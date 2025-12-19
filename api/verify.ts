import { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. CORS BLINDADO (Evita el "Network Error" por rechazo del navegador)
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { action, phoneNumber, code, userId, channel } = req.body;

        // 2. VARIABLES DE ENTORNO (Cargadas DENTRO para evitar errores de inicio)
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const apiKeySid = process.env.TWILIO_API_KEY_SID;      // <--- LA LLAVE CORRECTA
        const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
        const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        // Validación de seguridad
        if (!accountSid || !apiKeySid || !apiKeySecret || !serviceSid || !supabaseUrl || !supabaseServiceKey) {
            console.error("❌ Faltan variables en Vercel. Revisa TWILIO_API_KEY_SID y SUPABASE_SERVICE_ROLE_KEY");
            return res.status(500).json({ error: 'Server misconfiguration' });
        }

        // 3. INICIALIZACIÓN (La corrección clave)
        // Usamos API KEY SID como usuario, no el Account SID
        const client = twilio(apiKeySid, apiKeySecret, { accountSid: accountSid });
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // --- ENVIAR SMS ---
        if (action === 'send') {
            const verification = await client.verify.v2
                .services(serviceSid)
                .verifications.create({
                    to: phoneNumber,
                    channel: channel || 'sms'
                });
            return res.status(200).json({ status: verification.status });
        }

        // --- VERIFICAR Y GUARDAR ---
        if (action === 'check') {
            const check = await client.verify.v2
                .services(serviceSid)
                .verificationChecks.create({ to: phoneNumber, code });

            if (check.status === 'approved') {
                // Guardamos en Supabase usando permisos de admin
                const { error: dbError } = await supabase
                    .from('profiles')
                    .update({
                        phone: phoneNumber,
                        phone_verified: true
                    })
                    .eq('id', userId);

                if (dbError) {
                    console.error("⚠️ Error guardando en DB:", dbError);
                }

                return res.status(200).json({ status: 'approved' });
            } else {
                return res.status(400).json({ status: 'rejected', error: 'Invalid code' });
            }
        }

        return res.status(400).json({ error: 'Invalid action' });

    } catch (error: any) {
        console.error('🔥 CRASH:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
