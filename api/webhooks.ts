
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Configuration for API Route (disable body parser)
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

    // DIAGNOSTIC GET
    if (req.method === 'GET') {
        return sendJson(res, 200, {
            status: 'active',
            type: 'ESM Module',
            env: {
                stripeKey: !!process.env.STRIPE_SECRET_KEY,
                stripeSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
                supabaseUrl: !!process.env.VITE_SUPABASE_URL,
                supabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
            }
        });
    }

    if (req.method !== 'POST') {
        return sendJson(res, 405, { error: 'Method Not Allowed' });
    }

    try {
        console.log("[Webhook] POST received");

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

        // Ignore Invoice Events safely
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
            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (!supabaseUrl || !supabaseKey) {
                return sendJson(res, 200, {
                    status: "error",
                    message: "Missing Supabase Config. Check SUPABASE_SERVICE_ROLE_KEY."
                });
            }

            const supabase = createClient(supabaseUrl, supabaseKey);

            let planId = 'pro';
            let limit = 150;
            const amount = session.amount_total || 0;
            if (amount >= 2000) { planId = 'business_plus'; limit = 999999; }
            else if (amount >= 1200) { planId = 'business'; limit = 600; }

            // 1. First, CHECK if user exists
            const { data: userCheck, error: checkError } = await supabase
                .from('profiles')
                .select('id, email')
                .eq('id', userId)
                .single();

            if (checkError || !userCheck) {
                console.error(`[Webhook] User Check Failed: ${userId}`);
                return sendJson(res, 200, {
                    status: "error",
                    message: `User Not Found in Profile Table`,
                    details: checkError ? checkError.message : "No row found",
                    searchedId: userId
                });
            }

            // 2. Perform Update
            const { data, error } = await supabase.from('profiles').update({
                plan_id: planId,
                minutes_limit: limit,
                subscription_status: 'active',
                subscription_id: session.subscription,
                updated_at: new Date().toISOString()
            })
                .eq('id', userId)
                .select();

            if (error) {
                return sendJson(res, 200, { status: "error", message: `Update Failed: ${error.message}` });
            }

            return sendJson(res, 200, { status: "success", userId, planId, updated_email: userCheck.email });
        }

        return sendJson(res, 200, { received: true });

    } catch (err: any) {
        console.error(`CRASH: ${err.message}`);
        // Return 200 with error info to ensure visibility in Dashboard
        return sendJson(res, 200, {
            status: "crash",
            error: err.message,
            stack: err.stack
        });
    }
}
