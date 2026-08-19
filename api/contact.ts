/**
 * api/contact.ts
 *
 * Formulario público de contacto.
 *
 * Antes esto pasaba por /api/send-email, que aceptaba `to` y `html` del
 * cliente: cualquiera podía enviar HTML arbitrario a cualquier destinatario
 * firmado como diktalo.com. Aquí el destinatario es fijo y el HTML se compone
 * en servidor escapando cada campo, así que el formulario sigue siendo
 * anónimo sin ser un relay.
 *
 * pages/Contact.tsx construía el HTML en el navegador interpolando el
 * formulario sin escapar, lo que además permitía inyectar marcado en el correo
 * que recibe soporte.
 */

import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateEnv } from './_utils/env-validator.js';
import { initSentry, Sentry } from './_utils/sentry.js';

initSentry();

const SUPPORT_SENDER = 'Diktalo Support <support@diktalo.com>';
const SUPPORT_INBOX = 'support@diktalo.com';

const TOPICS = ['support', 'sales', 'legal', 'security', 'other'] as const;
type Topic = typeof TOPICS[number];

const LIMITS = {
    name: 120,
    email: 254,
    subject: 200,
    message: 5000
};

/** Escapa para contexto de texto HTML. Los correos van en HTML, no en texto plano. */
function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** Evita que un salto de línea en un campo se convierta en cabecera extra. */
function sanitizeHeaderValue(value: string): string {
    return value.replace(/[\r\n]+/g, ' ').trim();
}

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= LIMITS.email;
}

function renderEmail(fields: { topic: Topic; name: string; email: string; subject: string; message: string }): string {
    const { topic, name, email, subject, message } = fields;
    return `
<div style="font-family: sans-serif; color: #333; max-width: 600px; line-height: 1.6;">
    <h2 style="color: #2563eb;">Nuevo mensaje del formulario de contacto</h2>
    <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
        <p><strong>Tema:</strong> ${escapeHtml(topic.toUpperCase())}</p>
        <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Asunto:</strong> ${escapeHtml(subject)}</p>
    </div>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
    <h3>Mensaje:</h3>
    <div style="white-space: pre-wrap; background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">${escapeHtml(message)}</div>
    <p style="font-size: 12px; color: #64748b; margin-top: 30px;">
        Enviado desde el formulario de contacto de Diktalo.
    </p>
</div>`.trim();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.diktalo.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    let env;
    try {
        env = validateEnv(['base', 'resend']);
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }

    const body = req.body || {};

    // Honeypot: un campo invisible que solo rellenan los bots. Se responde 200
    // para no darles señal de que han sido detectados.
    if (typeof body.website === 'string' && body.website.trim() !== '') {
        console.warn('[CONTACT] Honeypot activado; descartado.');
        return res.status(200).json({ success: true });
    }

    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const subject = String(body.subject || '').trim();
    const message = String(body.message || '').trim();
    const topic: Topic = TOPICS.includes(body.topic) ? body.topic : 'other';

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Email no válido' });
    }
    if (name.length > LIMITS.name || subject.length > LIMITS.subject || message.length > LIMITS.message) {
        return res.status(400).json({ error: 'Alguno de los campos excede la longitud permitida' });
    }

    try {
        const resend = new Resend(env.RESEND_API_KEY);

        const { data, error } = await resend.emails.send({
            from: SUPPORT_SENDER,
            to: [SUPPORT_INBOX],
            replyTo: sanitizeHeaderValue(email),
            subject: sanitizeHeaderValue(`[Contacto] ${topic.toUpperCase()}: ${subject}`).slice(0, 200),
            html: renderEmail({ topic, name, email, subject, message })
        });

        if (error) {
            console.error('[CONTACT] Error de Resend:', error);
            Sentry.captureMessage(`[CONTACT] Resend rechazó el envío: ${error.message}`, 'error');
            return res.status(502).json({ error: 'No se pudo enviar el mensaje. Inténtalo de nuevo.' });
        }

        console.log('[CONTACT] Mensaje enviado:', data?.id);
        return res.status(200).json({ success: true });

    } catch (err: any) {
        console.error('[CONTACT] Error inesperado:', err);
        Sentry.captureException(err);
        return res.status(500).json({ error: 'Error interno' });
    }
}
