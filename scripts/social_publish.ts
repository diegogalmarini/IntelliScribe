/**
 * Diktalo Social Publisher
 * ------------------------
 * Publica el articulo nuevo del newsroom en LinkedIn (pagina de empresa) y X,
 * sin pasar por Make. Se ejecuta como paso del workflow DESPUES del push, para
 * que el articulo este desplegado cuando salgan los posts.
 *
 * Modos:
 *   npx tsx scripts/social_publish.ts
 *       CI: lee .newsroom-social.json (escrito por automated_newsroom.ts).
 *       Si no existe, no hay nada que publicar y termina en verde.
 *
 *   npx tsx scripts/social_publish.ts --slug <slug>
 *       Backfill: busca el articulo en utils/blogData.ts, genera los textos
 *       con Gemini y publica. Sirve para recuperar los articulos que se
 *       quedaron en la cola muerta de Make.
 *
 * Secrets (GitHub Actions / .env.local):
 *   LinkedIn: LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET,
 *             LINKEDIN_REFRESH_TOKEN, LINKEDIN_ORG_ID
 *   X:        X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET
 *             (OAuth 1.0a: tokens estaticos que no caducan — sin la rotacion
 *             de refresh tokens de un solo uso que mato el escenario de Make)
 *
 * Una red sin secrets configurados se omite con aviso. Una red configurada
 * que falla hace fallar el proceso (exit 1) para que el run salga en rojo.
 */

import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Version mensual de la API de LinkedIn. Validas ~12 meses; si la API
// devuelve 426 "Upgrade Required", subir a un YYYYMM mas reciente.
const LINKEDIN_VERSION = '202506';

interface SocialPayload {
    slug: string;
    title: string;
    url: string;
    image_path: string | null;   // ruta local en public/ (null si es URL externa)
    image_url: string;
    linkedin_text: string;
    tweet_text: string;
}

// ---------------------------------------------------------------------------
// Imagen
// ---------------------------------------------------------------------------

function mimeFromPath(p: string): string {
    if (p.endsWith('.png')) return 'image/png';
    if (p.endsWith('.webp')) return 'image/webp';
    return 'image/jpeg';
}

async function loadImage(payload: SocialPayload): Promise<{ buffer: Buffer; mime: string } | null> {
    // En CI el fichero recien generado esta en el checkout: no dependemos del deploy.
    if (payload.image_path) {
        const local = path.join(process.cwd(), 'public', payload.image_path);
        if (fs.existsSync(local)) {
            return { buffer: fs.readFileSync(local), mime: mimeFromPath(local) };
        }
    }
    try {
        const res = await fetch(payload.image_url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const mime = res.headers.get('content-type') || mimeFromPath(payload.image_url);
        return { buffer: Buffer.from(await res.arrayBuffer()), mime };
    } catch (e) {
        console.warn(`⚠️ No se pudo cargar la imagen (${(e as Error).message}). Se publica sin imagen.`);
        return null;
    }
}

// ---------------------------------------------------------------------------
// Espera a que el articulo este desplegado (no bloqueante si expira)
// ---------------------------------------------------------------------------

async function waitForUrl(url: string, maxMinutes = 5): Promise<void> {
    const deadline = Date.now() + maxMinutes * 60_000;
    while (Date.now() < deadline) {
        try {
            const res = await fetch(url, { method: 'HEAD' });
            if (res.ok) {
                console.log(`✅ Articulo desplegado: ${url}`);
                return;
            }
        } catch { /* red o deploy aun en curso */ }
        await new Promise(r => setTimeout(r, 20_000));
    }
    console.warn(`⚠️ ${url} no respondio 200 en ${maxMinutes} min. Se publica igualmente.`);
}

// ---------------------------------------------------------------------------
// LinkedIn (pagina de empresa, Community Management API)
// ---------------------------------------------------------------------------

async function publishLinkedIn(payload: SocialPayload): Promise<void> {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const refreshToken = process.env.LINKEDIN_REFRESH_TOKEN;
    const orgId = process.env.LINKEDIN_ORG_ID;

    if (!clientId || !clientSecret || !refreshToken || !orgId) {
        console.warn('⚠️ LinkedIn: secrets no configurados (LINKEDIN_*). Se omite.');
        return;
    }

    // 1. Refresh token (365 dias) → access token (60 dias). El refresh token no
    //    rota en cada uso: solo hay que reautorizar manualmente una vez al año.
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
        }),
    });
    if (!tokenRes.ok) throw new Error(`LinkedIn refresh fallo: ${tokenRes.status} ${await tokenRes.text()}`);
    const { access_token } = await tokenRes.json();

    const headers = {
        Authorization: `Bearer ${access_token}`,
        'LinkedIn-Version': LINKEDIN_VERSION,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
    };
    const author = `urn:li:organization:${orgId}`;

    // 2. Subir la imagen (si hay)
    let imageUrn: string | null = null;
    const img = await loadImage(payload);
    if (img) {
        const initRes = await fetch('https://api.linkedin.com/rest/images?action=initializeUpload', {
            method: 'POST',
            headers,
            body: JSON.stringify({ initializeUploadRequest: { owner: author } }),
        });
        if (!initRes.ok) throw new Error(`LinkedIn initializeUpload fallo: ${initRes.status} ${await initRes.text()}`);
        const init = await initRes.json();
        const uploadUrl = init.value.uploadUrl;
        imageUrn = init.value.image;

        const putRes = await fetch(uploadUrl, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': img.mime },
            body: new Uint8Array(img.buffer),
        });
        if (!putRes.ok) throw new Error(`LinkedIn subida de imagen fallo: ${putRes.status}`);
    }

    // 3. Crear el post
    const body: any = {
        author,
        commentary: payload.linkedin_text,
        visibility: 'PUBLIC',
        distribution: {
            feedDistribution: 'MAIN_FEED',
            targetEntities: [],
            thirdPartyDistributionChannels: [],
        },
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false,
    };
    if (imageUrn) {
        body.content = { media: { id: imageUrn, title: payload.title } };
    }

    const postRes = await fetch('https://api.linkedin.com/rest/posts', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });
    if (!postRes.ok) throw new Error(`LinkedIn post fallo: ${postRes.status} ${await postRes.text()}`);
    console.log(`✅ LinkedIn: publicado (${postRes.headers.get('x-restli-id')})`);
}

// ---------------------------------------------------------------------------
// X (OAuth 1.0a: sin rotacion de tokens)
// ---------------------------------------------------------------------------

async function publishX(payload: SocialPayload): Promise<void> {
    const appKey = process.env.X_API_KEY;
    const appSecret = process.env.X_API_SECRET;
    const accessToken = process.env.X_ACCESS_TOKEN;
    const accessSecret = process.env.X_ACCESS_SECRET;

    if (!appKey || !appSecret || !accessToken || !accessSecret) {
        console.warn('⚠️ X: secrets no configurados (X_*). Se omite.');
        return;
    }

    const { TwitterApi } = await import('twitter-api-v2');
    const client = new TwitterApi({ appKey, appSecret, accessToken, accessSecret });

    // 280 chars, la URL cuenta 23 via t.co. Margen defensivo por si el modelo
    // ignoro el limite del prompt.
    let text = payload.tweet_text.trim();
    if (text.length > 250) text = text.slice(0, 247) + '…';
    const tweetText = `${text}\n\n${payload.url}`;

    // La imagen es deseable pero no imprescindible: si la subida falla
    // (endpoint v1.1 retirado, limites del tier), el tweet sale sin ella.
    let mediaId: string | undefined;
    const img = await loadImage(payload);
    if (img) {
        try {
            mediaId = await client.v2.uploadMedia(img.buffer, { media_type: img.mime as any });
        } catch (e) {
            try {
                mediaId = await client.v1.uploadMedia(img.buffer, { mimeType: img.mime });
            } catch (e2) {
                console.warn(`⚠️ X: subida de imagen fallo (${(e2 as Error).message}). Tweet sin imagen.`);
            }
        }
    }

    const tweet = await client.v2.tweet(
        mediaId ? { text: tweetText, media: { media_ids: [mediaId] } } : { text: tweetText }
    );
    console.log(`✅ X: publicado (id ${tweet.data.id})`);
}

// ---------------------------------------------------------------------------
// Backfill: reconstruir el payload desde blogData para un slug ya publicado
// ---------------------------------------------------------------------------

async function payloadFromSlug(slug: string): Promise<SocialPayload> {
    const { blogPosts } = await import('../utils/blogData');
    const post = blogPosts.find((p: any) => p.slug === slug);
    if (!post) throw new Error(`No existe ningun articulo con slug "${slug}" en blogData.ts`);

    const url = `https://diktalo.com/blog/${slug}`;
    let linkedin = '';
    let tweet = '';

    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
        try {
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({
                model: 'gemini-3.7-flash',
                generationConfig: { responseMimeType: 'application/json' },
            });
            const result = await model.generateContent(`
Eres el community manager de Diktalo (asistente de reuniones con IA en español).
Genera un post de LinkedIn y un tweet para este articulo del blog.

TITULO: ${post.title}
RESUMEN: ${post.excerpt}
RESPUESTA DIRECTA: ${post.aeoAnswer || ''}
URL: ${url}

LINKEDIN: gancho que pare el scroll, 3-4 bullets con 👉, CTA "Lee el artículo completo: ${url}", 6-8 hashtags incluyendo #Diktalo.
TWEET: max 200 caracteres, una frase gancho + max 2 hashtags, SIN URL (se añade aparte).

Devuelve SOLO JSON valido: {"linkedin": "string", "tweet": "string"}`);
            const data = JSON.parse(result.response.text());
            linkedin = data.linkedin || '';
            tweet = data.tweet || '';
        } catch (e) {
            console.warn(`⚠️ Gemini fallo generando textos (${(e as Error).message}). Uso plantilla.`);
        }
    }

    if (!linkedin) linkedin = `${post.title}\n\n${post.excerpt}\n\nLee el artículo completo: ${url}\n\n#Diktalo #IA`;
    if (!tweet) tweet = `${post.title} #Diktalo`;

    return {
        slug,
        title: post.title,
        url,
        image_path: post.image.startsWith('http') ? null : post.image,
        image_url: post.image.startsWith('http') ? post.image : `https://diktalo.com${post.image}`,
        linkedin_text: linkedin,
        tweet_text: tweet,
    };
}

// ---------------------------------------------------------------------------

async function main() {
    const slugArg = process.argv.indexOf('--slug');
    let payload: SocialPayload;

    if (slugArg !== -1 && process.argv[slugArg + 1]) {
        payload = await payloadFromSlug(process.argv[slugArg + 1]);
        console.log(`🔁 Backfill de "${payload.slug}"`);
    } else {
        const handoffPath = path.join(process.cwd(), '.newsroom-social.json');
        if (!fs.existsSync(handoffPath)) {
            console.log('ℹ️ No hay .newsroom-social.json: nada que publicar.');
            return;
        }
        payload = JSON.parse(fs.readFileSync(handoffPath, 'utf-8'));
    }

    await waitForUrl(payload.url);

    let fallo = false;
    try {
        await publishLinkedIn(payload);
    } catch (e) {
        console.error(`❌ LinkedIn: ${(e as Error).message}`);
        fallo = true;
    }
    try {
        await publishX(payload);
    } catch (e) {
        console.error(`❌ X: ${(e as Error).message}`);
        fallo = true;
    }

    if (fallo) process.exit(1);
    console.log('✨ Distribucion completada.');
}

main().catch(e => {
    console.error('❌ Social publisher fallo:', e);
    process.exit(1);
});
