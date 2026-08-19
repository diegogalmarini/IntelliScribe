import type { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';
import { validateTwilioRequest } from '../utils/twilioSecurity.js';
import { getTierForNumber } from '../utils/voiceRates.js';

const VoiceResponse = twilio.twiml.VoiceResponse;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resuelve a quién se le factura la llamada.
 *
 * `From` lo rellena Twilio a partir del identity del AccessToken que emitió
 * /api/twilio-token, así que no es manipulable por el navegador. El parámetro
 * `userId` sí lo pone el cliente (services/callService.ts lo manda en
 * device.connect), de modo que solo se usa como último recurso y se registra
 * cuando no coincide.
 */
function resolveUserId(req: VercelRequest): string | null {
    const from = (req.body?.From || req.query?.From) as string | undefined;
    const claimed = (req.query?.userId || req.body?.userId) as string | undefined;

    if (from && from.startsWith('client:')) {
        const identity = from.slice('client:'.length);
        if (UUID_RE.test(identity)) {
            if (claimed && claimed !== identity) {
                console.warn(`[VOICE] 🛑 El parámetro userId (${claimed}) no coincide con la identidad del token (${identity}). Se usa la del token.`);
            }
            return identity;
        }
        console.warn(`[VOICE] Identidad de token con formato inesperado: ${identity}`);
    }

    if (claimed && UUID_RE.test(claimed)) {
        console.warn('[VOICE] Sin identidad en From; se recurre al userId del parámetro.');
        return claimed;
    }

    return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 🔒 SECURITY: Validate Twilio Signature
    if (!validateTwilioRequest(req, res)) {
        return; // Response already handled by middleware
    }

    const twiml = new VoiceResponse();

    // Obtener datos
    const to = req.body.To || req.query.To;
    const userId = resolveUserId(req);

    // Ohio number as fallback
    const fallbackCallerId = process.env.TWILIO_CALLER_ID;

    console.log(`[VOICE] Request to call ${to} from user ${userId}`);

    if (!to) {
        console.error('[VOICE] ❌ Error: Missing "To" parameter');
        twiml.say('Error de sistema: falta el número de destino.');
        res.setHeader('Content-Type', 'text/xml');
        return res.status(200).send(twiml.toString());
    }

    // --- NEW: Voice Credit & Tier System ---
    let numberToCall = to.replace(/[\s\-\(\)]/g, '');
    if (!numberToCall.startsWith('+')) numberToCall = '+' + numberToCall;

    const tier = getTierForNumber(numberToCall);
    console.log(`[VOICE] Destination Tier: ${tier.id} (Multiplier: ${tier.multiplier})`);

    if (tier.id === 'BLOCKED') {
        console.warn(`[VOICE] 🛑 Blocked destination: ${numberToCall}`);
        twiml.say({ language: 'es-ES' }, 'Lo sentimos, este destino no está incluido en su plan actual o no está permitido por seguridad.');
        res.setHeader('Content-Type', 'text/xml');
        return res.status(200).send(twiml.toString());
    }

    // Query verified caller ID and credits if userId provided
    let callerId = fallbackCallerId;
    let verificationStatus = 'none';

    if (userId && userId !== 'guest' && userId !== 'unknown') {
        try {
            const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
            const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (supabaseUrl && supabaseServiceKey) {
                const response = await fetch(
                    `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=phone,phone_verified,caller_id_verified,plan_id,voice_credits`,
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

                        // 🔴 SECURITY: Block call if plan doesn't allow VoIP
                        if (profile.plan_id !== 'business_plus') {
                            console.warn(`[VOICE] 🛑 Plan restriction for user ${userId} (Plan: ${profile.plan_id})`);
                            twiml.say({ language: 'es-ES' }, 'Su suscripción actual no permite realizar llamadas salientes. Por favor, actualice su plan.');
                            res.setHeader('Content-Type', 'text/xml');
                            return res.status(200).send(twiml.toString());
                        }

                        // 🔴 CREDIT CHECK: Ensure user has at least enough for 1 minute of this tier
                        const credits = profile.voice_credits || 0;
                        if (credits < tier.multiplier) {
                            console.warn(`[VOICE] 🛑 Insufficient credits for user ${userId} (${credits} credits available, ${tier.multiplier} needed)`);
                            twiml.say({ language: 'es-ES' }, 'No tienes suficientes créditos de voz para realizar esta llamada. Por favor, recarga tu cuenta.');
                            res.setHeader('Content-Type', 'text/xml');
                            return res.status(200).send(twiml.toString());
                        }

                        // Use user's phone if caller_id_verified is true
                        // ⚠️ CHANGE: We now check caller_id_verified specifically for Twilio
                        if (profile.caller_id_verified && profile.phone) {
                            callerId = profile.phone;
                            verificationStatus = 'verified';
                            console.log(`[VOICE] ✅ Using verified caller ID: ${callerId} for user ${userId}`);
                        } else if (profile.phone_verified && profile.phone) {
                            // Temporary fallback: If phone verified via SMS but not yet in Twilio
                            // Note: This might still trigger 31005 if Twilio hasn't verified it
                            callerId = profile.phone;
                            verificationStatus = 'partially_verified';
                            console.log(`[VOICE] ⚠️ Using SMS-verified phone: ${callerId} for user ${userId}. Twilio might reject this.`);
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
            console.error('[VOICE] Error querying profile for call:', error);
        }
    } else {
        console.warn('[VOICE] ⚠️ No valid userId provided. Blocking call.');
        twiml.say({ language: 'es-ES' }, 'Error de autenticación. Por favor, inicie sesión.');
        res.setHeader('Content-Type', 'text/xml');
        return res.status(200).send(twiml.toString());
    }

    console.log(`[VOICE] Proceeding with call to ${numberToCall} from ${callerId} (Tier: ${tier.id})`);

    if (!callerId) {
        twiml.say('Error de configuración: no hay caller ID disponible.');
        res.setHeader('Content-Type', 'text/xml');
        return res.status(200).send(twiml.toString());
    }

    // --- DYNAMIC CALLBACK URL ---
    // If we are on localhost, Twilio cannot call back to us.
    // We force production URL so the audio is at least saved in the main DB and Storage.
    let host = req.headers.host || 'www.diktalo.com';
    let protocol = 'https';

    if (host.includes('localhost') || host.includes('127.0.0.1')) {
        console.log(`[VOICE] 🏠 Localhost detected (${host}). Redirecting callback to production for Twilio reachability.`);
        host = 'www.diktalo.com';
    }

    const callbackUrl = `${protocol}://${host}/api/recording-callback`;

    const dialOptions: any = {
        callerId: callerId,
        answerOnBridge: false,
        timeout: 30,
        record: 'record-from-answer-dual',
        recordingStatusCallbackMethod: 'POST',
        recordingStatusCallbackEvent: ['completed']
    };

    dialOptions.recordingStatusCallback = `${callbackUrl}?userId=${userId}&to=${encodeURIComponent(numberToCall)}`;
    console.log(`[VOICE] ✅ Recording callback set to: ${dialOptions.recordingStatusCallback}`);

    const dial = twiml.dial(dialOptions);

    if (/^[\d\+\-\(\) ]+$/.test(numberToCall)) {
        dial.number(numberToCall);
    } else {
        dial.client(numberToCall);
    }

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml.toString());
}
