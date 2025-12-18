import type { VercelRequest, VercelResponse } from '@vercel/node';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';

// --- PROFITABILITY PROTECTION ZONE (ZONE 1) ---
// These prefixes cover the "Included Calls" plan. 
// Any other destination will be blocked to prevent billing shocks.
const ALLOWED_PREFIXES = [
    '+1',   // USA & Canada
    '+34',  // Spain
    '+44',  // UK
    '+33',  // France
    '+49',  // Germany
    '+39',  // Italy
    '+351', // Portugal
    '+353', // Ireland
    '+31',  // Netherlands
    '+32'   // Belgium
];

export default function handler(req: VercelRequest, res: VercelResponse) {
    const twiml = new VoiceResponse();
    const to = req.body.To || req.query.To;

    // CRITICAL: Receive userId from Frontend to track usage
    const userId = req.body.userId || req.query.userId;

    // Use the verified Caller ID from env
    const callerId = process.env.TWILIO_CALLER_ID;

    // 1. Validation: Destination exists
    if (!to) {
        twiml.say({ language: 'es-ES' }, 'Error. No se detectó número de destino.');
        res.setHeader('Content-Type', 'text/xml');
        return res.status(200).send(twiml.toString());
    }

    // 2. COST PROTECTION LOGIC
    // Check if the destination is a phone number (not a browser client)
    const isPhoneNumber = /^[\d\+\-\(\) ]+$/.test(to);

    if (isPhoneNumber) {
        // Normalize number: Remove spaces, dashes, parentheses
        let cleanNumber = to.replace(/[\s\-\(\)]/g, '');

        // --- CRITICAL FIX: FORCE E.164 FORMAT ---
        // If the number arrives without a '+' (common in web requests), we treat it as valid.
        // We prepend '+' so the ALLOWED_PREFIXES check works correctly.
        if (!cleanNumber.startsWith('+')) {
            cleanNumber = '+' + cleanNumber;
        }

        // Check against Whitelist using the corrected cleanNumber
        const isAllowed = ALLOWED_PREFIXES.some(prefix => cleanNumber.startsWith(prefix));

        if (!isAllowed) {
            // Strategic Blocking Message
            twiml.say({ language: 'es-ES' }, 'Lo sentimos. El destino marcado no está incluido en su plan actual. Esta función estará disponible próximamente mediante recargas.');
            twiml.hangup();

            res.setHeader('Content-Type', 'text/xml');
            return res.status(200).send(twiml.toString());
        }
    }

    // 3. Connection Logic
    if (callerId) {
        const dial = twiml.dial({
            callerId: callerId,
            record: 'record-from-ringing', // AUTO-RECORDING ENABLED
            // INJECT USER ID INTO WEBHOOK URL
            recordingStatusCallback: `/api/webhooks/recording?userId=${userId}`,
        });

        if (isPhoneNumber) {
            dial.number(to);
        } else {
            dial.client(to);
        }
    } else {
        twiml.say({ language: 'es-ES' }, 'Error de configuración: Falta el Caller ID.');
    }

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml.toString());
}
