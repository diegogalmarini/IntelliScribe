import { Resend } from 'resend';

// -----------------------------------------------------------------------------
// CONFIGURATION & TYPES
// -----------------------------------------------------------------------------

const resend = new Resend(process.env.RESEND_API_KEY);

// Definimos los canales de comunicación oficiales de Diktalo
type EmailChannel = 'system' | 'support' | 'legal' | 'security';

// Mapeo de identidades de envío (Domain Sending Identities)
// NOTA: Asegúrate de que el dominio 'diktalo.com' esté verificado en el dashboard de Resend.
const SENDERS: Record<EmailChannel, string> = {
    system: 'Diktalo System <noreply@diktalo.com>',
    support: 'Diktalo Support <support@diktalo.com>',
    legal: 'Diktalo Legal <legal@diktalo.com>',
    security: 'Diktalo Security <security@diktalo.com>',
};

interface EmailPayload {
    to: string;
    subject: string;
    html: string;
    channel?: EmailChannel; // Opcional, defecto: 'system'
    replyTo?: string;       // Crucial para la estrategia "Lean" (Gmail forwarding)
}

// -----------------------------------------------------------------------------
// MAIN HANDLER
// -----------------------------------------------------------------------------

export default async function handler(request: Request) {
    // 1. Validación de Método
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // 2. Validación de Entorno
    if (!process.env.RESEND_API_KEY) {
        console.error('❌ CRITICAL: RESEND_API_KEY is missing in environment variables.');
        return new Response(JSON.stringify({ error: 'Server configuration error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // 3. Parseo y Validación de Payload
        // Nota: Usamos request.json() estándar de Fetch API (Vercel Edge/Node compat)
        const body = await request.json() as EmailPayload;
        const { to, subject, html, channel = 'system', replyTo } = body;

        if (!to || !subject || !html) {
            return new Response(JSON.stringify({ error: 'Missing required fields: to, subject, or html' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 4. Selección de Identidad
        const fromAddress = SENDERS[channel] || SENDERS.system;

        console.log(`📧 Dispatching email via [${channel}] to: ${to}`);

        // 5. Ejecución (Resend API)
        const data = await resend.emails.send({
            from: fromAddress,
            to: [to],
            reply_to: replyTo, // Permite que Diego responda directamente al usuario
            subject: subject,
            html: html,
        });

        if (data.error) {
            throw new Error(data.error.message);
        }

        console.log('✅ Email delivered to gateway:', data.data?.id);

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('❌ Email Dispatch Error:', error);
        return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
