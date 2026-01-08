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
        <div style="font-family: sans-serif; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
            <h2 style="color: #0f172a; margin-bottom: 16px;">✨ ¡Nueva grabación lista!</h2>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
                Hola <strong>${user.firstName}</strong>, tu grabación "<strong>${recording.title}</strong>" ya está procesada y disponible en tu dashboard.
            </p>
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; color: #64748b;">Duración: <strong>${recording.duration}</strong></p>
                <p style="margin: 4px 0 0; font-size: 14px; color: #64748b;">Fecha: <strong>${new Date(recording.date).toLocaleDateString()}</strong></p>
            </div>
            <a href="${dashboardUrl}" style="display: inline-block; background-color: #0f172a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Ver grabación en Diktalo
            </a>
            <hr style="margin: 32px 0 24px; border: 0; border-top: 1px solid #e2e8f0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                Recibes este correo porque tienes activadas las notificaciones de nuevas grabaciones. 
                Puedes cambiar esto en tus <a href="${window.location.origin}/settings" style="color: #6366f1;">ajustes</a>.
            </p>
        </div>
    `;

    return sendEmail({
        to: user.email,
        subject: `🎥 Nueva grabación: ${recording.title}`,
        html,
        channel: 'system'
    });
};
