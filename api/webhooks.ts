
import Stripe from 'stripe';
// ERROR: import { createClient } from '@supabase/supabase-js'; <-- CAUSES CRASH
// FIX: We will use native 'fetch' to call Supabase REST API directly.

export const config = {
    api: {
        bodyParser: false,
    },
};

async function buffer(readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

const sendJson = (res, statusCode, data) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
};

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, stripe-signature');

    if (req.method === 'OPTIONS') return sendJson(res, 200, {});

    if (req.method === 'GET') {
        return sendJson(res, 200, {
            status: 'active',
            mode: 'LIGHTWEIGHT_FETCH',
            env: {
                stripeKey: !!process.env.STRIPE_SECRET_KEY,
                supabaseUrl: !!process.env.VITE_SUPABASE_URL,
                supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
            }
        });
    }

    if (req.method !== 'POST') {
        return sendJson(res, 405, { error: 'Method Not Allowed' });
    }

    try {
        if (!process.env.STRIPE_SECRET_KEY) throw new Error("Missing STRIPE_SECRET_KEY");

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2024-12-18.acacia' as any,
        });

        const buf = await buffer(req);
        const signature = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        // Verify Signature
        let event;
        try {
            if (webhookSecret && signature) {
                event = stripe.webhooks.constructEvent(buf, signature, webhookSecret);
            } else {
                event = JSON.parse(buf.toString());
            }
        } catch (e: any) {
            return sendJson(res, 200, { status: "error", message: `Signature Verification Failed: ${e.message}` });
        }

        if (event.type.startsWith('invoice.')) {
            return sendJson(res, 200, { status: "ignored", type: event.type });
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.metadata?.userId;

            if (!userId) {
                return sendJson(res, 200, { status: "skipped", message: "No userId in session metadata" });
            }

            console.log(`[Webhook] Processing User: ${userId}`);

            const supabaseUrl = process.env.VITE_SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST be Service Role for updates

            if (!supabaseUrl || !supabaseKey) {
                return sendJson(res, 200, {
                    status: "error",
                    message: "Missing Supabase Config. Check SUPABASE_SERVICE_ROLE_KEY."
                });
            }

            // PLAN LOGIC
            let planId = 'pro';
            let limit = 150;
            const amount = session.amount_total || 0;
            if (amount >= 2000) { planId = 'business_plus'; limit = 999999; }
            else if (amount >= 1200) { planId = 'business'; limit = 600; }

            // UPDATE VIA REST API (No Library)
            const updateUrl = `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`;

            const payload = {
                plan_id: planId,
                minutes_limit: limit,
                subscription_status: 'active',
                subscription_id: session.subscription,
                updated_at: new Date().toISOString()
            };

            const response = await fetch(updateUrl, {
                method: 'PATCH',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation' // Return the updated row
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Supabase REST Error: ${response.status} ${response.statusText} - ${text}`);
            }

            const data = await response.json();

            if (!data || data.length === 0) {
                return sendJson(res, 200, {
                    status: "error",
                    message: `User Not Found: ID ${userId} does not exist in 'profiles'. Row count 0.`,
                    debug_tip: "Check RLS or User ID mismatch."
                });
            }

            return sendJson(res, 200, { status: "success", userId, planId, updated_row: data[0] });
        }

        return sendJson(res, 200, { received: true });

    } catch (err: any) {
        console.error(`CRASH: ${err.message}`);
        return sendJson(res, 200, {
            status: "crash",
            error: err.message,
            stack: err.stack
        });
    }
}
