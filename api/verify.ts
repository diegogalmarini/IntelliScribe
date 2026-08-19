import type { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';
import { validateEnv } from "./_utils/env-validator.js";
import { initSentry, Sentry } from "./_utils/sentry.js";
import { requireAuth } from "./_utils/auth.js";

// Initialize Sentry
initSentry();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Wrap everything in try-catch to ensure we ALWAYS return valid JSON
    try {
        res.setHeader('Access-Control-Allow-Origin', 'https://www.diktalo.com');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') return res.status(200).end();
        if (req.method !== 'POST') {
            console.log('❌ Method not allowed:', req.method);
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // El userId llegaba en el body sin verificar, asi que se podia escribir
        // `phone` y `phone_verified` en el perfil de cualquier cuenta.
        const authedUser = await requireAuth(req, res, 'verify');
        if (!authedUser) return;

        console.log("🔍 [VERIFY] Request received", {
            method: req.method,
            body: req.body,
            headers: {
                origin: req.headers.origin,
                contentType: req.headers['content-type']
            }
        });

        // Validate request body
        const { action, phoneNumber, code, channel } = req.body || {};
        const userId = authedUser.id;

        if (!action) {
            console.error('❌ Missing action parameter');
            return res.status(400).json({ error: 'Missing required parameter: action' });
        }

        if (!phoneNumber) {
            console.error('❌ Missing phoneNumber parameter');
            return res.status(400).json({ error: 'Missing required parameter: phoneNumber' });
        }

        // Validate phone number format
        const phoneRegex = /^\+\d{10,15}$/;
        if (!phoneRegex.test(phoneNumber)) {
            console.error('❌ Invalid phone number format:', phoneNumber);
            return res.status(400).json({
                error: 'Invalid phone number format. Must start with + and contain 10-15 digits.'
            });
        }

        // --- Environment Variables Validation ---
        console.log("🔍 [VERIFY] Checking environment variables...");

        let env;
        try {
            env = validateEnv(['base', 'twilio']);
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }

        const {
            TWILIO_ACCOUNT_SID: accountSid,
            TWILIO_AUTH_TOKEN: authToken,
            TWILIO_VERIFY_SERVICE_SID: serviceSid,
            SUPABASE_URL: supabaseUrl,
            SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey
        } = env;

        console.log("✅ [VERIFY] All environment variables present");

        // --- Initialize Twilio Client with error handling ---
        let client;
        try {
            console.log("🔍 [VERIFY] Initializing Twilio client...");
            client = twilio(accountSid, authToken);
            console.log("✅ [VERIFY] Twilio client initialized successfully");
        } catch (twilioInitError: any) {
            console.error("❌ [VERIFY] Failed to initialize Twilio client:", twilioInitError);
            return res.status(500).json({
                error: 'Failed to initialize Twilio client',
                details: twilioInitError.message
            });
        }

        // --- Supabase REST API Helper (NO CLIENT LIBRARY) ---
        // Using REST API directly to avoid ES module issues completely
        async function updateSupabaseProfile(userId: string, updates: any) {
            const response = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
                method: 'PATCH',
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Supabase update failed: ${response.status} ${errorText}`);
            }

            return true;
        }
        console.log("✅ [VERIFY] Supabase REST API helper initialized successfully");

        // --- SEND VERIFICATION CODE ---
        if (action === 'send') {
            console.log(`📤 [VERIFY] Sending ${channel || 'sms'} to ${phoneNumber}`);

            try {
                const verification = await client.verify.v2
                    .services(serviceSid)
                    .verifications.create({
                        to: phoneNumber,
                        channel: channel || 'sms'
                    });

                console.log("✅ [VERIFY] Verification sent successfully:", verification.status);
                return res.status(200).json({
                    status: verification.status,
                    message: 'Verification code sent successfully'
                });
            } catch (twilioError: any) {
                console.error('❌ [VERIFY] Twilio API error:', {
                    message: twilioError.message,
                    code: twilioError.code,
                    status: twilioError.status,
                    moreInfo: twilioError.moreInfo
                });

                return res.status(500).json({
                    error: 'Failed to send verification code',
                    details: twilioError.message,
                    twilioCode: twilioError.code
                });
            }
        }

        // --- VERIFY CODE ---
        if (action === 'check') {
            if (!code) {
                console.error('❌ Missing code parameter');
                return res.status(400).json({ error: 'Missing required parameter: code' });
            }

            if (!userId) {
                console.error('❌ Missing userId parameter');
                return res.status(400).json({ error: 'Missing required parameter: userId' });
            }

            console.log(`🔐 [VERIFY] Verifying code for ${phoneNumber}`);

            try {
                const check = await client.verify.v2
                    .services(serviceSid)
                    .verificationChecks.create({
                        to: phoneNumber,
                        code
                    });

                console.log("📋 [VERIFY] Verification check status:", check.status);

                if (check.status === 'approved') {
                    console.log("✅ [VERIFY] Code approved. Updating database...");

                    try {
                        // ACTUALLY UPDATE THE DATABASE
                        console.log(`✅ [VERIFY] Updating Supabase via REST API for user: ${userId}`);
                        await updateSupabaseProfile(userId, {
                            phone: phoneNumber,
                            phone_verified: true,
                            caller_id_verified: false // Reset Twilio verification when phone changes
                        });
                        console.log("✅ [VERIFY] Database updated successfully");

                        return res.status(200).json({
                            status: 'approved',
                            message: 'Phone verified successfully'
                        });
                    } catch (dbError: any) {
                        console.error('❌ [VERIFY] Database error:', dbError);
                        return res.status(500).json({
                            error: 'Database operation failed',
                            details: dbError.message
                        });
                    }
                } else {
                    console.log("❌ [VERIFY] Code rejected:", check.status);
                    return res.status(400).json({
                        status: 'rejected',
                        error: 'Invalid or expired verification code'
                    });
                }
            } catch (twilioError: any) {
                console.error('❌ [VERIFY] Twilio verification check error:', {
                    message: twilioError.message,
                    code: twilioError.code,
                    status: twilioError.status
                });

                return res.status(500).json({
                    error: 'Failed to verify code',
                    details: twilioError.message,
                    twilioCode: twilioError.code
                });
            }
        }

        // NEW ACTION: Verify Caller ID in Twilio
        if (action === 'verify-caller-id') {
            console.log(`🔔 [VERIFY] Initiating Twilio Caller ID verification for ${phoneNumber}`);

            if (!userId) {
                console.error('❌ [VERIFY] Missing userId for caller ID verification');
                return res.status(400).json({
                    error: 'Missing required parameter: userId'
                });
            }

            try {
                // Call Twilio OutgoingCallerIds API to initiate verification
                // Using our verified Twilio number to avoid spam filters
                const validationRequest = await client.validationRequests.create({
                    phoneNumber: phoneNumber,
                    friendlyName: `User ${userId}`,
                    callerId: '+12347043223', // Our verified Twilio number (better delivery than default)
                    // StatusCallback will be called when verification completes
                    statusCallback: `https://www.diktalo.com/api/voice-callback`
                });

                console.log('✅ [VERIFY] Twilio validation request created:', {
                    accountSid: validationRequest.accountSid,
                    phoneNumber: validationRequest.phoneNumber,
                    validationCode: validationRequest.validationCode,
                    callSid: validationRequest.callSid,
                    friendlyName: validationRequest.friendlyName
                });

                // Return the validation code to show to the user
                return res.status(200).json({
                    status: 'initiated',
                    validationCode: validationRequest.validationCode,
                    callSid: validationRequest.callSid,
                    message: 'Twilio will call you shortly. Please enter the validation code when prompted.'
                });

            } catch (twilioError) {
                console.error('❌ [VERIFY] Twilio caller ID verification error:', {
                    message: twilioError.message,
                    code: twilioError.code,
                    status: twilioError.status
                });

                return res.status(500).json({
                    error: 'Failed to initiate caller ID verification',
                    details: twilioError.message,
                    twilioCode: twilioError.code
                });
            }
        }

        // Invalid action
        console.error('❌ [VERIFY] Invalid action:', action);
        return res.status(400).json({
            error: 'Invalid action parameter',
            validActions: ['send', 'check', 'verify-caller-id']
        });


    } catch (error: any) {
        // Catch-all for any unexpected errors
        console.error('🔥 [VERIFY] UNEXPECTED ERROR:', error);
        Sentry.captureException(error);

        return res.status(500).json({
            error: 'Internal server error',
            details: error.message,
            type: error.name
        });
    }
}
