import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Get auth token from request
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'No authorization header' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Parse request body
        const { recordingId, fileName } = await req.json()

        if (!recordingId || !fileName) {
            return new Response(
                JSON.stringify({ error: 'Missing recordingId or fileName' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Create Supabase client with user's auth
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: authHeader },
                },
            }
        )

        // Verify user is authenticated and get recording
        const { data: recording, error: recordingError } = await supabaseClient
            .from('recordings')
            .select('audioUrl, userId')
            .eq('id', recordingId)
            .single()

        if (recordingError || !recording) {
            return new Response(
                JSON.stringify({ error: 'Recording not found' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Create service role client to download file (bypasses RLS)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Download file from storage
        const { data: fileData, error: downloadError } = await supabaseAdmin.storage
            .from('recordings')
            .download(recording.audioUrl)

        if (downloadError || !fileData) {
            console.error('Download error:', downloadError)
            return new Response(
                JSON.stringify({ error: 'Failed to download file' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Determine MIME type from filename extension
        const extension = fileName.split('.').pop()?.toLowerCase() || 'mp3'
        const mimeTypes: Record<string, string> = {
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'webm': 'audio/webm',
            'm4a': 'audio/mp4',
            'aac': 'audio/aac',
            'ogg': 'audio/ogg',
            'opus': 'audio/opus',
            'flac': 'audio/flac',
        }
        const contentType = mimeTypes[extension] || 'audio/mpeg'

        // Return file with proper download headers
        return new Response(fileData, {
            status: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Cache-Control': 'private, max-age=3600',
            },
        })
    } catch (error) {
        console.error('Edge function error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
