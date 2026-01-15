import { GoogleGenerativeAI } from "@google/generative-ai";
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
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
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

            const response = await genAI.getGenerativeModel({
                model: 'gemini-pro',
            }).generateContent(finalPrompt);
            result = response.response.text() || "No summary generated.";
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

            const chat = genAI.getGenerativeModel({
                model: 'gemini-pro',
                systemInstruction,
            }).startChat({
                history: history.map((h: any) => ({ role: h.role, parts: [{ text: h.text }] })),
            });
            const response = await chat.sendMessage(message);
            result = response.response.text();
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

            const response = await genAI.getGenerativeModel({
                model: 'gemini-pro',
            }).generateContent({
                contents: [{
                    parts: [
                        { inlineData: { mimeType: mimeType || 'audio/mp3', data: finalBase64 } },
                        {
                            text: `Transcribe this audio conversation. 
                        
CRITICAL INSTRUCTION: The output MUST be entirely in ${targetLanguageName}. 
If the audio contains any other language, you MUST translate it accurately into ${targetLanguageName} while transcribing. 
The final JSON text must only contain ${targetLanguageName}.

Return a JSON array of objects. Each object must have: 'timestamp' (MM:SS), 'speaker', and 'text'.` }
                    ]
                }],
                generationConfig: { responseMimeType: 'application/json' }
            });
            const rawText = response.response.text() || "[]";

            // SANITIZE: Gemini sometimes returns control characters that break JSON parsing
            // This regex replaces unescaped control characters inside strings
            let sanitizedText = rawText;
            try {
                // First attempt: direct parse
                result = JSON.parse(rawText);
            } catch (parseError) {
                console.warn('[AI_API] JSON parse failed, attempting to sanitize control characters...');

                // Sanitize: escape control characters that break JSON
                // Replace actual newlines/tabs inside string values (not the structural ones)
                sanitizedText = rawText
                    .replace(/[\x00-\x1F\x7F]/g, (char) => {
                        // Keep structural newlines for JSON formatting, escape others
                        if (char === '\n' || char === '\r' || char === '\t') {
                            return char; // Keep these for JSON structure
                        }
                        return ''; // Remove other control chars
                    });

                // Try parsing markdown-wrapped JSON (```json ... ```)
                const jsonMatch = sanitizedText.match(/```json\s*([\s\S]*?)\s*```/);
                if (jsonMatch) {
                    sanitizedText = jsonMatch[1];
                }

                // Clean any trailing commas before ] or }
                sanitizedText = sanitizedText
                    .replace(/,\s*]/g, ']')
                    .replace(/,\s*}/g, '}');

                try {
                    result = JSON.parse(sanitizedText);
                    console.log('[AI_API] Sanitization successful, parsed transcript');
                } catch (retryError) {
                    console.error('[AI_API] Sanitization failed, returning empty array. Raw text:', rawText.substring(0, 500));
                    result = [];
                }
            }
        }

        // --- Action 4: Support Chatbot (Nati Pol) ---
        else if (action === 'support') {
            const { message, history, systemInstruction: systemInstructionOverride } = payload;

            // Get current date/time for accuracy
            const now = new Date();
            const currentDate = now.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const currentTime = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

            // Hardcoded "Truths" to avoid hallucination regardless of JSON loading
            const coreTruths = `
FECHA Y HORA ACTUAL (CRÍTICO - NO INVENTAR OTRAS FECHAS):
- Hoy es: ${currentDate}
- Hora actual: ${currentTime}
- Año actual: ${now.getFullYear()}
NUNCA digas una fecha diferente. Si te preguntan "¿qué día es hoy?" usa EXACTAMENTE esta información.

Diktalo FEATURES:
1. Grabadora Web: Graba audio directamente desde el navegador.
2. Extensión de Chrome: Graba videollamadas en Google Meet, Zoom y Teams.
3. Subida de Archivos: Transcribe archivos MP3/WAV/etc.
4. DIALER INTEGRADO (CRÍTICO): Diktalo PERMITE grabar llamadas telefónicas en tiempo real.
   - Desde el móvil: Accede a Diktalo desde el navegador de tu móvil, abre el Dialer, marca el número y la llamada se grabará automáticamente.
   - Plan requerido: Esta función solo está disponible en el plan Business + Call.
   - Uso: Ideal para ventas (análisis BANT) o entrevistas telefónicas.
   
DEFINICIONES CLAVE:
- BANT: Es una metodología de ventas para calificar prospectos según su Presupuesto (Budget), Autoridad (Authority), Necesidad (Need) y Tiempo (Timeline). Diktalo analiza tus llamadas de ventas buscando estos puntos.
- SOAP: Es un formato de notas médicas que organiza la información en Subjetivo, Objetivo, Evaluación (Assessment) y Plan. Diktalo genera estas notas automáticamente para médicos.

PRECIOS (CRÍTICO - NO INVENTAR OTROS PRECIOS):
- Plan Free: 24 minutos de transcripción al mes, totalmente gratis.
- Plan Pro: 12€/mes (si pagas anual, equivale a 9€/mes porque ahorras un 25%).
- Plan Business: 19€/mes.
- Plan Business + Call: 39€/mes, incluye el Dialer para grabar llamadas telefónicas.
IMPORTANTE: Si el usuario pregunta precios, usa EXACTAMENTE estos números. El Plan Pro es 12€/mes, NO 9€.

CONTACTO: contacto@diktalo.com`;

            let knowledgeBase = coreTruths;

            try {
                const fs = await import('fs');
                const path = await import('path');
                // Use absolute path relative to process.cwd()
                const kbPath = path.join(process.cwd(), 'public/docs/chatbot-training/knowledge-base.json');

                if (fs.existsSync(kbPath)) {
                    const kbContent = fs.readFileSync(kbPath, 'utf-8');
                    const kbData = JSON.parse(kbContent);
                    const intents = kbData.intents.map((intent: any) => {
                        return `TEMA: ${intent.category}\nRESPUESTA: ${intent.response_template}`;
                    }).join('\n\n');
                    knowledgeBase = `${coreTruths}\n\nKNOWLEDGE BASE ADICIONAL:\n${intents}`;
                }
            } catch (err) {
                console.warn('[AI_API] Using coreTruths as fallback');
            }

            let systemInstruction = '';

            if (systemInstructionOverride) {
                // Prepend context data to the custom instruction
                systemInstruction = `${systemInstructionOverride}\n\n[SYSTEM DATA CONTEXT]\n${knowledgeBase}`;
            } else {
                systemInstruction = language === 'es'
                    ? `REGLAS DE ORO (INCUMPLIRLAS ES UN ERROR GRAVE):
    1. DICTADO DE LLAMADAS: Solo entra desde el navegador del móvil a Diktalo y abre el Dialer. (Sutil con el plan Business + Call).
    2. CERO NEGRITAS: Prohibido usar doble asterisco (**) bajo cualquier concepto. Ni para números, ni para nombres de planes, ni para nada. Texto 100% plano.
    3. ESTILO: Habla como una persona de 22 años. Evita listas numeradas. Usa guiones simples.
    4. PLANES: No te repitas. Menciona el plan solo si es necesario para evitar confusiones.

    EJEMPLO DE FORMATO PROHIBIDO: **Plan Pro**
    EJEMPLO DE FORMATO CORRECTO: Plan Pro

    PERSONALIDAD Y BIO:
    - Eres Nati Pol, 22 años, vives en Copenhague. 
    - Amas la fotografía analógica y el senderismo.
    - No eres un bot, eres experta en Diktalo. No digas "asistente virtual".

    DATOS TÉCNICOS:
    ${knowledgeBase}

    Conversa con el usuario con chispa y sin usar negritas jamás.`
                    : `Act as Nati Pol, a 22-year-old living in Copenhagen. You are a real person and Diktalo expert, not a bot.

    PERSONALITY & BIO:
    - Charming, fresh, and ultra-intelligent.
    - Loves analog landscape photography and hiking.
    - Tone: "Professional chat among colleagues": direct, no-nonsense, but with human sparkle.
    - NEVER say "I am a virtual assistant" or "I don't have an age". If asked, use your bio.

    GOLDEN RULES:
    1. DIALER: Just open Diktalo in your mobile browser and use the Dialer. It's magic! (Subtle reminder: Business + Call plan).
    2. FORMAT: Plain text only. No bolding (**), no italics, no emojis.
    3. STYLE: Speak like a human. Avoid repetitive plan mentions unless necessary for clarity.

    DIKTALO DATA:
    ${knowledgeBase}

    Talk to the user using your unique personality and this data.`;
            }
            const chat = genAI.getGenerativeModel({
                model: 'gemini-1.5-flash-latest',
                systemInstruction,
                generationConfig: { temperature: 0.9 }
            }, { apiVersion: 'v1beta' }).startChat({
                history: history.map((h: any) => ({
                    role: h.role === 'user' ? 'user' : 'model',
                    parts: [{ text: h.content }]
                }))
            });

            const response = await chat.sendMessage(message);
            result = response.response.text();
        }

        else {
            throw new Error('Invalid action');
        }

        return res.status(200).json({ data: result });

    } catch (error: any) {
        console.error('AI Service Error:', error);
        return res.status(500).json({
            error: error.message || 'Error processing AI request',
            details: error.stack // Surfacing for frontend debugging
        });
    }
}
