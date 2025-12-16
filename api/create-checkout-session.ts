
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia' as any,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const { priceId, userId, userEmail } = req.body;

    if (!priceId || !userId) {
        return res.status(400).json({ error: 'Missing priceId or userId' });
    }

    try {
        // Determine success/cancel URLs based on environment
        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const host = req.headers.host;
        const origin = `${protocol}://${host}`;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${origin}/dashboard?payment=success`,
            cancel_url: `${origin}/plans?payment=cancelled`,
            customer_email: userEmail,
            metadata: {
                userId: userId, // CRITICAL: This links the payment to the Supabase User
            },
        });

        return res.status(200).json({ sessionId: session.id, url: session.url });
    } catch (err: any) {
        console.error('Stripe error:', err);
        return res.status(500).json({ error: err.message });
    }
}
