import formidable from 'formidable';
import fs from 'fs/promises';

// Helper to validate UUID format
function isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

export default async function handler(req, res) {
    // CORS headers for extension
    const allowedOrigin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
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

    console.log('[upload-audio] Starting upload processing...');

    try {
        // --- Setup Environment Variables ---
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('[upload-audio] Missing Supabase credentials');
            return res.status(500).json({ error: 'Server configuration error: Missing Supabase credentials' });
        }

        // --- Step 1: Authenticate User via REST API ---
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized - Missing or invalid token' });
        }

        const userToken = authHeader.substring(7);

        // Verify token with Supabase Auth REST API
        const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'apikey': process.env.VITE_SUPABASE_ANON_KEY || supabaseServiceKey
            }
        });

        if (!authResponse.ok) {
            console.error('[upload-audio] Auth verification failed:', authResponse.status);
            return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }

        const user = await authResponse.json();
        const userId = user.id;

        if (!userId || !isValidUUID(userId)) {
            console.error('[upload-audio] Invalid user ID in token');
            return res.status(401).json({ error: 'Unauthorized - Invalid user context' });
        }

        console.log('[upload-audio] Authenticated user:', userId);

        // --- Step 2: Parse Multi-part Form Data ---
        const form = formidable({
            maxFileSize: 50 * 1024 * 1024, // Reduced to 50MB for safer serverless handling
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
            mimetype: audioFile.mimetype
        });

        // --- Step 3: Read File Buffer ---
        const fileBuffer = await fs.readFile(audioFile.filepath);

        // --- Step 4: Upload to Supabase Storage via REST API ---
        const timestamp = Date.now();
        const extension = audioFile.originalFilename?.split('.').pop() || 'webm';
        const fileName = `${userId}/${timestamp}.${extension}`;
        const storageUrl = `${supabaseUrl}/storage/v1/object/recordings/${fileName}`;

        console.log('[upload-audio] Uploading to storage:', fileName);

        const uploadResponse = await fetch(storageUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'apikey': supabaseServiceKey,
                'Content-Type': audioFile.mimetype || 'audio/webm'
            },
            body: fileBuffer
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('[upload-audio] Storage upload failed:', errorText);
            return res.status(500).json({ error: 'Failed to upload audio to storage' });
        }

        // Get the final audio URL
        const publicAudioUrl = fileName; // We store the relative path in the DB

        // --- Step 5: Create Recording Entry via REST API ---
        console.log('[upload-audio] Creating database entry...');

        const recordingData = {
            user_id: userId,
            title: title,
            description: tabUrl ? `Captured from: ${tabUrl}` : 'Captured via Chrome Extension',
            date: new Date().toISOString(),
            duration: '00:00',
            duration_seconds: 0,
            status: 'Processing',
            audio_url: publicAudioUrl,
            participants: 1,
            folder_id: null,
            metadata: {
                source: source,
                tab_url: tabUrl,
                original_filename: audioFile.originalFilename
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
            console.error('[upload-audio] Database insert failed:', errorText);
            return res.status(500).json({ error: 'Failed to create recording record' });
        }

        const insertedRows = await dbResponse.json();
        const recording = insertedRows[0];

        console.log('[upload-audio] Record created successfully:', recording.id);

        // Clean up temp file
        try {
            await fs.unlink(audioFile.filepath);
        } catch (unlinkErr) {
            console.warn('[upload-audio] Failed to cleanup temp file:', unlinkErr);
        }

        return res.status(200).json({
            success: true,
            recordingId: recording.id,
            message: 'Audio uploaded successfully'
        });

    } catch (error: any) {
        console.error('[upload-audio] UNEXPECTED ERROR:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}
