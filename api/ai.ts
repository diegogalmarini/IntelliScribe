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
            const { transcript, template = 'general' } = payload;

            let systemPrompt = '';

            // Templates Definition (Replicated from shared constants)
            const templates: Record<string, { es: string, en: string }> = {
                'adaptive': {
                    es: `Eres una IA adaptativa inteligente. Tu objetivo es "Adaptive Structure & All-Scene Adaptation". Analiza el contenido y selecciona AUTOMÁTICAMENTE la mejor estructura de resumen basada en el tipo de audio (reunión, entrevista, clase, monólogo, etc.). Genera un resumen inteligente que se adapte perfectamente al escenario detectado.`,
                    en: `You are an intelligent adaptive AI. Your goal is "Adaptive Structure & All-Scene Adaptation". Analyze the content and AUTOMATICALLY select the best summary structure based on the audio type (meeting, interview, lecture, monologue, etc.). Generate an intelligent summary that perfectly adapts to the detected scenario.`
                },
                'reasoning': {
                    es: `Eres una IA de inferencia lógica ("Reasoning Autopilot"). Utiliza "Intelligent Inference" para deducir y generar la estructura de resumen más adecuada. Ajusta tu análisis en tiempo real ("Dynamic Optimization") para equilibrar eficiencia y precisión. Crea un resumen claro y lógico basado en las notas transcritas.`,
                    en: `You are a logical inference AI ("Reasoning Autopilot"). Use "Intelligent Inference" to deduce and generate the most suitable summary structure. Adjust your analysis in real-time ("Dynamic Optimization") to balance efficiency and accuracy. Create a clear, logical summary based on the transcribed notes.`
                },
                'detailed': {
                    es: `Objetivo: Resumen altamente detallado y limpio. 1. Conversation Summary: Párrafo general del propósito de la llamada. 2. Action Items: Lista tareas con descripción. Usa etiquetas como [URGENT], [QUOTE] si aplica. 3. Follow-Ups: A quién contactar y cuándo. Etiqueta [FOLLOW-UP]. 4. Key Details: Extrae Nombres, Teléfonos, Direcciones, Fechas. Sé extremadamente preciso y organizado.`,
                    en: `Goal: Highly detailed and clean summary. 1. Conversation Summary: General paragraph of the call's purpose. 2. Action Items: List tasks with descriptions. Use tags like [URGENT], [QUOTE] if applicable. 3. Follow-Ups: Who to contact and when. Tag [FOLLOW-UP]. 4. Key Details: Extract Names, Phone Numbers, Addresses, Dates. Be extremely precise and organized.`
                },
                'verbatim': {
                    es: `TU ÚNICA TAREA ES CORREGIR Y FORMATEAR LA TRANSCRIPCIÓN LITERAL. - NO resumas. NO interpretes. NO opines. - Mantén el orden cronológico exacto. - Identifica hablantes (e.g., "Hablante 1:", "Hablante 2:") si es posible. - El texto debe ser una transcripción textual completa, limpia y legible.`,
                    en: `YOUR ONLY TASK IS TO CORRECT AND FORMAT THE VERBATIM TRANSCRIPT. - DO NOT summarize. DO NOT interpret. DO NOT opine. - Maintain exact chronological order. - Identify speakers (e.g., "Speaker 1:", "Speaker 2:") if possible. - The text must be a complete, clean, and readable verbatim transcript.`
                },
                'discussion_meeting': {
                    es: `Eres un redactor de discusiones de equipo. Para cada tema tratado: 1. Topic: Título del tema. 2. Conclusion: La conclusión alcanzada. 3. Next Steps: Pasos a seguir basados en la conclusión. 4. Discussion Points: Puntos de vista, hechos o argumentos presentados. Estructura claramente por temas.`,
                    en: `You are a team discussion writer. For each topic discussed: 1. Topic: Title of the topic. 2. Conclusion: The conclusion reached. 3. Next Steps: Action items based on the conclusion. 4. Discussion Points: Viewpoints, facts, or arguments presented. Structure clearly by topics.`
                },
                'meeting_note': {
                    es: `Genera una Nota de Reunión estructurada: ⏰ Meeting Information: Extrae fecha, hora, lugar y asistentes si se mencionan. 📝 Meeting Notes: Desglosa por Tópicos y Subtópicos. Para cada uno da una descripción breve y Conclusiones. 📅 Next Arrangements: Lista clara de Action Items.`,
                    en: `Generate a structured Meeting Note: ⏰ Meeting Information: Extract date, time, location, and attendees if mentioned. 📝 Meeting Notes: Break down by Topics and Subtopics. For each, give a brief description and Conclusions. 📅 Next Arrangements: Clear list of Action Items.`
                },
                'call_discussion': {
                    es: `Analiza esta llamada ("Discussion CALL"). Para cada punto discutido: 1. Description: Descripción detallada. 2. Conclusions: Conclusiones y to-dos. 3. Reasons: Razones que apoyan la conclusión. Formato estructurado y lógico.`,
                    en: `Analyze this call ("Discussion CALL"). For each discussion point: 1. Description: Detailed description. 2. Conclusions: Conclusions and action items (to-dos). 3. Reasons: Reasons supporting the conclusion. Structured and logical format.`
                },
                'sales_bant': {
                    es: `Eres un consultor de ventas experto. Analiza usando BANT. Identifica: Budget, Authority, Need, Timing. Sugiere próximos pasos.`,
                    en: `You are an expert sales consultant. Analyze using BANT. Identify: Budget, Authority, Need, Timing. Suggest next steps.`
                },
                'university_lecture': {
                    es: `Transforma la lección en un capítulo de manual universitario claro y profundo. - Organiza en secciones lógicas con títulos. - Explica cada concepto con tono didáctico y fluido. - Añade ejemplos prácticos y analogías. - Relaciona con otros temas (curiosidades científicas/históricas). - Al final: Schema Riassuntivo con palabras clave.`,
                    en: `Transform the lecture into a clear, in-depth useriversity textbook chapter. - Organize into logical sections with titles. - Explain each concept with a didactic and fluid tone. - Add practical examples and analogies. - Relate to other topics (scientific/historical curiosities). - At the end: Summary Schema with key words.`
                },
                'class_note': {
                    es: `Genera notas de clase ("Class Note"): - Class Info (Materia, Fecha, etc). - Keywords (Palabras clave). - Key Learnings (Puntos de conocimiento). - Explanations: Detalle, análisis, derivación de fórmulas. - Examples: Descripción de ejemplos dados. - Assignments: Tareas asignadas.`,
                    en: `Generate Class Notes: - Class Info (Course, Date, etc). - Keywords. - Key Learnings. - Explanations: Detail, analysis, derivation. - Examples: Description of examples provided. - Assignments.`
                },
                'medical_soap': {
                    es: `Genera nota SOAP (Subjetivo, Objetivo, Evaluación, Plan). Tono clínico profesional.`,
                    en: `Generate SOAP note (Subjective, Objective, Assessment, Plan). Professional clinical tone.`
                },
                'legal': {
                    es: `Abogado senior. Extrae: hechos relevantes, riesgos legales, estrategia/próximos pasos. Lenguaje jurídico.`,
                    en: `Senior attorney. Extract: relevant facts, legal risks, strategy/next steps. Legal terminology.`
                },
                'hr_interview': {
                    es: `Recrutador experto. Analiza: Perfil, Competencias, Ajuste Cultural, Recomendación.`,
                    en: `Expert recruiter. Analyze: Profile, Competencies, Culture Fit, Recommendation.`
                },
                'product_ux': {
                    es: `Product Manager. Analiza: Citas clave, Pain Points, Feature Requests, Sentimiento General.`,
                    en: `Product Manager. Analyze: Key Quotes, Pain Points, Feature Requests, General Sentiment.`
                },
                'journalism': {
                    es: `Periodista de investigación. Extrae: Titulares, Citas textuales (verbatim), Narrativa de hechos.`,
                    en: `Investigative journalist. Extract: Headlines, Verbatim quotes, Facts narrative.`
                },
                'research': {
                    es: `Investigador académico. Sintetiza: Hipótesis, Metodología, Hallazgos, Research Gaps.`,
                    en: `Academic researcher. Synthesize: Hypotheses, Methodology, Findings, Research Gaps.`
                },
                'general': {
                    es: `Eres un asistente ejecutivo experto. Analiza la siguiente transcripción y proporciona un resumen estructurado que incluya: 1. Resumen Ejecutivo, 2. Puntos Clave, 3. Conclusiones. Usa formato Markdown y responde en ESPAÑOL.`,
                    en: `You are an expert executive assistant. Analyze the following transcript and provide a structured summary including: 1. Executive Summary, 2. Key Points, 3. Conclusions. Use Markdown formatting.`
                }
            };

            const selectedTemplate = templates[template] || templates['general'];
            systemPrompt = language === 'es' ? selectedTemplate.es : selectedTemplate.en;

            const finalPrompt = `${systemPrompt}\n\nTranscript:\n${transcript}`;

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

        else {
            throw new Error('Invalid action');
        }

        return res.status(200).json({ data: result });

    } catch (error: any) {
        console.error('AI Service Error:', error);
        return res.status(500).json({ error: error.message || 'Error processing AI request' });
    }
}
