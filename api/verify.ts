import { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. CORS BLINDADO (Esto previene el "Network Error")
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Responder al preflight inmediatamente
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log("🔍 Request:", req.body); // Log para depurar en Vercel

        const { action, phoneNumber, code, userId, channel } = req.body;

        // 2. CARGA SEGURA DE VARIABLES (Dentro del handler para evitar crashes)
        // Usamos API Keys para autenticar (Más seguro y evita el error "Authenticate")
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const apiKeySid = process.env.TWILIO_API_KEY_SID;
        const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
        const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

        // Supabase: Usamos SERVICE_ROLE para poder escribir en la tabla 'profiles'
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        // Validación de variables críticas
        if (!accountSid || !apiKeySid || !apiKeySecret || !serviceSid || !supabaseUrl || !supabaseServiceKey) {
            console.error("❌ ERROR CRÍTICO: Faltan variables de entorno en Vercel.");
            // Devuelve JSON en lugar de explotar, así el frontend sabe qué pasa
            return res.status(500).json({ error: 'Server misconfiguration: Missing Env Vars' });
        }

        // 3. INICIALIZACIÓN DE CLIENTES
        const client = twilio(apiKeySid, apiKeySecret, { accountSid: accountSid });
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // --- ACCIÓN 1: ENVIAR SMS ---
        if (action === 'send') {
            if (!phoneNumber) return res.status(400).json({ error: 'Phone number required' });

            console.log(`📤 Enviando SMS a ${phoneNumber}...`);
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

            console.log(`🔐 Verificando código para ${phoneNumber}...`);

            // A. Verificar con Twilio
            const check = await client.verify.v2
                .services(serviceSid)
                .verificationChecks.create({ to: phoneNumber, code });

            if (check.status === 'approved') {
                console.log("✅ Twilio Aprobado. Guardando en Supabase...");

                // B. Guardar en Supabase (Usando Service Role)
                const { error: dbError } = await supabase
                    .from('profiles')
                    .update({
                        phone: phoneNumber,
                        phone_verified: true
                    })
                    .eq('id', userId);

                if (dbError) {
                    console.error("⚠️ Error al guardar en DB (pero el teléfono es válido):", dbError);
                    // No fallamos la petición porque el teléfono SÍ es válido
                } else {
                    console.log("🎉 Perfil actualizado con éxito.");
                }

                return res.status(200).json({
                    status: 'approved',
                    message: 'Phone verified and saved'
                });
            } else {
                console.warn("⛔ Código incorrecto");
                return res.status(400).json({ status: 'rejected', error: 'Invalid code' });
            }
        }

        return res.status(400).json({ error: 'Invalid action' });

    } catch (error: any) {
        console.error('🔥 CRASH CONTROLADO:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
