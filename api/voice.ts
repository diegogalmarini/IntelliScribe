import type { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';
const VoiceResponse = twilio.twiml.VoiceResponse;

// Lista de países permitidos (puedes ampliarla)
const ALLOWED_PREFIXES = ['+1', '+34', '+44', '+33', '+49', '+39'];

export default function handler(req: VercelRequest, res: VercelResponse) {
    const twiml = new VoiceResponse();

    // Obtener datos
    const to = req.body.To || req.query.To;
    // IMPORTANT: Use custom parameter, not 'From' (Twilio reserves this for device identity)
    const verifiedPhone = req.body.VerifiedPhone || req.query.VerifiedPhone;
    const fallbackCallerId = process.env.TWILIO_CALLER_ID; // Ohio number fallback

    // Use verified phone if provided AND it's a valid phone number, otherwise use fallback
    let callerId = fallbackCallerId;
    if (verifiedPhone && /^\+\d{10,15}$/.test(verifiedPhone)) {
        callerId = verifiedPhone;
    }

    console.log(`[VOICE] Calling ${to} from ${callerId} (verified: ${verifiedPhone || 'none'})`);

    if (!to || !callerId) {
        twiml.say('Error de configuración.');
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

    // CONEXIÓN con caller ID configurado
    const dial = twiml.dial({
        callerId: callerId,  // Use verified phone or fallback
        answerOnBridge: true,
        timeout: 30  // Add timeout to prevent hanging
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
