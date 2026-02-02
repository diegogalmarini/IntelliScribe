import { Resend } from 'resend';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateEnv } from "./_utils/env-validator";
import { initSentry, Sentry } from "./_utils/sentry";

// Initialize Sentry
initSentry();

type EmailChannel = 'system' | 'support' | 'legal' | 'security';

const SENDERS: Record<EmailChannel, string> = {
    system: 'Diktalo System <noreply@diktalo.com>',
    support: 'Diktalo Support <support@diktalo.com>',
    legal: 'Diktalo Legal <legal@diktalo.com>',
    security: 'Diktalo Security <security@diktalo.com>',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 0. CORS - Consistent with verify.ts
    const allowedOrigin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

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

        const resend = new Resend(env.RESEND_API_KEY);
        const { to, subject, html, channel = 'system', replyTo } = req.body || {};

        console.log('📨 [EMAIL] Incoming request payload:', {
            to,
            subject,
            channel,
            replyTo,
            contentPreview: html ? html.substring(0, 50) + '...' : 'NONE'
        });

        if (!to || !subject || !html) {
            console.warn('⚠️ [EMAIL] Validation failed: Missing required fields');
            return res.status(400).json({
                error: 'Missing required fields',
                received: { to: !!to, subject: !!subject, html: !!html }
            });
        }

        const fromAddress = SENDERS[channel as EmailChannel] || SENDERS.system;

        const { data, error } = await resend.emails.send({
            from: fromAddress,
            to: [to],
            replyTo: replyTo,
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
