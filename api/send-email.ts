import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailChannel = 'system' | 'support' | 'legal' | 'security';

const SENDERS: Record<EmailChannel, string> = {
    system: 'Diktalo System <noreply@diktalo.com>',
    support: 'Diktalo Support <support@diktalo.com>',
    legal: 'Diktalo Legal <legal@diktalo.com>',
    security: 'Diktalo Security <security@diktalo.com>',
};

export default async function handler(req: any, res: any) {
    // 1. Validación de Método
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 2. Validación de Clave API
    if (!process.env.RESEND_API_KEY) {
        console.error('❌ Missing RESEND_API_KEY');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const { to, subject, html, channel = 'system', replyTo } = req.body;

        if (!to || !subject || !html) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const fromAddress = SENDERS[channel as EmailChannel] || SENDERS.system;

        const { data, error } = await resend.emails.send({
            from: fromAddress,
            to: [to],
            reply_to: replyTo,
            subject: subject,
            html: html,
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ success: true, id: data?.id });

    } catch (error: any) {
        console.error('❌ Email Dispatch Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
