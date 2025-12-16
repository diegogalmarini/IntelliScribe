
import Stripe from 'stripe';
// import { createClient } from '@supabase/supabase-js'; <--- COMMENTED OUT TO ISOLATE CRASH

// Sanity Check v2: STRIPE ONLY (No Supabase)
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    const diagnostics = {
        message: "Sanity Check v2 (Stripe Only)",
        env: {
            stripeKey: !!process.env.STRIPE_SECRET_KEY,
        },
        imports: {
            stripe: typeof Stripe,
            supabase: "DISABLED"
        }
    };

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(diagnostics));
}
