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
    console.log('📞 [RECORDING-CALLBACK] NEW EVENT RECEIVED');

    try {
        // 1. EXTRACT DATA & LOG
        const {
            RecordingSid,
            RecordingUrl,
            RecordingDuration,
            To,
            From,
            RecordingStatus,
            CallSid
        } = req.body;

        const userId = (req.query.userId || req.body.userId) as string;
        const queryTo = req.query.to as string;
        const numberToCall = queryTo ? decodeURIComponent(queryTo) : To;

        console.log(`[RECORDING-CALLBACK] User: ${userId}, CallSid: ${CallSid}, Sid: ${RecordingSid}, Status: ${RecordingStatus}`);
        console.log(`[RECORDING-CALLBACK] Metadata: To=${To}, QueryTo=${queryTo}, Duration=${RecordingDuration}s`);

        // BASIC VALIDATION
        if (!userId) {
            console.error('❌ [RECORDING-CALLBACK] Missing userId');
            return res.status(400).json({ error: 'Missing userId' });
        }

        if (RecordingStatus !== 'completed') {
            console.log(`[RECORDING-CALLBACK] Wait: Status is ${RecordingStatus}`);
            return res.status(200).json({ message: 'Recording not ready' });
        }

        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('❌ [RECORDING-CALLBACK] Missing Supabase Env Variables');
            throw new Error('Supabase configuration error');
        }

        // 2. CALCULATE CREDITS
        const durationSeconds = parseInt(RecordingDuration) || 0;
        const minutesCharged = Math.max(1, Math.ceil(durationSeconds / 60));
        const tier = getTierForNumber(numberToCall || '');
        const creditsToDeduct = minutesCharged * tier.multiplier;

        console.log(`💰 [RECORDING-CALLBACK] Charged: ${creditsToDeduct} credits for ${minutesCharged}m`);

        // ATOMIC DEDUCTION
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

            if (!rpcResponse.ok) console.error('❌ [RECORDING-CALLBACK] RPC Credit Deduction failed');
        } catch (rpcErr) {
            console.warn('[RECORDING-CALLBACK] RPC Error (non-critical):', rpcErr);
        }

        // 3. DOWNLOAD FROM TWILIO
        console.log(`⬇️ [RECORDING-CALLBACK] Downloading: ${RecordingUrl}.mp3`);

        const twilioAuth = Buffer.from(
            `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
        ).toString('base64');

        const audioUrl = RecordingUrl + '.mp3';
        const audioResponse = await fetch(audioUrl, {
            headers: { 'Authorization': `Basic ${twilioAuth}` }
        });

        if (!audioResponse.ok) {
            console.error(`❌ [RECORDING-CALLBACK] Twilio Download Error: ${audioResponse.status}`);
            throw new Error(`Twilio download failed: ${audioResponse.status}`);
        }

        const audioBuffer = await audioResponse.arrayBuffer();
        console.log(`✅ [RECORDING-CALLBACK] File Size: ${audioBuffer.byteLength} bytes`);

        // 4. UPLOAD TO SUPABASE STORAGE
        const fileName = `${userId}/${RecordingSid || CallSid || Date.now()}.mp3`;
        const storageUrl = `${supabaseUrl}/storage/v1/object/recordings/${fileName}`;

        console.log(`⬆️ [RECORDING-CALLBACK] Uploading to Storage: recordings/${fileName}`);

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
            console.error(`❌ [RECORDING-CALLBACK] Storage Upload failed: ${upError}`);
            throw new Error('Supabase Storage error');
        }

        const publicAudioUrl = `${supabaseUrl}/storage/v1/object/public/recordings/${fileName}`;
        console.log(`✅ [RECORDING-CALLBACK] Public URL: ${publicAudioUrl}`);

        // 5. INSERT DB RECORD
        const formattedDuration = formatDuration(durationSeconds);
        const recipient = numberToCall || To || 'Unknown Number';
        const sender = From || 'Diktalo User';

        const recordingData = {
            user_id: userId,
            title: `Call to ${recipient}`,
            description: `Recorded call from ${sender} to ${recipient}`,
            date: new Date().toISOString(),
            duration: formattedDuration,
            duration_seconds: durationSeconds,
            status: 'Completed',
            audio_url: publicAudioUrl,
            participants: 2,
            folder_id: null,
            tags: ['phone-call'],
            notes: [],
            media: [],
            segments: [],
            metadata: {
                voice_tier: tier.id,
                multiplier: tier.multiplier,
                credits_deducted: creditsToDeduct,
                twilio_sid: RecordingSid,
                call_sid: CallSid
            }
        };

        console.log('💾 [RECORDING-CALLBACK] Saving to recordings table...');

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
            console.error(`❌ [RECORDING-CALLBACK] DB Insert failed: ${dbError}`);
            throw new Error('Database insert error');
        }

        const savedData = await dbResponse.json();
        console.log(`✅ [RECORDING-CALLBACK] SUCCESS: Created Recording ID: ${savedData[0]?.id}`);

        return res.status(200).json({ success: true, id: savedData[0]?.id });

    } catch (error: any) {
        console.error('🔥 [RECORDING-CALLBACK] CRITICAL ERROR:', error.message);
        return res.status(500).json({ error: error.message });
    }
}
