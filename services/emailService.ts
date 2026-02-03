import { Recording, UserProfile } from '../types';

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    channel?: 'system' | 'support' | 'legal' | 'security';
    replyTo?: string;
}

export const sendEmail = async ({ to, subject, html, channel = 'system', replyTo }: SendEmailParams) => {
    try {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ to, subject, html, channel, replyTo }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to send email');
        }

        return await response.json();
    } catch (error) {
        console.error('Email service error:', error);
        return null;
    }
};

/**
 * Notifies the user about a new recording if they have the setting enabled.
 */
export const notifyNewRecording = async (user: UserProfile, recording: Recording) => {
    const shouldNotify = user.notificationSettings?.email?.newRecording;

    if (!shouldNotify) {
        console.log(`[EmailService] Notification skipped for user ${user.id} (Disabled in settings)`);
        return;
    }

    console.log(`[EmailService] Sending new recording notification to ${user.email}`);

    const dashboardUrl = `${window.location.origin}/dashboard?recording=${recording.id}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; padding: 40px 20px; }
        .container { max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .content { padding: 48px 40px; }
        .logo { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 32px; }
        h2 { font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
        p { font-size: 16px; color: #475569; margin-bottom: 16px; }
        .button { display: inline-block; background: #0f172a; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0; }
        .footer { padding: 32px 40px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { font-size: 13px; color: #94a3b8; margin: 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <div class="logo">Diktalo</div>
            <h2>✨ ¡Nueva grabación lista!</h2>
            <p>Hola <strong>${user.firstName}</strong>, tu grabación "<strong>${recording.title}</strong>" ya está procesada y disponible en tu dashboard.</p>
            <div style="background-color: #f1f5f9; padding: 24px; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0; font-size: 14px; color: #64748b;">Duración: <strong>${recording.duration}</strong></p>
                <p style="margin: 4px 0 0; font-size: 14px; color: #64748b;">Fecha: <strong>${new Date(recording.date).toLocaleDateString()}</strong></p>
            </div>
            <center>
                <a href="${dashboardUrl}" class="button">Ver grabación en Diktalo</a>
            </center>
        </div>
        <div class="footer">
            <p>Recibes este correo porque tienes activadas las notificaciones. Puedes cambiar esto en tus ajustes.</p>
        </div>
    </div>
</body>
</html>
    `;

    return sendEmail({
        to: user.email,
        subject: `🎥 Nueva grabación: ${recording.title}`,
        html,
        channel: 'system'
    });
};
