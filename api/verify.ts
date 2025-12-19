import { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. CORS ROBUSTO
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
        console.log("🔍 Verify Request:", req.body);

        const { action, phoneNumber, code, channel } = req.body;

        // --- CORRECCIÓN DE CREDENCIALES ---
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const apiKeySid = process.env.TWILIO_API_KEY_SID;    // <--- Necesitamos esto
        const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
        const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

        if (!accountSid || !apiKeySid || !apiKeySecret || !serviceSid) {
            console.error("❌ Error Config: Faltan variables en Vercel");
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Inicialización correcta para usar API Keys
        const client = twilio(apiKeySid, apiKeySecret, { accountSid: accountSid });

        // --- ACCIÓN 1: ENVIAR ---
        if (action === 'send') {
            if (!phoneNumber) return res.status(400).json({ error: 'Phone number required' });

            console.log(`📤 Enviando SMS a ${phoneNumber}`);
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
            if (!phoneNumber || !code) return res.status(400).json({ error: 'Phone/Code required' });

            console.log(`🔐 Verificando ${phoneNumber}`);
            const check = await client.verify.v2
                .services(serviceSid)
                .verificationChecks.create({ to: phoneNumber, code });

            if (check.status === 'approved') {
                return res.status(200).json({ status: 'approved' });
            } else {
                return res.status(400).json({ status: 'rejected', error: 'Invalid code' });
            }
        }

        return res.status(400).json({ error: 'Invalid action' });

    } catch (error: any) {
        console.error('🔥 Error:', error);
        // Si Twilio falla, mostramos el mensaje exacto para depurar
        return res.status(500).json({ error: error.message || 'Internal Error' });
    }
}
