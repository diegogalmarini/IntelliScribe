// Minimal, modern email base template for frontend
const getEmailBase = (content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; 
            line-height: 1.6; 
            color: #1e293b; 
            background-color: #f8fafc;
            padding: 40px 20px;
        }
        .container { 
            max-width: 560px; 
            margin: 0 auto; 
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .content { 
            padding: 48px 40px;
        }
        .logo {
            font-size: 20px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 32px;
            letter-spacing: -0.5px;
        }
        h1, h2 { 
            font-size: 24px; 
            font-weight: 700; 
            color: #0f172a; 
            margin-bottom: 16px;
            line-height: 1.2;
            letter-spacing: -0.5px;
        }
        p { 
            font-size: 16px; 
            color: #475569; 
            margin-bottom: 16px;
        }
        .button {
            display: inline-block;
            background: #0f172a;
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            margin: 24px 0;
        }
        .footer {
            padding: 32px 40px;
            background: #f8fafc;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            font-size: 13px;
            color: #94a3b8;
            margin: 0;
        }
    </style>
</head>
<body>
    <div class="container">
        ${content}
    </div>
</body>
</html>
`;

export const EmailTemplates = {
    newsletterConfirmation: (confirmLink) => getEmailBase(`
        <div class="content">
            <div class="logo">Diktalo</div>
            <h2>Confirmación de Suscripción</h2>
            <p>Gracias por unirte a Diktalo. Por favor, confirma tu correo electrónico para recibir nuestras actualizaciones.</p>
            <center>
                <a href="${confirmLink}" class="button">Confirmar Suscripción</a>
            </center>
        </div>
        <div class="footer">
            <p>Si no has solicitado esto, puedes ignorar este correo.</p>
        </div>
    `),

    newRecording: (userName, recordingTitle, duration, date, dashboardUrl) => getEmailBase(`
        <div class="content">
            <div class="logo">Diktalo</div>
            <h2>✨ ¡Nueva grabación lista!</h2>
            <p>Hola <strong>${userName}</strong>, tu grabación "<strong>${recordingTitle}</strong>" ya está procesada y disponible en tu dashboard.</p>
            <div style="background-color: #f1f5f9; padding: 24px; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0; font-size: 14px; color: #64748b;">Duración: <strong>${duration}</strong></p>
                <p style="margin: 4px 0 0; font-size: 14px; color: #64748b;">Fecha: <strong>${date}</strong></p>
            </div>
            <center>
                <a href="${dashboardUrl}" class="button">Ver grabación en Diktalo</a>
            </center>
        </div>
        <div class="footer">
            <p>Recibes este correo porque tienes activadas las notificaciones.</p>
        </div>
    `),

    welcome: (userName, dashboardUrl) => getEmailBase(`
        <div class="content">
            <div class="logo">Diktalo</div>
            <h1>¡Bienvenido a Diktalo! 🚀</h1>
            <p>Hola <strong>${userName}</strong>, estamos encantados de que te unas. Diktalo transformará tu voz en tu mejor activo.</p>
            <p style="font-weight: 600; color: #0f172a; margin-top: 24px;">Explora nuestras funciones:</p>
            <ul style="padding-left: 20px; margin: 16px 0; color: #475569;">
                 <li style="padding: 4px 0;">🎤 Grabación Web de alta fidelidad</li>
                 <li style="padding: 4px 0;">🧩 Extensión de Chrome para reuniones</li>
                 <li style="padding: 4px 0;">📤 Importación de archivos de audio</li>
            </ul>
            <center>
                <a href="${dashboardUrl}" class="button">Ir al Dashboard</a>
            </center>
        </div>
        <div class="footer">
            <p>© 2026 Diktalo. Todos los derechos reservados.</p>
        </div>
    `)
};

