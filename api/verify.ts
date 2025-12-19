const twilio = require('twilio');
const { createClient } = require('@supabase/supabase-js');

// COMMONJS REWRITE: Bulletproof against transpilation/ESM issues
module.exports = async (req, res) => {
    try {
        // 1. SAFE CORS
        const origin = req.headers.origin || 'https://diktalo.com';
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Content-Type', 'application/json');

        if (req.method === 'OPTIONS') return res.status(200).end();
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

        const body = req.body || {};
        const { action, phoneNumber, code, userId } = body;

        // 2. SAFE ENV LOADING
        const accountSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
        const apiKeySid = (process.env.TWILIO_API_KEY_SID || '').trim();
        const apiKeySecret = (process.env.TWILIO_API_KEY_SECRET || '').trim();
        const serviceSid = (process.env.TWILIO_VERIFY_SERVICE_SID || '').trim();

        const supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
        const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

        if (!accountSid || !apiKeySid || !apiKeySecret || !serviceSid) {
            console.error("Missing Twilio Params");
            return res.status(500).json({ error: 'Configuration Error: Missing Twilio Variables' });
        }

        // 3. SAFE CLIENT INIT
        let client;
        try {
            client = twilio(apiKeySid, apiKeySecret, { accountSid: accountSid });
        } catch (initErr) {
            return res.status(500).json({ error: `Twilio Init Failed: ${initErr.message}` });
        }

        // 4. EXECUTION
        if (action === 'send') {
            try {
                // Validación explícita antes de llamar
                if (!phoneNumber) throw new Error("Phone number is required");

                const verification = await client.verify.v2
                    .services(serviceSid)
                    .verifications.create({
                        to: phoneNumber,
                        channel: 'sms'
                    });
                return res.status(200).json({ status: verification.status });
            } catch (twilioErr) {
                console.error("Twilio Send Error:", twilioErr);
                return res.status(500).json({ error: `Twilio Send Error: ${twilioErr.message}` });
            }
        }

        if (action === 'check') {
            try {
                const check = await client.verify.v2
                    .services(serviceSid)
                    .verificationChecks.create({ to: phoneNumber, code });

                if (check.status === 'approved') {
                    // Update DB safely
                    if (supabaseUrl && supabaseServiceKey && userId) {
                        const supabase = createClient(supabaseUrl, supabaseServiceKey);
                        await supabase.from('profiles').update({
                            phone: phoneNumber,
                            phone_verified: true
                        }).eq('id', userId);
                    }
                    return res.status(200).json({ status: 'approved' });
                } else {
                    return res.status(400).json({ status: 'rejected', error: 'Invalid code' });
                }
            } catch (verifyErr) {
                return res.status(500).json({ error: `Twilio Verify Error: ${verifyErr.message}` });
            }
        }

        return res.status(400).json({ error: 'Invalid action' });

    } catch (fatalErr) {
        console.error('🔥 FATAL:', fatalErr);
        // Fallback for fatal crash
        return res.status(500).json({
            error: 'Server Crash',
            message: fatalErr.message
        });
    }
};
