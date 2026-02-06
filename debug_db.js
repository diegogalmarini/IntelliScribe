
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

async function debug() {
    console.log(`--- CHECKING PROFILES SCHEMA ---`);

    const { data: columns, error } = await supabase.rpc('get_columns', { table_name: 'profiles' });

    if (error) {
        // Fallback: try to fetch one row and see the keys
        console.log('RPC failed, fetching one row instead...');
        const { data } = await supabase.from('profiles').select('*').limit(1);
        if (data && data.length > 0) {
            console.log('Columns found:', Object.keys(data[0]));
        } else {
            console.log('No data found to check columns.');
        }
    } else {
        console.log('Columns:', columns);
    }

    console.log('--- END DEBUG ---');
}

debug();
