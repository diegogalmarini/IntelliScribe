import { supabase } from '../lib/supabase';

// Mapeo de IDs de tus variables de entorno
const PLANS = {
    pro_monthly: import.meta.env.VITE_LEMON_VARIANT_PRO_MONTHLY,
    pro_annual: import.meta.env.VITE_LEMON_VARIANT_PRO_ANNUAL,
    business_monthly: import.meta.env.VITE_LEMON_VARIANT_BUSINESS_MONTHLY,
    business_annual: import.meta.env.VITE_LEMON_VARIANT_BUSINESS_ANNUAL,
    call_monthly: import.meta.env.VITE_LEMON_VARIANT_CALL_MONTHLY,
    call_annual: import.meta.env.VITE_LEMON_VARIANT_CALL_ANNUAL,
};

/**
 * Creates a checkout session and redirects to Lemon Squeezy
 * @param planId - Plan name: 'pro', 'business', or 'call'
 * @param billingCycle - 'monthly' or 'annual'
 * @param userEmail - User's email address
 * @param userId - User's Supabase ID
 */
export const createCheckout = async (
    planId: 'pro' | 'business' | 'call',
    billingCycle: 'monthly' | 'annual',
    userEmail: string,
    userId: string
) => {
    // Construct plan key
    const planKey = `${planId}_${billingCycle}` as keyof typeof PLANS;
    const variantId = PLANS[planKey];

    if (!variantId) {
        console.error('Missing Lemon Squeezy variant:', { planKey, variantId });
        throw new Error('Error de configuración de pagos');
    }

    console.log('Creating checkout via API:', { planId, billingCycle, variantId });

    // Call Supabase Edge Function to create checkout
    const { data, error } = await supabase.functions.invoke('lemon-checkout', {
        body: {
            variantId: variantId.toString(),
            userEmail,
            userId,
            billingCycle,
            planId
        }
    });

    if (error) {
        console.error('Error calling lemon-checkout function:', error);
        throw new Error('Error al crear la sesión de pago');
    }

    if (!data || !data.checkoutUrl) {
        console.error('No checkout URL returned:', data);
        throw new Error('Error al obtener URL de pago');
    }

    console.log('Redirecting to checkout:', data.checkoutUrl);

    // Redirect to checkout URL returned by API
    window.location.href = data.checkoutUrl;
};

/**
 * Opens customer portal for subscription management
 * Note: Lemon Squeezy sends portal URL via email after subscription
 */
export const openCustomerPortal = async () => {
    alert("Para gestionar tu suscripción, revisa el correo de confirmación de Lemon Squeezy o contáctanos en soporte@diktalo.com");
};

/**
 * Get current subscription status from database
 */
export const getSubscriptionStatus = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('plan_type, lemon_subscription_id, renews_at, subscription_status')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching subscription:', error);
        return null;
    }

    return data;
};