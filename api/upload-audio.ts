import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs/promises';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req, res) {
    // CORS headers for extension
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    try {
        // Authenticate user via Bearer token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized - Missing or invalid token' });
        }

        const token = authHeader.substring(7);

        // Verify token with Supabase
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            console.error('[upload-audio] Auth error:', authError);
            return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }

        console.log('[upload-audio] Authenticated user:', user.id);

        // Parse the multipart form data
        const form = formidable({
            maxFileSize: 500 * 1024 * 1024, // 500MB max
            keepExtensions: true,
        });

        const [fields, files] = await form.parse(req);

        const audioFile = Array.isArray(files.audio) ? files.audio[0] : files.audio;

        if (!audioFile) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        // Extract metadata
        const title = (Array.isArray(fields.title) ? fields.title[0] : fields.title) ||
            `Chrome Extension Recording - ${new Date().toLocaleString()}`;
        const source = (Array.isArray(fields.source) ? fields.source[0] : fields.source) || 'chrome-extension';
        const tabUrl = Array.isArray(fields.tabUrl) ? fields.tabUrl[0] : fields.tabUrl;

        console.log('[upload-audio] Processing file:', {
            name: audioFile.originalFilename,
            size: audioFile.size,
            type: audioFile.mimetype,
            title,
            source
        });

        // Read the file
        const fileBuffer = await fs.readFile(audioFile.filepath);

        // Generate filename
        const timestamp = Date.now();
        const extension = audioFile.originalFilename?.split('.').pop() || 'webm';
        const fileName = `${user.id}/${timestamp}.${extension}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('recordings')
            .upload(fileName, fileBuffer, {
                contentType: audioFile.mimetype || 'audio/webm',
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('[upload-audio] Storage upload error:', uploadError);
            return res.status(500).json({ error: 'Failed to upload audio file' });
        }

        console.log('[upload-audio] File uploaded to storage:', fileName);

        // Create recording entry in database
        const { data: recording, error: dbError } = await supabase
            .from('recordings')
            .insert({
                user_id: user.id,
                title: title,
                description: tabUrl ? `Captured from: ${tabUrl}` : 'Captured via Chrome Extension',
                date: new Date().toISOString(),
                duration: '00:00', // Will be updated after transcription
                duration_seconds: 0,
                status: 'Processing',
                audio_url: fileName,
                segments: [],
                participants: 0,
                folder_id: 'all',
                metadata: {
                    source: source,
                    tab_url: tabUrl,
                    uploaded_at: new Date().toISOString()
                }
            })
            .select()
            .single();

        if (dbError) {
            console.error('[upload-audio] Database error:', dbError);
            return res.status(500).json({ error: 'Failed to create recording entry' });
        }

        console.log('[upload-audio] Recording created:', recording.id);

        // TODO: Trigger transcription job here (AssemblyAI queue)
        // For now, user can manually trigger it from dashboard

        // Clean up temp file
        await fs.unlink(audioFile.filepath);

        return res.status(200).json({
            success: true,
            recordingId: recording.id,
            message: 'Recording uploaded successfully'
        });

    } catch (error: any) {
        console.error('[upload-audio] Unexpected error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
