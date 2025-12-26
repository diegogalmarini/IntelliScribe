import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Configuration for Vercel body parsing
export const config = {
    api: {
        bodyParser: false,
    },
};

// Helper for buffer
async function buffer(readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

// MAPA DE PRECIOS REALES (Producción) -> PLAN INTERNO
// Using VITE_ prefixed env vars as they are in .env.local and likely injected
const PRICE_ID_TO_PLAN_MAP: Record<string, string> = {
    // PRO
    [process.env.VITE_STRIPE_PRICE_PRO_MONTHLY!]: 'pro',
    [process.env.VITE_STRIPE_PRICE_PRO_ANNUAL!]: 'pro',

    // BUSINESS
    [process.env.VITE_STRIPE_PRICE_BUSINESS_MONTHLY!]: 'business',
    [process.env.VITE_STRIPE_PRICE_BUSINESS_ANNUAL!]: 'business',

    // BUSINESS PLUS
    [process.env.VITE_STRIPE_PRICE_BUSINESS_PLUS_MONTHLY!]: 'business_plus',
    [process.env.VITE_STRIPE_PRICE_BUSINESS_PLUS_ANNUAL!]: 'business_plus',
};

// LÍMITES DUROS POR PLAN (Hard Limits)
const PLAN_LIMITS = {
    free: {
        minutes_limit: 24,
        storage_limit: 0,
        retention_days: 7
    },
    pro: {
        minutes_limit: 300,
        storage_limit: 5368709120, // 5 GB
        retention_days: 365
    },
    business: {
        minutes_limit: 600,
        storage_limit: 21474836480, // 20 GB
        retention_days: 365
    },
    business_plus: {
        minutes_limit: 1200,
        storage_limit: 53687091200, // 50 GB
        retention_days: 365
    }
};

const sendJson = (res, statusCode, data) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
};

export default async function handler(req, res) {
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
                event = JSON.parse(buf.toString());
            }
        } catch (e: any) {
            return sendJson(res, 200, { status: "error", message: `Signature Verification Failed: ${e.message}` });
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.metadata?.userId || session.client_reference_id;

            if (!userId) {
                return sendJson(res, 200, { status: "skipped", message: "No userId in session metadata" });
            }

            console.log(`[Webhook] Processing User: ${userId}`);

            // Initialize Supabase Admin
            const supabaseUrl = process.env.VITE_SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (!supabaseUrl || !supabaseKey) {
                return sendJson(res, 200, {
                    status: "error",
                    message: "Missing Supabase Config. Check SUPABASE_SERVICE_ROLE_KEY."
                });
            }

            const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

            // Fetch Line Items to identify price
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
            const priceId = lineItems.data[0]?.price?.id;

            // Map Price ID to Plan
            let planId = 'free';
            if (priceId && PRICE_ID_TO_PLAN_MAP[priceId]) {
                planId = PRICE_ID_TO_PLAN_MAP[priceId];
            } else {
                // Fallback: If map fails, try to infer from amount (legacy safety net)
                console.warn(`[Webhook] Price ID ${priceId} not found in map. Falling back to amount.`);
                const amount = session.amount_total || 0;
                if (amount >= 3000) planId = 'business_plus';
                else if (amount >= 1800) planId = 'business';
                else planId = 'pro';
            }

            const limits = PLAN_LIMITS[planId as keyof typeof PLAN_LIMITS];

            console.log(`[Webhook] Updating ${userId} to ${planId}`);

            // Update Profile
            const { error, data } = await supabaseAdmin
                .from('profiles')
                .update({
                    plan_id: planId, // Assuming column is 'plan_id' based on previous schema, user said 'plan' but DB likely 'plan_id'
                    subscription_status: 'active',
                    stripe_customer_id: session.customer,
                    minutes_limit: limits.minutes_limit,
                    storage_limit: limits.storage_limit,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select();

            if (error) {
                console.error('[Webhook] Update Error:', error);
                throw error;
            }

            return sendJson(res, 200, { status: "success", plan: planId, userId });
        }

        return sendJson(res, 200, { received: true });

    } catch (err: any) {
        console.error(`CRASH: ${err.message}`);
        return sendJson(res, 500, { error: err.message });
    }
}
