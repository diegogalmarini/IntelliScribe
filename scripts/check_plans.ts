
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Specify path to .env file in the root directory
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
        console.log('Connecting to Supabase at:', supabaseUrl?.substring(0, 20) + '...');
        const { data, error } = await supabase
            .from('plans_configuration')
            .select('*');

        if (error) {
            console.error('Supabase Error:', error);
        } else if (!data || data.length === 0) {
            console.log('No plans found in plans_configuration table.');
        } else {
            console.log('Plans Configuration:');
            data.forEach(p => {
                console.log(`Plan: ${p.id} (${p.name})`);
                console.log(`Limits:`, JSON.stringify(p.limits, null, 2));
                console.log('---');
            });
        }
    } catch (err) {
        console.error('Unexpected script error:', err);
    }
}

main().catch(e => console.error('Fatal:', e));
