import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Wrap everything in try-catch to ensure we ALWAYS return valid JSON
    try {
        // CORS (Fixed for Safari: Origin must match if Credentials are true)
        const allowedOrigin = req.headers.origin || '*';
        res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
        res.setHeader(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        );

        if (req.method === 'OPTIONS') return res.status(200).end();
        if (req.method !== 'POST') {
            console.log('❌ Method not allowed:', req.method);
            return res.status(405).json({ error: 'Method not allowed' });
        }

        console.log("🔍 [VERIFY] Request received", {
            method: req.method,
            body: req.body,
            headers: {
                origin: req.headers.origin,
                contentType: req.headers['content-type']
            }
        });

        // Validate request body
        const { action, phoneNumber, code, userId, channel } = req.body || {};

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

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        const missingVars: string[] = [];
        if (!accountSid) missingVars.push('TWILIO_ACCOUNT_SID');
        if (!authToken) missingVars.push('TWILIO_AUTH_TOKEN');
        if (!serviceSid) missingVars.push('TWILIO_VERIFY_SERVICE_SID');
        if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
        if (!supabaseServiceKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');

        if (missingVars.length > 0) {
            console.error("❌ [VERIFY] Missing environment variables:", missingVars);
            return res.status(500).json({
                error: 'Server configuration error: Missing environment variables',
                details: `Missing: ${missingVars.join(', ')}`
            });
        }

        console.log("✅ [VERIFY] All environment variables present");

        // --- Initialize Twilio Client with error handling ---
        let client;
        try {
            console.log("🔍 [VERIFY] Initializing Twilio client...");
            client = twilio(accountSid, authToken);
            console.log("✅ [VERIFY] Twilio client initialized successfully");
        } catch (initError: any) {
            console.error('❌ [VERIFY] Twilio client initialization failed:', initError);
            return res.status(500).json({
                error: 'Failed to initialize Twilio client',
                details: initError.message
            });
        }

        // --- Initialize Supabase Client ---
        let supabase;
        try {
            console.log("🔍 [VERIFY] Initializing Supabase client...");
            supabase = createClient(supabaseUrl, supabaseServiceKey);
            console.log("✅ [VERIFY] Supabase client initialized successfully");
        } catch (initError: any) {
            console.error('❌ [VERIFY] Supabase client initialization failed:', initError);
            return res.status(500).json({
                error: 'Failed to initialize Supabase client',
                details: initError.message
            });
        }

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
                        const { error: dbError } = await supabase
                            .from('profiles')
                            .update({ phone: phoneNumber, phone_verified: true })
                            .eq('id', userId);

                        if (dbError) {
                            console.error('❌ [VERIFY] Database update failed:', dbError);
                            return res.status(500).json({
                                error: 'Verification succeeded but database update failed',
                                details: dbError.message
                            });
                        }

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

        // Invalid action
        console.error('❌ [VERIFY] Invalid action:', action);
        return res.status(400).json({
            error: 'Invalid action parameter',
            validActions: ['send', 'check']
        });

    } catch (error: any) {
        // Catch-all for any unexpected errors
        console.error('🔥 [VERIFY] UNEXPECTED ERROR:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });

        return res.status(500).json({
            error: 'Internal server error',
            details: error.message,
            type: error.name
        });
    }
}
