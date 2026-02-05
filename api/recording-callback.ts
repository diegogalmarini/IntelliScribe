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

// Helper for diagnostic logging
async function logDiagnostic(supabaseUrl: string, supabaseKey: string, userId: string | null, status: string, payload: any, error?: string) {
    if (!userId || userId === 'unknown' || userId === 'undefined') return;
    try {
        await fetch(`${supabaseUrl}/rest/v1/integration_logs`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                status: status,
                payload: {
                    ...payload,
                    service: 'TWILIO_VOICE',
                    timestamp: new Date().toISOString()
                },
                error_message: error || null,
                response_code: error ? 500 : 200
            })
        });
    } catch (e) {
        console.error('[DIAGNOSTIC] FAILED:', e);
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const start = Date.now();
    const body = req.body || {};
    const query = req.query || {};

    const RecordingSid = body.RecordingSid || query.RecordingSid;
    const RecordingUrl = body.RecordingUrl || query.RecordingUrl;
    const RecordingStatus = body.RecordingStatus || query.RecordingStatus;
    const callSid = body.CallSid || query.CallSid;

    // Robust userId extraction
    const userId = (query.userId || body.userId || body.userId_custom) as string;

    console.log(`📞 [REC-CALLBACK] SID: ${RecordingSid} | User: ${userId} | Status: ${RecordingStatus}`);

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    try {
        if (!supabaseUrl || !supabaseServiceKey) throw new Error('Missing Supabase Config');

        // Step 1: Log Start
        await logDiagnostic(supabaseUrl, supabaseServiceKey, userId, 'CALLBACK_RECEIVED', {
            RecordingSid,
            RecordingStatus,
            params: { query, body }
        });

        if (!userId || userId === 'unknown' || userId === 'undefined') {
            console.error('❌ [REC-CALLBACK] No userId found');
            return res.status(200).json({ error: 'Missing userId', status: 'ignored' });
        }

        if (RecordingStatus !== 'completed') {
            console.log(`[REC-CALLBACK] Status ${RecordingStatus} - skipping`);
            return res.status(200).json({ message: 'Not completed' });
        }

        // Step 2: Calculate Credits & Deduct
        const durationSeconds = parseInt(body.RecordingDuration || query.RecordingDuration) || 0;
        const minutesCharged = Math.max(1, Math.ceil(durationSeconds / 60));
        const queryTo = query.to as string;
        const numberToCall = queryTo ? decodeURIComponent(queryTo) : (body.To || query.To || '');
        const tier = getTierForNumber(numberToCall);
        const creditsToDeduct = minutesCharged * tier.multiplier;

        console.log(`💰 [REC-CALLBACK] Deducting ${creditsToDeduct} credits`);

        try {
            const rpcResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/decrement_voice_credits`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'apikey': supabaseServiceKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ p_user_id: userId, p_amount: creditsToDeduct })
            });
            if (!rpcResponse.ok) {
                const errText = await rpcResponse.text();
                await logDiagnostic(supabaseUrl, supabaseServiceKey, userId, 'CREDIT_DEDUCTION_FAILED', { amount: creditsToDeduct }, errText);
            } else {
                await logDiagnostic(supabaseUrl, supabaseServiceKey, userId, 'CREDIT_DEDUCTION_SUCCESS', { amount: creditsToDeduct });
            }
        } catch (rpcErr: any) {
            console.warn('[REC-CALLBACK] RPC Error:', rpcErr.message);
            await logDiagnostic(supabaseUrl, supabaseServiceKey, userId, 'CREDIT_RPC_ERROR', { amount: creditsToDeduct }, rpcErr.message);
        }

        // Step 3: Download & Upload
        const audioUrl = `${RecordingUrl}.mp3`;
        const twilioAuth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');

        const audioResponse = await fetch(audioUrl, { headers: { 'Authorization': `Basic ${twilioAuth}` } });
        if (!audioResponse.ok) throw new Error(`Twilio Download Failed: ${audioResponse.status}`);

        const audioBuffer = await audioResponse.arrayBuffer();
        const fileName = `${userId}/${RecordingSid || callSid || Date.now()}.mp3`;
        const storageUrl = `${supabaseUrl}/storage/v1/object/recordings/${fileName}`;

        const uploadResponse = await fetch(storageUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'audio/mpeg',
                'apikey': supabaseServiceKey,
                'x-upsert': 'true'
            },
            body: Buffer.from(audioBuffer) // Ensure Buffer for Node.js fetch
        });

        if (!uploadResponse.ok) {
            const upErr = await uploadResponse.text();
            throw new Error(`Storage Upload Failed: ${upErr}`);
        }

        const publicAudioUrl = `${supabaseUrl}/storage/v1/object/public/recordings/${fileName}`;

        // Step 4: Final Insert with ALL SCHEMA FIELDS
        const formattedDuration = formatDuration(durationSeconds);
        const recordingData = {
            user_id: userId,
            title: `Call to ${numberToCall || 'Unknown'}`,
            description: `Recorded call to ${numberToCall || 'Unknown'}`,
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
                call_sid: callSid
            },
            // SCHEMA COMPLIANCE (Explicit defaults)
            notes: [],
            media: [],
            segments: [],
            folder_id: null,
            summary: null
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
            const dbErr = await dbResponse.text();
            await logDiagnostic(supabaseUrl, supabaseServiceKey, userId, 'DB_INSERT_FAILED', { data: recordingData }, dbErr);
            throw new Error(`DB Insert Failed: ${dbErr}`);
        }

        const savedData = await dbResponse.json();
        await logDiagnostic(supabaseUrl, supabaseServiceKey, userId, 'CALLBACK_FINISHED', { recordingId: savedData[0]?.id });

        console.log(`✅ [REC-CALLBACK] Done in ${Date.now() - start}ms`);
        return res.status(200).json({ success: true, id: savedData[0]?.id });

    } catch (err: any) {
        console.error('🔥 [REC-CALLBACK] CRITICAL:', err.message);
        await logDiagnostic(supabaseUrl!, supabaseServiceKey!, userId, 'CALLBACK_CRITICAL_ERROR', {}, err.message);
        return res.status(200).json({ error: err.message }); // 200 to stop Twilio retries
    }
}
