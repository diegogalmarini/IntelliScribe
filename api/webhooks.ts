
// Webhook with Dynamic Imports to prevent Startup Crash

// HELPER: Read raw body safely
async function buffer(readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

// HELPER: Send JSON response safely (Node.js native)
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

    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }

    // DIAGNOSTIC GET: Check Environment & Imports
    if (req.method === 'GET') {
        const diagnostics: any = {
            status: 'active',
            env: {
                stripeKey: !!process.env.STRIPE_SECRET_KEY,
                stripeSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
                supabaseUrl: !!process.env.VITE_SUPABASE_URL,
                supabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
            },
            modules: {}
        };

        try {
            require('stripe');
            diagnostics.modules.stripe = 'OK';
        } catch (e: any) {
            diagnostics.modules.stripe = `FAILED: ${e.message}`;
        }

        try {
            require('@supabase/supabase-js');
            diagnostics.modules.supabase = 'OK';
        } catch (e: any) {
            diagnostics.modules.supabase = `FAILED: ${e.message}`;
        }

        return sendJson(res, 200, diagnostics);
    }

    if (req.method !== 'POST') {
        return sendJson(res, 405, { error: 'Method Not Allowed' });
    }

    try {
        console.log("[Webhook] Loading Modules...");

        // DYNAMIC IMPORTS
        const Stripe = require('stripe');
        const { createClient } = require('@supabase/supabase-js');

        if (!process.env.STRIPE_SECRET_KEY) throw new Error("Missing STRIPE_SECRET_KEY");
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2024-12-18.acacia',
        });

        // Parse Body
        console.log("[Webhook] Reading Body...");
        const buf = await buffer(req);
        const signature = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        // Verify Signature
        let event;
        try {
            if (webhookSecret && signature) {
                event = stripe.webhooks.constructEvent(buf, signature, webhookSecret);
            } else {
                console.log("Unsafe parsing...");
                event = JSON.parse(buf.toString());
            }
        } catch (e: any) {
            return sendJson(res, 200, { status: "error", message: `Signature Failed: ${e.message}` });
        }

        if (event.type.startsWith('invoice.')) {
            return sendJson(res, 200, { status: "ignored", type: event.type });
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.metadata?.userId;

            if (!userId) {
                return sendJson(res, 200, { status: "skipped", message: "No userId" });
            }

            const supabaseUrl = process.env.VITE_SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (!supabaseUrl || !supabaseKey) {
                return sendJson(res, 200, {
                    status: "error",
                    message: "Missing Supabase Config (Service Key missing?)",
                    env: process.env
                });
            }

            const supabase = createClient(supabaseUrl, supabaseKey);

            let planId = 'pro';
            let limit = 150;
            const amount = session.amount_total || 0;
            if (amount >= 2000) { planId = 'business_plus'; limit = 999999; }
            else if (amount >= 1200) { planId = 'business'; limit = 600; }

            const { data, error } = await supabase.from('profiles').update({
                plan_id: planId,
                minutes_limit: limit,
                subscription_status: 'active',
                subscription_id: session.subscription,
                updated_at: new Date().toISOString()
            })
                .eq('id', userId)
                .select();

            if (error) throw new Error(`DB Error: ${error.message}`);

            if (!data || data.length === 0) {
                return sendJson(res, 200, {
                    status: "error",
                    message: `User Not Found: ${userId} in profiles table.`,
                });
            }

            return sendJson(res, 200, { status: "success", userId, planId });
        }

        return sendJson(res, 200, { received: true });

    } catch (err: any) {
        console.error(`[Webhook] CRASH: ${err.message}`);
        return sendJson(res, 200, {
            status: "crash",
            error: err.message,
            stack: err.stack
        });
    }
}
