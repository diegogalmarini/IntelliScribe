/**
 * api/send-email.ts
 *
 * Notificaciones transaccionales al PROPIO usuario autenticado.
 *
 * Antes este endpoint no tenía autenticación y aceptaba `to`, `subject` y
 * `html` arbitrarios del body: era un relay abierto que permitía enviar
 * cualquier correo firmado como diktalo.com. El destinatario ahora sale del
 * token, nunca del cliente.
 *
 * El formulario público de contacto NO usa este endpoint: vive en
 * api/contact.ts, que es anónimo por diseño y construye el HTML en servidor.
 */

import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateEnv } from "./_utils/env-validator.js";
import { initSentry, Sentry } from "./_utils/sentry.js";
import { requireAuth } from "./_utils/auth.js";

// Initialize Sentry
initSentry();

// Un único remitente: cada dirección adicional es superficie de suplantación,
// y los canales `legal` y `security` no tenían ningún llamante en el código.
const SYSTEM_SENDER = 'Diktalo System <noreply@diktalo.com>';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.diktalo.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // 1. Validación de Método
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 2. Validación de Clave API (centralized)
        let env;
        try {
            env = validateEnv(['base', 'resend']);
        } catch (e: any) {
            return res.status(500).json({ error: e.message });
        }

        const user = await requireAuth(req, res, 'send-email');
        if (!user) return;

        // El destinatario es siempre el propio usuario del token. Un `to` en el
        // body se ignora en silencio: es exactamente el vector que se cierra.
        const recipient = user.email;
        if (!recipient) {
            console.warn('[EMAIL] El token no trae email; no hay a quién enviar.');
            return res.status(400).json({ error: 'No recipient available for this account' });
        }

        const resend = new Resend(env.RESEND_API_KEY);
        const { subject, html } = req.body || {};

        console.log('📨 [EMAIL] Envío a usuario autenticado:', {
            userId: user.id,
            subject,
            contentPreview: html ? html.substring(0, 50) + '...' : 'NONE'
        });

        if (!subject || !html) {
            console.warn('⚠️ [EMAIL] Validation failed: Missing required fields');
            return res.status(400).json({
                error: 'Missing required fields',
                received: { subject: !!subject, html: !!html }
            });
        }

        const { data, error } = await resend.emails.send({
            from: SYSTEM_SENDER,
            to: [recipient],
            subject: subject,
            html: html,
        });

        if (error) {
            console.error('❌ [EMAIL] Resend service error:', error);
            // Resend error objects can sometimes have nested details
            return res.status(400).json({
                error: error.message || 'Resend provider error',
                details: error
            });
        }

        console.log('✅ [EMAIL] Email sent successfully:', data?.id);
        return res.status(200).json({
            success: true,
            id: data?.id
        });

    } catch (error: any) {
        console.error('🔥 [EMAIL] UNEXPECTED SERVER ERROR:', error);
        Sentry.captureException(error);

        return res.status(500).json({
            error: error.message || 'Internal Server Error',
            type: error.name,
            diagnostics: 'Please check server logs for stack trace'
        });
    }
}
