
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16', // Use latest API version available in your dependencies
});

// Initialize Supabase Admin Client (Service Role Key usually needed for admin tasks, 
// using Anon key here assuming RLS allows update or we use a Service Key env var if strict)
// Ideally use SERVICE_ROLE_KEY for admin updates bypassing RLS
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Disable body parsing by Vercel/Next.js to verify signature raw body
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

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    let event;
    const signature = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try {
        const buf = await buffer(req);
        event = stripe.webhooks.constructEvent(buf, signature, webhookSecret!);
    } catch (err: any) {
        console.error(`Webhook Signature Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata?.userId;

        // Determine plan from amount or price ID
        // Logic: Retrieve line items or check amount to decide 'pro' or 'business'
        // For simplicity here, we assume if it's not free, it's pro (you can enhance this logic)
        // Detailed logic requires fetching line items or checking session.amount_total

        let planId = 'pro';
        let minutesLimit = 100;

        // Example logic: if amount > 1000 (10 EUR), maybe it's business
        if (session.amount_total && session.amount_total > 1300) {
            planId = 'business';
            minutesLimit = 600;
        }

        if (userId) {
            console.log(`Updating user ${userId} to plan ${planId}`);

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
                console.error('Supabase update error:', error);
                return res.status(500).json({ error: 'Database update failed' });
            }
        }
    }

    return res.status(200).json({ received: true });
}
