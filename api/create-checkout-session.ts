import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia' as any,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const { priceId, email, userId, planId } = req.body;

    if (!priceId || !userId) {
        return res.status(400).json({ error: 'Missing priceId or userId' });
    }

    try {
        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const host = req.headers.host;
        const origin = `${protocol}://${host}`;

        const session = await stripe.checkout.sessions.create({
            customer_email: email,
            client_reference_id: userId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            allow_promotion_codes: true, // CLAVE PARA CUPONES
            success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/plans`,
            metadata: {
                userId: userId,
                planId: planId // Optional tracking
            }
        });

        return res.status(200).json({ sessionId: session.id });
    } catch (err: any) {
        console.error('Stripe Checkout Error:', err);
        return res.status(500).json({ error: err.message });
    }
}
