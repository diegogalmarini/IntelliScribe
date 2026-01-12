import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Create Supabase client with service role key for admin access
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        console.log('[Auto-Delete] Starting cleanup job...')

        // 1. Find all users with free plan
        const { data: freeUsers, error: usersError } = await supabaseAdmin
            .from('profiles')
            .select('id, plan_id')
            .eq('plan_id', 'free')

        if (usersError) {
            throw new Error(`Error fetching free users: ${usersError.message}`)
        }

        if (!freeUsers || freeUsers.length === 0) {
            console.log('[Auto-Delete] No free plan users found')
            return new Response(
                JSON.stringify({ message: 'No free users to process', deleted: 0 }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log(`[Auto-Delete] Found ${freeUsers.length} free plan users`)

        // 2. Calculate cutoff date (7 days ago)
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - 7)
        const cutoffISO = cutoffDate.toISOString()

        console.log(`[Auto-Delete] Cutoff date: ${cutoffISO}`)

        let totalDeleted = 0
        let totalStorageFreed = 0

        // 3. Process each free user
        for (const user of freeUsers) {
            // Find old recordings for this user
            const { data: oldRecordings, error: recordingsError } = await supabaseAdmin
                .from('recordings')
                .select('id, audio_file_path, metadata')
                .eq('user_id', user.id)
                .lt('created_at', cutoffISO)

            if (recordingsError) {
                console.error(`[Auto-Delete] Error fetching recordings for user ${user.id}:`, recordingsError)
                continue
            }

            if (!oldRecordings || oldRecordings.length === 0) {
                console.log(`[Auto-Delete] No old recordings for user ${user.id}`)
                continue
            }

            console.log(`[Auto-Delete] Found ${oldRecordings.length} old recordings for user ${user.id}`)

            // 4. Delete each recording
            for (const recording of oldRecordings) {
                try {
                    // Extract file size from metadata if available
                    const metadata = recording.metadata as any
                    const audioFileSize = metadata?.audioFileSize || 0

                    // Delete file from storage
                    if (recording.audio_file_path) {
                        const { error: storageError } = await supabaseAdmin.storage
                            .from('recordings')
                            .remove([recording.audio_file_path])

                        if (storageError) {
                            console.error(`[Auto-Delete] Error deleting file ${recording.audio_file_path}:`, storageError)
                        } else {
                            console.log(`[Auto-Delete] Deleted file: ${recording.audio_file_path}`)
                        }
                    }

                    // Delete database record
                    const { error: deleteError } = await supabaseAdmin
                        .from('recordings')
                        .delete()
                        .eq('id', recording.id)

                    if (deleteError) {
                        console.error(`[Auto-Delete] Error deleting recording ${recording.id}:`, deleteError)
                        continue
                    }

                    // Update user's storage_used
                    if (audioFileSize > 0) {
                        const { error: storageUpdateError } = await supabaseAdmin.rpc(
                            'decrement_storage',
                            { p_user_id: user.id, p_storage_bytes: audioFileSize }
                        )

                        if (storageUpdateError) {
                            console.error(`[Auto-Delete] Error updating storage for user ${user.id}:`, storageUpdateError)
                        } else {
                            totalStorageFreed += audioFileSize
                        }
                    }

                    totalDeleted++
                    console.log(`[Auto-Delete] ✅ Deleted recording ${recording.id}`)

                } catch (err) {
                    console.error(`[Auto-Delete] Error processing recording ${recording.id}:`, err)
                }
            }
        }

        const result = {
            message: 'Cleanup completed successfully',
            usersProcessed: freeUsers.length,
            recordingsDeleted: totalDeleted,
            storageFreedBytes: totalStorageFreed,
            storageFreedMB: (totalStorageFreed / 1048576).toFixed(2),
            cutoffDate: cutoffISO
        }

        console.log('[Auto-Delete] Job complete:', result)

        return new Response(
            JSON.stringify(result),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('[Auto-Delete] Fatal error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
})
