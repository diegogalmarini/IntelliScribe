import { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        console.log("🔍 Iniciando Verify...", req.body);

        const { action, phoneNumber, code, userId, channel } = req.body;

        // --- CAMBIO CLAVE: USAMOS AUTH TOKEN MAESTRO ---
        // Esto elimina cualquier duda sobre permisos de API Keys para Verify
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN; // <--- NUEVA VARIABLE
        const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!accountSid || !authToken || !serviceSid || !supabaseUrl || !supabaseServiceKey) {
            console.error("❌ Faltan variables. Asegúrate de tener TWILIO_AUTH_TOKEN en Vercel.");
            return res.status(500).json({ error: 'Server configuration error: Missing Env Vars' });
        }

        // Inicializamos con Auth Token (Infalible para REST API)
        const client = twilio(accountSid, authToken);
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // --- ENVIAR ---
        if (action === 'send') {
            console.log(`📤 Enviando SMS a ${phoneNumber}`);
            const verification = await client.verify.v2
                .services(serviceSid)
                .verifications.create({
                    to: phoneNumber,
                    channel: channel || 'sms'
                });
            return res.status(200).json({ status: verification.status });
        }

        // --- VERIFICAR ---
        if (action === 'check') {
            console.log(`🔐 Verificando código...`);
            const check = await client.verify.v2
                .services(serviceSid)
                .verificationChecks.create({ to: phoneNumber, code });

            if (check.status === 'approved') {
                console.log("✅ Aprobado. Guardando en DB...");
                await supabase
                    .from('profiles')
                    .update({ phone: phoneNumber, phone_verified: true })
                    .eq('id', userId);

                return res.status(200).json({ status: 'approved' });
            } else {
                return res.status(400).json({ status: 'rejected', error: 'Invalid code' });
            }
        }

        return res.status(400).json({ error: 'Invalid action' });

    } catch (error: any) {
        console.error('🔥 CRASH:', error);
        return res.status(500).json({ error: error.message });
    }
}
