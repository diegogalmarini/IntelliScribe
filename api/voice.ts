import type { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';
import { getTierForNumber } from '../utils/voiceRates';

const VoiceResponse = twilio.twiml.VoiceResponse;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const twiml = new VoiceResponse();

    // Obtener datos
    const to = req.body.To || req.query.To;
    const userId = req.query.userId || req.body.userId;

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
                    `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=phone,phone_verified,plan_id,voice_credits`,
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

                        // Use user's phone if phone_verified is true
                        if (profile.phone_verified && profile.phone) {
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

    const callbackUrl = 'https://www.diktalo.com/api/recording-callback';

    const dialOptions: any = {
        callerId: callerId,
        answerOnBridge: true,
        timeout: 30,
        record: 'record-from-answer-dual',
        recordingStatusCallbackMethod: 'POST',
        recordingStatusCallbackEvent: ['completed']
    };

    dialOptions.recordingStatusCallback = `${callbackUrl}?userId=${userId}&to=${encodeURIComponent(numberToCall)}`;
    console.log(`[VOICE] ✅ Recording will be saved to database for user ${userId}`);

    const dial = twiml.dial(dialOptions);

    if (/^[\d\+\-\(\) ]+$/.test(numberToCall)) {
        dial.number(numberToCall);
    } else {
        dial.client(numberToCall);
    }

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml.toString());
}
