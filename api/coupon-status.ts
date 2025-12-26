import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia' as any,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Configuración de CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { code } = req.query;
    if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Missing coupon code' });
    }

    try {
        // Buscar cupón activo
        const promotionCodes = await stripe.promotionCodes.list({
            code: code,
            active: true,
            limit: 1,
            expand: ['data.coupon']
        });

        if (promotionCodes.data.length === 0) {
            return res.status(200).json({ active: false, remaining: 0, label: 'Agotado' });
        }

        const promo = promotionCodes.data[0];
        const max = promo.max_redemptions;
        const used = promo.times_redeemed;
        // Calcular restantes (Si es ilimitado, devolvemos null)
        const remaining = max ? Math.max(0, max - used) : null;

        return res.status(200).json({
            active: true,
            code: promo.code,
            remaining: remaining,
            total: max,
            percent_off: promo.coupon.percent_off,
            label: `🔥 Solo quedan ${remaining} ofertas`
        });

    } catch (error) {
        console.error('Error fetching coupon:', error);
        return res.status(500).json({ error: 'Internal error' });
    }
}
