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
    checkoutId: string,
    userEmail?: string,
    userId?: string
) => {
    // Validate checkout ID format (UUID)
    if (!checkoutId || !checkoutId.match(/^[0-9a-f-]{36}$/i)) {
        console.error('Invalid checkout ID:', checkoutId);
        throw new Error('ID de checkout inválido');
    }

    // Build checkout URL
    let checkoutUrl = `https://diktalosaas.lemonsqueezy.com/checkout/buy/${checkoutId}`;

    // Add optional query parameters for pre-filling
    const params = new URLSearchParams();
    if (userEmail) params.append('checkout[email]', userEmail);
    if (userId) params.append('checkout[custom][user_id]', userId);

    if (params.toString()) {
        checkoutUrl += `?${params.toString()}`;
    }

    console.log('Redirecting to Lemon Squeezy checkout:', checkoutUrl);

    // Direct redirect to checkout
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