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
    console.log('📞 [RECORDING-CALLBACK] Received Twilio recording callback');

    try {
        // Extract Twilio parameters
        const {
            RecordingSid,
            RecordingUrl,
            RecordingDuration,
            To,
            From,
            RecordingStatus
        } = req.body;

        const userId = req.query.userId as string;
        const queryTo = req.query.to as string;
        // Logic: if 'to' is in query (from our voice.ts), it's more accurate.
        const numberToCall = queryTo ? decodeURIComponent(queryTo) : To;

        console.log(`📞 [RECORDING-CALLBACK] Recording ${RecordingSid} for user ${userId}, To: ${numberToCall}`);

        if (!userId || userId === 'unknown' || !isValidUUID(userId)) {
            console.error('❌ [RECORDING-CALLBACK] Invalid or missing userId');
            return res.status(400).json({ error: 'Invalid userId' });
        }

        if (RecordingStatus !== 'completed') {
            return res.status(200).json({ message: 'Recording not ready' });
        }

        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase credentials');
        }

        // --- NEW: Calculate and Deduct Credits ---
        const durationSeconds = parseInt(RecordingDuration) || 0;
        const minutesCharged = Math.max(1, Math.ceil(durationSeconds / 60));
        const tier = getTierForNumber(numberToCall || '');
        const creditsToDeduct = minutesCharged * tier.multiplier;

        console.log(`💰 [RECORDING-CALLBACK] Charging ${creditsToDeduct} credits (${minutesCharged} min * ${tier.multiplier}x)`);

        // Atomic deduction via RPC
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
                const errorText = await rpcResponse.text();
                console.error('❌ [RECORDING-CALLBACK] Credit deduction failed:', errorText);
            } else {
                console.log(`✅ [RECORDING-CALLBACK] Deducted ${creditsToDeduct} credits from user ${userId}`);
            }
        } catch (rpcErr) {
            console.error('❌ [RECORDING-CALLBACK] RPC Error:', rpcErr);
        }

        // Step 1: Download recording from Twilio
        console.log('⬇️ [RECORDING-CALLBACK] Downloading audio from Twilio...');

        const twilioAuth = Buffer.from(
            `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
        ).toString('base64');

        const audioUrl = RecordingUrl + '.mp3';
        const audioResponse = await fetch(audioUrl, {
            headers: { 'Authorization': `Basic ${twilioAuth}` }
        });

        if (!audioResponse.ok) {
            throw new Error(`Failed to download audio: ${audioResponse.statusText}`);
        }

        const audioBuffer = await audioResponse.arrayBuffer();

        // Step 2: Upload to Supabase Storage
        const fileName = `${userId}/${RecordingSid}.mp3`;
        const storageUrl = `${supabaseUrl}/storage/v1/object/recordings/${fileName}`;

        const uploadResponse = await fetch(storageUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'audio/mpeg',
                'apikey': supabaseServiceKey
            },
            body: audioBuffer
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Failed to upload to storage: ${errorText}`);
        }

        const publicAudioUrl = `${supabaseUrl}/storage/v1/object/public/recordings/${fileName}`;

        // Step 4: Create recording entry
        const formattedDuration = formatDuration(durationSeconds);
        const recipient = numberToCall || 'Unknown Number';
        const sender = From || 'Diktalo User';

        const recordingData = {
            user_id: userId,
            title: `Call to ${recipient}`,
            description: `Recorded conversation between ${sender} and ${recipient}`,
            date: new Date().toISOString(),
            duration: formattedDuration,
            duration_seconds: durationSeconds,
            status: 'Processing',
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
                credits_deducted: creditsToDeduct
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
            const errorText = await dbResponse.text();
            throw new Error(`Failed to insert into database: ${errorText}`);
        }

        const [recording] = await dbResponse.json();
        console.log(`✅ [RECORDING-CALLBACK] Created recording: ${recording.id}`);

        return res.status(200).json({
            success: true,
            recordingId: recording.id,
            creditsDeducted: creditsToDeduct
        });

    } catch (error: any) {
        console.error('🔥 [RECORDING-CALLBACK] ERROR:', error.message);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}
