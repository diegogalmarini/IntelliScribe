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
 * Creates a checkout session by redirecting to Lemon Squeezy checkout URL
 * @param checkoutId - Lemon Squeezy checkout UUID from database
 * @param userEmail - User's email address (optional)
 * @param userId - User's Supabase ID (optional)
 */
export const createCheckout = async (
    checkoutIdOrUrl: string,
    userEmail?: string,
    userId?: string
) => {
    let checkoutUrlStr = '';

    // Check if it's a full URL
    if (checkoutIdOrUrl && (checkoutIdOrUrl.startsWith('http://') || checkoutIdOrUrl.startsWith('https://'))) {
        checkoutUrlStr = checkoutIdOrUrl;
    }
    // Check if it's a UUID
    else if (checkoutIdOrUrl && checkoutIdOrUrl.match(/^[0-9a-f-]{36}$/i)) {
        checkoutUrlStr = `https://diktalosaas.lemonsqueezy.com/checkout/buy/${checkoutIdOrUrl}`;
    } else {
        console.error('Invalid checkout ID or URL:', checkoutIdOrUrl);
        throw new Error('ID de checkout o URL inválida');
    }

    try {
        // Use URL API for safe parameter appending
        const url = new URL(checkoutUrlStr);

        // Get current domain for redirect
        const currentDomain = window.location.origin;
        const redirectUrl = `${currentDomain}/dashboard`;

        // Add params
        if (userEmail) url.searchParams.append('checkout[email]', userEmail);
        if (userId) url.searchParams.append('checkout[custom][user_id]', userId);
        url.searchParams.append('checkout[custom][redirect_url]', redirectUrl);

        console.log('Redirecting to Lemon Squeezy checkout:', url.toString());

        // Direct redirect to checkout
        window.location.href = url.toString();
    } catch (e) {
        console.error('Error constructing checkout URL:', e);
        throw new Error('Error al procesar la URL de pago');
    }
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