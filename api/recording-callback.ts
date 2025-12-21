import type { VercelRequest, VercelResponse } from '@vercel/node';

// Use CommonJS require for Vercel serverless compatibility
const { createClient } = require('@supabase/supabase-js');

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

        // Initialize Supabase client
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase credentials');
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

        // Step 2: Upload to Supabase Storage
        console.log('⬆️ [RECORDING-CALLBACK] Uploading to Supabase Storage...');

        const fileName = `${userId}/${RecordingSid}.mp3`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('recordings')
            .upload(fileName, audioBuffer, {
                contentType: 'audio/mpeg',
                upsert: false
            });

        if (uploadError) {
            console.error('❌ [RECORDING-CALLBACK] Upload error:', uploadError);
            throw uploadError;
        }

        console.log(`✅ [RECORDING-CALLBACK] Uploaded to: ${fileName}`);

        // Step 3: Get public URL
        const { data: urlData } = supabase.storage
            .from('recordings')
            .getPublicUrl(fileName);

        const publicAudioUrl = urlData.publicUrl;
        console.log(`🔗 [RECORDING-CALLBACK] Public URL: ${publicAudioUrl}`);

        // Step 4: Create recording entry in database
        console.log('💾 [RECORDING-CALLBACK] Creating database entry...');

        const durationSeconds = parseInt(RecordingDuration) || 0;
        const formattedDuration = formatDuration(durationSeconds);

        const { data: recording, error: dbError } = await supabase
            .from('recordings')
            .insert({
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
            })
            .select()
            .single();

        if (dbError) {
            console.error('❌ [RECORDING-CALLBACK] Database error:', dbError);
            throw dbError;
        }

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
