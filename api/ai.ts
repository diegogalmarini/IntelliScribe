import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateEnv } from "./_utils/env-validator.js";
import { initSentry, Sentry } from "./_utils/sentry.js";
import { requireAuth } from "./_utils/auth.js";
import { GEMINI_CONFIG, EMBEDDING_DIMENSIONS, createRunner } from "./_utils/gemini.js";
import { resolveTemplatePrompt } from "../constants/aiPrompts.js";
import { enforceRateLimit, RATE_RULES } from "./_utils/rate-limit.js";
import { extraerIdDeYouTube, urlCanonica, duracionDesdeTokens, metadatosPublicos, metadatosDataApi, FPS_TRANSCRIPCION } from "./_utils/youtube.js";

// Initialize Sentry
initSentry();

const ALLOWED_ORIGINS = new Set([
    'https://www.diktalo.com',
    'https://diktalo.com'
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const origin = req.headers.origin as string | undefined;
    res.setHeader('Access-Control-Allow-Origin',
        origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://www.diktalo.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Todas las acciones de este endpoint exigen sesión. El chatbot de soporte,
    // que es la única que debe seguir siendo pública, vive en api/support-chat.ts.
    const user = await requireAuth(req, res, 'ai');
    if (!user) return;

    const { action, payload, language = 'en' } = req.body || {};
    console.log(`[AI_API] Petición de ${user.id}. Acción: ${action}`);

    // La transcripción es la acción que cuesta dinero por petición, así que ahí
    // se falla en cerrado. El resto lleva un límite más holgado y fail-open.
    const rateOk = (action === 'transcribe' || action === 'transcribe-youtube')
        ? await enforceRateLimit(req, res, 'ai:transcribe', { userId: user.id }, RATE_RULES.transcribe, { failClosed: true })
        : await enforceRateLimit(req, res, 'ai', { userId: user.id }, RATE_RULES.ai);
    if (!rateOk) return;

    let env;
    try {
        env = validateEnv(['base', 'ai']);
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }

    const { GEMINI_API_KEY, SUPABASE_URL: supabaseUrl, SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey } = env;

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

        const runWithFallback = createRunner(genAI);

        let result;

        // --- Action 1: Meeting Summary ---
        if (action === 'summary') {
            const { transcript, template: templateId = 'general', attachments } = payload;

            // El prompt se resuelve en servidor desde el identificador de plantilla.
            // constants/aiPrompts.ts es el modulo compartido con la UI.
            const systemPrompt = resolveTemplatePrompt(templateId, language);

            let visualContext = '';
            if (attachments && Array.isArray(attachments) && attachments.length > 0) {
                const attachmentList = attachments.map((a: any) => `- Time: ${a.time} | URL: ${a.url}`).join('\n');
                const instruction = language === 'es'
                    ? `\n\n[CONTEXTO VISUAL]\nSe capturaron las siguientes capturas de pantalla durante la reunión:\n${attachmentList}\n\nINSTRUCCIÓN: Si el contenido de la transcripción coincide con el tiempo de una captura, DEBES insertar la imagen en el resumen usando el formato markdown: \n![Contexto Visual](url)\nInsértala justo después del párrafo relevante.`
                    : `\n\n[VISUAL CONTEXT]\nThe following screenshots were captured during the meeting:\n${attachmentList}\n\nINSTRUCTION: If the transcript content aligns with the timestamp of a screenshot, you MUST insert the image into the summary using markdown format: \n![Visual Context](url)\nInsert it right after the relevant paragraph.`;
                visualContext = instruction;
            }

            const targetLangLabel = language === 'es' ? 'ESPAÑOL (SPANISH)' : 'ENGLISH';
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
                    // outputDimensionality es obligatorio: sin él el vector sale de 3072
                    // dimensiones y la RPC, que espera VECTOR(768), rechaza la consulta.
                    // El catch de abajo se lo tragaba y el chat caía al transcript completo,
                    // así que la búsqueda semántica nunca llegó a funcionar.
                    const embedResult = await model.embedContent({
                        content: { role: 'user', parts: [{ text: message }] },
                        outputDimensionality: EMBEDDING_DIMENSIONS
                    } as any);
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
                            filter_recording_ids: recordingIds,
                            // Se llama con service role, así que la RLS no aplica: sin este
                            // filtro bastaba conocer un UUID de grabación ajena para leer
                            // sus fragmentos.
                            filter_user_id: user.id
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
                // Solo se descarga del bucket propio y con service role. Antes, si la
                // URL no era de Supabase se hacía fetch() contra ella tal cual, lo que
                // convertía el endpoint en un proxy de peticiones salientes; y aunque
                // fuera de Supabase, no se comprobaba de quién era el fichero.
                if (!audioUrl.includes('supabase.co/storage/v1/object/')) {
                    throw new Error('audioUrl no apunta al almacenamiento de Diktalo');
                }

                const pathParts = audioUrl.split('/recordings/');
                if (pathParts.length < 2) {
                    throw new Error('audioUrl no corresponde al bucket de grabaciones');
                }

                const filePath = decodeURIComponent(pathParts[1]).split('?')[0];

                // Las rutas del bucket son `${userId}/fichero`. Cualquier otra cosa
                // —incluido un ../— es un intento de leer material ajeno.
                if (!filePath.startsWith(`${user.id}/`) || filePath.includes('..')) {
                    console.warn(`[AI_API] Ruta rechazada para ${user.id}: ${filePath}`);
                    throw new Error('No autorizado para acceder a ese audio');
                }

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

            // Note: Files >10MB are already rejected above. For files >20MB, use File API (future Phase 5).

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
 
 SPEAKER IDENTIFICATION:
 - Analyze the audio for names (e.g., "Hi Diego", "This is Natalia").
 - If a name is mentioned, associate it with the speaker's voice.
 - In 'suggestedSpeakers', map the generic ID (SPEAKER_00) to the Real Name (Diego).
 
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

        // --- Action: transcribir un video de YouTube por URL ---
        //
        // Gemini ingiere la URL de forma nativa: Diktalo nunca descarga ni aloja
        // el video. Ver api/_utils/youtube.ts para por que solo YouTube.
        else if (action === 'transcribe-youtube') {
            const videoId = extraerIdDeYouTube(payload?.url);
            if (!videoId) {
                return res.status(400).json({ error: 'INVALID_YOUTUBE_URL' });
            }

            // La URL que viaja a Gemini se construye desde el id ya validado, no
            // se reenvia la cadena del cliente: asi ningun parametro suyo sale de
            // aqui. Mismo criterio que el arreglo del SSRF en `transcribe`.
            const videoUrl = urlCanonica(videoId);

            // Cuota. Sin la Data API de YouTube no se puede saber la duracion
            // ANTES de procesar, asi que aqui solo se comprueba que quede algo y
            // se cobra lo realmente consumido despues.
            const perfilRes = await fetch(
                `${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=minutes_used,minutes_limit,extra_minutes`,
                { headers: { Authorization: `Bearer ${supabaseServiceKey}`, apikey: supabaseServiceKey } }
            );
            const perfil = perfilRes.ok ? (await perfilRes.json())[0] : null;
            const ilimitado = !perfil || perfil.minutes_limit === -1;
            const disponibles = ilimitado
                ? Infinity
                : (perfil.minutes_limit || 0) + (perfil.extra_minutes || 0) - (perfil.minutes_used || 0);

            if (disponibles <= 0) {
                return res.status(403).json({ error: 'QUOTA_EXCEEDED' });
            }

            // Vuelo previo con la Data API: da la duracion REAL antes de gastar un
            // solo token. Devuelve null si la API no esta disponible —por ejemplo
            // con una clave restringida a la Generative Language API—, y entonces
            // se degrada al comportamiento anterior: se procesa y se cobra despues.
            const previo = await metadatosDataApi(videoId);

            if (previo) {
                if (previo.privado) {
                    return res.status(404).json({ error: 'VIDEO_UNAVAILABLE' });
                }
                if (previo.enDirecto) {
                    return res.status(400).json({ error: 'VIDEO_IS_LIVE' });
                }
                if (previo.duracionSegundos !== null && !ilimitado) {
                    const minutosNecesarios = Math.max(1, Math.ceil(previo.duracionSegundos / 60));
                    if (minutosNecesarios > disponibles) {
                        return res.status(403).json({
                            error: 'VIDEO_TOO_LONG',
                            necesarios: minutosNecesarios,
                            disponibles
                        });
                    }
                }
            }

            const nombresIdioma: Record<string, string> = {
                es: 'Spanish', en: 'English', de: 'German', it: 'Italian', pt: 'Portuguese'
            };
            const idiomaDestino = nombresIdioma[language] || 'English';

            const salida = await runWithFallback('transcription', undefined, async (model) => {
                const response = await model.generateContent({
                    contents: [{
                        role: 'user',
                        parts: [
                            {
                                fileData: { fileUri: videoUrl, mimeType: 'video/*' },
                                // 0.1 fps en vez del valor por defecto: medido, baja
                                // el gasto 2,9x sin perder transcripcion, porque lo
                                // que importa es el audio y no los fotogramas.
                                videoMetadata: { fps: FPS_TRANSCRIPCION }
                            },
                            {
                                text: `Transcribe the spoken audio of this video.
 CRITICAL: The output MUST be entirely in ${idiomaDestino}. Translate if the audio is in another language.
 Do NOT add any preamble, introduction or closing remark: return ONLY the JSON object.

 SPEAKER IDENTIFICATION:
 - Identify distinct speakers and label them SPEAKER_0, SPEAKER_1, ...
 - If a name is said out loud, map the ID to that real name in 'suggestedSpeakers'.

 Return a JSON object with:
 1. 'segments': array of objects with 'timestamp' (MM:SS), 'speaker' and 'text'.
 2. 'suggestedSpeakers': dictionary mapping speaker IDs to real names.`
                            }
                        ]
                    }],
                    generationConfig: { responseMimeType: 'application/json' }
                });
                const detalles = response.response?.usageMetadata?.promptTokensDetails || [];
                const video = detalles.find((d: any) => d.modality === 'VIDEO');
                return { texto: response.response.text() || '{}', tokensVideo: video?.tokenCount || 0 };
            });

            let datos: any;
            try {
                datos = JSON.parse(salida.texto);
            } catch {
                // Mismo saneado que `transcribe`: el modelo a veces envuelve el
                // JSON en un bloque de codigo o deja una coma colgando.
                const limpio = salida.texto
                    .replace(/```json\s*([\s\S]*?)\s*```/, '$1')
                    .replace(/,\s*]/g, ']')
                    .replace(/,\s*}/g, '}');
                try { datos = JSON.parse(limpio); } catch { datos = { segments: [], suggestedSpeakers: {} }; }
            }

            // La duracion de la Data API es exacta; la derivada de tokens tiene un
            // error medido del 0,8%. Se prefiere la primera cuando esta disponible.
            const durationSeconds = previo?.duracionSegundos ?? duracionDesdeTokens(salida.tokensVideo);

            // Cobro en SERVIDOR. La ruta de subida de audio lo hace en el cliente
            // y solo sobre el estado de React, asi que no se persiste; aqui no
            // depende del navegador y no se puede saltar.
            if (durationSeconds > 0) {
                const minutos = Math.max(1, Math.ceil(durationSeconds / 60));
                const cobro = await fetch(`${supabaseUrl}/rest/v1/rpc/increment_user_usage`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${supabaseServiceKey}`,
                        apikey: supabaseServiceKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ p_user_id: user.id, p_minutes: minutos })
                });
                if (!cobro.ok) {
                    console.error(`[AI_API] No se pudo cobrar ${minutos} min a ${user.id}: ${cobro.status}`);
                    Sentry.captureMessage(`[YT] Cobro de minutos fallido para ${user.id}`, 'error');
                }
            }

            // Si el vuelo previo ya trajo el titulo, no hace falta ir a oEmbed.
            const meta = previo?.titulo ? { titulo: previo.titulo, autor: previo.autor } : await metadatosPublicos(videoId);

            result = {
                segments: Array.isArray(datos?.segments) ? datos.segments : [],
                suggestedSpeakers: datos?.suggestedSpeakers || {},
                durationSeconds,
                title: meta?.titulo || `YouTube ${videoId}`,
                author: meta?.autor || '',
                sourceUrl: videoUrl
            };
        }

        // --- Action: Traduccion de contenido dinamico de BD ---
        // Vive aqui y no en el cliente porque services/aiTranslationService.ts
        // instanciaba GoogleGenerativeAI en el navegador con VITE_GEMINI_API_KEY.
        // Esa variable no existe, asi que el servicio lleva fallando en silencio
        // desde abril; definirla habria publicado la clave en el bundle.
        else if (action === 'translate') {
            const { text, targetLang } = payload || {};
            if (!text || typeof text !== 'string') throw new Error('No text provided for translation');
            if (targetLang !== 'en' && targetLang !== 'es') throw new Error('targetLang must be "en" or "es"');
            if (text.length > 20_000) throw new Error('Text too long to translate');

            const prompt = targetLang === 'en'
                ? `Translate this Spanish text to professional English for a SaaS product. Maintain the same tone and technical terms. Only return the translation, nothing else:

${text}`
                : `Traduce este texto en ingles a espanol profesional para un producto SaaS. Manten el mismo tono y terminos tecnicos. Solo devuelve la traduccion:

${text}`;

            result = await runWithFallback('summary', undefined, async (model) => {
                const response = await model.generateContent(prompt);
                return response.response.text().trim();
            });
        }

        // --- Action 5: Text Embeddings ---
        else if (action === 'embed') {
            const { text } = payload;
            if (!text) throw new Error('No text provided for embedding');

            console.log(`[AI_API] Generating embedding for text (${text.length} chars)`);
            // Sin fallback: `embedding-001` es de la familia 1.0, prohibida, y además
            // genera vectores de otro espacio que corromperían el índice al mezclarse
            // con los ya almacenados. Si el modelo correcto falla, se falla.
            const embedModel = genAI.getGenerativeModel({
                model: GEMINI_CONFIG.actions.embed.preferredModel
            }, { apiVersion: GEMINI_CONFIG.apiVersion as any });

            const embedResult = await embedModel.embedContent({
                content: { role: 'user', parts: [{ text }] },
                outputDimensionality: EMBEDDING_DIMENSIONS
            } as any);
            result = embedResult.embedding.values;
        }

        // --- Action 6: Sync RAG (Chunking + Embedding) ---
        else if (action === 'sync-rag') {
            const { recordingId, transcript } = payload;
            if (!recordingId || !transcript) throw new Error('Missing recordingId or transcript');

            // El userId sale del token: antes venía en el payload y permitía insertar
            // fragmentos a nombre de cualquier cuenta.
            const userId = user.id;

            const ownerCheck = await fetch(
                `${supabaseUrl}/rest/v1/recordings?id=eq.${encodeURIComponent(recordingId)}&user_id=eq.${userId}&select=id`,
                { headers: { 'Authorization': `Bearer ${supabaseServiceKey}`, 'apikey': supabaseServiceKey } }
            );
            const owned = ownerCheck.ok ? await ownerCheck.json() : [];
            if (!Array.isArray(owned) || owned.length === 0) {
                console.warn(`[AI_API] sync-rag rechazado: ${userId} no es dueño de ${recordingId}`);
                throw new Error('No autorizado para indexar esa grabación');
            }

            const { chunkText } = await import('./_utils/chunker');
            const chunks = chunkText(transcript, 1000); // chunk size ~1000 chars

            console.log(`[AI_API] Syncing RAG for recording ${recordingId}. Created ${chunks.length} chunks.`);

            const model = genAI.getGenerativeModel({
                model: GEMINI_CONFIG.actions.embed.preferredModel
            }, { apiVersion: GEMINI_CONFIG.apiVersion as any });

            const results = [];
            for (const chunk of chunks) {
                // Sin fallback a modelos muertos: un vector de otro espacio en la misma
                // tabla rompe la búsqueda semántica en silencio.
                const embedResult = await model.embedContent({
                    content: { role: 'user', parts: [{ text: chunk.text }] },
                    outputDimensionality: EMBEDDING_DIMENSIONS
                } as any);
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
