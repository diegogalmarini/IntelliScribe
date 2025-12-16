
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Native config export
export const config = {
    api: {
        bodyParser: false,
    },
};

// HELPER: Read raw body safely
async function buffer(readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

// HELPER: Send JSON response safely
const sendJson = (res, statusCode, data) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
};

export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, stripe-signature');

    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }

    if (req.method === 'GET') {
        return sendJson(res, 200, { status: 'active' });
    }

    if (req.method !== 'POST') {
        return sendJson(res, 405, { error: 'Method Not Allowed' });
    }

    try {
        console.log("[Webhook] POST received");

        // 1. Initialize Stripe
        if (!process.env.STRIPE_SECRET_KEY) throw new Error("Missing STRIPE_SECRET_KEY");
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2024-12-18.acacia' as any,
        });

        // 2. Buffer Body
        const buf = await buffer(req);
        const signature = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        // 3. Verify Signature
        let event;
        try {
            if (webhookSecret && signature) {
                event = stripe.webhooks.constructEvent(buf, signature, webhookSecret);
            } else {
                event = JSON.parse(buf.toString());
            }
        } catch (e: any) {
            console.error(`[Webhook] Signature Error: ${e.message}`);
            return sendJson(res, 400, { error: `Signature Error: ${e.message}` });
        }

        // 4. Filter Events (Ignore noise)
        if (event.type.startsWith('invoice.')) {
            console.log(`[Webhook] Ignoring event: ${event.type}`);
            return sendJson(res, 200, { received: true, ignored: true });
        }

        // 5. Handle Checkout Session
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.metadata?.userId;

            if (userId) {
                console.log(`[Webhook] Processing Payment for User ID: ${userId}`);

                const supabaseUrl = process.env.VITE_SUPABASE_URL;
                const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
                const supabase = createClient(supabaseUrl!, supabaseKey!);

                // Plan Logic
                let planId = 'pro';
                let limit = 150;
                const amount = session.amount_total || 0;
                if (amount >= 2000) { planId = 'business_plus'; limit = 999999; }
                else if (amount >= 1200) { planId = 'business'; limit = 600; }

                // CRITICAL: Update and Check Rows
                const { data, error } = await supabase.from('profiles').update({
                    plan_id: planId,
                    minutes_limit: limit,
                    subscription_status: 'active',
                    subscription_id: session.subscription,
                    updated_at: new Date().toISOString()
                })
                    .eq('id', userId)
                    .select(); // Ask for returned rows

                if (error) {
                    console.error('[Webhook] DB Error:', error);
                    throw new Error(`DB Update Failed: ${error.message}`);
                }

                // If data is empty, NO ROW WAS UPDATED -> User ID mismatch
                if (!data || data.length === 0) {
                    console.error(`[Webhook] USER NOT FOUND! ID: ${userId}`);
                    throw new Error(`User ${userId} not found in 'profiles' table. Update affected 0 rows.`);
                }

                console.log(`[Webhook] Success! Updated user ${userId} to ${planId}`);
            } else {
                console.warn("[Webhook] Session missing userId metadata");
            }
        }

        return sendJson(res, 200, { received: true });

    } catch (err: any) {
        console.error(`[Webhook] CRASH: ${err.message}`);
        return sendJson(res, 500, {
            error: 'Internal Server Error',
            details: err.message
        });
    }
}
