import { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';

// NOTA: Quitamos Supabase de aquí por ahora para aislar el error de "Network".
// Primero logremos que llegue el SMS. Luego reconectamos la DB.

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. CORS ROBUSTO (Para que no falle el Network Error)
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*'); // En producción cambia * por tu dominio
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Responder inmediatamente a la petición OPTIONS (Preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log("🔍 Verify Request Recibido:", req.body);

        const { action, phoneNumber, code, channel } = req.body;

        // Validar credenciales de Twilio
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const apiKeySecret = process.env.TWILIO_API_KEY_SECRET; // O Auth Token
        const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

        if (!accountSid || !apiKeySecret || !serviceSid) {
            console.error("❌ Error Config: Faltan variables de Twilio en Vercel");
            return res.status(500).json({ error: 'Server configuration error (Env Vars)' });
        }

        const client = twilio(accountSid, apiKeySecret);

        // --- ACCIÓN 1: ENVIAR CÓDIGO (SEND) ---
        if (action === 'send') {
            if (!phoneNumber) return res.status(400).json({ error: 'Phone number required' });

            console.log(`📤 Enviando SMS a ${phoneNumber} con Service: ${serviceSid}`);

            const verification = await client.verify.v2
                .services(serviceSid)
                .verifications.create({
                    to: phoneNumber,
                    channel: channel || 'sms'
                });

            console.log("✅ SMS Enviado:", verification.status);
            return res.status(200).json({ status: verification.status });
        }

        // --- ACCIÓN 2: VERIFICAR CÓDIGO (CHECK) ---
        if (action === 'check') {
            if (!phoneNumber || !code) {
                return res.status(400).json({ error: 'Phone and code required' });
            }

            console.log(`🔐 Verificando código ${code} para ${phoneNumber}`);

            const verificationCheck = await client.verify.v2
                .services(serviceSid)
                .verificationChecks.create({
                    to: phoneNumber,
                    code: code
                });

            if (verificationCheck.status === 'approved') {
                console.log("🎉 Verificación Exitosa!");

                // AQUÍ es donde actualizaremos Supabase en el futuro.
                // Por ahora devolvemos OK para desbloquearte.
                return res.status(200).json({
                    status: 'approved',
                    message: 'Phone verified successfully'
                });
            } else {
                console.warn("⛔ Código inválido");
                return res.status(400).json({ status: 'rejected', error: 'Invalid code' });
            }
        }

        return res.status(400).json({ error: 'Invalid action' });

    } catch (error: any) {
        console.error('🔥 CRASH en api/verify:', error);
        // Devolvemos el mensaje de error real para que lo veas en el frontend
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
