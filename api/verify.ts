import { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

// WRAPPER PARA EVITAR CRASHES DUROS
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // 1. CORS SIMPLIFICADO Y SEGURO (Sin saltos de línea)
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Simplifcamos para debug

        if (req.method === 'OPTIONS') return res.status(200).end();
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

        const { action, phoneNumber, code, userId, channel } = req.body || {};

        // 2. DEBUG DE VARIABLES (Safe Access)
        const accountSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
        const apiKeySid = (process.env.TWILIO_API_KEY_SID || '').trim();
        const apiKeySecret = (process.env.TWILIO_API_KEY_SECRET || '').trim();
        const serviceSid = (process.env.TWILIO_VERIFY_SERVICE_SID || '').trim();

        const supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
        const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

        if (!accountSid || !apiKeySid || !apiKeySecret || !serviceSid) {
            console.error("Missing Twilio Vars");
            return res.status(500).json({ error: 'Missing Twilio Config' });
        }

        // 3. INICIALIZACIÓN
        const client = twilio(apiKeySid, apiKeySecret, { accountSid: accountSid });

        // --- ACCIÓN 1: ENVIAR ---
        if (action === 'send') {
            console.log(`📤 Sending to ${phoneNumber}`);
            const verification = await client.verify.v2
                .services(serviceSid)
                .verifications.create({
                    to: phoneNumber,
                    channel: channel || 'sms'
                });
            return res.status(200).json({ status: verification.status });
        }

        // --- ACCIÓN 2: VERIFICAR ---
        if (action === 'check') {
            const check = await client.verify.v2
                .services(serviceSid)
                .verificationChecks.create({ to: phoneNumber, code });

            if (check.status === 'approved') {
                // Supabase opcional para esta prueba de crash
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
        }

        return res.status(400).json({ error: 'Invalid action' });

    } catch (error: any) {
        console.error('🔥 FINAL CATCH:', error);
        // Asegurmos que SIEMPRE devolvemos JSON válido
        const safeParams = {
            allowedCredentials: 'true',
            content: 'application/json'
        };
        // Intentar escribir cabeceras si no se han enviado
        try {
            if (!res.headersSent) {
                res.setHeader('Content-Type', 'application/json');
            }
        } catch (e) { }

        return res.status(500).json({
            error: `Server Error: ${error.message}`,
            details: 'Check Vercel Logs'
        });
    }
}
