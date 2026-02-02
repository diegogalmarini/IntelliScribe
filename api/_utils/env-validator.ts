/**
 * api/_utils/env-validator.ts
 * 
 * Centralized environment variable validation for Vercel functions.
 */

export interface EnvVariables {
    GEMINI_API_KEY: string;
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    RESEND_API_KEY: string;
    LEMONSQUEEZY_WEBHOOK_SECRET: string;
    TWILIO_ACCOUNT_SID?: string;
    TWILIO_AUTH_TOKEN?: string;
    TWILIO_VERIFY_SERVICE_SID?: string;
}

export function validateEnv(services: ('base' | 'ai' | 'resend' | 'twilio' | 'payments')[] = ['base']) {
    const serviceMap: Record<string, string[]> = {
        base: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
        ai: ['GEMINI_API_KEY'],
        resend: ['RESEND_API_KEY'],
        twilio: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_VERIFY_SERVICE_SID'],
        payments: ['LEMONSQUEEZY_WEBHOOK_SECRET']
    };

    const required = Array.from(new Set(services.flatMap(s => serviceMap[s] || [])));

    const missing = required.filter(key => {
        const val = process.env[key];
        return !val || val.length === 0;
    });

    if (missing.length > 0) {
        const error = `Server Configuration Error: Missing environment variables [${missing.join(', ')}]. Please check Vercel/Supabase settings.`;
        console.error(error);
        throw new Error(error);
    }

    return {
        GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
        SUPABASE_URL: (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)!,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        RESEND_API_KEY: process.env.RESEND_API_KEY!,
        LEMONSQUEEZY_WEBHOOK_SECRET: process.env.LEMONSQUEEZY_WEBHOOK_SECRET!,
        TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
        TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
        TWILIO_VERIFY_SERVICE_SID: process.env.TWILIO_VERIFY_SERVICE_SID
    };
}

