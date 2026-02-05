import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTierForNumber } from '../utils/voiceRates';

// Helper to validate UUID format
function isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

// Helper to format duration seconds to HH:MM:SS
function formatDuration(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const start = Date.now();
    console.log(`📞 [RECORDING-CALLBACK] RECVD: ${req.method} | SID: ${req.body?.RecordingSid || req.query?.RecordingSid}`);

    try {
        // 1. EXTRACT DATA & LOG EVERYTHING
        const body = req.body || {};
        const query = req.query || {};

        const RecordingSid = body.RecordingSid || query.RecordingSid;
        const RecordingUrl = body.RecordingUrl || query.RecordingUrl;
        const RecordingDuration = body.RecordingDuration || query.RecordingDuration;
        const To = body.To || query.To;
        const From = body.From || query.From;
        const RecordingStatus = body.RecordingStatus || query.RecordingStatus;
        const CallSid = body.CallSid || query.CallSid;

        // HIGH PRIORITY: Try to find userId everywhere
        // Twilio might strip query params if not configured correctly, so check body too
        const userId = (query.userId || body.userId || body.userId_custom) as string;
        const queryTo = query.to as string;
        const numberToCall = queryTo ? decodeURIComponent(queryTo) : To;

        console.log('[RECORDING-CALLBACK] CONTEXT:', {
            userId,
            RecordingSid,
            Status: RecordingStatus,
            CallSid,
            host: req.headers.host
        });

        // If no userId, we are stuck. Acknowledge so Twilio doesn't retry infinitely.
        if (!userId || userId === 'unknown' || userId === 'undefined') {
            console.error('❌ [RECORDING-CALLBACK] Missing userId. Cannot save.');
            return res.status(200).json({ error: 'Missing userId', status: 'ignored' });
        }

        if (RecordingStatus !== 'completed') {
            console.log(`[RECORDING-CALLBACK] Skipping: Status is ${RecordingStatus}`);
            return res.status(200).json({ message: 'Recording not ready' });
        }

        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('❌ [RECORDING-CALLBACK] Missing Env Vars');
            throw new Error('Supabase config error');
        }

        // 2. CALCULATE CREDITS
        const durationSeconds = parseInt(RecordingDuration) || 0;
        const minutesCharged = Math.max(1, Math.ceil(durationSeconds / 60));
        const tier = getTierForNumber(numberToCall || '');
        const creditsToDeduct = minutesCharged * tier.multiplier;

        console.log(`💰 [RECORDING-CALLBACK] Charge: ${creditsToDeduct} for ${durationSeconds}s`);

        // ATOMIC DEDUCTION (NON-BLOCKING)
        // Ensure this RPC uses the correct 'profiles' table internally (updated in SQL)
        try {
            const rpcResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/decrement_voice_credits`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'apikey': supabaseServiceKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    p_user_id: userId,
                    p_amount: creditsToDeduct
                })
            });

            if (!rpcResponse.ok) {
                const rpcErr = await rpcResponse.text();
                console.warn('⚠️ [RECORDING-CALLBACK] Deduction RPC Failed:', rpcErr);
            } else {
                console.log('✅ [RECORDING-CALLBACK] Credits deducted');
            }
        } catch (rpcErr) {
            console.warn('[RECORDING-CALLBACK] RPC error:', rpcErr);
        }

        // 3. DOWNLOAD FROM TWILIO
        const audioUrl = RecordingUrl + '.mp3';
        const twilioAuth = Buffer.from(
            `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
        ).toString('base64');

        const audioResponse = await fetch(audioUrl, {
            headers: { 'Authorization': `Basic ${twilioAuth}` }
        });

        if (!audioResponse.ok) {
            console.error(`❌ [RECORDING-CALLBACK] Twilio Download Error: ${audioResponse.status}`);
            throw new Error(`Twilio download failed: ${audioResponse.status}`);
        }

        const audioBuffer = await audioResponse.arrayBuffer();
        console.log(`✅ [RECORDING-CALLBACK] Downloaded ${audioBuffer.byteLength} bytes`);

        // 4. UPLOAD TO STORAGE
        const fileName = `${userId}/${RecordingSid || CallSid || Date.now()}.mp3`;
        const storageUrl = `${supabaseUrl}/storage/v1/object/recordings/${fileName}`;

        const uploadResponse = await fetch(storageUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'audio/mpeg',
                'apikey': supabaseServiceKey,
                'x-upsert': 'true'
            },
            body: audioBuffer
        });

        if (!uploadResponse.ok) {
            const upError = await uploadResponse.text();
            console.error(`❌ [RECORDING-CALLBACK] Storage Error: ${upError}`);
            throw new Error('Supabase Storage error');
        }

        const publicAudioUrl = `${supabaseUrl}/storage/v1/object/public/recordings/${fileName}`;

        // 5. INSERT DB RECORD
        const formattedDuration = formatDuration(durationSeconds);
        const recipient = numberToCall || To || 'Unknown';

        const recordingData = {
            user_id: userId,
            title: `Call to ${recipient}`,
            description: `Recorded call to ${recipient}`,
            date: new Date().toISOString(),
            duration: formattedDuration,
            duration_seconds: durationSeconds,
            status: 'Completed',
            audio_url: publicAudioUrl,
            participants: 2,
            tags: ['phone-call'],
            metadata: {
                voice_tier: tier.id,
                credits_deducted: creditsToDeduct,
                twilio_sid: RecordingSid,
                call_sid: CallSid
            }
        };

        const dbResponse = await fetch(`${supabaseUrl}/rest/v1/recordings`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'apikey': supabaseServiceKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(recordingData)
        });

        if (!dbResponse.ok) {
            const dbError = await dbResponse.text();
            console.error(`❌ [RECORDING-CALLBACK] DB Error: ${dbError}`);
            throw new Error('Database insert error');
        }

        const savedData = await dbResponse.json();
        console.log(`✅ [RECORDING-CALLBACK] Finalized in ${Date.now() - start}ms. ID: ${savedData[0]?.id}`);

        return res.status(200).json({ success: true, id: savedData[0]?.id });

    } catch (error: any) {
        console.error('🔥 [RECORDING-CALLBACK] CRITICAL:', error.message);
        // Still return 200 to keep Twilio happy, but logs will tell us the error
        return res.status(200).json({ error: error.message });
    }
}
