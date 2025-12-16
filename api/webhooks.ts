
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Configuration for Next.js API Routes (ignored by standard Vercel Functions but kept for compatibility)
export const config = {
    api: {
        bodyParser: false,
    },
};

// HELPER: Read raw body
async function buffer(readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export default async function handler(req, res) {
    console.log(`[Webhook] Request received: ${req.method}`);

    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, stripe-signature'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Health check
    if (req.method === 'GET') {
        const envCheck = {
            hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
            hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
            hasSupabaseKey: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY),
            stripeVersion: '2024-12-18.acacia'
        };
        return res.status(200).json({ status: 'active', env: envCheck });
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).send(`Method Not Allowed. Received: ${req.method}`);
    }

    try {
        console.log("[Webhook] Initializing Stripe...");
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("Missing STRIPE_SECRET_KEY");
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2024-12-18.acacia' as any,
        });

        console.log("[Webhook] Reading body...");
        const buf = await buffer(req);
        const signature = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        // If no signature, we can't verify, but check if we can proceed (unsecured mode not recommended)
        if (!signature && webhookSecret) {
            throw new Error("Missing stripe-signature header");
        }

        let event;
        if (webhookSecret) {
            console.log("[Webhook] Verifying signature...");
            event = stripe.webhooks.constructEvent(buf, signature, webhookSecret);
        } else {
            console.log("[Webhook] WARNING: No Webhook Secret found, skipping verification (UNSAFE)");
            event = JSON.parse(buf.toString());
        }

        console.log(`[Webhook] Event Type: ${event.type}`);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.metadata?.userId;

            console.log(`[Webhook] Processing session for user: ${userId}`);

            const supabaseUrl = process.env.VITE_SUPABASE_URL;
            // PREFER SERVICE KEY
            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

            if (!supabaseUrl || !supabaseKey) {
                throw new Error("Missing Supabase credentials");
            }

            const supabase = createClient(supabaseUrl, supabaseKey);

            // Logic for Plan
            let planId = 'pro';
            let minutesLimit = 150;

            if (session.amount_total && session.amount_total >= 2000) {
                planId = 'business_plus';
                minutesLimit = 999999;
            } else if (session.amount_total && session.amount_total >= 1200) {
                planId = 'business';
                minutesLimit = 600;
            }

            if (userId) {
                console.log(`[Webhook] Updating DB for ${userId} -> ${planId}`);
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        plan_id: planId,
                        minutes_limit: minutesLimit,
                        subscription_status: 'active',
                        subscription_id: session.subscription,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId);

                if (error) {
                    console.error('[Webhook] Supabase Update Error:', error);
                    throw new Error(`Supabase Error: ${error.message}`);
                }
                console.log("[Webhook] Update Successful");
            }
        }

        res.status(200).json({ received: true });

    } catch (err: any) {
        console.error(`[Webhook] CRASH: ${err.message}`);
        // Return error details to client for debugging
        res.status(500).json({
            error: 'Webhook Handler Failed',
            details: err.message,
            stack: err.stack
        });
    }
}
