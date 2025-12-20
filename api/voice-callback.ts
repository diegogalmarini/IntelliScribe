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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
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
        const {
            OutgoingCallerIdSid,
            PhoneNumber,
            VerificationStatus,
            CallSid,
            AccountSid
        } = req.body;

        // Log all parameters
        console.log(`📞 [VOICE-CALLBACK] OutgoingCallerIdSid: ${OutgoingCallerIdSid}`);
        console.log(`📞 [VOICE-CALLBACK] PhoneNumber: ${PhoneNumber}`);
        console.log(`📞 [VOICE-CALLBACK] VerificationStatus: ${VerificationStatus}`);
        console.log(`📞 [VOICE-CALLBACK] CallSid: ${CallSid}`);
        console.log(`📞 [VOICE-CALLBACK] AccountSid: ${AccountSid}`);

        if (!PhoneNumber) {
            console.error('❌ [VOICE-CALLBACK] Missing PhoneNumber parameter');
            return res.status(400).json({ error: 'Missing PhoneNumber' });
        }

        // Find user by phone number
        const userId = await findUserByPhone(PhoneNumber);

        if (!userId) {
            console.warn(`⚠️ [VOICE-CALLBACK] No user found for phone: ${PhoneNumber}`);
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(`👤 [VOICE-CALLBACK] Found user ID: ${userId}`);

        // Update user's caller_id_verified status
        if (VerificationStatus === 'success') {
            console.log(`✅ [VOICE-CALLBACK] Verification successful for ${PhoneNumber}`);

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
            console.log(`❌ [VOICE-CALLBACK] Verification failed for ${PhoneNumber}`);

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
