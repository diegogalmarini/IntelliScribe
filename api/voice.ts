import type { VercelRequest, VercelResponse } from '@vercel/node';
// CORRECCIÓN CRÍTICA: Importación segura para Vercel
import twilio from 'twilio';
const VoiceResponse = twilio.twiml.VoiceResponse;

const ALLOWED_PREFIXES = [
    '+1', '+34', '+44', '+33', '+49', '+39', '+351', '+353', '+31', '+32'
];

export default function handler(req: VercelRequest, res: VercelResponse) {
    console.log('📞 Voice Request:', req.body); // Esto aparecerá en los logs de Vercel

    const twiml = new VoiceResponse();

    try {
        const to = req.body.To || req.query.To;
        const userId = req.body.userId || req.query.userId;
        const callerId = process.env.TWILIO_CALLER_ID;

        if (!to) {
            twiml.say({ language: 'es-ES' }, 'Error. No se recibió el número de destino.');
            res.setHeader('Content-Type', 'text/xml');
            return res.status(200).send(twiml.toString());
        }

        const isPhoneNumber = /^[\d\+\-\(\) ]+$/.test(to);

        if (isPhoneNumber) {
            // Normalización segura
            let cleanNumber = to.replace(/[\s\-\(\)]/g, '');
            if (!cleanNumber.startsWith('+')) {
                cleanNumber = '+' + cleanNumber;
            }

            const isAllowed = ALLOWED_PREFIXES.some(prefix => cleanNumber.startsWith(prefix));

            if (!isAllowed) {
                twiml.say({ language: 'es-ES' }, 'Destino no incluido en el plan.');
                twiml.hangup();
                res.setHeader('Content-Type', 'text/xml');
                return res.status(200).send(twiml.toString());
            }
        }

        if (callerId) {
            const dial = twiml.dial({
                callerId: callerId,
                record: 'record-from-ringing',
                recordingStatusCallback: `/api/webhooks/recording?userId=${userId || 'guest'}`,
            });

            if (isPhoneNumber) {
                dial.number(to);
            } else {
                dial.client(to);
            }
        } else {
            twiml.say({ language: 'es-ES' }, 'Error de configuración. Falta Caller ID.');
        }

    } catch (error) {
        console.error('🔥 Error en voice.ts:', error);
        twiml.say({ language: 'es-ES' }, 'Ocurrió un error en el servidor.');
    }

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml.toString());
}
