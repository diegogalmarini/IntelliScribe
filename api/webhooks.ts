import { stripe } from '../services/stripeService';
import { supabaseAdmin } from '../lib/supabase';

// Helper para parsear el body de Stripe si es necesario (generalmente Vercel lo maneja)
// Nota: Si usas la integración estándar de Vercel/Next, a veces req.body ya viene parseado.
// Esta configuración asegura que recibamos el raw body si fuera necesario para la firma.
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

// Lógica dinámica: Consultar DB para saber qué plan es este precio
const getPlanFromDB = async (priceId: string) => {
    // Buscar si el ID corresponde a precio mensual o anual en nuestra tabla de configuración
    const { data, error } = await supabaseAdmin
        .from('plans_configuration')
        .select('*')
        .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_annual.eq.${priceId}`)
        .single();

    if (error || !data) {
        console.error(`[Webhook] Plan not found in DB for Price ID: ${priceId}`);
        return null;
    }
    return data;
};

const sendJson = (res, statusCode, data) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
};

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return sendJson(res, 405, { error: 'Method Not Allowed' });
    }

    try {
        const signature = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        const buf = await buffer(req);

        let event;
        try {
            if (webhookSecret) {
                event = stripe.webhooks.constructEvent(buf, signature, webhookSecret);
            } else {
                // Fallback para desarrollo local sin firma estricta
                event = JSON.parse(buf.toString());
            }
        } catch (err: any) {
            console.error(`⚠️  Webhook signature verification failed.`, err.message);
            return sendJson(res, 400, { error: `Webhook Error: ${err.message}` });
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            // 1. Recuperar el ID del precio pagado desde Stripe
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
            const priceId = lineItems.data[0]?.price?.id;

            if (!priceId) {
                console.error('[Webhook] No price ID found in session');
                return sendJson(res, 400, { error: 'No price ID' });
            }

            // 2. BUSCAR PLAN EN DB (Dinámico - Aquí está el ahorro de líneas)
            // En lugar de tener un mapa gigante harcoded, preguntamos a Supabase.
            const planConfig = await getPlanFromDB(priceId);

            // Fallback a 'free' si falla la DB, pero intentamos usar los datos reales
            const planId = planConfig?.id || 'free';

            // Usar los límites de la DB. Si no existen, defaults seguros.
            const limits = planConfig?.limits || { transcription_minutes: 24, storage_gb: 0 };

            console.log(`[Webhook] Pago recibido (${priceId}). Asignando Plan: ${planId} con límites:`, limits);

            // 3. Actualizar usuario en Supabase con los datos obtenidos
            const { error } = await supabaseAdmin
                .from('profiles')
                .update({
                    plan_id: planId,
                    subscription_status: 'active',
                    stripe_customer_id: session.customer,

                    // Aplicar límites dinámicos leídos de la tabla plans_configuration
                    minutes_limit: limits.transcription_minutes,
                    storage_limit: (limits.storage_gb || 0) * 1073741824,  // GB to bytes
                    call_limit: limits.call_minutes || 0,

                    // Sincronizar fecha de reseteo: Hoy + 1 mes
                    usage_reset_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),

                    updated_at: new Date().toISOString()
                })
                .eq('id', session.client_reference_id || session.metadata.userId);

            if (error) {
                console.error('[Webhook Error] Error updating profile:', error);
                return sendJson(res, 500, { error: 'Database update failed' });
            }

            return sendJson(res, 200, { received: true, plan: planId });
        }

        // Reseteo mensual via Webhook (Recomendado para mayor precisión en mensuales)
        if (event.type === 'invoice.payment_succeeded') {
            const invoice = event.data.object;
            const customerId = invoice.customer;

            // No reseteamos si es la primera factura (ya lo hace checkout.session.completed)
            // prevent unnecessary double reset
            if (invoice.billing_reason === 'subscription_create') {
                return sendJson(res, 200, { received: true, note: 'Initial invoice skipped' });
            }

            console.log(`[Webhook] Renovación mensual detectada para cliente: ${customerId}`);

            // Resetear minutos y avanzar fecha de reseteo
            const { error } = await supabaseAdmin
                .from('profiles')
                .update({
                    minutes_used: 0,
                    usage_reset_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('stripe_customer_id', customerId);

            if (error) console.error('[Webhook] Error resetting usage on renewal:', error);
            return sendJson(res, 200, { received: true, action: 'monthly_usage_reset' });
        }

        // Manejar pago fallido - PAUSAR cuenta automáticamente
        if (event.type === 'invoice.payment_failed') {
            const invoice = event.data.object;
            const customerId = invoice.customer;

            console.log(`[Webhook] ⚠️ Payment failed for customer: ${customerId}`);

            // Pausar la cuenta del usuario hasta que resuelva el pago
            const { error } = await supabaseAdmin
                .from('profiles')
                .update({
                    subscription_status: 'paused',
                    updated_at: new Date().toISOString()
                })
                .eq('stripe_customer_id', customerId);

            if (error) {
                console.error('[Webhook] Error pausing user account:', error);
                return sendJson(res, 500, { error: 'Failed to pause account' });
            }

            console.log(`[Webhook] ✅ Account paused for customer: ${customerId}`);
            return sendJson(res, 200, { received: true, action: 'account_paused' });
        }

        // Manejar cancelación (opcional, para volver a free automáticamente al terminar periodo)
        if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object;
            const customerId = subscription.customer;

            // Buscar usuario por stripe_customer_id y hacer downgrade
            const { error } = await supabaseAdmin
                .from('profiles')
                .update({
                    plan_id: 'free',
                    subscription_status: 'canceled',
                    minutes_limit: 24,
                    storage_limit: 0
                })
                .eq('stripe_customer_id', customerId);

            if (error) console.error('[Webhook] Error downgrading user:', error);
        }

        return sendJson(res, 200, { received: true });

    } catch (err: any) {
        console.error(`CRASH: ${err.message}`);
        return sendJson(res, 500, { error: err.message });
    }
}