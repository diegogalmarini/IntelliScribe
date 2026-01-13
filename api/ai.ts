import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';
// Supabase client library removed to avoid ESM in the dependency issues on Vercel

// Initialize AI only on the server
// Removed global init to prevent cold-start crashes if env vars are missing
// const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
// const supabase = createClient(...);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS configuration
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { action, payload, language = 'en' } = req.body;
    console.log(`[AI_API] Request received. Action: ${action}`);

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Server Error: Missing GEMINI_API_KEY in environment variables.' });
    }
    if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ error: 'Server Error: Missing SUPABASE_URL or SERVICE_ROLE_KEY.' });
    }

    try {
        // Initialize Clients Safely
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // Supabase config (using REST API, no client library)
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        let result;

        // --- Action 1: Meeting Summary ---
        if (action === 'summary') {
            const { transcript, template: templateId = 'general', systemPrompt: systemPromptOverride, attachments } = payload;

            // Basic fallback templates if systemPrompt is not provided by the frontend
            const fallbackTemplates: Record<string, { es: string, en: string }> = {
                'general': {
                    es: 'Eres un asistente experto en resumir reuniones. Proporciona un resumen detallado y estructurado de la siguiente transcripción. Responde SIEMPRE en ESPAÑOL.',
                    en: 'You are an expert meeting assistant. Provide a detailed and structured summary of the following transcript. Always respond in ENGLISH.'
                }
            };

            let systemPrompt = '';
            if (systemPromptOverride) {
                systemPrompt = systemPromptOverride;
            } else {
                const selected = fallbackTemplates[templateId] || fallbackTemplates['general'];
                systemPrompt = language === 'es' ? selected.es : selected.en;
            }

            let visualContext = '';
            if (attachments && Array.isArray(attachments) && attachments.length > 0) {
                // Attachments are expected to be { time: "HH:MM:SS", url: "..." }
                const attachmentList = attachments.map((a: any) => `- Time: ${a.time} | URL: ${a.url}`).join('\n');
                const instruction = language === 'es'
                    ? `\n\n[CONTEXTO VISUAL]\nSe capturaron las siguientes capturas de pantalla durante la reunión:\n${attachmentList}\n\nINSTRUCCIÓN: Si el contenido de la transcripción coincide con el tiempo de una captura, DEBES insertar la imagen en el resumen usando el formato markdown: \n![Contexto Visual](url)\nInsértala justo después del párrafo relevante.`
                    : `\n\n[VISUAL CONTEXT]\nThe following screenshots were captured during the meeting:\n${attachmentList}\n\nINSTRUCTION: If the transcript content aligns with the timestamp of a screenshot, you MUST insert the image into the summary using markdown format: \n![Visual Context](url)\nInsert it right after the relevant paragraph.`;

                visualContext = instruction;
            }

            const targetLangLabel = language === 'es' ? 'ESPÍÑOL (SPANISH)' : 'ENGLISH';
            const finalPrompt = `${systemPrompt}${visualContext}\n\nCRITICAL INSTRUCTION: Your entire response MUST be in ${targetLangLabel}. Do not use any other language.\n\nTranscript:\n${transcript}`;

            const response = await genAI.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: finalPrompt,
                config: { temperature: 0.3 }
            });
            result = response.text || "No summary generated.";
        }

        // --- Action 2: Chat with Transcript ---
        else if (action === 'chat') {
            const { transcript, history, message } = payload;
            let finalContext = '';

            // Handle Array of Recordings (Meso/Macro Level) or Single String
            if (Array.isArray(transcript)) {
                // It's an array of { title, date, content, id }
                finalContext = transcript.map((item: any, index: number) => {
                    return `--- RECORDING START [${index + 1}] ---\nTITLE: ${item.title}\nDATE: ${item.date}\nID: ${item.id}\nCONTENT:\n${item.content}\n--- RECORDING END ---`;
                }).join('\n\n');
            } else {
                // Legacy support for single string
                finalContext = typeof transcript === 'string' ? transcript : JSON.stringify(transcript);
            }

            // Safety limit (approx 700k chars to stay safe within Gemini 1M window and leave room for response)
            const CHAR_LIMIT = 700000;
            if (finalContext.length > CHAR_LIMIT) {
                console.warn(`[AI_API] Context too large (${finalContext.length} chars). Truncating...`);
                finalContext = finalContext.substring(0, CHAR_LIMIT) + "\n\n[SYSTEM: CONTEXT TRUNCATED DUE TO LENGTH]";
            }

            const systemInstruction = language === 'es'
                ? `Eres Diktalo, un asistente de inteligencia de voz. Responde basándote ÚNICAMENTE en este contexto de grabaciones:\n${finalContext}\n\nREGLAS IMPORTANTES:\n1. NUNCA menciones los "Document ID" o UUIDs en tu respuesta visible.\n2. Si citas algo, menciona "En la grabación [Título]" o "En la reunión del [Fecha]".\n3. Si analizas múltiples grabaciones, busca patrones y conexiones entre ellas.\n4. Si el usuario pide abrir una grabación, termina con: [OPEN_RECORDING: id].`
                : `You are Diktalo. Answer based ONLY on this context:\n${finalContext}\n\nIMPORTANT RULES:\n1. NEVER mention "Document IDs".\n2. Refer to recordings by Title or Date.\n3. Identify patterns across multiple recordings.\n4. If asked to open one, end with: [OPEN_RECORDING: id].`;

            const chat = genAI.chats.create({
                model: 'gemini-2.0-flash-exp',
                config: { systemInstruction },
                history: history.map((h: any) => ({ role: h.role, parts: [{ text: h.text }] }))
            });
            const response = await chat.sendMessage({ message });
            result = response.text;
        }

        // --- Action 3: Audio Transcription ---
        else if (action === 'transcribe') {
            const { audioBase64, audioUrl, mimeType } = payload;
            let finalBase64 = audioBase64;

            // PERFORMANCE FIX: If only URL is provided, fetch it server-side to avoid 413 error
            if (!finalBase64 && audioUrl) {
                console.log(`[AI_API] Fetching audio from URL: ${audioUrl}`);

                // If it's a Supabase URL, use the service key to bypass privacy
                if (audioUrl.includes('supabase.co/storage/v1/object/')) {
                    const pathParts = audioUrl.split('/recordings/');
                    if (pathParts.length > 1) {
                        const filePath = decodeURIComponent(pathParts[1]).split('?')[0];
                        console.log(`[AI_API] Downloading from bucket 'recordings': ${filePath}`);

                        // Use Supabase Storage REST API directly
                        const storageUrl = `${supabaseUrl}/storage/v1/object/recordings/${filePath}`;
                        const storageResponse = await fetch(storageUrl, {
                            headers: {
                                'Authorization': `Bearer ${supabaseServiceKey}`,
                                'apikey': supabaseServiceKey
                            }
                        });

                        if (!storageResponse.ok) {
                            throw new Error(`Supabase Storage Error: ${storageResponse.status} ${storageResponse.statusText}`);
                        }

                        const buffer = await storageResponse.arrayBuffer();
                        finalBase64 = Buffer.from(buffer).toString('base64');
                    }
                }

                // Fallback to regular fetch if still no base64
                if (!finalBase64) {
                    const response = await fetch(audioUrl);
                    if (!response.ok) throw new Error(`Failed to fetch audio from storage: ${response.statusText}`);
                    const buffer = await response.arrayBuffer();
                    finalBase64 = Buffer.from(buffer).toString('base64');
                }
            }

            if (!finalBase64) throw new Error('No audio data or URL provided');

            const languageNames: Record<string, string> = {
                'es': 'Spanish',
                'en': 'English',
                'de': 'German',
                'it': 'Italian',
                'pt': 'Portuguese'
            };
            const targetLanguageName = languageNames[language] || 'English';

            const response = await genAI.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: {
                    parts: [
                        { inlineData: { mimeType: mimeType || 'audio/mp3', data: finalBase64 } },
                        {
                            text: `Transcribe this audio conversation. 
                        
CRITICAL INSTRUCTION: The output MUST be entirely in ${targetLanguageName}. 
If the audio contains any other language, you MUST translate it accurately into ${targetLanguageName} while transcribing. 
The final JSON text must only contain ${targetLanguageName}.

Return a JSON array of objects. Each object must have: 'timestamp' (MM:SS), 'speaker', and 'text'.` }
                    ]
                },
                config: { responseMimeType: 'application/json' }
            });
            result = JSON.parse(response.text || "[]");
        }

        // --- Action 4: Support Chatbot (Nati Pol) ---
        else if (action === 'support') {
            const { message, history, knowledgeBasePath } = payload;

            // Load knowledge base from file system with fallback
            let knowledgeBase = `Diktalo es tu Segundo Cerebro Corporativo.

Es una plataforma de IA que te ayuda a:
- Grabar reuniones, llamadas y conversaciones
- Transcribir automáticamente a texto
- Analizar con IA para extraer insights
- Exportar a múltiples formatos (PDF, Word, TXT)

MÉTODOS DE GRABACIÓN:
1. Grabadora Web: Desde el panel de control.
2. Extensión de Chrome: Para Google Meet, Zoom y Microsoft Teams.
3. Subida de Archivos: MP3, WAV, etc.
4. LLAMADAS TELEFÓNICAS: Diktalo tiene un Dialer integrado. Puedes marcar un número desde la plataforma y la conversación se grabará y transcribirá automáticamente. Es ideal para ventas (análisis BANT) o entrevistas telefónicas.

PÚBLICO OBJETIVO:
- Médicos: Notas SOAP automáticas.
- Vendedores: Análisis de llamadas comerciales.
- Abogados: Documentación de testimonios y casos.

PLANES:
- Gratis: 24 minutos al mes.
- Pro: Desde 9€/mes.

Para crear cuenta: clic en "Crear Mi Cuenta" en la home.
Soporte: contacto@diktalo.com`;

            try {
                const fs = await import('fs');
                const path = await import('path');
                const kbPath = path.join(process.cwd(), 'public', knowledgeBasePath || 'docs/chatbot-training/knowledge-base.json');

                if (fs.existsSync(kbPath)) {
                    const kbContent = fs.readFileSync(kbPath, 'utf-8');
                    const kbData = JSON.parse(kbContent);

                    // Format knowledge base for AI
                    const intents = kbData.intents.map((intent: any) => {
                        return `TEMA: ${intent.category}\nPATTERNS: ${intent.patterns.join(', ')}\nRESPUESTA: ${intent.response_template}`;
                    }).join('\n\n---\n\n');

                    knowledgeBase = `KNOWLEDGE BASE DE DIKTALO:\n\n${intents}\n\nDETALLE IMPORTANTE: También permitimos grabar LLAMADAS TELEFÓNICAS mediante nuestro Dialer integrado.`;
                    console.log('[AI_API] Knowledge base loaded successfully');
                } else {
                    console.warn('[AI_API] Knowledge base file not found, using fallback');
                }
            } catch (err) {
                console.error('[AI_API] Failed to load knowledge base:', err);
                console.log('[AI_API] Using fallback knowledge base');
            }

            const systemInstruction = language === 'es'
                ? `Eres Nati Pol, asistente virtual de Diktalo. Tu tono es profesional, directo y servicial.

CONTEXTO COMPLETO DE DIKTALO:
${knowledgeBase}

REGLAS ESTRICTAS:
1. NO uses emojis.
2. NO uses negritas (**) ni ningún tipo de formato markdown especial. Texto plano únicamente.
3. Responde de forma concisa (máximo 3 párrafos cortos).
4. Incluye siempre la opción de "Llamadas Telefónicas mediante el Dialer" cuando te pregunten cómo grabar.
5. Si el usuario pregunta algo que no está en el contexto, sugiere: "Para ese detalle específico, por favor contacta con soporte en contacto@diktalo.com".
6. SIEMPRE responde en ESPAÑOL.
7. No menciones que eres un bot ni que lees un knowledge base.`
                : `You are Nati Pol, Diktalo's virtual assistant. Professional, direct, and helpful.

CONTEXT:
${knowledgeBase}

STRICT RULES:
1. NO emojis.
2. NO bolding (**) or special markdown formatting. Plain text only.
3. Be concise.
4. Always include "Phone Calls via Dialer" as a recording option.
5. If uncertain, suggest contacting support.
6. ALWAYS respond in ENGLISH.`;

            const chat = genAI.chats.create({
                model: 'gemini-2.0-flash-exp',
                config: {
                    systemInstruction,
                    temperature: 0.7  // Slightly more creative for friendly chat
                },
                history: history.map((h: any) => ({
                    role: h.role === 'user' ? 'user' : 'model',
                    parts: [{ text: h.content }]
                }))
            });

            const response = await chat.sendMessage({ message });
            result = response.text;
        }

        else {
            throw new Error('Invalid action');
        }

        return res.status(200).json({ data: result });

    } catch (error: any) {
        console.error('AI Service Error:', error);
        return res.status(500).json({ error: error.message || 'Error processing AI request' });
    }
}
