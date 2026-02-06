import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';
import { validateEnv } from "./_utils/env-validator.js";
import { initSentry, Sentry } from "./_utils/sentry.js";

// Initialize Sentry
initSentry();

// Consolidated Configuration to ensure serverless reliability
const GEMINI_CONFIG = {
    apiVersion: 'v1beta',
    modelPriorities: [
        'gemini-1.5-flash',
        'gemini-1.5-pro'
    ],
    actions: {
        summary: { preferredModel: 'gemini-1.5-flash', temperature: 0.7 },
        chat: { preferredModel: 'gemini-1.5-pro', temperature: 0.8 },
        support: { preferredModel: 'gemini-1.5-flash', temperature: 0.9 }, // Nati Pol needs speed
        transcription: { preferredModel: 'gemini-1.5-flash', temperature: 0.1 }, // Flash is best for long audio
        embed: { preferredModel: 'text-embedding-004' }
    }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS configuration
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { action, payload, language = 'en' } = req.body;
    console.log(`[AI_API] Request received. Action: ${action}`);

    let env;
    try {
        env = validateEnv(['base', 'ai']);
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }

    const { GEMINI_API_KEY, SUPABASE_URL: supabaseUrl, SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey } = env;

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

        /**
         * Exponential backoff retry utility (ChatGPT Analysis Recommendation)
         * Retries a function up to maxRetries times with exponential delay
         */
        const withRetry = async <T>(
            fn: () => Promise<T>,
            maxRetries: number = 3,
            actionName: string = 'operation'
        ): Promise<T> => {
            for (let attempt = 0; attempt < maxRetries; attempt++) {
                try {
                    return await fn();
                } catch (error: any) {
                    const isLastAttempt = attempt === maxRetries - 1;

                    if (isLastAttempt) {
                        console.error(`[AI_API] ${actionName} failed after ${maxRetries} attempts:`, error.message);
                        throw error;
                    }

                    const delayMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
                    console.warn(`[AI_API] ${actionName} attempt ${attempt + 1} failed: ${error.message}. Retrying in ${delayMs}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                }
            }
            throw new Error(`${actionName} failed after all retries`);
        };

        /**
         * Helper to execute an AI task with automatic fallback.
         * The task itself is retried with different models.
         */
        const runWithFallback = async (actionType: keyof typeof GEMINI_CONFIG.actions, systemInstruction: string | undefined, task: (model: any, config: any) => Promise<any>) => {
            const config = GEMINI_CONFIG.actions[actionType];
            const modelsToTry = [config.preferredModel, ...GEMINI_CONFIG.modelPriorities.filter(m => m !== config.preferredModel)];

            let lastError = null;
            for (const modelName of modelsToTry) {
                try {
                    console.log(`[AI_API] Trying ${modelName} for ${actionType}`);
                    const model = genAI.getGenerativeModel({
                        model: modelName,
                        systemInstruction,
                        generationConfig: { temperature: config.temperature }
                    }, { apiVersion: GEMINI_CONFIG.apiVersion as any });

                    // Wrap the actual task execution with retry logic
                    return await withRetry(
                        () => task(model, config),
                        3,
                        `${actionType} with ${modelName}`
                    );
                } catch (err: any) {
                    console.warn(`[AI_API] Model ${modelName} failed after retries: ${err.message}. Trying next model...`);
                    lastError = err;
                }
            }
            throw lastError || new Error(`All models failed for: ${actionType}`);
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

            result = await runWithFallback('summary', undefined, async (model) => {
                const response = await model.generateContent(finalPrompt);
                return response.response.text() || "No summary generated.";
            });
        }

        // --- Action 2: Chat with Transcript ---
        else if (action === 'chat') {
            const { transcript, history, message, recordingIds } = payload;
            let finalContext = '';

            // RAG OPTIMIZATION: If we have specific recording IDs and the context is potentially large, use Semantic Search
            if (recordingIds && Array.isArray(recordingIds) && recordingIds.length > 0) {
                console.log(`[AI_API] Chat with RAG optimization. Searching chunks for ${recordingIds.length} recordings.`);

                try {
                    const model = genAI.getGenerativeModel({ model: GEMINI_CONFIG.actions.embed.preferredModel }, { apiVersion: GEMINI_CONFIG.apiVersion as any });
                    const embedResult = await model.embedContent(message);
                    const queryEmbedding = embedResult.embedding.values;

                    const searchResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/match_recording_chunks`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${supabaseServiceKey}`,
                            'apikey': supabaseServiceKey,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            query_embedding: queryEmbedding,
                            match_threshold: 0.3,
                            match_count: 15,
                            filter_recording_ids: recordingIds
                        })
                    });

                    if (searchResponse.ok) {
                        const matchedChunks = await searchResponse.json();
                        if (matchedChunks && matchedChunks.length > 0) {
                            console.log(`[AI_API] Found ${matchedChunks.length} relevant chunks via RAG.`);
                            finalContext = matchedChunks.map((c: any) => c.content).join('\n---\n');
                        }
                    }
                } catch (ragErr) {
                    console.error('[AI_API] RAG Search failed, falling back to full transcript:', ragErr);
                }
            }

            // Fallback to full transcript if RAG yielded nothing or wasn't used
            if (!finalContext) {
                if (Array.isArray(transcript)) {
                    finalContext = transcript.map((item: any, index: number) => {
                        return `--- RECORDING START [${index + 1}] ---\nTITLE: ${item.title}\nDATE: ${item.date}\nID: ${item.id}\nCONTENT:\n${item.content}\n--- RECORDING END ---`;
                    }).join('\n\n');
                } else {
                    finalContext = typeof transcript === 'string' ? transcript : JSON.stringify(transcript);
                }
            }

            const CHAR_LIMIT = 700000;
            if (finalContext.length > CHAR_LIMIT) {
                console.warn(`[AI_API] Context too large (${finalContext.length} chars). Truncating...`);
                finalContext = finalContext.substring(0, CHAR_LIMIT) + "\n\n[SYSTEM: CONTEXT TRUNCATED DUE TO LENGTH]";
            }

            const systemInstruction = language === 'es'
                ? `Eres Diktalo, un asistente de inteligencia de voz. Responde basándote ÚNICAMENTE en este contexto (recuperado semánticamente si es relevante):\n${finalContext}\n\nREGLAS IMPORTANTES:\n1. NUNCA menciones los "Document ID" o UUIDs en tu respuesta visible.\n2. Si citas algo, menciona "En la grabación [Título]" o "En la reunión del [Fecha]".\n3. Si analizas múltiples grabaciones, busca patrones y conexiones entre ellas.\n4. Si el usuario pide abrir una grabación, termina con: [OPEN_RECORDING: id].`
                : `You are Diktalo. Answer based ONLY on this context (retrieved via similarity search if relevant):\n${finalContext}\n\nIMPORTANT RULES:\n1. NEVER mention "Document IDs".\n2. Refer to recordings by Title or Date.\n3. Identify patterns across multiple recordings.\n4. If asked to open one, end with: [OPEN_RECORDING: id].`;

            result = await runWithFallback('chat', systemInstruction, async (model) => {
                const chat = model.startChat({
                    history: history.map((h: any) => ({ role: h.role, parts: [{ text: h.text }] })),
                });
                const response = await chat.sendMessage(message);
                return response.response.text();
            });
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

            const audioBufferSize = Buffer.from(finalBase64, 'base64').length;
            const audioSizeMB = audioBufferSize / 1024 / 1024;
            console.log(`[AI_API] Audio Size: ${audioSizeMB.toFixed(2)}MB, Mime: ${mimeType}`);

            // CRITICAL: Vercel Free/Hobby has 10s timeout, Pro has 60s max
            // Gemini can handle up to 20MB but it takes time
            // For Vercel stability, we limit to 10MB (~10 minutes of audio)
            if (audioBufferSize > 10 * 1024 * 1024) {
                console.error(`[AI_API] Audio file too large: ${audioSizeMB.toFixed(2)}MB`);
                throw new Error(`Audio file is too large (${audioSizeMB.toFixed(2)}MB). Maximum size is 10MB for reliable processing. Please split your audio into smaller segments.`);
            }

            if (audioBufferSize > 20 * 1024 * 1024) {
                console.warn('[AI_API] Audio file exceeds 20MB limit for inlineData. This might fail.');
                // In Phase 5, implement File API upload here
            }

            const languageNames: Record<string, string> = {
                'es': 'Spanish', 'en': 'English', 'de': 'German', 'it': 'Italian', 'pt': 'Portuguese'
            };
            const targetLanguageName = languageNames[language] || 'English';

            result = await runWithFallback('transcription', undefined, async (model) => {
                const response = await model.generateContent({
                    contents: [{
                        parts: [
                            { inlineData: { mimeType: mimeType || 'audio/mp3', data: finalBase64 } },
                            {
                                text: `Transcribe this audio conversation. 
 CRITICAL INSTRUCTION: The output MUST be entirely in ${targetLanguageName}. 
 If the audio contains any other language, you MUST translate it accurately into ${targetLanguageName} while transcribing. 
 
 Return a JSON object with:
 1. 'segments': An array of objects. Each object must have: 'timestamp' (MM:SS), 'speaker' (e.g. SPEAKER_0, SPEAKER_1), and 'text'.
 2. 'suggestedSpeakers': A dictionary mapping the speaker IDs (e.g. SPEAKER_0) to a real name if you can identify it from the conversation context. If you can't identify a name, use the ID itself.` }
                        ]
                    }],
                    generationConfig: { responseMimeType: 'application/json' }
                });
                return response.response.text() || "[]";
            });

            let sanitizedText = result;
            try {
                result = JSON.parse(sanitizedText);
            } catch (parseError) {
                console.warn('[AI_API] JSON parse failed, attempting to sanitize control characters...');
                sanitizedText = sanitizedText.replace(/[\x00-\x1F\x7F]/g, (char) => {
                    if (char === '\n' || char === '\r' || char === '\t') return char;
                    return '';
                });
                const jsonMatch = sanitizedText.match(/```json\s*([\s\S]*?)\s*```/);
                if (jsonMatch) sanitizedText = jsonMatch[1];
                sanitizedText = sanitizedText.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}');
                try {
                    result = JSON.parse(sanitizedText);
                } catch (retryError) {
                    console.error('[AI_API] Sanitization failed, returning empty structure.');
                    result = { segments: [], suggestedSpeakers: {} };
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

            result = await runWithFallback('support', systemInstruction, async (model) => {
                const chat = model.startChat({
                    history: validHistory
                });
                const response = await chat.sendMessage(message);
                return response.response.text();
            });
        }

        // --- Action 5: Text Embeddings ---
        else if (action === 'embed') {
            const { text } = payload;
            if (!text) throw new Error('No text provided for embedding');

            console.log(`[AI_API] Generating embedding for text (${text.length} chars)`);
            const embedWithFallback = async (text: string) => {
                try {
                    const model = genAI.getGenerativeModel({
                        model: GEMINI_CONFIG.actions.embed.preferredModel
                    }, { apiVersion: GEMINI_CONFIG.apiVersion as any });
                    return await model.embedContent(text);
                } catch (err: any) {
                    console.warn(`[AI_API] Embedding optimization failed with ${GEMINI_CONFIG.actions.embed.preferredModel}. Falling back to embedding-001. Error: ${err.message}`);
                    const fallbackModel = genAI.getGenerativeModel({ model: 'embedding-001' }, { apiVersion: GEMINI_CONFIG.apiVersion as any });
                    return await fallbackModel.embedContent(text);
                }
            };

            const embedResult = await embedWithFallback(text);
            result = embedResult.embedding.values;
        }

        // --- Action 6: Sync RAG (Chunking + Embedding) ---
        else if (action === 'sync-rag') {
            const { recordingId, transcript, userId } = payload;
            if (!recordingId || !transcript || !userId) throw new Error('Missing recordingId, transcript or userId');

            const { chunkText } = await import('./_utils/chunker');
            const chunks = chunkText(transcript, 1000); // chunk size ~1000 chars

            console.log(`[AI_API] Syncing RAG for recording ${recordingId}. Created ${chunks.length} chunks.`);

            const model = genAI.getGenerativeModel({
                model: GEMINI_CONFIG.actions.embed.preferredModel
            }, { apiVersion: GEMINI_CONFIG.apiVersion as any });

            const results = [];
            for (const chunk of chunks) {
                const embedResult = await model.embedContent(chunk.text);
                const embedding = embedResult.embedding.values;

                const dbResponse = await fetch(`${supabaseUrl}/rest/v1/recording_chunks`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${supabaseServiceKey}`,
                        'apikey': supabaseServiceKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        recording_id: recordingId,
                        user_id: userId,
                        chunk_index: chunk.index,
                        content: chunk.text,
                        embedding: embedding
                    })
                });

                if (dbResponse.ok) {
                    results.push(chunk.index);
                } else {
                    const err = await dbResponse.text();
                    console.error(`[AI_API] Chunk ${chunk.index} save failed:`, err);
                }
            }
            result = { synced: results.length, total: chunks.length };
        }

        else {
            throw new Error('Invalid action');
        }

        return res.status(200).json({ data: result });

    } catch (error: any) {
        console.error('AI Service Error:', error);
        Sentry.captureException(error, {
            extra: {
                action,
                payloadSize: JSON.stringify(payload || {}).length,
                language
            }
        });

        // Ensure we ALWAYS return JSON to avoid frontend crashes
        return res.status(500).json({
            error: error.message || 'Error processing AI request',
            details: error.stack ? error.stack.substring(0, 500) : 'No stack trace'
        });
    }
}
