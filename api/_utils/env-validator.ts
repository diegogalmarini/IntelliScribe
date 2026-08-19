/**
 * api/_utils/env-validator.ts
 * 
 * Centralized environment variable validation for Vercel functions.
 */

export interface EnvVariables {
    GEMINI_API_KEY: string;
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    SUPABASE_ANON_KEY: string;
    RESEND_API_KEY: string;
    LEMONSQUEEZY_WEBHOOK_SECRET: string;
    TWILIO_ACCOUNT_SID?: string;
    TWILIO_AUTH_TOKEN?: string;
    TWILIO_VERIFY_SERVICE_SID?: string;
}

export function validateEnv(services: ('base' | 'ai' | 'resend' | 'twilio' | 'payments')[] = ['base']) {
    const serviceMap: Record<string, string[]> = {
        // SUPABASE_ANON_KEY es obligatoria: es la `apikey` correcta para verificar
        // un token de usuario contra /auth/v1/user (ver api/_utils/auth.ts).
        base: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY'],
        ai: ['GEMINI_API_KEY'],
        resend: ['RESEND_API_KEY'],
        twilio: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_VERIFY_SERVICE_SID'],
        payments: ['LEMONSQUEEZY_WEBHOOK_SECRET']
    };

    const required = Array.from(new Set(services.flatMap(s => serviceMap[s] || [])));

    // Algunas variables existen en Vercel con el prefijo VITE_ por herencia del
    // frontend. Se acepta cualquiera de las dos formas para no exigir un renombrado
    // coordinado en el dashboard.
    const ALIASES: Record<string, string> = {
        SUPABASE_URL: 'VITE_SUPABASE_URL',
        SUPABASE_ANON_KEY: 'VITE_SUPABASE_ANON_KEY'
    };

    const resolve = (key: string): string | undefined =>
        process.env[key] || (ALIASES[key] ? process.env[ALIASES[key]] : undefined);

    const missing = required.filter(key => {
        const val = resolve(key);
        return !val || val.length === 0;
    });

    if (missing.length > 0) {
        const error = `Server Configuration Error: Missing environment variables [${missing.join(', ')}]. Please check Vercel/Supabase settings.`;
        console.error(error);
        throw new Error(error);
    }

    return {
        GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
        SUPABASE_URL: resolve('SUPABASE_URL')!,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        SUPABASE_ANON_KEY: resolve('SUPABASE_ANON_KEY')!,
        RESEND_API_KEY: process.env.RESEND_API_KEY!,
        LEMONSQUEEZY_WEBHOOK_SECRET: process.env.LEMONSQUEEZY_WEBHOOK_SECRET!,
        TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
        TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
        TWILIO_VERIFY_SERVICE_SID: process.env.TWILIO_VERIFY_SERVICE_SID
    };
}

