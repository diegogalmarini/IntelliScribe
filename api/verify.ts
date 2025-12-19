import { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // CORS that works (proven by test)
        const origin = req.headers.origin || 'https://diktalo.com';
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Content-Type', 'application/json');

        if (req.method === 'OPTIONS') return res.status(200).end();
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

        const { action, phoneNumber, code, userId, channel } = req.body || {};

        // Load and clean env vars
        const accountSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
        const apiKeySid = (process.env.TWILIO_API_KEY_SID || '').trim();
        const apiKeySecret = (process.env.TWILIO_API_KEY_SECRET || '').trim();
        const serviceSid = (process.env.TWILIO_VERIFY_SERVICE_SID || '').trim();

        const supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
        const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

        if (!accountSid || !apiKeySid || !apiKeySecret || !serviceSid) {
            console.error("Missing Twilio vars");
            return res.status(500).json({ error: 'Server config error' });
        }

        // Initialize Twilio client
        const client = twilio(apiKeySid, apiKeySecret, { accountSid: accountSid });

        // SEND SMS
        if (action === 'send') {
            console.log(`📤 Sending SMS to ${phoneNumber}`);
            const verification = await client.verify.v2
                .services(serviceSid)
                .verifications.create({
                    to: phoneNumber,
                    channel: channel || 'sms'
                });

            console.log(`✅ SMS sent, status: ${verification.status}`);
            return res.status(200).json({ status: verification.status });
        }

        // VERIFY CODE
        if (action === 'check') {
            console.log(`🔐 Checking code for ${phoneNumber}`);
            const check = await client.verify.v2
                .services(serviceSid)
                .verificationChecks.create({ to: phoneNumber, code });

            if (check.status === 'approved') {
                console.log('✅ Code approved, updating database...');

                // Update Supabase
                if (supabaseUrl && supabaseServiceKey && userId) {
                    const supabase = createClient(supabaseUrl, supabaseServiceKey);
                    const { error: dbError } = await supabase
                        .from('profiles')
                        .update({
                            phone: phoneNumber,
                            phone_verified: true
                        })
                        .eq('id', userId);

                    if (dbError) {
                        console.error('⚠️ DB update failed:', dbError);
                    } else {
                        console.log('🎉 Profile updated successfully');
                    }
                }

                return res.status(200).json({ status: 'approved' });
            } else {
                console.warn('❌ Invalid code');
                return res.status(400).json({ status: 'rejected', error: 'Invalid code' });
            }
        }

        return res.status(400).json({ error: 'Invalid action' });

    } catch (error: any) {
        console.error('🔥 ERROR:', error);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            error: error.message || 'Server error',
            debug: 'Check Vercel logs'
        });
    }
}
