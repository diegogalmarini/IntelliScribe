
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    try {
        // Fetch a single profile to see all keys/columns
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .limit(1)
            .single();

        if (error) {
            console.error('Supabase Error:', error);
        } else {
            console.log('Profile Keys:', Object.keys(data));
            console.log('Sample Data:', data);
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

main();
