import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getOnboardingEmail } from "./email-templates.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const ONBOARDING_SECRET = Deno.env.get("ONBOARDING_EMAILS_SECRET")!;

// step → [minDays, maxDays) since signup
const SCHEDULE = [
    { step: 1, minDays: 0, maxDays: 1 },
    { step: 2, minDays: 1, maxDays: 2 },
    { step: 3, minDays: 3, maxDays: 4 },
    { step: 4, minDays: 5, maxDays: 6 },
    { step: 5, minDays: 7, maxDays: 8 },
];

async function sendEmail(to: string, subject: string, html: string, fromName: string = "Diego de Diktalo") {
    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: `${fromName} <hola@diktalo.com>`,
                to: [to],
                subject,
                html
            })
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        console.log(`Sent step email to ${to} — id: ${data.id}`);
        return data;
    } catch (err) {
        console.error(`Failed to send email to ${to}:`, err);
        return null;
    }
}

Deno.serve(async (req) => {
    if (req.headers.get("x-onboarding-secret") !== ONBOARDING_SECRET) {
        return new Response("Unauthorized", { status: 401 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = Date.now();
    let totalSent = 0;
    const errors: string[] = [];

    for (const { step, minDays, maxDays } of SCHEDULE) {
        const minDate = new Date(now - maxDays * 86_400_000).toISOString();
        const maxDate = new Date(now - minDays * 86_400_000).toISOString();

        const { data: candidates, error } = await supabase.rpc(
            "get_onboarding_email_candidates",
            { p_min_date: minDate, p_max_date: maxDate, p_step: step }
        );

        if (error) {
            errors.push(`step ${step}: ${error.message}`);
            continue;
        }

        for (const user of candidates ?? []) {
            const lang = user.user_language === "en" ? "en" : "es";
            const firstName = (user.user_name as string).split(" ")[0];
            const { subject, html } = getOnboardingEmail(step, firstName, lang);

            const sent = await sendEmail(user.user_email, subject, html);
            if (!sent) continue;

            const { error: logErr } = await supabase
                .from("onboarding_emails_sent")
                .insert({ user_id: user.user_id, email_step: step });

            if (logErr) errors.push(`log step ${step} for ${user.user_id}: ${logErr.message}`);
            else totalSent++;
        }
    }

    return new Response(
        JSON.stringify({ sent: totalSent, errors }),
        { headers: { "Content-Type": "application/json" } }
    );
});
