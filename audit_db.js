
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function debugData() {
    console.log('--- DB AUDIT START ---');

    // 1. Recordings Audit
    const { data: recordings, error: rError } = await supabase
        .from('recordings')
        .select('id, metadata, tags, user_id');

    if (rError) {
        console.error('Error fetching recordings:', rError);
        return;
    }

    console.log(`Total Recordings: ${recordings.length}`);

    const extensionSpecs = recordings.filter(r => {
        const meta = typeof r.metadata === 'string' ? JSON.parse(r.metadata || '{}') : r.metadata;
        return meta?.source === 'chrome-extension' || meta?.context?.url;
    });
    console.log(`Recordings from Extension: ${extensionSpecs.length}`);

    if (recordings.length > 0) {
        console.log('Sample Metadata:', JSON.stringify(recordings[0].metadata, null, 2));
    }

    // 2. Users Audit
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('id, plan_id, created_at');

    if (pError) {
        console.error('Error fetching profiles:', pError);
        return;
    }

    const trialUsers = profiles.filter(p => !p.plan_id || p.plan_id === 'free');
    const paidUsers = profiles.filter(p => p.plan_id && p.plan_id !== 'free');

    console.log(`Total Users: ${profiles.length}`);
    console.log(`Trial/Free Users: ${trialUsers.length}`);
    console.log(`Paid Users: ${paidUsers.length}`);

    // 3. Active Recorders
    const activeUsers = new Set(recordings.filter(r => r.user_id).map(r => r.user_id));
    console.log(`Unique Active Recorders: ${activeUsers.size}`);

    console.log('--- DB AUDIT END ---');
}

debugData();
