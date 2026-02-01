// supabase/functions/lemon-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LEMON_SECRET = Deno.env.get("LEMONSQUEEZY_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Variant ID to Plan Type mapping
const VARIANT_PLAN_MAP: Record<number, string> = {
    1269049: 'pro',           // Pro Monthly
    1269099: 'pro',           // Pro Annual
    1269208: 'business',      // Business Monthly
    1269212: 'business',      // Business Annual
    1269226: 'business_plus', // Call Monthly
    1269230: 'business_plus', // Call Annual
};

serve(async (req) => {
    try {
        if (req.method !== "POST") {
            return new Response("Method not allowed", { status: 405 });
        }

        // 1. Read body and signature
        const signature = req.headers.get("x-signature");
        const body = await req.text();

        if (!signature) {
            console.error("Missing signature header");
            return new Response("Missing signature", { status: 401 });
        }

        // 2. Verify HMAC signature
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(LEMON_SECRET),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["verify"]
        );

        const signatureBytes = hexToUint8Array(signature);
        const bodyBytes = encoder.encode(body);
        const verified = await crypto.subtle.verify("HMAC", key, signatureBytes, bodyBytes);

        if (!verified) {
            console.error("Invalid signature");
            return new Response("Invalid signature", { status: 401 });
        }

        // 3. Parse payload
        const payload = JSON.parse(body);
        const eventName = payload.meta?.event_name;
        const customData = payload.meta?.custom_data;
        const userId = customData?.user_id;

        console.log(`📦 Event: ${eventName} | User: ${userId}`);

        if (!userId) {
            console.error("Missing user_id in custom data");
            return new Response(JSON.stringify({ received: true, error: "Missing user_id" }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // 4. Handle subscription events
        if (eventName === "subscription_created" || eventName === "subscription_updated") {
            const variantId = payload.data?.attributes?.variant_id;
            const subscriptionId = payload.data?.id;
            const customerId = payload.data?.attributes?.customer_id;
            const renewsAt = payload.data?.attributes?.renews_at;
            const status = payload.data?.attributes?.status;

            console.log(`Variant ID: ${variantId} | Status: ${status}`);

            // Map variant to plan type
            const planType = VARIANT_PLAN_MAP[variantId] || 'free';

            // Update database
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    plan_id: planType,
                    plan_type: planType,
                    lemon_subscription_id: subscriptionId,
                    lemon_customer_id: customerId,
                    renews_at: renewsAt,
                    subscription_status: status === 'active' ? 'active' : 'inactive'
                })
                .eq('id', userId);

            if (error) {
                console.error("Database update error:", error);
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            }

            console.log(`✅ Activated ${planType} plan for user ${userId}`);
        }

        // 5. Handle cancellations
        if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    plan_id: 'free',
                    plan_type: 'free',
                    subscription_status: 'cancelled'
                })
                .eq('id', userId);

            if (error) {
                console.error("Database update error:", error);
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            }

            console.log(`❌ Cancelled subscription for user ${userId}`);
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Webhook error:", error);
        return new Response(JSON.stringify({ error: "Server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
});

// Helper: Convert hex string to Uint8Array
function hexToUint8Array(hexString: string): Uint8Array {
    const matches = hexString.match(/.{1,2}/g);
    if (!matches) return new Uint8Array();
    return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
}
