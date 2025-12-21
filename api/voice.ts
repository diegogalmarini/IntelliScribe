import type { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';
const VoiceResponse = twilio.twiml.VoiceResponse;

// Lista de países permitidos (puedes ampliarla)
const ALLOWED_PREFIXES = ['+1', '+34', '+44', '+33', '+49', '+39'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const twiml = new VoiceResponse();

    // Obtener datos
    const to = req.body.To || req.query.To;
    const userId = req.body.userId || req.query.userId; // NEW: Get userId to lookup verified caller ID

    // Ohio number as fallback
    const fallbackCallerId = process.env.TWILIO_CALLER_ID;

    console.log(`[VOICE] Request to call ${to} from user ${userId}`);

    if (!to) {
        twiml.say('Error: número destino no proporcionado.');
        res.setHeader('Content-Type', 'text/xml');
        return res.status(200).send(twiml.toString());
    }

    // Query verified caller ID if userId provided
    let callerId = fallbackCallerId;
    let verificationStatus = 'none'; // For logging

    if (userId) {
        try {
            const supabaseUrl = process.env.SUPABASE_URL;
            const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (supabaseUrl && supabaseServiceKey) {
                const response = await fetch(
                    `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=phone,caller_id_verified`,
                    {
                        headers: {
                            'apikey': supabaseServiceKey,
                            'Authorization': `Bearer ${supabaseServiceKey}`
                        }
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.length > 0) {
                        const profile = data[0];

                        // Use user's phone if caller_id_verified is true
                        if (profile.caller_id_verified && profile.phone) {
                            callerId = profile.phone;
                            verificationStatus = 'verified';
                            console.log(`[VOICE] ✅ Using verified caller ID: ${callerId} for user ${userId}`);
                        } else {
                            verificationStatus = 'unverified';
                            console.log(`[VOICE] ⚠️ User ${userId} has not verified caller ID, using fallback: ${fallbackCallerId}`);
                        }
                    }
                } else {
                    console.error('[VOICE] Failed to query Supabase:', response.statusText);
                }
            }
        } catch (error) {
            console.error('[VOICE] Error querying verified caller ID:', error);
            // Continue with fallback
        }
    } else {
        console.log('[VOICE] No userId provided, using fallback caller ID');
    }

    console.log(`[VOICE] Calling ${to} from ${callerId} (verified: ${verificationStatus})`);

    if (!callerId) {
        twiml.say('Error de configuración: no hay caller ID disponible.');
        res.setHeader('Content-Type', 'text/xml');
        return res.status(200).send(twiml.toString());
    }

    // Limpieza de número
    let numberToCall = to.replace(/[\s\-\(\)]/g, '');
    if (!numberToCall.startsWith('+')) numberToCall = '+' + numberToCall;

    // Validación de seguridad simple
    const isAllowed = ALLOWED_PREFIXES.some(p => numberToCall.startsWith(p));
    if (!isAllowed) {
        twiml.say({ language: 'es-ES' }, 'Destino no permitido.');
        res.setHeader('Content-Type', 'text/xml');
        return res.status(200).send(twiml.toString());
    }

    // CONEXIÓN con caller ID y grabación configurados
    // Use hardcoded production URL for reliability
    const callbackUrl = 'https://www.diktalo.com/api/recording-callback';

    console.log(`[VOICE] Recording callback URL: ${callbackUrl}?userId=${userId || 'unknown'}`);

    const dial = twiml.dial({
        callerId: callerId,  // Use verified phone or fallback
        answerOnBridge: true,
        timeout: 30,  // Add timeout to prevent hanging
        record: 'record-from-answer-dual',  // Record both sides of call
        recordingStatusCallback: `${callbackUrl}?userId=${userId || 'unknown'}`,
        recordingStatusCallbackMethod: 'POST',  // Ensure Twilio uses POST
        recordingStatusCallbackEvent: ['completed']  // Only notify when recording is done
    });

    // Detectar si es número o cliente
    if (/^[\d\+\-\(\) ]+$/.test(numberToCall)) {
        dial.number(numberToCall);
    } else {
        dial.client(numberToCall);
    }

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml.toString());
}
