
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

const sendText = (res, statusCode, text) => {
    res.statusCode = statusCode;
    res.end(text);
};

export default async function handler(req, res) {
    console.log(`[Webhook] Request: ${req.method}`);

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
        return sendJson(res, 200, {
            status: 'active',
            env_check: {
                stripe_key: !!process.env.STRIPE_SECRET_KEY ? 'OK' : 'MISSING',
                supabase_url: !!process.env.VITE_SUPABASE_URL ? 'OK' : 'MISSING',
                supabase_key: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY) ? 'OK' : 'MISSING'
            }
        });
    }

    if (req.method !== 'POST') {
        return sendText(res, 405, `Method Not Allowed. Received: ${req.method}`);
    }

    try {
        console.log("[Webhook] Init Stripe...");
        if (!process.env.STRIPE_SECRET_KEY) throw new Error("Missing STRIPE_SECRET_KEY");

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2024-12-18.acacia' as any,
        });

        // Parse Body
        console.log("[Webhook] Reading Body...");
        const buf = await buffer(req);
        const signature = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        let event;
        if (webhookSecret && signature) {
            console.log("[Webhook] Verifying Signature...");
            event = stripe.webhooks.constructEvent(buf, signature, webhookSecret);
        } else {
            console.log("[Webhook] Skipping signature verification (unsafe/missing secret)");
            event = JSON.parse(buf.toString());
        }

        console.log(`[Webhook] Event: ${event.type}`);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.metadata?.userId;

            if (userId) {
                console.log(`[Webhook] Processing User: ${userId}`);
                const supabaseUrl = process.env.VITE_SUPABASE_URL;
                const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

                if (!supabaseUrl || !supabaseKey) throw new Error("Missing Supabase Config");

                const supabase = createClient(supabaseUrl, supabaseKey);

                // Determine Plan
                let planId = 'pro';
                let limit = 150;
                const amount = session.amount_total || 0;

                if (amount >= 2000) {
                    planId = 'business_plus';
                    limit = 999999;
                } else if (amount >= 1200) {
                    planId = 'business';
                    limit = 600;
                }

                const { error } = await supabase.from('profiles').update({
                    plan_id: planId,
                    minutes_limit: limit,
                    subscription_status: 'active',
                    subscription_id: session.subscription,
                    updated_at: new Date().toISOString()
                }).eq('id', userId);

                if (error) throw new Error(`DB Error: ${error.message}`);
                console.log(`[Webhook] User ${userId} updated to ${planId}`);
            }
        }

        sendJson(res, 200, { received: true });

    } catch (err: any) {
        console.error(`[Webhook] CRASH: ${err.message}`);
        sendJson(res, 500, {
            error: 'Webhook Internal Error',
            details: err.message
        });
    }
}
