import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS (allow GET for the confirmation link)
    const allowedOrigin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ error: 'Token de confirmación requerido' });
    }

    try {
        // 1. Find subscription by token
        const { data, error: fetchError } = await supabase
            .from('newsletter_subscriptions')
            .select('id, email, status')
            .eq('confirmation_token', token)
            .single();

        if (fetchError || !data) {
            return res.status(404).json({ error: 'Token inválido o expirado' });
        }

        if (data.status === 'confirmed') {
            return res.status(200).json({ success: true, message: 'Ya confirmado' });
        }

        // 2. Update status to confirmed
        const { error: updateError } = await supabase
            .from('newsletter_subscriptions')
            .update({
                status: 'confirmed',
                updated_at: new Date().toISOString()
            })
            .eq('id', data.id);

        if (updateError) throw updateError;

        // Note: In a real production app, we might redirect here:
        // res.redirect(302, 'https://diktalo.com/confirm-subscription?success=true');

        return res.status(200).json({ success: true, email: data.email });

    } catch (error: any) {
        console.error('Confirmation Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
