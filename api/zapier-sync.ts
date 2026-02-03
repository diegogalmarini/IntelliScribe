import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateEnv } from "./_utils/env-validator.js";
import { initSentry, Sentry } from "./_utils/sentry.js";

// Initialize Sentry
initSentry();

/**
 * Zapier Sync Handler
 * 
 * Flow:
 * 1. Validate environment
 * 2. Authenticate user and verify plan (Business+)
 * 3. Fetch recording data
 * 4. Send POST to zapier_webhook_url
 * 5. Log activity in integration_logs
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS configuration
    const allowedOrigin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { recordingId, userId, isTest = false } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        // 1. Validate Env
        const env = validateEnv(['base']);
        const { SUPABASE_URL: supabaseUrl, SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey } = env;

        // --- Supabase REST API Helper ---
        async function supabaseRequest(path: string, options: any = {}) {
            const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
                ...options,
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Supabase error (${response.status}): ${text}`);
            }
            return response;
        }

        // 2. Fetch User Profile and verify plan
        const profileRes = await supabaseRequest(`profiles?id=eq.${userId}&select=plan_id,zapier_webhook_url,first_name,last_name`);
        const profiles = await profileRes.json();
        const profile = profiles[0];

        if (!profile) {
            return res.status(404).json({ error: 'User profile not found' });
        }

        // Plan Gate
        const allowedPlans = ['business', 'business_plus'];
        if (!allowedPlans.includes(profile.plan_id) && !isTest) {
            return res.status(403).json({ error: 'Your plan does not support Zapier integration. Please upgrade to Business.' });
        }

        const webhookUrl = profile.zapier_webhook_url;
        if (!webhookUrl) {
            return res.status(400).json({ error: 'No Zapier Webhook URL configured.' });
        }

        // 3. Handle Test Connection
        if (isTest) {
            console.log(`[ZapierSync] Sending TEST payload for user ${userId}`);
            const testPayload = {
                event: 'test_connection',
                timestamp: new Date().toISOString(),
                user: {
                    name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User',
                    email: profile.email
                },
                message: "¡Conexión establecida! Diktalo está listo para enviar tus transcripciones."
            };

            const testZapRes = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testPayload)
            });

            return res.status(200).json({
                success: testZapRes.ok,
                message: testZapRes.ok ? 'Connection test successful!' : 'Zapier returned an error.'
            });
        }

        // 4. Fetch Recording Data
        if (!recordingId) {
            return res.status(400).json({ error: 'Missing recordingId for sync.' });
        }

        const recRes = await supabaseRequest(`recordings?id=eq.${recordingId}`);
        const recordings = await recRes.json();
        const recording = recordings[0];

        if (!recording) {
            return res.status(404).json({ error: 'Recording not found.' });
        }

        // 5. Prepare Payload
        const payload = {
            event: 'recording_synced',
            timestamp: new Date().toISOString(),
            data: {
                id: recording.id,
                title: recording.title,
                summary: recording.summary || '',
                transcript: recording.segments?.map((s: any) => `${s.speaker}: ${s.text}`).join('\n') || '',
                duration: recording.duration,
                durationSeconds: recording.durationSeconds,
                date: recording.date,
                link: `https://www.diktalo.com/dashboard?recording=${recording.id}`,
                source: recording.metadata?.source || 'web'
            },
            user: {
                name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User',
                id: userId
            }
        };

        // 6. Dispatch to Zapier
        console.log(`[ZapierSync] Dispatching payload to ${webhookUrl}`);
        const zapRes = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const zapStatus = zapRes.ok ? 'success' : 'error';

        // 7. Log the integration activity
        try {
            await supabaseRequest('integration_logs', {
                method: 'POST',
                body: JSON.stringify({
                    user_id: userId,
                    recording_id: recordingId,
                    status: zapStatus,
                    payload: payload,
                    response_code: zapRes.status,
                    error_message: zapRes.ok ? null : await zapRes.text()
                })
            });
        } catch (logErr) {
            console.error('[ZapierSync] Logging failed:', logErr);
            // Non-fatal error
        }

        if (!zapRes.ok) {
            throw new Error(`Zapier responded with status ${zapRes.status}`);
        }

        return res.status(200).json({
            success: true,
            message: 'Sync completed successfully'
        });

    } catch (error: any) {
        console.error('Zapier Sync Error:', error);
        Sentry.captureException(error);

        return res.status(500).json({
            error: error.message || 'Internal Server Error'
        });
    }
}
