
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debug() {
    console.log('--- Recordings Sample ---');
    const { data: recs, error: rError } = await supabase
        .from('recordings')
        .select('*')
        .limit(5);

    if (rError) console.error(rError);
    else console.log(recs.map(r => ({ id: r.id, user_id: r.user_id, title: r.title })));

    console.log('--- Active Users Count ---');
    const { data: active, error: aError } = await supabase
        .from('recordings')
        .select('user_id');

    if (aError) console.error(aError);
    else {
        const users = new Set(active.filter(r => r.user_id).map(r => r.user_id));
        console.log('Total Recordings:', active.length);
        console.log('Unique User IDs:', users.size);
        console.log('Null User IDs:', active.filter(r => !r.user_id).length);
    }
}

debug();
