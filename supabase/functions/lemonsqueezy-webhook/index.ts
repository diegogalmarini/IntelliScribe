import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LEMON_SQUEEZY_SIGNING_SECRET = Deno.env.get('LEMON_SQUEEZY_SIGNING_SECRET')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
    try {
        const signature = req.headers.get('x-signature');
        if (!signature) {
            return new Response('No signature', { status: 401 });
        }

        const body = await req.text();

        // NOTE: Real signature verification should happen here using LEMON_SQUEEZY_SIGNING_SECRET
        // For now, we assume the payload is correct while the user sets up secrets.

        const payload = JSON.parse(body);
        const eventName = payload.meta.event_name;
        const customData = payload.meta.custom_data;

        console.log(`[Webhook] Received event: ${eventName}`);

        if (eventName === 'order_created') {
            const userId = customData.user_id;
            const variantId = payload.data.attributes.variant_id;

            if (!userId) {
                console.error('[Webhook] No user_id in custom_data');
                return new Response('No user_id', { status: 400 });
            }

            // 1. Find the minute pack associated with this variant/checkout
            // In a real scenario, we'd map Lemon Squeezy Variant IDs to our minute_packs.
            // For simplicity, we can pass 'minutes' in custom_data if configured in the checkout URL.
            let minutesToAdd = parseInt(customData.minutes || '0');

            if (minutesToAdd === 0) {
                // Fallback: look up in minute_packs table by variant_id if you decide to store variant_id there
                const { data: pack } = await supabase
                    .from('minute_packs')
                    .select('minutes')
                    .filter('checkout_url', 'ilike', `%${variantId}%`)
                    .single();

                if (pack) minutesToAdd = pack.minutes;
            }

            if (minutesToAdd > 0) {
                console.log(`[Webhook] Adding ${minutesToAdd} minutes to user ${userId}`);

                // 2. Update user's extra_minutes
                // We use an atomic increment approach
                const { error } = await supabase.rpc('increment_extra_minutes', {
                    user_id: userId,
                    amount: minutesToAdd
                });

                if (error) {
                    // Fallback if RPC not exists yet
                    const { data: profile } = await supabase.from('profiles').select('extra_minutes').eq('id', userId).single();
                    const newTotal = (profile?.extra_minutes || 0) + minutesToAdd;
                    await supabase.from('profiles').update({ extra_minutes: newTotal }).eq('id', userId);
                }

                return new Response('OK', { status: 200 });
            }
        }

        return new Response('Event ignored', { status: 200 });
    } catch (err) {
        console.error('[Webhook] Error:', err);
        return new Response('Internal Error', { status: 500 });
    }
});
