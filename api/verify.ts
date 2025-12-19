import { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. Configuración de CORS (Permite que tu web hable con el servidor)
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Responder al "preflight" del navegador inmediatamente
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { action, phoneNumber, code, userId, channel } = req.body;

        // 2. Cargar Variables de Entorno
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const apiKeySid = process.env.TWILIO_API_KEY_SID;      // <--- USAMOS LA KEY CORRECTA
        const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
        const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

        // SUPABASE: Usamos la Service Role Key para tener permisos de escritura
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!accountSid || !apiKeySid || !apiKeySecret || !serviceSid || !supabaseUrl || !supabaseServiceKey) {
            console.error("❌ Error Config: Faltan variables en Vercel");
            return res.status(500).json({ error: 'Server configuration error (Env Vars)' });
        }

        // 3. Inicializar Clientes
        // Twilio: (User: API Key, Pass: Secret, Account: Owner)
        const client = twilio(apiKeySid, apiKeySecret, { accountSid: accountSid });

        // Supabase: Modo Admin
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // --- ACCIÓN 1: ENVIAR SMS ---
        if (action === 'send') {
            if (!phoneNumber) return res.status(400).json({ error: 'Phone number required' });

            const verification = await client.verify.v2
                .services(serviceSid)
                .verifications.create({
                    to: phoneNumber,
                    channel: channel || 'sms'
                });

            return res.status(200).json({ status: verification.status });
        }

        // --- ACCIÓN 2: VERIFICAR CÓDIGO ---
        if (action === 'check') {
            if (!phoneNumber || !code) return res.status(400).json({ error: 'Phone/Code required' });

            // A. Preguntar a Twilio si el código es bueno
            const check = await client.verify.v2
                .services(serviceSid)
                .verificationChecks.create({ to: phoneNumber, code });

            if (check.status === 'approved') {
                console.log(`✅ Teléfono ${phoneNumber} verificado. Guardando en Supabase...`);

                // B. GUARDAR EN SUPABASE (Ahora sí, descomentado y con permisos)
                const { error: dbError } = await supabase
                    .from('profiles')
                    .update({
                        phone: phoneNumber,
                        phone_verified: true
                    })
                    .eq('id', userId);

                if (dbError) {
                    console.error("❌ Error guardando en DB:", dbError);
                    // No fallamos la petición completa, pero avisamos en logs
                } else {
                    console.log("🎉 Perfil actualizado correctamente.");
                }

                return res.status(200).json({
                    status: 'approved',
                    message: 'Phone verified and saved'
                });
            } else {
                return res.status(400).json({ status: 'rejected', error: 'Invalid code' });
            }
        }

        return res.status(400).json({ error: 'Invalid action' });

    } catch (error: any) {
        console.error('🔥 Error General:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
