// apply-migration.js
// Applies the language column migration to Supabase

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qnvzofpdrfzchsegooic.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function applyMigration() {
    console.log('🔄 Applying language column migration...');

    const sql = `
        -- Add language column to profiles table
        ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT 'es';

        -- Update existing users to Spanish (default for Diktalo)
        UPDATE profiles 
        SET language = 'es' 
        WHERE language IS NULL;
    `;

    try {
        const { data, error } = await supabase.rpc('exec_sql', { query: sql });

        if (error) {
            console.error('❌ Migration failed:', error.message);
            process.exit(1);
        }

        console.log('✅ Migration applied successfully!');

        // Verify
        const { data: profiles, error: verifyError } = await supabase
            .from('profiles')
            .select('id, email, language')
            .limit(5);

        if (!verifyError) {
            console.log('📊 Sample profiles:');
            console.table(profiles);
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

applyMigration();
