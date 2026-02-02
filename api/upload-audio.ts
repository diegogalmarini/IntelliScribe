import formidable from 'formidable';
import fs from 'fs/promises';
import { validateEnv } from "./_utils/env-validator.js";
import { initSentry, Sentry } from "./_utils/sentry.js";

// Initialize Sentry
initSentry();

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
        let env;
        try {
            env = validateEnv(['base']);
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }

        const { SUPABASE_URL: supabaseUrl, SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey } = env;

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

        const userData = await authResponse.json();
        const userId = userData.id || userData.data?.user?.id;

        if (!userId || !isValidUUID(userId)) {
            console.error('[upload-audio] Invalid user ID in token response:', userData);
            return res.status(401).json({ error: 'Unauthorized - Invalid user context' });
        }

        console.log('[upload-audio] Authenticated user:', userId);

        // --- Step 2: Handle Upload Strategy (Direct vs Legacy) ---
        const contentType = req.headers['content-type'] || '';

        let filePath = '';
        let fileDuration = 0;
        let fileMetadata: any = {};

        // STRATEGY A: JSON Registration (Direct-to-Cloud)
        if (contentType.includes('application/json')) {
            console.log('[upload-audio] Handling JSON Registration (Direct Upload)...');
            let body = req.body;
            if (typeof body === 'string') {
                try {
                    body = JSON.parse(body);
                } catch (e) {
                    console.error('[upload-audio] Failed to parse JSON body string:', e);
                    return res.status(400).json({ error: 'Invalid JSON payload' });
                }
            }

            if (!body || !body.filePath) {
                console.error('[upload-audio] Missing filePath in JSON body:', body);
                return res.status(400).json({ error: 'Missing filePath in registration payload' });
            }

            filePath = body.filePath;
            fileDuration = body.duration || 0;
            fileMetadata = body.metadata || {};

            console.log('[upload-audio] Registered path:', filePath);

            if (!filePath.startsWith(`${userId}/`)) {
                console.warn('[upload-audio] Potential path spoofing warning:', filePath, 'User:', userId);
            }

        } else {
            // STRATEGY B: Legacy Multipart Upload (Proxy)
            const form = formidable({
                maxFileSize: 50 * 1024 * 1024,
                keepExtensions: true,
            });

            const [fields, files] = await form.parse(req);
            const audioFile = Array.isArray(files.audio) ? files.audio[0] : files.audio;

            if (!audioFile) {
                return res.status(400).json({ error: 'No audio file provided' });
            }

            console.log('[upload-audio] Processing legacy file:', {
                name: audioFile.originalFilename,
                mimetype: audioFile.mimetype
            });

            const fileBuffer = await fs.readFile(audioFile.filepath);
            const timestamp = Date.now();
            const extension = audioFile.originalFilename?.split('.').pop() || 'webm';
            const fileName = `${userId}/${timestamp}.${extension}`;
            const storageUrl = `${supabaseUrl}/storage/v1/object/recordings/${fileName}`;

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

            try { await fs.unlink(audioFile.filepath); } catch (e) { }

            filePath = fileName;
            const titleField = (Array.isArray(fields.title) ? fields.title[0] : fields.title);
            const sourceField = (Array.isArray(fields.source) ? fields.source[0] : fields.source);
            const tabUrlField = Array.isArray(fields.tabUrl) ? fields.tabUrl[0] : fields.tabUrl;

            fileMetadata = {
                title: titleField,
                source: sourceField,
                tabUrl: tabUrlField,
                original_filename: audioFile.originalFilename
            };
        }

        // --- Step 3: Create Recording Entry via REST API ---
        console.log('[upload-audio] Creating database entry...');
        const title = fileMetadata.title || `Recording - ${new Date().toLocaleString()}`;
        const source = fileMetadata.source || 'chrome-extension';

        const recordingData = {
            user_id: userId,
            title: title,
            description: fileMetadata.tabUrl ? `Captured from: ${fileMetadata.tabUrl}` : 'Captured via Chrome Extension',
            date: new Date(Date.now() - ((fileDuration || 0) * 1000)).toISOString(),
            duration_seconds: fileDuration || null,
            status: null,
            audio_url: filePath,
            participants: 1,
            folder_id: null,
            metadata: {
                source: source,
                tab_url: fileMetadata.tabUrl,
                original_filename: fileMetadata.original_filename,
                attachments: fileMetadata.attachments
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

        return res.status(200).json({
            success: true,
            recordingId: recording.id,
            message: 'Audio uploaded successfully'
        });

    } catch (error: any) {
        console.error('[upload-audio] UNEXPECTED ERROR:', error);
        Sentry.captureException(error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}
