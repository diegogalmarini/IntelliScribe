
import twilio from 'twilio';

export default async function handler(req, res) {
    const response = new twilio.twiml.VoiceResponse();
    const { To } = req.body;

    // Si hay un número 'To', llamar a ese número (PSTN)
    // Asegurarse de que el CallerId esté verificado o sea un número de Twilio
    if (To) {
        const dial = response.dial({
            callerId: process.env.TWILIO_CALLER_ID, // Tu número de Twilio comprado
        });
        dial.number(To);
    } else {
        response.say("Welcome to Diktalo. No destination number was provided.");
    }

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(response.toString());
}
