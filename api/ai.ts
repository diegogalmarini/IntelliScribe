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
                'general': {
                    es: `Eres un asistente ejecutivo experto. Analiza la siguiente transcripción y proporciona un resumen estructurado que incluya: 1. Resumen Ejecutivo, 2. Puntos Clave, 3. Conclusiones. Usa formato Markdown y responde en ESPAÑOL.`,
                    en: `You are an expert executive assistant. Analyze the following transcript and provide a structured summary including: 1. Executive Summary, 2. Key Points, 3. Conclusions. Use Markdown formatting.`
                },
                'meeting': {
                    es: `Eres un secretario de actas profesional. Analiza esta reunión y genera: 1. Agenda/Temas tratados, 2. Decisiones tomadas, 3. Action Items (Tareas Pendientes) con responsables si los hay. Usa Markdown claro.`,
                    en: `You are a professional minute-taker. Analyze this meeting and generate: 1. Agenda/Topics, 2. Decisions Made, 3. Action Items with owners. Use clear Markdown.`
                },
                'sales_bant': {
                    es: `Eres un consultor de ventas experto. Analiza esta llamada usando BANT (Budget, Authority, Need, Timing). Identifica claramente: 1. Presupuesto, 2. Autoridad, 3. Necesidad, 4. Tiempo. Sugiere próximos pasos de cierre.`,
                    en: `You are an expert sales consultant. Analyze this call using BANT (Budget, Authority, Need, Timing). Clearly identify each and suggest closing next steps.`
                },
                'medical_soap': {
                    es: `Eres un médico experto. Genera una nota SOAP (Subjetivo, Objetivo, Evaluación, Plan) profesional basada en esta consulta. Mantén un tono clínico y formal.`,
                    en: `You are an expert physician. Generate a professional SOAP note (Subjective, Objective, Assessment, Plan) based on this consultation. Maintain a clinical tone.`
                },
                'legal': {
                    es: `Eres un abogado senior. Analiza esta conversación y extrae: 1. Hechos fácticos relevantes, 2. Riesgos legales identificados, 3. Estrategia o pasos legales a seguir. Usa lenguaje jurídico preciso.`,
                    en: `You are a senior attorney. Analyze this conversation and extract: 1. Relevant Facts, 2. Legal Risks Identified, 3. Legal Strategy/Next Steps. Use precise legal terminology.`
                },
                'hr_interview': {
                    es: `Eres un reclutador experto. Evalúa al candidato basándote en esta entrevista. Analiza: 1. Perfil, 2. Competencias demostradas, 3. Ajuste cultural, 4. Recomendación fundamentada.`,
                    en: `You are an expert recruiter. Evaluate the candidate based on this interview. Analyze: 1. Profile, 2. Demonstrated Competencies, 3. Culture Fit, 4. Reasoned Recommendation.`
                },
                'product_ux': {
                    es: `Eres un Product Manager. Analiza este feedback/user interview. Extrae: 1. Citas clave del usuario, 2. Pain Points identificados, 3. Solicitudes de funcionalidades, 4. Sentimiento general.`,
                    en: `You are a Product Manager. Analyze this user feedback/interview. Extract: 1. Key User Quotes, 2. Pain Points, 3. Feature Requests, 4. General Sentiment.`
                },
                'education_lecture': {
                    es: `Eres un estudiante de honor. Genera notas de estudio de esta clase: 1. Conceptos y Definiciones (con negritas), 2. Puntos probables de examen, 3. Resumen estructurado.`,
                    en: `You are an honors student. Generate study notes from this lecture: 1. Concepts & Definitions (bold), 2. Likely exam topics, 3. Structured summary.`
                },
                'journalism': {
                    es: `Eres un periodista de investigación. Extrae: 1. Titulares potenciales, 2. Las mejores citas textuales (verbatim), 3. Resumen narrativo de los hechos revelados.`,
                    en: `You are an investigative journalist. Extract: 1. Potential Headlines, 2. Best Direct Quotes (verbatim), 3. Narrative summary of revealed facts.`
                },
                'research': {
                    es: `Eres un investigador académico. Sintetiza la discusión en: 1. Hipótesis, 2. Metodología, 3. Hallazgos, 4. Brechas (Gaps) identificadas en la investigación.`,
                    en: `You are an academic researcher. Synthesize the discussion into: 1. Hypotheses, 2. Methodology, 3. Findings, 4. Research Gaps identified.`
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
            const systemInstruction = language === 'es'
                ? `Eres Diktalo, un asistente. Responde basándote ÚNICAMENTE en este contexto:\n${transcript}`
                : `You are Diktalo. Answer based ONLY on this context:\n${transcript}`;

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

            const response = await genAI.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: {
                    parts: [
                        { inlineData: { mimeType: mimeType || 'audio/mp3', data: finalBase64 } },
                        { text: "Transcribe this audio conversation. Return a JSON array of objects. Each object must have: 'timestamp' (MM:SS), 'speaker', and 'text'." }
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
