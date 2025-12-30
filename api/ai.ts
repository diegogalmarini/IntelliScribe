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

            // Templates Definition
            const templates: Record<string, { es: string, en: string }> = {
                'general': {
                    es: `Eres un asistente ejecutivo experto. Analiza la siguiente transcripción y proporciona un resumen estructurado que incluya: 1. Resumen Ejecutivo, 2. Puntos Clave, 3. Conclusiones. Usa formato Markdown y responde en ESPAÑOL.`,
                    en: `You are an expert executive assistant. Analyze the following transcript and provide a structured summary including: 1. Executive Summary, 2. Key Points, 3. Conclusions. Use Markdown formatting.`
                },
                'meeting': {
                    es: `Eres un secretario de actas profesional. Analiza esta reunión y genera: 1. Agenda/Temas tratados, 2. Decisiones tomadas, 3. Tareas pendientes (Action Items) con responsables si los hay. Usa formato Markdown claro.`,
                    en: `You are a professional minute-taker. Analyze this meeting and generate: 1. Agenda/Topics, 2. Decisions Made, 3. Action Items with owners. Use clear Markdown.`
                },
                'class': {
                    es: `Eres un estudiante de honor. Analiza esta clase/conferencia y extrae: 1. Conceptos Principales (Definiciones), 2. Puntos importantes para el examen, 3. Resumen de la lección. Usa bullet points y negritas para conceptos.`,
                    en: `You are an honors student. Analyze this lecture and extract: 1. Key Concepts (Definitions), 2. Important points for the exam, 3. Lesson Summary. Use bullet points and bold text for concepts.`
                },
                'interview': {
                    es: `Eres un reclutador experto o periodista. Analiza esta entrevista y extrae: 1. Perfil del entrevistado, 2. Preguntas clave y respuestas resumidas, 3. Fortalezas/Debilidades o Puntos de interés.`,
                    en: `You are an expert recruiter or journalist. Analyze this interview and extract: 1. Interviewee Profile, 2. Key Questions & Summarized Answers, 3. Strengths/Weaknesses or Key Insights.`
                },
                'sales': {
                    es: `Eres un consultor de ventas senior. Analiza esta llamada de ventas y detecta: 1. Necesidades/Dolores del cliente, 2. Objeciones, 3. Próximos pasos acordados, 4. Sentimiento general.`,
                    en: `You are a senior sales consultant. Analyze this sales call and identify: 1. Client Needs/Pain Points, 2. Objections, 3. Agreed Next Steps, 4. General Sentiment.`
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
