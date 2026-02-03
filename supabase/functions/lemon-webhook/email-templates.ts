// Email templates for subscription events in ES and EN
// Redesigned with minimalist, modern aesthetic matching Diktalo SaaS

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

// Minimal, modern email base template
const getEmailBase = (content: string, language: 'es' | 'en') => `
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
        h1 { 
            font-size: 28px; 
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
        .highlight {
            background: #f1f5f9;
            padding: 24px;
            border-radius: 8px;
            margin: 24px 0;
        }
        .feature-list {
            list-style: none;
            margin: 0;
            padding: 0;
        }
        .feature-list li {
            padding: 8px 0;
            color: #475569;
            font-size: 15px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .feature-list li:before {
            content: "✓";
            display: inline-block;
            width: 20px;
            height: 20px;
            background: #10b981;
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 20px;
            font-size: 12px;
            font-weight: 700;
            flex-shrink: 0;
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
            transition: background 0.2s;
        }
        .button:hover {
            background: #1e293b;
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
        .footer a {
            color: #64748b;
            text-decoration: none;
        }
        .footer a:hover {
            color: #0f172a;
        }
        ol {
            padding-left: 20px;
            margin: 16px 0;
        }
        ol li {
            padding: 4px 0;
            color: #475569;
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

export function getWelcomeEmail(
    planType: string,
    userName: string,
    language: 'es' | 'en' = 'es'
): EmailContent {
    const plan = PLAN_DETAILS[planType]?.[language] || PLAN_DETAILS['pro'][language];

    const content = {
        es: {
            subject: `Bienvenido a Diktalo ${plan.name}`,
            html: getEmailBase(`
        <div class="content">
            <div class="logo">Diktalo</div>
            <h1>Bienvenido a Diktalo ${plan.name}</h1>
            <p>Hola ${userName},</p>
            <p>Gracias por unirte a Diktalo. Tu cuenta ha sido actualizada a <strong>${plan.name}</strong> y ya puedes disfrutar de todas las funciones premium.</p>
            
            <div class="highlight">
                <p style="font-weight: 600; color: #0f172a; margin-bottom: 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Tu plan incluye</p>
                <ul class="feature-list">
                    <li>${plan.minutes} min/mes de transcripción IA</li>
                    <li>${plan.storage} de almacenamiento cloud</li>
                    ${plan.features.map(f => `<li>${f}</li>`).join('\n                    ')}
                </ul>
            </div>

            <p style="font-weight: 600; color: #0f172a; margin-top: 32px; margin-bottom: 12px;">Próximos pasos</p>
            <ol>
                <li>Accede a tu dashboard</li>
                <li>Graba tu primera sesión</li>
                <li>Explora los resúmenes IA y transcripciones</li>
            </ol>

            <center>
                <a href="https://www.diktalo.com/dashboard" class="button">Ir al Dashboard</a>
            </center>

            <p style="margin-top: 32px; font-size: 14px; color: #94a3b8;">
                ¿Necesitas ayuda? Escríbenos a <a href="mailto:soporte@diktalo.com" style="color: #0f172a; text-decoration: underline;">soporte@diktalo.com</a>
            </p>
        </div>
        <div class="footer">
            <p>© 2026 Diktalo. Todos los derechos reservados.</p>
        </div>
            `, 'es')
        },
        en: {
            subject: `Welcome to Diktalo ${plan.name}`,
            html: getEmailBase(`
        <div class="content">
            <div class="logo">Diktalo</div>
            <h1>Welcome to Diktalo ${plan.name}</h1>
            <p>Hi ${userName},</p>
            <p>Thank you for joining Diktalo. Your account has been upgraded to <strong>${plan.name}</strong> and you can now enjoy all premium features.</p>
            
            <div class="highlight">
                <p style="font-weight: 600; color: #0f172a; margin-bottom: 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Your plan includes</p>
                <ul class="feature-list">
                    <li>${plan.minutes} min/month of AI transcription</li>
                    <li>${plan.storage} cloud storage</li>
                    ${plan.features.map(f => `<li>${f}</li>`).join('\n                    ')}
                </ul>
            </div>

            <p style="font-weight: 600; color: #0f172a; margin-top: 32px; margin-bottom: 12px;">Next steps</p>
            <ol>
                <li>Access your dashboard</li>
                <li>Record your first session</li>
                <li>Explore AI summaries and transcriptions</li>
            </ol>

            <center>
                <a href="https://www.diktalo.com/dashboard" class="button">Go to Dashboard</a>
            </center>

            <p style="margin-top: 32px; font-size: 14px; color: #94a3b8;">
                Need help? Write to us at <a href="mailto:support@diktalo.com" style="color: #0f172a; text-decoration: underline;">support@diktalo.com</a>
            </p>
        </div>
        <div class="footer">
            <p>© 2026 Diktalo. All rights reserved.</p>
        </div>
            `, 'en')
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
            html: getEmailBase(`
        <div class="content">
            <div class="logo">Diktalo</div>
            <h1>${isUpgrade ? 'Plan actualizado' : 'Cambio de plan'}</h1>
            <p>Hola ${userName},</p>
            <p>Tu plan de Diktalo ha sido ${isUpgrade ? 'mejorado' : 'cambiado'} a <strong>${plan.name}</strong>.</p>
            <p>${isUpgrade ? 'Ahora tienes acceso a más funciones y límites ampliados.' : 'Este cambio es efectivo inmediatamente.'}</p>
            
            <center>
                <a href="https://www.diktalo.com/dashboard" class="button">Ver mi cuenta</a>
            </center>
        </div>
        <div class="footer">
            <p>© 2026 Diktalo. Todos los derechos reservados.</p>
        </div>
            `, 'es')
        },
        en: {
            subject: isUpgrade ? `Your plan has been upgraded to ${plan.name}` : `Plan change confirmed`,
            html: getEmailBase(`
        <div class="content">
            <div class="logo">Diktalo</div>
            <h1>${isUpgrade ? 'Plan upgraded' : 'Plan changed'}</h1>
            <p>Hi ${userName},</p>
            <p>Your Diktalo plan has been ${isUpgrade ? 'upgraded' : 'changed'} to <strong>${plan.name}</strong>.</p>
            <p>${isUpgrade ? 'You now have access to more features and increased limits.' : 'This change is effective immediately.'}</p>
            
            <center>
                <a href="https://www.diktalo.com/dashboard" class="button">View my account</a>
            </center>
        </div>
        <div class="footer">
            <p>© 2026 Diktalo. All rights reserved.</p>
        </div>
            `, 'en')
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
            html: getEmailBase(`
        <div class="content">
            <div class="logo">Diktalo</div>
            <h1>Suscripción cancelada</h1>
            <p>Hola ${userName},</p>
            <p>Tu suscripción a Diktalo ha sido cancelada. Lamentamos verte partir.</p>
            <p>Tendrás acceso a tu plan hasta: <strong>${endsAt}</strong></p>
            <p>Después de esa fecha, tu cuenta pasará al plan gratuito.</p>
            <p>¿Cambiaste de opinión? Puedes reactivar tu suscripción en cualquier momento.</p>
            
            <center>
                <a href="https://www.diktalo.com/plans" class="button">Reactivar suscripción</a>
            </center>
            
            <p style="margin-top: 32px; font-size: 14px; color: #94a3b8;">
                Nos encantaría saber por qué cancelaste. <a href="mailto:soporte@diktalo.com" style="color: #0f172a; text-decoration: underline;">Cuéntanos</a>
            </p>
        </div>
        <div class="footer">
            <p>© 2026 Diktalo. Todos los derechos reservados.</p>
        </div>
            `, 'es')
        },
        en: {
            subject: 'Your Diktalo subscription has been cancelled',
            html: getEmailBase(`
        <div class="content">
            <div class="logo">Diktalo</div>
            <h1>Subscription cancelled</h1>
            <p>Hi ${userName},</p>
            <p>Your Diktalo subscription has been cancelled. We're sorry to see you go.</p>
            <p>You'll have access to your plan until: <strong>${endsAt}</strong></p>
            <p>After that date, your account will revert to the free plan.</p>
            <p>Changed your mind? You can reactivate your subscription anytime.</p>
            
            <center>
                <a href="https://www.diktalo.com/plans" class="button">Reactivate subscription</a>
            </center>
            
            <p style="margin-top: 32px; font-size: 14px; color: #94a3b8;">
                We'd love to know why you cancelled. <a href="mailto:support@diktalo.com" style="color: #0f172a; text-decoration: underline;">Tell us</a>
            </p>
        </div>
        <div class="footer">
            <p>© 2026 Diktalo. All rights reserved.</p>
        </div>
            `, 'en')
        }
    };

    return content[language];
}
