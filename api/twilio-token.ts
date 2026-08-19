import twilio from 'twilio';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest } from './_utils/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.diktalo.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Este endpoint emite un AccessToken de Twilio Voice: quien lo obtiene puede
    // hacer llamadas facturadas a la cuenta. Se exige token desde el primer
    // despliegue, sin ventana de compatibilidad: el Dialer es exclusivo de
    // Business Plus, así que el alcance de una ruptura es mínimo comparado con
    // dejar abierto un canal de gasto. Antes, el `userId` llegaba en el body y
    // bastaba conocer el UUID de una cuenta Business Plus para suplantarla.
    const auth = await authenticateRequest(req);
    if (!auth.ok) {
        return res.status(auth.status!).json({ error: auth.error });
    }
    const userId = auth.user!.id;

    // 🔴 AUDITORÍA DE SEGURIDAD: Validar en el Servidor que el usuario tenga el plan correcto
    // No podemos confiar en el estado del cliente (AppRoute.PLANS solo filtra visualmente)
    try {
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('[TOKEN] Configuración de Supabase ausente');
            return res.status(500).json({ error: 'Configuration Error' });
        }

        // Consultar directamente el perfil del usuario para verificar su plan
        const response = await fetch(
            `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=plan_id`,
            {
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`
                }
            }
        );

        if (!response.ok) {
            console.error('[TOKEN] Error consultando perfil:', response.statusText);
            return res.status(500).json({ error: 'Identity verification failed' });
        }

        const data = await response.json();
        const profile = data[0];

        if (!profile || profile.plan_id !== 'business_plus') {
            console.warn(`[SECURITY] 🛑 Intento de acceso no autorizado al Dialer. User: ${userId}, Plan: ${profile?.plan_id || 'unknown'}`);
            return res.status(403).json({
                error: 'Unauthorized',
                message: 'El acceso al Dialer requiere un plan Business Plus.'
            });
        }

        console.log(`[TOKEN] ✅ Acceso concedido para user ${userId} (Plan: business_plus)`);

    } catch (err) {
        console.error('[TOKEN] Crash durante validación:', err);
        return res.status(500).json({ error: 'Validation process failed' });
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