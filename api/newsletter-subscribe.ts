import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role for internal DB ops
const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    const allowedOrigin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, legalAccepted, metadata = {} } = req.body || {};

    if (!email || !legalAccepted) {
        return res.status(400).json({ error: 'Email y aceptación legal son requeridos' });
    }

    try {
        // 1. Check if already exists
        const { data: existing } = await supabase
            .from('newsletter_subscriptions')
            .select('status')
            .eq('email', email)
            .single();

        if (existing?.status === 'confirmed') {
            return res.status(200).json({ success: true, alreadySubscribed: true });
        }

        // 2. Insert or update to pending
        const { data, error: dbError } = await supabase
            .from('newsletter_subscriptions')
            .upsert({
                email,
                status: 'pending',
                legal_accepted: legalAccepted,
                metadata: { ...metadata, source: 'blog_footer' },
                updated_at: new Date().toISOString()
            }, { onConflict: 'email' })
            .select('confirmation_token')
            .single();

        if (dbError) throw dbError;

        // 3. Send confirmation email
        const confirmLink = `https://diktalo.com/confirm-subscription?token=${data.confirmation_token}`;

        const { error: emailError } = await resend.emails.send({
            from: 'Diktalo <noreply@diktalo.com>',
            to: [email],
            subject: 'Confirma tu suscripción a Diktalo',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
                    <h2 style="color: #3b82f6;">¡Casi listo!</h2>
                    <p>Gracias por querer sumarte a la newsletter de Diktalo. Para completar tu suscripción y empezar a recibir nuestras novedades, haz clic en el botón de abajo:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${confirmLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Confirmar suscripción</a>
                    </div>
                    <p style="font-size: 12px; color: #64748b;">Si no solicitaste esta suscripción, puedes ignorar este correo.</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #94a3b8;">Diktalo - Inteligencia Conversacional Estratégica</p>
                </div>
            `
        });

        if (emailError) {
            console.error('Resend Error:', emailError);
            // We don't fail the whole request if email fails to send, but we log it
        }

        return res.status(200).json({ success: true });

    } catch (error: any) {
        console.error('Subscription Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
