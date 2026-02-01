export const EmailTemplates = {
    newsletterConfirmation: (confirmLink) => `
        <div style="font-family: sans-serif; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #0f172a; margin-bottom: 16px;">Confirmación de Suscripción</h2>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
                Gracias por unirte a Diktalo. Por favor, confirma tu correo electrónico para recibir nuestras actualizaciones.
            </p>
            <a href="${confirmLink}" style="display: inline-block; background-color: #0f172a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Confirmar Suscripción
            </a>
            <hr style="margin: 32px 0 24px; border: 0; border-top: 1px solid #e2e8f0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                Si no has solicitado esto, puedes ignorar este correo.
            </p>
        </div>
    `,

    newRecording: (userName, recordingTitle, duration, date, dashboardUrl) => `
        <div style="font-family: sans-serif; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #0f172a; margin-bottom: 16px;">✨ ¡Nueva grabación lista!</h2>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
                Hola <strong>${userName}</strong>, tu grabación "<strong>${recordingTitle}</strong>" ya está procesada y disponible en tu dashboard.
            </p>
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; color: #64748b;">Duración: <strong>${duration}</strong></p>
                <p style="margin: 4px 0 0; font-size: 14px; color: #64748b;">Fecha: <strong>${date}</strong></p>
            </div>
            <a href="${dashboardUrl}" style="display: inline-block; background-color: #0f172a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Ver grabación en Diktalo
            </a>
            <hr style="margin: 32px 0 24px; border: 0; border-top: 1px solid #e2e8f0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                Recibes este correo porque tienes activadas las notificaciones.
            </p>
        </div>
    `,

    welcome: (userName, dashboardUrl) => `
        <div style="font-family: sans-serif; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #0f172a; margin-bottom: 16px;">¡Bienvenido a Diktalo! 🚀</h2>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
                Hola <strong>${userName}</strong>, estamos encantados de que te unas. Diktalo transformará tu voz en tu mejor activo.
            </p>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
                Explora nuestras funciones:
                <ul style="padding-left: 20px; margin-top: 8px;">
                     <li>🎤 Grabación Web de alta fidelidad</li>
                     <li>🧩 Extensión de Chrome para reuniones</li>
                     <li>📤 Importación de archivos de audio</li>
                </ul>
            </p>
            <a href="${dashboardUrl}" style="display: inline-block; background-color: #0f172a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Ir a mi Dashboard
            </a>
        </div>
    `
};
