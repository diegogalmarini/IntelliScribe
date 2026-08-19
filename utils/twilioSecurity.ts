
import type { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';

/**
 * Validates that the incoming request is from Twilio.
 * 
 * @param req The VercelRequest object
 * @param res The VercelResponse object
 * @returns true if valid, false if invalid (and handles the response)
 */
export function validateTwilioRequest(req: VercelRequest, res: VercelResponse): boolean {
    // 1. Salto de validación solo en desarrollo.
    //
    // Antes la condición era que el header `Host` contuviera "localhost", y ese
    // header lo controla quien hace la petición: bastaba enviarlo así para
    // saltarse la comprobación de firma en producción. Ahora depende del entorno
    // del servidor y además exige un opt-in explícito.
    const isProduction = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
    if (!isProduction && process.env.TWILIO_SKIP_SIGNATURE === '1') {
        console.log('[SECURITY] ⚠️ Entorno de desarrollo con TWILIO_SKIP_SIGNATURE=1. Se omite la validación de firma.');
        return true;
    }

    // 2. Get Auth Token
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!authToken) {
        console.error('[SECURITY] ❌ TWILIO_AUTH_TOKEN is missing in environment variables.');
        res.status(500).send('Server Configuration Error');
        return false;
    }

    // 3. Get Signature Header
    const signature = req.headers['x-twilio-signature'] as string;
    if (!signature) {
        console.warn('[SECURITY] 🛑 Missing X-Twilio-Signature header. Rejecting request.');
        res.status(403).send('Forbidden: Missing Signature');
        return false;
    }

    // 4. Reconstruct URL
    // Vercel/Node puts the protocol in 'x-forwarded-proto' usually, or we default to https
    // El Host se usa aquí solo para reconstruir la URL que Twilio firmó; si no
    // coincide, la firma no valida, que es justo lo que se quiere.
    const host = req.headers.host || '';
    const protocol = (req.headers['x-forwarded-proto'] as string) || 'https';
    const url = `${protocol}://${host}${req.url}`;

    // 5. Get Params (Body + Query? No, Twilio signs the POST body or the query string depending on method)
    // For POST, it signs the key/value pairs in the body.
    // For GET, it signs the URL with query params.
    // Vercel parses the body for us into req.body.
    const params = req.body || {};

    // 6. Validate
    try {
        const isValid = twilio.validateRequest(authToken, signature, url, params);

        if (!isValid) {
            console.warn(`[SECURITY] 🛑 Invalid Twilio Signature. URL: ${url}`);
            res.status(403).send('Forbidden: Invalid Signature');
            return false;
        }

        return true;
    } catch (error) {
        console.error('[SECURITY] Error during validation:', error);
        res.status(500).send('Security Validation Error');
        return false;
    }
}
