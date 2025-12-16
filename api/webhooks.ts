
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

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
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, stripe-signature');

    if (req.method === 'OPTIONS') return sendJson(res, 200, {});

    // Debug info about environment
    const debugEnv = {
        stripeKey: process.env.STRIPE_SECRET_KEY ? 'Present' : 'MISSING',
        stripeSecret: process.env.STRIPE_WEBHOOK_SECRET ? 'Present' : 'MISSING',
        supabaseUrl: process.env.VITE_SUPABASE_URL ? 'Present' : 'MISSING',
        supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'MISSING',
    };

    if (req.method === 'GET') {
        return sendJson(res, 200, { status: 'active', env: debugEnv });
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

        let event;
        try {
            if (webhookSecret && signature) {
                event = stripe.webhooks.constructEvent(buf, signature, webhookSecret);
            } else {
                console.log("Unsafe parsing (No Secret/Signature)");
                event = JSON.parse(buf.toString());
            }
        } catch (e: any) {
            // Return 200 to show error in Stripe Dashboard cleanly
            return sendJson(res, 200, { status: "error", message: `Signature Verification Failed: ${e.message}`, env: debugEnv });
        }

        if (event.type.startsWith('invoice.')) {
            return sendJson(res, 200, { status: "ignored", type: event.type });
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.metadata?.userId;

            if (!userId) {
                return sendJson(res, 200, { status: "skipped", message: "No userId in metadata" });
            }

            const supabaseUrl = process.env.VITE_SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

            if (!supabaseUrl || !supabaseKey) {
                throw new Error("Missing Supabase Configuration (URL or Key)");
            }

            const supabase = createClient(supabaseUrl, supabaseKey);

            let planId = 'pro';
            let limit = 150;
            const amount = session.amount_total || 0;
            if (amount >= 2000) { planId = 'business_plus'; limit = 999999; }
            else if (amount >= 1200) { planId = 'business'; limit = 600; }

            // Update DB
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
                throw new Error(`Supabase Update Error: ${error.message}`);
            }

            if (!data || data.length === 0) {
                // RETURN 200 WITH ERROR MESSAGE so user sees it in dashboard
                return sendJson(res, 200, {
                    status: "error",
                    message: `User Not Found: ID ${userId} does not exist in 'profiles' table.`,
                    debug_tip: "Check if row exists in Supabase 'profiles' table for this user ID."
                });
            }

            return sendJson(res, 200, { status: "success", userId, planId, updated_rows: data.length });
        }

        return sendJson(res, 200, { status: "received", type: event.type });

    } catch (err: any) {
        // CATCH ALL CRASHES AND RETURN 200 WITH DETAILS
        console.error(`CRASH: ${err.message}`);
        return sendJson(res, 200, {
            status: "crash",
            error: err.message,
            stack: err.stack,
            env: debugEnv
        });
    }
}
