import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const LEMON_API_URL = 'https://api.lemonsqueezy.com/v1/checkouts';

serve(async (req) => {
    // CORS headers
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            },
        });
    }

    try {
        // Parse request body
        const { variantId, userEmail, userId, billingCycle, planId } = await req.json();

        // Validate required fields
        if (!variantId || !userEmail || !userId) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields: variantId, userEmail, userId' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Get API key and store ID from environment
        const apiKey = Deno.env.get('LEMONSQUEEZY_API_KEY');
        const storeId = Deno.env.get('LEMONSQUEEZY_STORE_ID');

        if (!apiKey || !storeId) {
            console.error('Missing environment variables:', { hasApiKey: !!apiKey, hasStoreId: !!storeId });
            return new Response(
                JSON.stringify({ error: 'Server configuration error' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Build Lemon Squeezy checkout request
        const checkoutData = {
            data: {
                type: 'checkouts',
                attributes: {
                    checkout_data: {
                        email: userEmail,
                        custom: {
                            user_id: userId,
                            plan_id: planId || 'unknown',
                            billing_cycle: billingCycle || 'monthly',
                        },
                    },
                },
                relationships: {
                    store: {
                        data: {
                            type: 'stores',
                            id: storeId,
                        },
                    },
                    variant: {
                        data: {
                            type: 'variants',
                            id: variantId.toString(),
                        },
                    },
                },
            },
        };

        console.log('Creating checkout with Lemon Squeezy:', {
            variantId,
            userEmail,
            userId: userId.substring(0, 8) + '...',
            planId,
            billingCycle,
        });

        // Call Lemon Squeezy API
        const lemonResponse = await fetch(LEMON_API_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(checkoutData),
        });

        const lemonData = await lemonResponse.json();

        if (!lemonResponse.ok) {
            console.error('Lemon Squeezy API error:', lemonData);
            return new Response(
                JSON.stringify({
                    error: 'Failed to create checkout',
                    details: lemonData,
                }),
                { status: lemonResponse.status, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Extract checkout URL from response
        const checkoutUrl = lemonData.data?.attributes?.url;

        if (!checkoutUrl) {
            console.error('No checkout URL in response:', lemonData);
            return new Response(
                JSON.stringify({ error: 'Invalid response from payment provider' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        console.log('Checkout created successfully:', checkoutUrl);

        // Return checkout URL
        return new Response(
            JSON.stringify({ checkoutUrl }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        );

    } catch (error) {
        console.error('Error in lemon-checkout function:', error);
        return new Response(
            JSON.stringify({
                error: 'Internal server error',
                message: error.message,
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});
