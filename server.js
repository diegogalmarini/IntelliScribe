import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { EmailTemplates } from './utils/emailTemplates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
try {
    const envPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split(/\r?\n/).forEach(line => {
            const [key, val] = line.split('=');
            if (key && val) {
                process.env[key.trim()] = val.trim();
            }
        });
        console.log('Loaded .env.local');
    }
} catch (e) {
    console.error('Error loading .env.local', e);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendKey = process.env.RESEND_API_KEY;

const supabase = (supabaseUrl && supabaseServiceKey) ? createClient(supabaseUrl, supabaseServiceKey) : null;
const resend = resendKey ? new Resend(resendKey) : null;

const PORT = 3001;

const server = http.createServer(async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/api/twilio-token' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const { userId } = JSON.parse(body);

                const accountSid = process.env.TWILIO_ACCOUNT_SID;
                const apiKey = process.env.TWILIO_API_KEY_SID;
                const apiSecret = process.env.TWILIO_API_KEY_SECRET;
                const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

                if (!accountSid || !apiKey || !apiSecret || !twimlAppSid) {
                    throw new Error('Missing Twilio credentials in .env.local');
                }

                const AccessToken = twilio.jwt.AccessToken;
                const VoiceGrant = AccessToken.VoiceGrant;

                const voiceGrant = new VoiceGrant({
                    outgoingApplicationSid: twimlAppSid,
                    incomingAllow: true,
                });

                const token = new AccessToken(accountSid, apiKey, apiSecret, {
                    identity: userId || 'unknown',
                });

                token.addGrant(voiceGrant);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ token: token.toJwt() }));
                console.log(`Token generated for user: ${userId}`);

            } catch (err) {
                console.error('Token generation error:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
    } else if (req.url.startsWith('/api/coupon-status') && req.method === 'GET') {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const code = url.searchParams.get('code');

        console.log(`[API] Checking coupon status for: ${code}`);

        // Mock response to avoid breaking UI if Stripe is not configured
        // In production this calls Stripe (see api/coupon-status.ts)
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            active: true,
            code: code,
            remaining: 5,
            total: 100,
            percent_off: 20,
            label: `🔥 Solo quedan 5 ofertas`
        }));
    } else if (req.url === '/api/ai' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                // geminiService sends: { action, payload, language }
                const { action, payload, language = 'es' } = JSON.parse(body);
                console.log('AI Request:', action);

                if (!process.env.GEMINI_API_KEY) {
                    throw new Error('Missing GEMINI_API_KEY');
                }

                // Dynamically import GoogleGenAI (new SDK)
                const { GoogleGenAI } = await import('@google/genai');
                const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

                let resultData = null;

                // --- Action: Summary ---
                if (action === 'summary') {
                    const { transcript, template = 'general', systemPrompt: systemPromptOverride } = payload || {};
                    let prompt = "";

                    if (systemPromptOverride) {
                        prompt = `${systemPromptOverride}\n\nTranscript:\n${transcript}`;
                    } else {
                        // Template logic
                        switch (template) {
                            case 'meeting':
                                prompt = `Analiza la siguiente transcripción de una reunión. Genera un resumen estructurado que incluya:
                                  1. **Objetivos de la reunión**: ¿Para qué se reunieron?
                                  2. **Decisiones clave**: ¿Qué se acordó?
                                  3. **Tareas pendientes (Action Items)**: ¿Quién hace qué y para cuándo?
                                  4. **Conclusiones**: Resumen general.
                                  
                                  Transcripción:
                                  ${transcript}`;
                                break;
                            default: // 'general'
                                prompt = `Genera un resumen conciso y estructurado de la siguiente transcripción. Identifica los puntos clave, temas principales y cualquier conclusión relevante. Utiliza formato Markdown para mejorar la legibilidad.
                                  
                                  Transcripción:
                                  ${transcript}`;
                        }
                    }

                    const response = await genAI.models.generateContent({
                        model: 'gemini-2.0-flash-exp',
                        contents: prompt,
                        config: { temperature: 0.3 }
                    });

                    resultData = response.text || "No summary generated.";
                }
                // --- Action: Chat ---
                else if (action === 'chat') {
                    const { transcript, history, message } = payload;
                    let finalContext = typeof transcript === 'string' ? transcript : JSON.stringify(transcript);

                    const systemInstruction = language === 'es'
                        ? `Eres Diktalo, un asistente de inteligencia de voz. Responde basándote ÚNICAMENTE en este contexto de grabaciones:\n${finalContext}`
                        : `You are Diktalo. Answer based ONLY on this context:\n${finalContext}`;

                    const chat = genAI.chats.create({
                        model: 'gemini-2.0-flash-exp',
                        config: { systemInstruction },
                        history: history.map((h) => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text || h.content }] }))
                    });
                    const response = await chat.sendMessage({ message });
                    resultData = response.text;
                }
                // --- Action: Transcribe ---
                else if (action === 'transcribe') {
                    const { audioBase64, audioUrl, mimeType } = payload;
                    let finalBase64 = audioBase64;

                    if (!finalBase64 && audioUrl) {
                        console.log(`[AI_API] Fetching audio from URL: ${audioUrl}`);
                        const response = await fetch(audioUrl);
                        if (!response.ok) throw new Error(`Failed to fetch audio from storage: ${response.statusText}`);
                        const buffer = await response.arrayBuffer();
                        finalBase64 = Buffer.from(buffer).toString('base64');
                    }

                    if (!finalBase64) throw new Error('No audio data or URL provided');

                    const response = await genAI.models.generateContent({
                        model: 'gemini-2.0-flash-exp',
                        contents: {
                            parts: [
                                { inlineData: { mimeType: mimeType || 'audio/mp3', data: finalBase64 } },
                                { text: `Transcribe this audio conversation. Return a JSON array of objects with 'timestamp' (MM:SS), 'speaker', and 'text'.` }
                            ]
                        },
                        config: { responseMimeType: 'application/json' }
                    });
                    resultData = JSON.parse(response.text || "[]");
                }
                // --- Action: Support ---
                else if (action === 'support') {
                    const { message, history } = payload;
                    const coreTruths = `Diktalo FEATURES: 1. Grabadora Web, 2. Extensión Chrome, 3. Subida Archivos, 4. DIALER (Crítico). Precios: Free (24 min), Pro (9€/mes). Nati Pol, 22 años, vive en Copenhague. Habla sin negritas.`;

                    const systemInstruction = `Eres Nati Pol, experta en Diktalo. ${coreTruths}. REGLA DE ORO: CERO NEGRITAS.`;

                    const chat = genAI.chats.create({
                        model: 'gemini-2.0-flash-exp',
                        config: { systemInstruction, temperature: 0.9 },
                        history: history.map((h) => ({
                            role: h.role === 'user' ? 'user' : 'model',
                            parts: [{ text: h.content || h.text }]
                        }))
                    });

                    const response = await chat.sendMessage({ message });
                    resultData = response.text;
                }
                else {
                    throw new Error(`Invalid action: ${action}`);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ data: resultData }));

            } catch (err) {
                console.error('AI API Error:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
    } else if (req.url === '/api/send-email' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { type, payload, to } = JSON.parse(body);
                console.log(`[API] Sending email type: ${type} to: ${to}`);

                if (!resend) {
                    console.warn('[API] Resend not configured. Mocking email send.');
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, mocked: true }));
                    return;
                }

                let subject = '';
                let html = '';

                switch (type) {
                    case 'new_recording':
                        subject = '✨ Tu grabación está lista';
                        html = EmailTemplates.newRecording(
                            payload.userName,
                            payload.recordingTitle,
                            payload.duration,
                            payload.date,
                            payload.dashboardUrl
                        );
                        break;
                    case 'welcome':
                        subject = 'Bienvenido a Diktalo 🚀';
                        html = EmailTemplates.welcome(payload.userName, payload.dashboardUrl);
                        break;
                    default:
                        throw new Error('Invalid email type');
                }

                await resend.emails.send({
                    from: 'Diktalo <noreply@diktalo.com>',
                    to: [to],
                    subject: subject,
                    html: html
                });

                console.log('[API] Email sent successfully via Resend');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));

            } catch (err) {
                console.error('Email Error:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });

    } else if (req.url === '/api/newsletter-subscribe' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { email, legalAccepted } = JSON.parse(body);
                console.log('[API] Newsletter subscribe:', email);

                if (!supabase) throw new Error('Supabase not configured in server.js');

                const { data, error: dbError } = await supabase
                    .from('newsletter_subscriptions')
                    .upsert({
                        email,
                        status: 'pending',
                        legal_accepted: legalAccepted,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'email' })
                    .select('confirmation_token')
                    .single();

                if (dbError) throw dbError;

                const confirmLink = `http://localhost:5173/confirm-subscription?token=${data.confirmation_token}`;

                if (resend) {
                    await resend.emails.send({
                        from: 'Diktalo <noreply@diktalo.com>',
                        to: [email],
                        subject: 'Confirma tu suscripción',
                        html: EmailTemplates.newsletterConfirmation(confirmLink)
                    });
                    console.log('[API] Confirmation email sent (Resend)');
                } else {
                    console.warn('[API] Resend not configured. Confirmation Link:', confirmLink);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                console.error('Newsletter Error:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
    } else if (req.url.startsWith('/api/newsletter-confirm') && req.method === 'GET') {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const token = url.searchParams.get('token');
        console.log('[API] Newsletter confirm token:', token);

        try {
            if (!supabase) throw new Error('Supabase not configured');
            const { data, error } = await supabase
                .from('newsletter_subscriptions')
                .update({ status: 'confirmed' })
                .eq('confirmation_token', token)
                .select();

            if (error || !data.length) throw new Error('Invalid token');

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

server.listen(PORT, () => {
    console.log(`Local API Server running on http://localhost:${PORT}`);
});
