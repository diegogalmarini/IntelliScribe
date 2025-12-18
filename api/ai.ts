import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize AI only on the server
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

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

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Server Error: Missing API Key configuration.' });
    }

    try {
        let result;

        // --- Action 1: Meeting Summary ---
        if (action === 'summary') {
            const { transcript } = payload;
            const prompt = language === 'es'
                ? `Eres un asistente ejecutivo experto. Analiza la siguiente transcripción de reunión y proporciona un resumen estructurado que incluya: 1. Resumen Ejecutivo, 2. Decisiones Clave, 3. Tareas (Action Items). Usa formato Markdown y responde en ESPAÑOL.\n\nTranscript:\n${transcript}`
                : `You are an expert executive assistant. Analyze the following meeting transcript and provide a structured summary including: 1. Executive Summary, 2. Key Decisions, 3. Action Items. Use Markdown formatting.\n\nTranscript:\n${transcript}`;

            const response = await genAI.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
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
                model: 'gemini-2.5-flash',
                config: { systemInstruction },
                history: history.map((h: any) => ({ role: h.role, parts: [{ text: h.text }] }))
            });
            const response = await chat.sendMessage({ message });
            result = response.text;
        }

        // --- Action 3: Audio Transcription ---
        else if (action === 'transcribe') {
            const { audioBase64, mimeType } = payload;
            const response = await genAI.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [
                        { inlineData: { mimeType: mimeType || 'audio/mp3', data: audioBase64 } },
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
