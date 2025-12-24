import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Cron Job: Monthly Usage Reset
 * Runs on the 1st of every month at 00:00 UTC
 * Resets minutes_used to 0 for all users whose billing cycle has ended
 */
export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // Verify this is actually a cron request from Vercel
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Call the reset function
        const { data, error } = await supabase.rpc('reset_monthly_usage');

        if (error) {
            console.error('Reset failed:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }

        console.log('Monthly usage reset completed successfully');

        return res.status(200).json({
            success: true,
            message: 'Monthly usage reset completed',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('Unexpected error:', err);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
