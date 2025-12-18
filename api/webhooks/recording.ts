import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin to bypass RLS for billing updates
const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. Validation
    const params = req.body || req.query;
    const duration = parseInt(params.RecordingDuration || '0');
    const userId = req.query.userId as string;

    console.log(`[Webhook:Recording] Processing Call. User: ${userId}, Duration: ${duration}s`);

    if (!userId) {
        console.error('[Webhook:Recording] Error: Missing userId');
        return res.status(400).send('Missing userId');
    }

    // 2. Calculate Minutes (Always round UP)
    // Example: 10 seconds call = 1 minute charge. 61 seconds = 2 minutes charge.
    const minutesToDeduct = Math.max(1, Math.ceil(duration / 60));

    // 3. Update Supabase
    try {
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('minutes_used')
            .eq('id', userId)
            .single();

        if (fetchError || !profile) throw new Error('User not found');

        const newUsage = (profile.minutes_used || 0) + minutesToDeduct;

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ minutes_used: newUsage })
            .eq('id', userId);

        if (updateError) throw updateError;

        console.log(`[Webhook:Recording] Success. Deducted ${minutesToDeduct} mins. New Total: ${newUsage}`);
        return res.status(200).send('OK');

    } catch (error: any) {
        console.error('[Webhook:Recording] DB Error:', error.message);
        return res.status(500).send('Internal Server Error');
    }
}
