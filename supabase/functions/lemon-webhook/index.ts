// supabase/functions/lemon-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getWelcomeEmail, getPlanChangeEmail, getCancellationEmail } from "./email-templates.ts";

const LEMON_SECRET = Deno.env.get("LEMONSQUEEZY_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

// Helper to send emails via Resend
async function sendEmail(to: string, subject: string, html: string) {
    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: "Diktalo <hola@diktalo.com>",
                to: [to],
                subject,
                html
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Resend API error:", error);
            throw new Error(`Resend failed: ${error}`);
        }

        const data = await response.json();
        console.log(`✉️ Email sent successfully to ${to}:`, data.id);
        return data;
    } catch (error) {
        console.error("Failed to send email:", error);
        // Don't throw - email failure shouldn't fail the webhook
        return null;
    }
}

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
            const userEmail = payload.data?.attributes?.user_email;
            const userName = payload.data?.attributes?.user_name || 'there';

            console.log(`Variant ID: ${variantId} | Status: ${status}`);

            // Map variant to plan type
            const planType = VARIANT_PLAN_MAP[variantId] || 'free';

            // Get current plan before updating (for subscription_updated)
            const { data: currentProfile } = await supabase
                .from('profiles')
                .select('plan_type, language, first_name, last_name')
                .eq('id', userId)
                .single();

            const oldPlanType = currentProfile?.plan_type || 'free';
            const userLanguage = (currentProfile?.language || 'es') as 'es' | 'en';
            const finalUserName = `${currentProfile?.first_name || ''} ${currentProfile?.last_name || ''}`.trim() || userName;

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

            // Send appropriate email
            try {
                if (eventName === "subscription_created") {
                    // Welcome email for new subscription
                    const emailContent = getWelcomeEmail(planType, finalUserName, userLanguage);
                    await sendEmail(userEmail, emailContent.subject, emailContent.html);
                } else if (eventName === "subscription_updated" && planType !== oldPlanType) {
                    // Plan change email (upgrade/downgrade)
                    const emailContent = getPlanChangeEmail(oldPlanType, planType, finalUserName, userLanguage);
                    await sendEmail(userEmail, emailContent.subject, emailContent.html);
                }
            } catch (emailError) {
                console.error("Email error (non-fatal):", emailError);
                // Continue - email failure shouldn't stop the webhook
            }
        }

        // 5. Handle cancellations
        if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
            const endsAt = payload.data?.attributes?.ends_at;
            const userEmail = payload.data?.attributes?.user_email;
            const userName = payload.data?.attributes?.user_name || 'there';

            // Get user data before updating
            const { data: currentProfile } = await supabase
                .from('profiles')
                .select('plan_type, language, first_name, last_name')
                .eq('id', userId)
                .single();

            const oldPlanType = currentProfile?.plan_type || 'pro';
            const userLanguage = (currentProfile?.language || 'es') as 'es' | 'en';
            const finalUserName = `${currentProfile?.first_name || ''} ${currentProfile?.last_name || ''}`.trim() || userName;

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

            // Send cancellation email
            try {
                const formattedDate = endsAt ? new Date(endsAt).toLocaleDateString(userLanguage === 'es' ? 'es-ES' : 'en-US') : 'end of billing period';
                const emailContent = getCancellationEmail(oldPlanType, finalUserName, formattedDate, userLanguage);
                await sendEmail(userEmail, emailContent.subject, emailContent.html);
            } catch (emailError) {
                console.error("Email error (non-fatal):", emailError);
            }
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
