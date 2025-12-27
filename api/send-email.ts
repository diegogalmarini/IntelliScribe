
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const { to, subject, html } = request.body;

    if (!to || !subject || !html) {
        return response.status(400).json({ error: 'Missing required fields' });
    }

    if (!process.env.RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY is missing');
        return response.status(500).json({ error: 'Email service not configured (Missing API Key)' });
    }

    try {
        console.log(`📧 Sending email to ${to} with subject: ${subject}`);
        const data = await resend.emails.send({
            from: 'Diktalo <noreply@diktalo.com>',
            to: [to],
            subject: subject,
            html: html,
        });

        console.log('✅ Email sent successfully:', data);
        return response.status(200).json(data);
    } catch (error: any) {
        console.error('❌ Resend Error:', error);
        return response.status(500).json({ error: error.message });
    }
}
