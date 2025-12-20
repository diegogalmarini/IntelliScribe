import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Twilio StatusCallback handler for OutgoingCallerID verification
 * 
 * Called by Twilio after the verification call completes.
 * URL: https://diktalo.com/api/voice-callback
 * 
 * Parameters sent by Twilio:
 * - OutgoingCallerIdSid: Unique ID for this verification
 * - PhoneNumber: The number that was being verified
 * - VerificationStatus: 'success' or 'failed'
 * - CallSid: The SID of the verification call
 * - AccountSid: Your Twilio account SID
 */

// Helper function to update Supabase profiles table
async function updateSupabaseProfile(userId: string, updates: { caller_id_verified?: boolean }) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase configuration');
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(updates)
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Supabase update failed: ${error}`);
    }

    return await response.json();
}

// Helper function to find user by phone number
async function findUserByPhone(phoneNumber: string): Promise<string | null> {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase configuration');
    }

    const response = await fetch(
        `${supabaseUrl}/rest/v1/profiles?phone=eq.${encodeURIComponent(phoneNumber)}&select=id`,
        {
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`
            }
        }
    );

    if (!response.ok) {
        throw new Error(`Supabase query failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.length > 0 ? data[0].id : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    console.log('🔔 [VOICE-CALLBACK] Received Twilio StatusCallback');
    console.log('📋 [VOICE-CALLBACK] Request body:', JSON.stringify(req.body, null, 2));

    try {
        // Extract Twilio parameters
        // Note: Twilio sends phone number in 'PhoneNumber' field for ValidationRequest callbacks
        const {
            OutgoingCallerIdSid,
            PhoneNumber,
            VerificationStatus,
            CallSid,
            AccountSid,
            To,
            Called
        } = req.body;

        // Twilio may send phone in PhoneNumber, To, or Called depending on the callback type
        const phoneNumber = PhoneNumber || To || Called;

        // Log all parameters
        console.log(`📞 [VOICE-CALLBACK] OutgoingCallerIdSid: ${OutgoingCallerIdSid}`);
        console.log(`📞 [VOICE-CALLBACK] PhoneNumber: ${phoneNumber} (from: ${PhoneNumber ? 'PhoneNumber' : To ? 'To' : 'Called'})`);
        console.log(`📞 [VOICE-CALLBACK] VerificationStatus: ${VerificationStatus}`);
        console.log(`📞 [VOICE-CALLBACK] CallSid: ${CallSid}`);
        console.log(`📞 [VOICE-CALLBACK] AccountSid: ${AccountSid}`);

        if (!phoneNumber) {
            console.error('❌ [VOICE-CALLBACK] Missing phone number (checked PhoneNumber, To, Called)');
            console.error('❌ [VOICE-CALLBACK] Full request body:', JSON.stringify(req.body, null, 2));
            return res.status(400).json({ error: 'Missing phone number in callback' });
        }

        // Find user by phone number
        const userId = await findUserByPhone(phoneNumber);

        if (!userId) {
            console.warn(`⚠️ [VOICE-CALLBACK] No user found for phone: ${phoneNumber}`);
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(`👤 [VOICE-CALLBACK] Found user ID: ${userId}`);

        // Update user's caller_id_verified status
        if (VerificationStatus === 'success') {
            console.log(`✅ [VOICE-CALLBACK] Verification successful for ${phoneNumber}`);

            await updateSupabaseProfile(userId, {
                caller_id_verified: true
            });

            console.log(`✅ [VOICE-CALLBACK] Updated caller_id_verified = true for user ${userId}`);

            return res.status(200).json({
                status: 'success',
                message: 'Caller ID verified successfully',
                userId
            });
        } else {
            console.log(`❌ [VOICE-CALLBACK] Verification failed for ${phoneNumber}`);

            // Don't update to false - let user retry later
            return res.status(200).json({
                status: 'failed',
                message: 'Caller ID verification failed',
                userId
            });
        }

    } catch (error) {
        console.error('🔥 [VOICE-CALLBACK] ERROR:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });

        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}
