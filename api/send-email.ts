
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

    try {
        const data = await resend.emails.send({
            from: 'Diktalo <noreply@diktalo.com>',
            to: [to],
            subject: subject,
            html: html,
        });

        return response.status(200).json(data);
    } catch (error) {
        return response.status(500).json({ error: error.message });
    }
}
