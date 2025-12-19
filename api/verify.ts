import { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. CORS Setup
    const origin = req.headers.origin || 'https://diktalo.com';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    let step = 'START';

    try {
        const { action, phoneNumber, code, userId } = req.body || {};

        // 2. Env Vars
        step = 'ENV_LOADING';
        const accountSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
        const apiKeySid = (process.env.TWILIO_API_KEY_SID || '').trim();
        const apiKeySecret = (process.env.TWILIO_API_KEY_SECRET || '').trim();
        const serviceSid = (process.env.TWILIO_VERIFY_SERVICE_SID || '').trim();

        // 3. Validation
        step = 'ENV_VALIDATION';
        if (!accountSid.startsWith('AC')) throw new Error(`Bad AccountSID: ${accountSid.substring(0, 2)}...`);
        if (!apiKeySid.startsWith('SK')) throw new Error(`Bad ApiKeySID: ${apiKeySid.substring(0, 2)}...`);
        if (!serviceSid.startsWith('VA')) throw new Error(`Bad ServiceSID: ${serviceSid.substring(0, 2)}...`);

        // 4. Client Init
        step = 'CLIENT_INIT';
        let client;
        try {
            client = twilio(apiKeySid, apiKeySecret, { accountSid: accountSid });
        } catch (e: any) {
            throw new Error(`Twilio Init Failed: ${e.message}`);
        }

        // 5. Execution
        if (action === 'send') {
            step = 'SENDING_SMS';
            console.log(`Step: ${step} to ${phoneNumber}`);

            // Explicitly validate phone before sending
            if (!phoneNumber || phoneNumber.length < 8) {
                throw new Error(`Invalid phone number format: ${phoneNumber}`);
            }

            const verification = await client.verify.v2
                .services(serviceSid)
                .verifications.create({
                    to: phoneNumber,
                    channel: 'sms'
                });

            return res.status(200).json({ status: verification.status });
        }

        if (action === 'check') {
            step = 'VERIFYING_CODE';
            const check = await client.verify.v2
                .services(serviceSid)
                .verificationChecks.create({ to: phoneNumber, code });

            if (check.status === 'approved') {
                step = 'DB_UPDATE';
                // Only create supabase client if needed
                const supabaseUrl = process.env.VITE_SUPABASE_URL;
                const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

                if (supabaseUrl && supabaseKey) {
                    const supabase = createClient(supabaseUrl, supabaseKey);
                    await supabase.from('profiles').update({
                        phone: phoneNumber,
                        phone_verified: true
                    }).eq('id', userId);
                }

                return res.status(200).json({ status: 'approved' });
            } else {
                return res.status(400).json({ status: 'rejected', error: 'Invalid code' });
            }
        }

        return res.status(400).json({ error: 'Invalid action' });

    } catch (error: any) {
        console.error(`🔥 FAILED AT ${step}:`, error);
        return res.status(500).json({
            error: `Error at ${step}: ${error.message}`,
            step: step
        });
    }
}
