/**
 * api/_utils/auth.ts
 *
 * Verificación de identidad para las funciones serverless.
 *
 * El patrón (Bearer -> GET /auth/v1/user -> userId validado) se extrae de
 * api/upload-audio.ts, que era el único endpoint que ya autenticaba bien.
 * Se hace por REST y no con supabase-js para no cargar la librería en cada
 * función: estos handlers arrancan en frío en cada invocación.
 *
 * Regla de uso: el userId SIEMPRE sale del token. Ningún endpoint debe volver
 * a leer `userId` del body o de la query para decidir sobre qué usuario actúa.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Sentry } from './sentry.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface AuthedUser {
    /** UUID del usuario, validado. Fuente de verdad para toda decisión de propiedad. */
    id: string;
    /** Email según Supabase Auth. Fuente de verdad para send-email: nunca usar el del body. */
    email: string | null;
    /** JWT crudo, para llamar a PostgREST con la RLS del propio usuario. */
    token: string;
}

/**
 * Forma única en vez de unión discriminada: el tsconfig del proyecto no activa
 * `strict`, y sin `strictNullChecks` el estrechamiento por discriminante no es
 * fiable. Una sola forma con campos opcionales se comporta igual en cualquier modo.
 */
export interface AuthResult {
    ok: boolean;
    user?: AuthedUser;
    status?: 401 | 403;
    error?: string;
}

/**
 * Ventana de compatibilidad.
 *
 * El proyecto usa vite-plugin-pwa con registerType 'autoUpdate' (vite.config.ts),
 * así que hay bundles cacheados en service workers de usuarios con la pestaña
 * abierta que todavía no mandan el token. Con AUTH_ENFORCE distinto de 'true',
 * esas peticiones se dejan pasar y se contabilizan en Sentry en vez de romperse.
 *
 * Cuando el contador de peticiones sin token llegue a cero, poner AUTH_ENFORCE=true
 * en Vercel. Es un cambio de variable de entorno, reversible en un minuto.
 */
const ENFORCE = process.env.AUTH_ENFORCE === 'true';

function getSupabaseUrl(): string {
    return (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)!;
}

/** La anon key es la correcta para el header `apikey` al verificar un token de usuario. */
function getAnonKey(): string {
    return (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY)!;
}

/**
 * Cache en memoria del lambda caliente: evita un viaje a /auth/v1/user por
 * petición. La clave es el propio token, que no sale de este proceso.
 * El TTL corto acota la ventana en la que un token revocado sigue valiendo.
 */
const CACHE_TTL_MS = 30_000;
const CACHE_MAX = 500;
const tokenCache = new Map<string, { user: AuthedUser; expiresAt: number }>();

function cacheGet(token: string): AuthedUser | null {
    const hit = tokenCache.get(token);
    if (!hit) return null;
    if (hit.expiresAt < Date.now()) {
        tokenCache.delete(token);
        return null;
    }
    return hit.user;
}

function cacheSet(token: string, user: AuthedUser): void {
    if (tokenCache.size >= CACHE_MAX) {
        // Evicción FIFO: basta para acotar memoria, no necesitamos LRU real.
        const oldest = tokenCache.keys().next().value;
        if (oldest) tokenCache.delete(oldest);
    }
    tokenCache.set(token, { user, expiresAt: Date.now() + CACHE_TTL_MS });
}

/**
 * Verifica el Bearer contra Supabase Auth. No escribe en la respuesta.
 * Úsala cuando necesites decidir tú qué hacer con el fallo.
 */
export async function authenticateRequest(req: VercelRequest): Promise<AuthResult> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { ok: false, status: 401, error: 'Unauthorized - Missing or invalid token' };
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
        return { ok: false, status: 401, error: 'Unauthorized - Empty token' };
    }

    const cached = cacheGet(token);
    if (cached) return { ok: true, user: cached };

    let response: Response;
    try {
        response = await fetch(`${getSupabaseUrl()}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': getAnonKey()
            }
        });
    } catch (err: any) {
        // Fallo de red contra Supabase Auth: fail-closed. Es preferible un 401
        // espurio a dejar pasar una petición sin verificar.
        console.error('[AUTH] Error de red verificando el token:', err?.message);
        Sentry.captureException(err);
        return { ok: false, status: 401, error: 'Unauthorized - Auth service unavailable' };
    }

    if (!response.ok) {
        return { ok: false, status: 401, error: 'Unauthorized - Invalid token' };
    }

    const data: any = await response.json();
    const id = data?.id || data?.data?.user?.id;

    if (!id || !UUID_RE.test(id)) {
        console.error('[AUTH] Respuesta de Auth sin UUID válido');
        return { ok: false, status: 401, error: 'Unauthorized - Invalid user context' };
    }

    const user: AuthedUser = {
        id,
        email: data?.email || data?.data?.user?.email || null,
        token
    };
    cacheSet(token, user);
    return { ok: true, user };
}

/**
 * Exige usuario autenticado. Si falla, escribe la respuesta y devuelve null.
 *
 *   const user = await requireAuth(req, res);
 *   if (!user) return;
 *
 * Durante la ventana de compatibilidad (AUTH_ENFORCE != 'true') una petición
 * sin token se deja pasar con un usuario anónimo marcado, y se registra.
 * `endpoint` solo se usa para poder contar en Sentry quién falta por migrar.
 */
export async function requireAuth(
    req: VercelRequest,
    res: VercelResponse,
    endpoint: string
): Promise<AuthedUser | null> {
    const result = await authenticateRequest(req);

    if (result.ok) return result.user!;

    if (!ENFORCE) {
        console.warn(`[AUTH] ${endpoint}: petición sin token válida durante la ventana de compatibilidad (${result.error})`);
        Sentry.captureMessage(`[AUTH-WINDOW] Petición sin token en ${endpoint}`, 'warning');
        return null;
    }

    res.status(result.status!).json({ error: result.error });
    return null;
}

/**
 * Distingue "no autenticado pero tolerado por la ventana" de "rechazado".
 * Un handler necesita saberlo para decidir si continuar en modo degradado.
 * Devuelve true si la respuesta ya está escrita y el handler debe hacer return.
 */
export function authWindowOpen(): boolean {
    return !ENFORCE;
}

/**
 * Exige usuario autenticado con rol de administrador.
 *
 * La comprobación de rol NO se reimplementa aquí: se delega en la RPC
 * `is_admin_user()`, que es la misma función que usan las policies RLS. Así no
 * hay dos definiciones de "quién es admin" que puedan divergir.
 *
 * Falla en cerrado: si la RPC no existe o da error, se deniega. Si eso ocurre,
 * el problema es de esquema y aparecerá en Sentry con este mensaje.
 */
export async function requireAdmin(
    req: VercelRequest,
    res: VercelResponse,
    endpoint: string
): Promise<AuthedUser | null> {
    const result = await authenticateRequest(req);

    if (!result.ok) {
        res.status(result.status!).json({ error: result.error });
        return null;
    }

    const user = result.user!;

    let isAdmin = false;
    try {
        const rpc = await fetch(`${getSupabaseUrl()}/rest/v1/rpc/is_admin_user`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${user.token}`,
                'apikey': getAnonKey(),
                'Content-Type': 'application/json'
            },
            body: '{}'
        });

        if (!rpc.ok) {
            const detail = await rpc.text();
            console.error(`[AUTH] is_admin_user() falló (${rpc.status}): ${detail}`);
            Sentry.captureMessage(`[AUTH] is_admin_user() no disponible en ${endpoint}: ${rpc.status}`, 'error');
        } else {
            isAdmin = (await rpc.json()) === true;
        }
    } catch (err: any) {
        console.error('[AUTH] Error llamando a is_admin_user():', err?.message);
        Sentry.captureException(err);
    }

    if (!isAdmin) {
        console.warn(`[AUTH] ${endpoint}: acceso admin denegado para ${user.id}`);
        res.status(403).json({ error: 'Forbidden - Admin role required' });
        return null;
    }

    return user;
}

/**
 * Detecta clientes que todavía mandan un userId en el payload.
 *
 * El valor del body se ignora siempre; esto solo sirve para localizar los call
 * sites que quedan por migrar y para no fallar en silencio si alguno intenta
 * actuar sobre otra cuenta. Devuelve false si hay discrepancia.
 */
export function assertSelf(user: AuthedUser, claimedUserId?: string | null, endpoint = 'unknown'): boolean {
    if (!claimedUserId) return true;
    if (claimedUserId === user.id) return true;

    console.warn(`[AUTH] ${endpoint}: el payload reclama ${claimedUserId} pero el token es de ${user.id}`);
    Sentry.captureMessage(`[AUTH] Discrepancia de userId en ${endpoint}`, 'warning');
    return false;
}

/** PostgREST con el JWT del usuario: la RLS sigue aplicando. Preferir siempre que sirva. */
export function userFetch(user: AuthedUser, path: string, init: RequestInit = {}): Promise<Response> {
    return fetch(`${getSupabaseUrl()}/rest/v1/${path}`, {
        ...init,
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'apikey': getAnonKey(),
            'Content-Type': 'application/json',
            ...(init.headers || {})
        }
    });
}

/**
 * PostgREST con service role: bypasea RLS por completo.
 * Usarlo solo cuando la operación no puede expresarse con el JWT del usuario,
 * y filtrando siempre por el userId del token.
 */
export function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return fetch(`${getSupabaseUrl()}/rest/v1/${path}`, {
        ...init,
        headers: {
            'Authorization': `Bearer ${key}`,
            'apikey': key,
            'Content-Type': 'application/json',
            ...(init.headers || {})
        }
    });
}
