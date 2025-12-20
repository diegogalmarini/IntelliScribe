import { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURACIÓN DE SEGURIDAD ---
// Inicializamos DENTRO del handler para evitar crashes si faltan vars al inicio
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. CORS (Para evitar errores de red)
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Responder OK a la petición OPTIONS (Preflight del navegador)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Solo aceptamos POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log("🔍 [Verify API] Iniciando proceso...", req.body);

        // 2. EXTRACCIÓN Y LIMPIEZA DE DATOS
        const { action, phoneNumber, code, userId, channel } = req.body;

        // 3. CARGA DE VARIABLES (Con validación paranoica)
        const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
        const apiKeySid = process.env.TWILIO_API_KEY_SID?.trim();
        const apiKeySecret = process.env.TWILIO_API_KEY_SECRET?.trim();
        const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID?.trim();
        const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

        // Chequeo de seguridad: Si falta algo, avisamos en JSON (no explotamos)
        const missingVars = [];
        if (!accountSid) missingVars.push('TWILIO_ACCOUNT_SID');
        if (!apiKeySid) missingVars.push('TWILIO_API_KEY_SID');
        if (!apiKeySecret) missingVars.push('TWILIO_API_KEY_SECRET');
        if (!serviceSid) missingVars.push('TWILIO_VERIFY_SERVICE_SID');
        if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
        if (!supabaseKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');

        if (missingVars.length > 0) {
            console.error("❌ [Verify API] Faltan variables:", missingVars);
            return res.status(500).json({
                error: 'Server Misconfiguration',
                details: `Missing Env Vars: ${missingVars.join(', ')}`
            });
        }

        // 4. INICIALIZACIÓN SEGURA (Dentro del try/catch)
        // Twilio: (User: API Key SID, Pass: API Key Secret, Options: { accountSid })
        const client = twilio(apiKeySid, apiKeySecret, { accountSid: accountSid });

        // Supabase
        const supabase = createClient(supabaseUrl!, supabaseKey!);

        // --- LÓGICA: ENVIAR SMS ---
        if (action === 'send') {
            if (!phoneNumber) return res.status(400).json({ error: 'Falta el número de teléfono' });

            console.log(`📤 [Twilio] Enviando SMS a ${phoneNumber}`);
            const verification = await client.verify.v2
                .services(serviceSid!)
                .verifications.create({
                    to: phoneNumber,
                    channel: channel || 'sms'
                });

            console.log(`✅ [Twilio] Estado envío: ${verification.status}`);
            return res.status(200).json({ status: verification.status });
        }

        // --- LÓGICA: VERIFICAR CÓDIGO ---
        if (action === 'check') {
            if (!phoneNumber || !code) return res.status(400).json({ error: 'Faltan datos (teléfono/código)' });

            console.log(`🔐 [Twilio] Verificando código para ${phoneNumber}`);

            // Paso A: Verificar con Twilio
            const check = await client.verify.v2
                .services(serviceSid!)
                .verificationChecks.create({ to: phoneNumber, code });

            if (check.status === 'approved') {
                console.log("✅ [Twilio] Aprobado. Guardando en Supabase...");

                // Paso B: Guardar en Supabase
                const { error: dbError } = await supabase
                    .from('profiles')
                    .update({
                        phone: phoneNumber,
                        phone_verified: true
                    })
                    .eq('id', userId);

                if (dbError) {
                    console.error("⚠️ [Supabase] Error al guardar:", dbError);
                    // No fallamos la petición, el teléfono es válido
                } else {
                    console.log("🎉 [Supabase] Perfil actualizado.");
                }

                return res.status(200).json({ status: 'approved' });
            } else {
                console.warn("⛔ [Twilio] Código rechazado");
                return res.status(400).json({ status: 'rejected', error: 'Invalid code' });
            }
        }

        return res.status(400).json({ error: 'Acción no válida' });

    } catch (error: any) {
        // CATCH-ALL: Si algo explota, lo atrapamos y lo devolvemos como JSON legible
        console.error('🔥 [CRASH]', error);

        // Si el error viene de Twilio, suele tener un 'code' y 'moreInfo'
        const errorMessage = error.message || 'Error desconocido';
        const errorDetails = error.code ? `Twilio Error ${error.code}` : '';

        return res.status(500).json({
            error: 'Internal Server Error',
            message: errorMessage,
            details: errorDetails
        });
    }
}
