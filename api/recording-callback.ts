import type { VercelRequest, VercelResponse } from '@vercel/node';

// Helper to format duration seconds to HH:MM:SS
function formatDuration(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    console.log('📞 [RECORDING-CALLBACK] Received Twilio recording callback');
    console.log('📋 [RECORDING-CALLBACK] Request body:', JSON.stringify(req.body, null, 2));
    console.log('📋 [RECORDING-CALLBACK] Query params:', JSON.stringify(req.query, null, 2));

    try {
        // Extract Twilio parameters
        const {
            RecordingSid,
            RecordingUrl,
            RecordingDuration,
            CallSid,
            To,
            From,
            RecordingStatus
        } = req.body;

        // Get userId from query params (we passed it in the callback URL)
        const userId = req.query.userId as string;

        console.log(`📞 [RECORDING-CALLBACK] Recording ${RecordingSid} for user ${userId}`);
        console.log(`📞 [RECORDING-CALLBACK] Duration: ${RecordingDuration}s, Status: ${RecordingStatus}`);

        if (!userId || userId === 'unknown') {
            console.error('❌ [RECORDING-CALLBACK] No userId provided');
            return res.status(400).json({ error: 'Missing userId' });
        }

        if (RecordingStatus !== 'completed') {
            console.log(`⏭️ [RECORDING-CALLBACK] Recording not completed yet, status: ${RecordingStatus}`);
            return res.status(200).json({ message: 'Recording not ready yet' });
        }

        // Get Supabase credentials
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase credentials');
        }

        // Step 1: Download recording from Twilio
        console.log('⬇️ [RECORDING-CALLBACK] Downloading audio from Twilio...');

        const twilioAuth = Buffer.from(
            `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
        ).toString('base64');

        const audioUrl = RecordingUrl + '.mp3';  // Twilio MP3 format
        const audioResponse = await fetch(audioUrl, {
            headers: { 'Authorization': `Basic ${twilioAuth}` }
        });

        if (!audioResponse.ok) {
            throw new Error(`Failed to download audio: ${audioResponse.statusText}`);
        }

        const audioBuffer = await audioResponse.arrayBuffer();
        console.log(`✅ [RECORDING-CALLBACK] Downloaded ${audioBuffer.byteLength} bytes`);

        // Step 2: Upload to Supabase Storage using REST API
        console.log('⬆️ [RECORDING-CALLBACK] Uploading to Supabase Storage...');

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
            console.error('❌ [RECORDING-CALLBACK] Upload error:', errorText);
            throw new Error(`Failed to upload to storage: ${uploadResponse.statusText} - ${errorText}`);
        }

        console.log(`✅ [RECORDING-CALLBACK] Uploaded to: ${fileName}`);

        // Step 3: Get public URL
        const publicAudioUrl = `${supabaseUrl}/storage/v1/object/public/recordings/${fileName}`;
        console.log(`🔗 [RECORDING-CALLBACK] Public URL: ${publicAudioUrl}`);

        // Step 4: Create recording entry in database using REST API
        console.log('💾 [RECORDING-CALLBACK] Creating database entry...');

        const durationSeconds = parseInt(RecordingDuration) || 0;
        const formattedDuration = formatDuration(durationSeconds);

        const recordingData = {
            user_id: userId,
            title: `Call to ${To}`,
            description: `Recorded call from ${From} to ${To}`,
            date: new Date().toISOString(),
            duration: formattedDuration,
            duration_seconds: durationSeconds,
            status: 'Processing',  // Will update to 'Processed' after transcription
            audio_url: publicAudioUrl,
            participants: 2,
            folder_id: 'all',
            tags: ['phone-call'],
            notes: [],
            media: [],
            segments: []  // Will be filled by transcription
        };

        const dbResponse = await fetch(`${supabaseUrl}/rest/v1/recordings`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'apikey': supabaseServiceKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'  // Return the created row
            },
            body: JSON.stringify(recordingData)
        });

        if (!dbResponse.ok) {
            const errorText = await dbResponse.text();
            console.error('❌ [RECORDING-CALLBACK] Database error:', errorText);
            throw new Error(`Failed to insert into database: ${dbResponse.statusText} - ${errorText}`);
        }

        const [recording] = await dbResponse.json();
        console.log(`✅ [RECORDING-CALLBACK] Created recording: ${recording.id}`);

        // TODO: Step 5: Trigger transcription (will implement in next phase)
        // For now, just log that we'd start transcription here
        console.log('🎙️ [RECORDING-CALLBACK] TODO: Start transcription for:', publicAudioUrl);

        return res.status(200).json({
            success: true,
            recordingId: recording.id,
            message: 'Recording saved successfully'
        });

    } catch (error: any) {
        console.error('🔥 [RECORDING-CALLBACK] ERROR:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });

        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}
