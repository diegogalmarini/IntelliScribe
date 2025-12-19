import { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { action, phoneNumber, code, userId, channel } = req.body;

        // 2. CARGA Y LIMPIEZA DE VARIABLES (Trim es clave)
        // Eliminamos espacios en blanco accidentales que causan "pattern mismatch"
        const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
        const apiKeySid = process.env.TWILIO_API_KEY_SID?.trim();
        const apiKeySecret = process.env.TWILIO_API_KEY_SECRET?.trim();
        const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID?.trim();

        const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

        // 3. DEBUGGING DE FORMATO (Sin revelar secretos)
        // Verificamos que los prefijos sean correctos: AC, SK, VA
        if (!accountSid?.startsWith('AC')) throw new Error(`Invalid AccountSID Format: Starts with ${accountSid?.substring(0, 2)}`);
        if (!apiKeySid?.startsWith('SK')) throw new Error(`Invalid ApiKeySID Format: Starts with ${apiKeySid?.substring(0, 2)}`);
        if (!serviceSid?.startsWith('VA')) throw new Error(`Invalid ServiceSID Format: Starts with ${serviceSid?.substring(0, 2)}`);

        if (!accountSid || !apiKeySid || !apiKeySecret || !serviceSid || !supabaseUrl || !supabaseServiceKey) {
            console.error("❌ MISSING VARS");
            return res.status(500).json({ error: 'Missing Env Vars' });
        }

        // 4. INICIALIZACIÓN
        let client;
        try {
            client = twilio(apiKeySid, apiKeySecret, { accountSid: accountSid });
        } catch (initErr: any) {
            throw new Error(`Twilio Init Failed: ${initErr.message}`);
        }

        // Acciones
        if (action === 'send') {
            console.log(`📤 Sending to ${phoneNumber} via ${serviceSid}`);
            const verification = await client.verify.v2
                .services(serviceSid)
                .verifications.create({
                    to: phoneNumber,
                    channel: channel || 'sms'
                });
            return res.status(200).json({ status: verification.status });
        }

        if (action === 'check') {
            const check = await client.verify.v2
                .services(serviceSid)
                .verificationChecks.create({ to: phoneNumber, code });

            if (check.status === 'approved') {
                const supabase = createClient(supabaseUrl, supabaseServiceKey);
                await supabase.from('profiles').update({
                    phone: phoneNumber,
                    phone_verified: true
                }).eq('id', userId);

                return res.status(200).json({ status: 'approved' });
            } else {
                return res.status(400).json({ status: 'rejected', error: 'Invalid code' });
            }
        }

        return res.status(400).json({ error: 'Invalid action' });

    } catch (error: any) {
        console.error('🔥 CRASH:', error);
        // Devolvemos el mensaje EXACTO de depuración al frontend
        return res.status(500).json({ error: `Debug: ${error.message}` });
    }
}
