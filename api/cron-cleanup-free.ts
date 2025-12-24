import { createClient } from '@supabase/supabase-js';

const CRON_SECRET = process.env.CRON_SECRET;
const FREE_TIER_RETENTION_DAYS = 7;

/**
 * Vercel Cron Job - Free Tier Cleanup
 * Runs daily to delete audio files older than 7 days for free users
 * Preserves database records (metadata/transcriptions)
 */
export default async function handler(req: any, res: any) {
    // Verify cron secret for security
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
        console.error('[Cron-Cleanup] Unauthorized access attempt');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('[Cron-Cleanup] Starting free tier cleanup...');

    try {
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase credentials');
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Calculate cutoff date (7 days ago)
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - FREE_TIER_RETENTION_DAYS);
        const cutoffISO = cutoffDate.toISOString();

        console.log(`[Cron-Cleanup] Cutoff date: ${cutoffISO}`);

        // Get all free tier users
        const { data: freeUsers, error: usersError } = await supabase
            .from('profiles')
            .select('id, email')
            .eq('plan_id', 'free');

        if (usersError) {
            throw new Error(`Failed to fetch free users: ${usersError.message}`);
        }

        console.log(`[Cron-Cleanup] Found ${freeUsers?.length || 0} free tier users`);

        let deletedCount = 0;
        let errorCount = 0;

        // Process each free user
        for (const user of freeUsers || []) {
            try {
                // Get recordings older than cutoff date
                const { data: oldRecordings, error: recError } = await supabase
                    .from('recordings')
                    .select('id, audio_url, title')
                    .eq('user_id', user.id)
                    .lt('created_at', cutoffISO)
                    .not('audio_url', 'is', null); // Only recordings with audio files

                if (recError) {
                    console.error(`[Cron-Cleanup] Error fetching recordings for user ${user.email}:`, recError);
                    errorCount++;
                    continue;
                }

                if (!oldRecordings || oldRecordings.length === 0) {
                    continue; // No old recordings for this user
                }

                console.log(`[Cron-Cleanup] User ${user.email}: ${oldRecordings.length} old recordings found`);

                // Delete audio files from storage
                for (const recording of oldRecordings) {
                    try {
                        if (recording.audio_url) {
                            // Delete from Supabase Storage
                            const { error: deleteError } = await supabase.storage
                                .from('recordings')
                                .remove([recording.audio_url]);

                            if (deleteError) {
                                console.error(`[Cron-Cleanup] Failed to delete audio: ${recording.audio_url}`, deleteError);
                                errorCount++;
                                continue;
                            }

                            // Update DB record - set audio_url to null (keep metadata/transcript)
                            const { error: updateError } = await supabase
                                .from('recordings')
                                .update({ audio_url: null })
                                .eq('id', recording.id);

                            if (updateError) {
                                console.error(`[Cron-Cleanup] Failed to update recording ${recording.id}:`, updateError);
                                errorCount++;
                            } else {
                                deletedCount++;
                                console.log(`[Cron-Cleanup] Deleted: ${recording.title} (${recording.audio_url})`);
                            }
                        }
                    } catch (err) {
                        console.error(`[Cron-Cleanup] Error processing recording ${recording.id}:`, err);
                        errorCount++;
                    }
                }
            } catch (err) {
                console.error(`[Cron-Cleanup] Error processing user ${user.email}:`, err);
                errorCount++;
            }
        }

        const response = {
            status: 'success',
            deletedCount,
            errorCount,
            freeUsersChecked: freeUsers?.length || 0,
            cutoffDate: cutoffISO,
            timestamp: new Date().toISOString()
        };

        console.log('[Cron-Cleanup] Completed:', response);

        return res.status(200).json(response);

    } catch (error: any) {
        console.error('[Cron-Cleanup] Fatal error:', error);
        return res.status(500).json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}
