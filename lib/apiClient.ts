/**
 * lib/apiClient.ts
 *
 * Punto único de salida hacia /api/*.
 *
 * Hasta ahora ningún `fetch('/api/...')` del frontend mandaba el token de
 * sesión: los endpoints recibían un `userId` en el body y se fiaban de él, lo
 * que permitía actuar sobre cuentas ajenas conociendo un UUID. Este helper
 * adjunta el JWT para que el servidor derive la identidad del token.
 *
 * Vive en lib/ y no en services/ porque services/ lo consume, y usa
 * `supabase.auth.getSession()` directamente en vez de AuthContext para poder
 * llamarse desde módulos que no son componentes de React.
 */

import { supabase } from './supabase';

/** Se lanza cuando no hay sesión utilizable. La UI debe llevar a login. */
export class ApiAuthError extends Error {
    constructor(message = 'Sesión no válida o expirada') {
        super(message);
        this.name = 'ApiAuthError';
    }
}

export interface ApiFetchInit extends Omit<RequestInit, 'body'> {
    /** Se serializa a JSON automáticamente. */
    body?: unknown;
    /** true para endpoints públicos por diseño (contacto, newsletter, soporte). */
    anonymous?: boolean;
}

/** Margen antes de la expiración a partir del cual se refresca la sesión. */
const REFRESH_MARGIN_SECONDS = 60;

async function getAccessToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const expiresAt = session.expires_at;
    if (expiresAt && expiresAt - Math.floor(Date.now() / 1000) < REFRESH_MARGIN_SECONDS) {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
            console.warn('[apiClient] No se pudo refrescar la sesión:', error.message);
            return session.access_token;
        }
        return data.session?.access_token ?? session.access_token;
    }

    return session.access_token;
}

function buildHeaders(base: HeadersInit | undefined, token: string | null): HeadersInit {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(base as Record<string, string> | undefined)
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

/**
 * Devuelve el Response crudo para que los call sites existentes cambien una
 * sola línea. Reintenta una vez tras un 401 refrescando la sesión, igual que
 * hace `authenticatedFetch` en la extensión Chrome.
 */
export async function apiFetch(path: string, init: ApiFetchInit = {}): Promise<Response> {
    const { body, anonymous, headers, ...rest } = init;

    let token = anonymous ? null : await getAccessToken();
    if (!anonymous && !token) {
        throw new ApiAuthError();
    }

    const payload = body === undefined ? undefined : JSON.stringify(body);

    const send = (t: string | null) => fetch(path, {
        method: payload !== undefined ? 'POST' : 'GET',
        ...rest,
        headers: buildHeaders(headers, t),
        body: payload
    });

    let response = await send(token);

    if (response.status === 401 && !anonymous) {
        const { data, error } = await supabase.auth.refreshSession();
        if (error || !data.session) {
            throw new ApiAuthError();
        }
        token = data.session.access_token;
        response = await send(token);
        if (response.status === 401) {
            throw new ApiAuthError();
        }
    }

    return response;
}

/** Igual que apiFetch pero parsea JSON y lanza con el `error` que devuelva el backend. */
export async function apiJson<T = any>(path: string, init: ApiFetchInit = {}): Promise<T> {
    const response = await apiFetch(path, init);
    const text = await response.text();

    let parsed: any = null;
    if (text) {
        try {
            parsed = JSON.parse(text);
        } catch {
            if (!response.ok) throw new Error(text.slice(0, 200));
        }
    }

    if (!response.ok) {
        throw new Error(parsed?.error || parsed?.message || `Error ${response.status}`);
    }

    return parsed as T;
}
