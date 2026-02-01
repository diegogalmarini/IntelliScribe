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

async function auditSubscriptions() {
    console.log('--- SUBSCRIPTION AUDIT ---');

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, plan_id, subscription_status');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Total Users: ${profiles.length}\n`);

    // Check how many have "active" subscription_status
    const withActiveStatus = profiles.filter(p => p.subscription_status === 'active');
    const withOtherStatus = profiles.filter(p => p.subscription_status !== 'active');

    console.log(`subscription_status = 'active': ${withActiveStatus.length}`);
    console.log(`subscription_status != 'active': ${withOtherStatus.length}\n`);

    // Group by plan_id
    const planBreakdown = profiles.reduce((acc, p) => {
        const plan = p.plan_id || 'none';
        acc[plan] = (acc[plan] || 0) + 1;
        return acc;
    }, {});

    console.log('Plan Breakdown:');
    Object.entries(planBreakdown).forEach(([plan, count]) => {
        console.log(`  ${plan}: ${count} users`);
    });

    console.log('\nSample Users with "active" status:');
    withActiveStatus.slice(0, 5).forEach(u => {
        console.log(`  - ${u.email}: Plan ${u.plan_id || 'none'}`);
    });

    console.log('--- END AUDIT ---');
}

auditSubscriptions();
