// Email templates for subscription events in ES and EN

export interface EmailContent {
    subject: string;
    html: string;
}

export interface PlanDetails {
    name: string;
    minutes: string;
    storage: string;
    features: string[];
}

const PLAN_DETAILS: Record<string, { es: PlanDetails; en: PlanDetails }> = {
    pro: {
        es: {
            name: 'Pro',
            minutes: '300',
            storage: '5 GB',
            features: [
                'Transcripción IA avanzada',
                'Resúmenes automáticos',
                'Chat con tus grabaciones',
                'Grabación de micrófono + sistema'
            ]
        },
        en: {
            name: 'Pro',
            minutes: '300',
            storage: '5 GB',
            features: [
                'Advanced AI transcription',
                'Automatic summaries',
                'Chat with your recordings',
                'Microphone + system recording'
            ]
        }
    },
    business: {
        es: {
            name: 'Business',
            minutes: '600',
            storage: '20 GB',
            features: [
                'Todo lo de Pro incluido',
                'Soporte prioritario',
                'Exportación avanzada',
                'Integraciones empresariales'
            ]
        },
        en: {
            name: 'Business',
            minutes: '600',
            storage: '20 GB',
            features: [
                'Everything in Pro',
                'Priority support',
                'Advanced export',
                'Enterprise integrations'
            ]
        }
    },
    business_plus: {
        es: {
            name: 'Business + Call',
            minutes: '850',
            storage: '50 GB',
            features: [
                'Todo lo de Business incluido',
                'Grabación de llamadas telefónicas',
                'Soporte telefónico dedicado',
                'Análisis conversacional avanzado'
            ]
        },
        en: {
            name: 'Business + Call',
            minutes: '850',
            storage: '50 GB',
            features: [
                'Everything in Business',
                'Phone call recording',
                'Dedicated phone support',
                'Advanced conversation analysis'
            ]
        }
    }
};

export function getWelcomeEmail(
    planType: string,
    userName: string,
    language: 'es' | 'en' = 'es'
): EmailContent {
    const plan = PLAN_DETAILS[planType]?.[language] || PLAN_DETAILS['pro'][language];

    const content = {
        es: {
            subject: `¡Bienvenido a Diktalo ${plan.name}! 🎉`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .feature-list { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .feature-list li { margin: 10px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Bienvenido a Diktalo ${plan.name}!</h1>
            <p>Tu suscripción está activa</p>
        </div>
        <div class="content">
            <p>Hola ${userName},</p>
            <p>¡Gracias por unirte a Diktalo! Tu cuenta ha sido actualizada a <strong>${plan.name}</strong> y ya puedes disfrutar de todas las funciones premium.</p>
            
            <div class="feature-list">
                <h3>Tu plan incluye:</h3>
                <ul>
                    <li>✅ ${plan.minutes} min/mes de transcripción IA</li>
                    <li>✅ ${plan.storage} de almacenamiento cloud</li>
                    ${plan.features.map(f => `<li>✅ ${f}</li>`).join('\n                    ')}
                </ul>
            </div>

            <p><strong>Próximos pasos:</strong></p>
            <ol>
                <li>Accede a tu dashboard</li>
                <li>Graba tu primera sesión</li>
                <li>Explora los resúmenes IA y transcripciones</li>
            </ol>

            <center>
                <a href="https://www.diktalo.com/dashboard" class="button">Ir al Dashboard</a>
            </center>

            <p>¿Necesitas ayuda? Estamos aquí para ti:</p>
            <p>📧 Email: <a href="mailto:soporte@diktalo.com">soporte@diktalo.com</a></p>
        </div>
        <div class="footer">
            <p>© 2026 Diktalo. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
            `
        },
        en: {
            subject: `Welcome to Diktalo ${plan.name}! 🎉`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .feature-list { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .feature-list li { margin: 10px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Diktalo ${plan.name}!</h1>
            <p>Your subscription is now active</p>
        </div>
        <div class="content">
            <p>Hi ${userName},</p>
            <p>Thank you for joining Diktalo! Your account has been upgraded to <strong>${plan.name}</strong> and you can now enjoy all premium features.</p>
            
            <div class="feature-list">
                <h3>Your plan includes:</h3>
                <ul>
                    <li>✅ ${plan.minutes} min/month of AI transcription</li>
                    <li>✅ ${plan.storage} cloud storage</li>
                    ${plan.features.map(f => `<li>✅ ${f}</li>`).join('\n                    ')}
                </ul>
            </div>

            <p><strong>Next steps:</strong></p>
            <ol>
                <li>Access your dashboard</li>
                <li>Record your first session</li>
                <li>Explore AI summaries and transcriptions</li>
            </ol>

            <center>
                <a href="https://www.diktalo.com/dashboard" class="button">Go to Dashboard</a>
            </center>

            <p>Need help? We're here for you:</p>
            <p>📧 Email: <a href="mailto:support@diktalo.com">support@diktalo.com</a></p>
        </div>
        <div class="footer">
            <p>© 2026 Diktalo. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
            `
        }
    };

    return content[language];
}

export function getPlanChangeEmail(
    oldPlan: string,
    newPlan: string,
    userName: string,
    language: 'es' | 'en' = 'es'
): EmailContent {
    const plan = PLAN_DETAILS[newPlan]?.[language] || PLAN_DETAILS['pro'][language];
    const isUpgrade = ['free', 'pro', 'business', 'business_plus'].indexOf(newPlan) >
        ['free', 'pro', 'business', 'business_plus'].indexOf(oldPlan);

    const content = {
        es: {
            subject: isUpgrade ? `Tu plan ha sido actualizado a ${plan.name}` : `Cambio de plan confirmado`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${isUpgrade ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#6c757d'}; color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${isUpgrade ? '¡Plan actualizado!' : 'Cambio de plan'}</h1>
        </div>
        <div class="content">
            <p>Hola ${userName},</p>
            <p>Tu plan de Diktalo ha sido ${isUpgrade ? 'mejorado' : 'cambiado'} a <strong>${plan.name}</strong>.</p>
            <p>${isUpgrade ? '¡Ahora tienes acceso a más funciones y límites ampliados!' : 'Este cambio será efectivo inmediatamente.'}</p>
            <center>
                <a href="https://www.diktalo.com/dashboard" class="button">Ver mi cuenta</a>
            </center>
        </div>
        <div class="footer">
            <p>© 2026 Diktalo. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
            `
        },
        en: {
            subject: isUpgrade ? `Your plan has been upgraded to ${plan.name}` : `Plan change confirmed`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${isUpgrade ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#6c757d'}; color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${isUpgrade ? 'Plan upgraded!' : 'Plan changed'}</h1>
        </div>
        <div class="content">
            <p>Hi ${userName},</p>
            <p>Your Diktalo plan has been ${isUpgrade ? 'upgraded' : 'changed'} to <strong>${plan.name}</strong>.</p>
            <p>${isUpgrade ? 'You now have access to more features and increased limits!' : 'This change will take effect immediately.'}</p>
            <center>
                <a href="https://www.diktalo.com/dashboard" class="button">View my account</a>
            </center>
        </div>
        <div class="footer">
            <p>© 2026 Diktalo. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
            `
        }
    };

    return content[language];
}

export function getCancellationEmail(
    planType: string,
    userName: string,
    endsAt: string,
    language: 'es' | 'en' = 'es'
): EmailContent {
    const content = {
        es: {
            subject: 'Tu suscripción a Diktalo ha sido cancelada',
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6c757d; color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Suscripción cancelada</h1>
        </div>
        <div class="content">
            <p>Hola ${userName},</p>
            <p>Tu suscripción a Diktalo ha sido cancelada. Lamentamos verte partir.</p>
            <p>Tendrás acceso a tu plan hasta: <strong>${endsAt}</strong></p>
            <p>Después de esa fecha, tu cuenta pasará al plan gratuito.</p>
            <p>¿Cambiaste de opinión? Puedes reactivar tu suscripción en cualquier momento.</p>
            <center>
                <a href="https://www.diktalo.com/plans" class="button">Reactivar suscripción</a>
            </center>
            <p>Nos encantaría saber por qué cancelaste. <a href="mailto:soporte@diktalo.com">Cuéntanos</a></p>
        </div>
        <div class="footer">
            <p>© 2026 Diktalo. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
            `
        },
        en: {
            subject: 'Your Diktalo subscription has been cancelled',
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6c757d; color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Subscription cancelled</h1>
        </div>
        <div class="content">
            <p>Hi ${userName},</p>
            <p>Your Diktalo subscription has been cancelled. We're sorry to see you go.</p>
            <p>You'll have access to your plan until: <strong>${endsAt}</strong></p>
            <p>After that date, your account will revert to the free plan.</p>
            <p>Changed your mind? You can reactivate your subscription anytime.</p>
            <center>
                <a href="https://www.diktalo.com/plans" class="button">Reactivate subscription</a>
            </center>
            <p>We'd love to know why you cancelled. <a href="mailto:support@diktalo.com">Tell us</a></p>
        </div>
        <div class="footer">
            <p>© 2026 Diktalo. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
            `
        }
    };

    return content[language];
}
