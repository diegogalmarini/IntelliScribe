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
    const storeId = import.meta.env.VITE_LEMON_STORE_ID;

    if (!variantId || !storeId) {
        console.error('Missing Lemon Squeezy configuration:', { planKey, variantId, storeId });
        throw new Error('Error de configuración de pagos');
    }

    // Build checkout URL with user data in custom fields
    const checkoutUrl = `https://${storeId}.lemonsqueezy.com/checkout/buy/${variantId}?checkout[email]=${encodeURIComponent(userEmail)}&checkout[custom][user_id]=${userId}`;

    console.log('Redirecting to Lemon Squeezy checkout:', { planId, billingCycle, variantId });

    // Redirect to checkout
    window.location.href = checkoutUrl;
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
```