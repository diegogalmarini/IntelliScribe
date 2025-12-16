
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Sanity Check: Can we load modules and return 200?
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    // 1. Diagnostics Object
    const diagnostics = {
        message: "Sanity Check v1",
        env: {
            stripeKey: !!process.env.STRIPE_SECRET_KEY,
            supabaseUrl: !!process.env.VITE_SUPABASE_URL,
        },
        imports: {
            stripe: typeof Stripe,
            createClient: typeof createClient
        }
    };

    // 2. Simple Response (Native Node style because bodyParser is false)
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(diagnostics));
}
