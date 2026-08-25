/**
 * LinkedIn OAuth bootstrap (una sola vez al año)
 * ----------------------------------------------
 * Genera el refresh token que scripts/social_publish.ts usa en CI.
 *
 * Requisitos previos:
 *   1. App creada en https://developer.linkedin.com asociada a la pagina de
 *      Diktalo, con el producto "Community Management API" aprobado.
 *   2. En la app, pestaña Auth → Redirect URLs: añadir exactamente
 *      http://localhost:8888/callback
 *   3. En .env.local: LINKEDIN_CLIENT_ID y LINKEDIN_CLIENT_SECRET.
 *
 * Uso:
 *   npx tsx scripts/linkedin_auth.ts
 *   → abre la URL que imprime, autoriza con la cuenta ADMIN de la pagina,
 *   → el script captura el callback e imprime el refresh token.
 *   → guardar el token como secret LINKEDIN_REFRESH_TOKEN en GitHub
 *     (Settings → Secrets and variables → Actions). No pegarlo en ningun chat.
 *
 * El refresh token dura 365 dias; el access token que emite, 60. El publisher
 * refresca el access token en cada run, asi que esto solo se repite al año.
 */

import * as http from 'http';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:8888/callback';
const SCOPES = 'w_organization_social r_organization_social';

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Faltan LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET en .env.local');
    process.exit(1);
}

const state = Math.random().toString(36).slice(2);
const authUrl =
    'https://www.linkedin.com/oauth/v2/authorization' +
    `?response_type=code&client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&state=${state}&scope=${encodeURIComponent(SCOPES)}`;

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://localhost:8888');
    if (url.pathname !== '/callback') {
        res.writeHead(404).end();
        return;
    }

    const code = url.searchParams.get('code');
    const gotState = url.searchParams.get('state');
    const error = url.searchParams.get('error_description') || url.searchParams.get('error');

    if (error || !code || gotState !== state) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Autorizacion fallida: ${error || 'sin code o state invalido'}`);
        console.error(`❌ ${error || 'Callback sin code o con state invalido'}`);
        server.close();
        process.exit(1);
    }

    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code!,
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID!,
            client_secret: CLIENT_SECRET!,
        }),
    });
    const data = await tokenRes.json();

    if (!tokenRes.ok || !data.refresh_token) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Fallo el intercambio de tokens. Mira la consola.');
        console.error('❌ Intercambio fallido:', JSON.stringify(data, null, 2));
        console.error(
            data.refresh_token === undefined && data.access_token
                ? '\n⚠️ LinkedIn devolvio access token pero NO refresh token: la app aun no tiene aprobado un producto con refresh habilitado (Community Management API).'
                : ''
        );
        server.close();
        process.exit(1);
    }

    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Listo. Vuelve a la terminal — ya puedes cerrar esta pestaña.');

    console.log('\n✅ Tokens obtenidos.\n');
    console.log(`REFRESH TOKEN (guardar como secret LINKEDIN_REFRESH_TOKEN):\n\n${data.refresh_token}\n`);
    console.log(`Caduca en ${Math.round((data.refresh_token_expires_in || 0) / 86400)} dias.`);
    console.log('Access token de prueba emitido correctamente (no hace falta guardarlo).');

    server.close();
    process.exit(0);
});

server.listen(8888, () => {
    console.log('🔑 Abre esta URL en el navegador y autoriza con la cuenta admin de la pagina de Diktalo:\n');
    console.log(authUrl + '\n');
    console.log('Esperando el callback en http://localhost:8888/callback ...');
});
