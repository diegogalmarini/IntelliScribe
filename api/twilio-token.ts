import twilio from 'twilio';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Permitir CORS para evitar bloqueos en móviles
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY_SID;
    const apiSecret = process.env.TWILIO_API_KEY_SECRET;
    const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

    if (!accountSid || !apiKey || !apiSecret || !twimlAppSid) {
        return res.status(500).json({ error: 'Twilio configuration missing' });
    }

    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    // ⚠️ CAMBIO CLAVE: incomingAllow: false
    // Esto evita que el navegador pida permisos de micro antes de tiempo
    const voiceGrant = new VoiceGrant({
        outgoingApplicationSid: twimlAppSid,
        incomingAllow: false,
    });

    // Limpiamos el userId para asegurar compatibilidad
    const identity = userId.replace(/[^a-zA-Z0-9_-]/g, '_');

    const token = new AccessToken(accountSid, apiKey, apiSecret, {
        identity: identity,
        ttl: 3600 // 1 hora de validez
    });

    token.addGrant(voiceGrant);

    return res.status(200).json({ token: token.toJwt() });
}
// Force update redeploy.