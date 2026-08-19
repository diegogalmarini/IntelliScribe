/**
 * api/_utils/rate-limit.ts
 *
 * Límite de peticiones para los endpoints que son públicos por diseño.
 *
 * El contador vive en base de datos (ver 20260819_rate_limit_counters.sql):
 * Vercel escala a N instancias, así que un contador en memoria daría un límite
 * efectivo de N × límite.
 *
 * La IP nunca se almacena en claro. Se guarda un hash con sal, porque el
 * producto es europeo y una dirección IP es dato personal bajo el RGPD.
 */

import crypto from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Sentry } from './sentry.js';

export interface RateRule {
    limit: number;
    windowSeconds: number;
}

export interface RateIdentity {
    /** Identidad preferente cuando hay sesión. */
    userId?: string | null;
    /** Usar la IP como identidad. Para endpoints anónimos. */
    ip?: boolean;
    /** Discriminante extra: email, teléfono... Se hashea igual que la IP. */
    extra?: string | null;
}

/**
 * Fail-open por defecto.
 *
 * Una caída de la base de datos no debe tumbar el formulario de contacto ni el
 * bot de la landing. Se deja pasar y se avisa a Sentry. La excepción son los
 * endpoints que cuestan dinero por petición (transcripción), donde conviene
 * fallar en cerrado: ver `failClosed`.
 */
export interface RateLimitOptions {
    failClosed?: boolean;
}

function getClientIp(req: VercelRequest): string {
    const real = req.headers['x-real-ip'];
    if (typeof real === 'string' && real) return real;

    const fwd = req.headers['x-forwarded-for'];
    if (typeof fwd === 'string' && fwd) return fwd.split(',')[0].trim();
    if (Array.isArray(fwd) && fwd.length) return String(fwd[0]).split(',')[0].trim();

    return 'unknown';
}

function hash(value: string): string {
    const salt = process.env.RATE_LIMIT_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    return crypto.createHash('sha256').update(`${salt}:${value}`).digest('hex').slice(0, 32);
}

function buildKey(scope: string, req: VercelRequest, identity: RateIdentity): string {
    if (identity.userId) return `${scope}:u:${identity.userId}`;
    if (identity.extra) return `${scope}:x:${hash(identity.extra.toLowerCase())}`;
    if (identity.ip) return `${scope}:i:${hash(getClientIp(req))}`;
    return `${scope}:global`;
}

async function consume(key: string, rule: RateRule): Promise<{ allowed: boolean; hits: number; resetAt: string } | null> {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) return null;

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/consume_rate_limit`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            p_key: key,
            p_limit: rule.limit,
            p_window_seconds: rule.windowSeconds
        })
    });

    if (!response.ok) return null;

    const data: any = await response.json();
    return {
        allowed: data?.allowed !== false,
        hits: data?.hits ?? 0,
        resetAt: data?.reset_at ?? ''
    };
}

/**
 * Aplica una o varias reglas. Basta que una se supere para rechazar.
 *
 * Devuelve true si la petición debe continuar. Si devuelve false, YA se ha
 * escrito la respuesta 429 y el handler solo tiene que hacer return.
 */
export async function enforceRateLimit(
    req: VercelRequest,
    res: VercelResponse,
    scope: string,
    identity: RateIdentity,
    rules: RateRule[],
    options: RateLimitOptions = {}
): Promise<boolean> {
    const baseKey = buildKey(scope, req, identity);

    for (const rule of rules) {
        // La ventana forma parte de la clave: así dos reglas sobre la misma
        // identidad (por minuto y por hora) no se pisan el contador.
        const key = `${baseKey}:${rule.windowSeconds}`;

        let result;
        try {
            result = await consume(key, rule);
        } catch (err: any) {
            console.error(`[RATE] Error consultando el contador para ${scope}:`, err?.message);
            Sentry.captureException(err);
            result = null;
        }

        if (!result) {
            // No se pudo contar.
            if (options.failClosed) {
                console.warn(`[RATE] ${scope}: contador no disponible, se rechaza (fail-closed).`);
                res.status(503).json({ error: 'Service temporarily unavailable. Please try again shortly.' });
                return false;
            }
            console.warn(`[RATE] ${scope}: contador no disponible, se deja pasar (fail-open).`);
            Sentry.captureMessage(`[RATE] Contador no disponible en ${scope}`, 'warning');
            continue;
        }

        res.setHeader('X-RateLimit-Limit', String(rule.limit));
        res.setHeader('X-RateLimit-Remaining', String(Math.max(0, rule.limit - result.hits)));
        if (result.resetAt) res.setHeader('X-RateLimit-Reset', result.resetAt);

        if (!result.allowed) {
            const retryAfter = result.resetAt
                ? Math.max(1, Math.ceil((new Date(result.resetAt).getTime() - Date.now()) / 1000))
                : rule.windowSeconds;

            console.warn(`[RATE] ${scope}: límite superado (${result.hits}/${rule.limit}).`);
            res.setHeader('Retry-After', String(retryAfter));
            res.status(429).json({
                error: 'Too many requests',
                retryAfter
            });
            return false;
        }
    }

    return true;
}

/** Reglas por endpoint, en un solo sitio para poder revisarlas de un vistazo. */
export const RATE_RULES = {
    /** Bot de soporte anónimo: protege cuota de Gemini sin estorbar a un visitante real. */
    supportAnon: [
        { limit: 8, windowSeconds: 60 },
        { limit: 60, windowSeconds: 3600 }
    ] as RateRule[],

    /** Formulario de contacto: protege la reputación del dominio en Resend. */
    contact: [
        { limit: 3, windowSeconds: 3600 }
    ] as RateRule[],

    /** Alta en newsletter. */
    newsletter: [
        { limit: 3, windowSeconds: 3600 }
    ] as RateRule[],

    /** Transcripción: es la acción que cuesta dinero de verdad por petición. */
    transcribe: [
        { limit: 10, windowSeconds: 60 },
        { limit: 200, windowSeconds: 86400 }
    ] as RateRule[],

    /** Resto de acciones de IA autenticadas. */
    ai: [
        { limit: 30, windowSeconds: 60 }
    ] as RateRule[],

    /** Envío de SMS de verificación: cada uno cuesta en Twilio. */
    verify: [
        { limit: 5, windowSeconds: 3600 }
    ] as RateRule[]
};
