/**
 * Utilidades para transcribir vídeo de YouTube.
 *
 * POR QUÉ SOLO YOUTUBE: Gemini ingiere una URL de YouTube de forma nativa
 * (`fileData.fileUri`), así que es Google procesando su propia plataforma.
 * Diktalo nunca descarga ni aloja el vídeo, con lo que no hay que tocar los
 * términos de servicio de nadie. Para Vimeo, Loom o cualquier otra no existe esa
 * vía: habría que descargar el fichero, y eso sí viola el ToS de la mayoría de
 * plataformas. Esas van por integración oficial con OAuth o no van.
 */

/** Un id de vídeo de YouTube son 11 caracteres de este alfabeto. */
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

const HOSTS_VALIDOS = new Set([
    'youtube.com',
    'www.youtube.com',
    'm.youtube.com',
    'music.youtube.com',
    'youtu.be',
    'www.youtu.be'
]);

/**
 * Extrae el id de vídeo de una URL de YouTube, o null si no lo es.
 *
 * El llamante DEBE construir la URL que manda a Gemini a partir del id que
 * devuelve esto, nunca reenviar la cadena original: así ningún parámetro que
 * venga del cliente llega a viajar. Es el mismo criterio que se aplicó al
 * arreglar el SSRF de la acción `transcribe`, que hacía fetch de cualquier URL.
 */
export function extraerIdDeYouTube(input: unknown): string | null {
    if (typeof input !== 'string' || input.length > 2048) return null;

    let url: URL;
    try {
        url = new URL(input.trim());
    } catch {
        return null;
    }

    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (!HOSTS_VALIDOS.has(url.hostname.toLowerCase())) return null;

    const candidatos: (string | null)[] = [];

    if (url.hostname.toLowerCase().endsWith('youtu.be')) {
        candidatos.push(url.pathname.slice(1));
    } else {
        candidatos.push(url.searchParams.get('v'));
        // /shorts/ID, /live/ID, /embed/ID
        const m = url.pathname.match(/^\/(?:shorts|live|embed|v)\/([^/?#]+)/);
        if (m) candidatos.push(m[1]);
    }

    for (const c of candidatos) {
        if (c && VIDEO_ID.test(c)) return c;
    }
    return null;
}

/** URL canónica, construida solo a partir de un id ya validado. */
export const urlCanonica = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`;

/**
 * Tokens de vídeo que consume un segundo con `fps: 0.1`.
 *
 * Medido contra la API con dos vídeos de tamaños muy distintos:
 *   - 19 s   ->    605 tokens = 31,8 tok/s
 *   - 1314 s -> 41.039 tokens = 31,2 tok/s
 *
 * La tasa es estable, así que sirve para derivar la duración del vídeo a partir
 * del contador de tokens que devuelve la propia API. Se usa eso y no la última
 * marca de tiempo de la transcripción porque el contador es metadato facturable
 * y la marca la escribe el modelo, que puede inventársela.
 *
 * Con `fps` por defecto la tasa sube a ~89 tok/s: casi tres veces más caro por
 * el mismo trabajo, porque para transcribir manda el audio, no los fotogramas.
 */
export const TOKENS_VIDEO_POR_SEGUNDO = 31.5;

/** Fotogramas por segundo que se piden a Gemini. Ver la constante de arriba. */
export const FPS_TRANSCRIPCION = 0.1;

/** Duración estimada en segundos a partir de los tokens de vídeo facturados. */
export function duracionDesdeTokens(tokensDeVideo: number): number {
    if (!Number.isFinite(tokensDeVideo) || tokensDeVideo <= 0) return 0;
    return Math.round(tokensDeVideo / TOKENS_VIDEO_POR_SEGUNDO);
}

/**
 * Título y autor del vídeo vía oEmbed. No necesita clave y no descarga el vídeo.
 *
 * Devuelve null si el vídeo es privado, no existe o YouTube no responde: en ese
 * caso el llamante pone un título genérico en vez de fallar, porque el título es
 * cosmético y la transcripción ya se ha pagado.
 */
export async function metadatosPublicos(videoId: string): Promise<{ titulo: string; autor: string } | null> {
    try {
        const r = await fetch(
            `https://www.youtube.com/oembed?url=${encodeURIComponent(urlCanonica(videoId))}&format=json`,
            { signal: AbortSignal.timeout(5000) }
        );
        if (!r.ok) return null;
        const j: any = await r.json();
        return {
            titulo: typeof j?.title === 'string' ? j.title.slice(0, 200) : '',
            autor: typeof j?.author_name === 'string' ? j.author_name.slice(0, 120) : ''
        };
    } catch {
        return null;
    }
}
