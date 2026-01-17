import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GEMINI_CONFIG } from '../constants/ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // ... headers and basic validation ...
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
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

        /**
         * Helper to get a model with automatic fallback if the preferred one fails.
         */
        const getModelWithFallback = async (actionType: keyof typeof GEMINI_CONFIG.actions, systemInstruction?: string) => {
            const config = GEMINI_CONFIG.actions[actionType];
            const modelsToTry = [config.preferredModel, ...GEMINI_CONFIG.modelPriorities.filter(m => m !== config.preferredModel)];

            let lastError = null;
            for (const modelName of modelsToTry) {
                try {
                    console.log(`[AI_API] Attempting to use model: ${modelName} for action: ${actionType}`);
                    const model = genAI.getGenerativeModel({
                        model: modelName,
                        systemInstruction,
                    }, { apiVersion: GEMINI_CONFIG.apiVersion as any });

                    // Basic check to see if model exists (optional, usually sendMessage/generateContent will fail)
                    return model;
                } catch (err) {
                    console.warn(`[AI_API] Model ${modelName} failed or not found. Trying next...`, err);
                    lastError = err;
                }
            }
            throw lastError || new Error(`All models failed for action: ${actionType}`);
        };

        let result;

        // --- Action 1: Meeting Summary ---
        if (action === 'summary') {
            const { transcript, template: templateId = 'general', systemPrompt: systemPromptOverride, attachments } = payload;

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
                const attachmentList = attachments.map((a: any) => `- Time: ${a.time} | URL: ${a.url}`).join('\n');
                const instruction = language === 'es'
                    ? `\n\n[CONTEXTO VISUAL]\nSe capturaron las siguientes capturas de pantalla durante la reunión:\n${attachmentList}\n\nINSTRUCCIÓN: Si el contenido de la transcripción coincide con el tiempo de una captura, DEBES insertar la imagen en el resumen usando el formato markdown: \n![Contexto Visual](url)\nInsértala justo después del párrafo relevante.`
                    : `\n\n[VISUAL CONTEXT]\nThe following screenshots were captured during the meeting:\n${attachmentList}\n\nINSTRUCTION: If the transcript content aligns with the timestamp of a screenshot, you MUST insert the image into the summary using markdown format: \n![Visual Context](url)\nInsert it right after the relevant paragraph.`;
                visualContext = instruction;
            }

            const targetLangLabel = language === 'es' ? 'ESPÍÑOL (SPANISH)' : 'ENGLISH';
            const finalPrompt = `${systemPrompt}${visualContext}\n\nCRITICAL INSTRUCTION: Your entire response MUST be in ${targetLangLabel}. Do not use any other language.\n\nTranscript:\n${transcript}`;

            const model = await getModelWithFallback('summary');
            const response = await model.generateContent(finalPrompt);
            result = response.response.text() || "No summary generated.";
        }

        // --- Action 2: Chat with Transcript ---
        else if (action === 'chat') {
            const { transcript, history, message } = payload;
            let finalContext = '';

            if (Array.isArray(transcript)) {
                finalContext = transcript.map((item: any, index: number) => {
                    return `--- RECORDING START [${index + 1}] ---\nTITLE: ${item.title}\nDATE: ${item.date}\nID: ${item.id}\nCONTENT:\n${item.content}\n--- RECORDING END ---`;
                }).join('\n\n');
            } else {
                finalContext = typeof transcript === 'string' ? transcript : JSON.stringify(transcript);
            }

            const CHAR_LIMIT = 700000;
            if (finalContext.length > CHAR_LIMIT) {
                console.warn(`[AI_API] Context too large (${finalContext.length} chars). Truncating...`);
                finalContext = finalContext.substring(0, CHAR_LIMIT) + "\n\n[SYSTEM: CONTEXT TRUNCATED DUE TO LENGTH]";
            }

            const systemInstruction = language === 'es'
                ? `Eres Diktalo, un asistente de inteligencia de voz. Responde basándote ÚNICAMENTE en este contexto de grabaciones:\n${finalContext}\n\nREGLAS IMPORTANTES:\n1. NUNCA menciones los "Document ID" o UUIDs en tu respuesta visible.\n2. Si citas algo, menciona "En la grabación [Título]" o "En la reunión del [Fecha]".\n3. Si analizas múltiples grabaciones, busca patrones y conexiones entre ellas.\n4. Si el usuario pide abrir una grabación, termina con: [OPEN_RECORDING: id].`
                : `You are Diktalo. Answer based ONLY on this context:\n${finalContext}\n\nIMPORTANT RULES:\n1. NEVER mention "Document IDs".\n2. Refer to recordings by Title or Date.\n3. Identify patterns across multiple recordings.\n4. If asked to open one, end with: [OPEN_RECORDING: id].`;

            const model = await getModelWithFallback('chat', systemInstruction);
            const chat = model.startChat({
                history: history.map((h: any) => ({ role: h.role, parts: [{ text: h.text }] })),
            });
            const response = await chat.sendMessage(message);
            result = response.response.text();
        }

        // --- Action 3: Audio Transcription ---
        else if (action === 'transcribe') {
            const { audioBase64, audioUrl, mimeType } = payload;
            let finalBase64 = audioBase64;

            if (!finalBase64 && audioUrl) {
                console.log(`[AI_API] Fetching audio from URL: ${audioUrl}`);
                if (audioUrl.includes('supabase.co/storage/v1/object/')) {
                    const pathParts = audioUrl.split('/recordings/');
                    if (pathParts.length > 1) {
                        const filePath = decodeURIComponent(pathParts[1]).split('?')[0];
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
                if (!finalBase64) {
                    const response = await fetch(audioUrl);
                    if (!response.ok) throw new Error(`Failed to fetch audio from storage: ${response.statusText}`);
                    const buffer = await response.arrayBuffer();
                    finalBase64 = Buffer.from(buffer).toString('base64');
                }
            }

            if (!finalBase64) throw new Error('No audio data or URL provided');

            const languageNames: Record<string, string> = {
                'es': 'Spanish', 'en': 'English', 'de': 'German', 'it': 'Italian', 'pt': 'Portuguese'
            };
            const targetLanguageName = languageNames[language] || 'English';

            const model = await getModelWithFallback('transcription');
            const response = await model.generateContent({
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

            let sanitizedText = rawText;
            try {
                result = JSON.parse(rawText);
            } catch (parseError) {
                console.warn('[AI_API] JSON parse failed, attempting to sanitize control characters...');
                sanitizedText = rawText.replace(/[\x00-\x1F\x7F]/g, (char) => {
                    if (char === '\n' || char === '\r' || char === '\t') return char;
                    return '';
                });
                const jsonMatch = sanitizedText.match(/```json\s*([\s\S]*?)\s*```/);
                if (jsonMatch) sanitizedText = jsonMatch[1];
                sanitizedText = sanitizedText.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}');
                try {
                    result = JSON.parse(sanitizedText);
                } catch (retryError) {
                    console.error('[AI_API] Sanitization failed, returning empty array.');
                    result = [];
                }
            }
        }

        // --- Action 4: Support Chatbot (Nati Pol) ---
        else if (action === 'support') {
            const { message, history, systemInstruction: systemInstructionOverride } = payload;
            const now = new Date();
            const currentDate = now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const currentTime = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

            const coreTruths = `FECHA Y HORA ACTUAL:\n- Hoy es: ${currentDate}\n- Hora actual: ${currentTime}\n\nDiktalo FEATURES:\n1. Grabadora Web\n2. Extensión de Chrome\n3. Subida de Archivos\n4. DIALER INTEGRADO (Plan Business + Call)\n\nPRECIOS:\n- Plan Free: 24 min/mes gratis\n- Plan Pro: 12€/mes\n- Plan Business: 19€/mes\n- Plan Business + Call: 39€/mes\n\nCONTACTO: contacto@diktalo.com`;

            let knowledgeBase = coreTruths;
            try {
                const fs = await import('fs');
                const path = await import('path');
                const kbPath = path.join(process.cwd(), 'public/docs/chatbot-training/knowledge-base.json');
                if (fs.existsSync(kbPath)) {
                    const kbContent = fs.readFileSync(kbPath, 'utf-8');
                    const kbData = JSON.parse(kbContent);
                    const intents = kbData.intents.map((intent: any) => `TEMA: ${intent.category}\nRESPUESTA: ${intent.response_template}`).join('\n\n');
                    knowledgeBase = `${coreTruths}\n\nKNOWLEDGE BASE ADICIONAL:\n${intents}`;
                }
            } catch (err) { }

            let systemInstruction = '';
            if (systemInstructionOverride) {
                systemInstruction = `${systemInstructionOverride}\n\n[SYSTEM DATA CONTEXT]\n${knowledgeBase}`;
            } else {
                systemInstruction = language === 'es'
                    ? `REGLAS DE ORO: 1. Dialer móvil. 2. CERO NEGRITAS (**). 3. Habla como alguien de 22 años. 4. Estilo Nati Pol de Copenhague.\n\n${knowledgeBase}`
                    : `Act as Nati Pol, 22, from Copenhagen. No bolding. No bot-talk.\n\n${knowledgeBase}`;
            }

            // GEMINI SECURITY: History MUST start with user and MUST alternate roles.
            const validHistory = [];
            let lastRole = null;
            for (const h of (history || [])) {
                const currentRole = h.role === 'user' ? 'user' : 'model';
                if (validHistory.length === 0 && currentRole !== 'user') continue;
                if (currentRole === lastRole) continue;
                validHistory.push({ role: currentRole as 'user' | 'model', parts: [{ text: h.content || h.text || '' }] });
                lastRole = currentRole;
            }

            const model = await getModelWithFallback('support', systemInstruction);
            const chat = model.startChat({
                history: validHistory
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
            details: error.stack
        });
    }
}
