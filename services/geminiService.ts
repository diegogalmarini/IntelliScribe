
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { TranscriptSegment } from "../types";

// Safe access to API Key to prevent "process is not defined" crashes in browser
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY || '';
    }
  } catch (e) {
    console.warn("Environment variable access failed", e);
  }
  return '';
};

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const generateMeetingSummary = async (transcript: string, language: 'en' | 'es' = 'en'): Promise<string> => {
  const apiKey = getApiKey();
  
  // Return mock summary if no key to prevent crashing in demo
  if (!apiKey) {
      if (language === 'es') {
          return new Promise(resolve => setTimeout(() => resolve(`## Resumen Ejecutivo
Este es un resumen simulado porque no se configuró ninguna API Key. La reunión se centró en revisar el rendimiento del Q3 y definir objetivos estratégicos para el Q4.

## Decisiones Clave
- **Aprobación de Presupuesto:** El presupuesto de marketing para Q4 ha aumentado un 15%.
- **Cronograma:** El lanzamiento del producto está confirmado para el 15 de noviembre.

## Tareas
1. **Sarah:** Actualizar el tablero de Jira con los nuevos hitos para el viernes.
2. **Mike:** Enviar el contrato revisado al equipo legal.
3. **Todos:** Revisar la nueva documentación de cumplimiento antes de la próxima sincronización.`), 2000));
      }
      return new Promise(resolve => setTimeout(() => resolve(`## Executive Summary
This is a simulated AI summary because no API Key was configured. The meeting focused on reviewing Q3 performance and outlining strategic goals for Q4.

## Key Decisions
- **Budget Approval:** The marketing budget for Q4 has been increased by 15%.
- **Timeline:** The product launch is confirmed for November 15th.

## Action Items
1. **Sarah:** Update the Jira board with new milestones by Friday.
2. **Mike:** Send the revised contract to the legal team.
3. **All:** Review the new compliance documentation before the next sync.`), 2000));
  }

  const prompt = language === 'es' 
    ? `Eres un asistente ejecutivo experto. Analiza la siguiente transcripción de reunión y proporciona un resumen estructurado que incluya: 1. Resumen Ejecutivo, 2. Decisiones Clave, 3. Tareas (Action Items). Usa formato Markdown y responde en ESPAÑOL.`
    : `You are an expert executive assistant. Analyze the following meeting transcript and provide a structured summary including: 1. Executive Summary, 2. Key Decisions, 3. Action Items. Use Markdown formatting.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${prompt}
      
      Transcript:
      ${transcript}`,
      config: {
        temperature: 0.3,
      }
    });
    return response.text || "No summary generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating summary.";
  }
};

export const chatWithTranscript = async (
  transcript: string, 
  history: { role: 'user' | 'model', text: string }[], 
  newMessage: string,
  language: 'en' | 'es' = 'en'
): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return language === 'es' ? "API Key no configurada." : "API Key not configured.";

  const systemInstruction = language === 'es'
    ? `Eres Diktalo, un asistente de inteligencia conversacional. 
        Tienes acceso a la transcripción de una reunión proporcionada a continuación. 
        Responde a las preguntas del usuario basándote ÚNICAMENTE en el contexto de esta transcripción. 
        Si la respuesta no está en la transcripción, indícalo claramente. Responde en ESPAÑOL.
        
        Contexto de Transcripción:
        ${transcript}`
    : `You are Diktalo, a conversational intelligence assistant. 
        You have access to the transcript of a meeting provided below. 
        Answer the user's questions based ONLY on the context of this transcript. 
        If the answer is not in the transcript, state that clearly.
        
        Transcript Context:
        ${transcript}`;

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || (language === 'es' ? "No pude generar una respuesta." : "I couldn't generate a response.");
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return language === 'es' ? "Lo siento, hubo un error procesando tu solicitud." : "Sorry, I encountered an error processing your request.";
  }
};

export const transcribeAudio = async (audioBase64: string, mimeType: string, language: 'en' | 'es' = 'en'): Promise<Partial<TranscriptSegment>[]> => {
    const apiKey = getApiKey();
    // Return mock data if no key to prevent crashing in demo
    if (!apiKey) {
        return new Promise(resolve => setTimeout(() => resolve([
            { timestamp: '00:01', speaker: 'Speaker 1', text: language === 'es' ? 'Esta es una transcripción simulada porque no se encontró API Key.' : 'This is a simulated transcription because no API Key was found.' },
            { timestamp: '00:05', speaker: 'Speaker 2', text: language === 'es' ? 'Por favor configura tu API Key de Gemini en las variables de entorno.' : 'Please configure your Gemini API Key in the environment variables to use real audio transcription.' }
        ]), 2000));
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { 
                        inlineData: { 
                            mimeType: mimeType || 'audio/mp3', // Use detected mimeType or safe default
                            data: audioBase64 
                        } 
                    },
                    { 
                        text: `Transcribe this audio conversation. 
                        Return a JSON array of objects. 
                        Each object must have:
                        - "timestamp" (string in format MM:SS)
                        - "speaker" (string like "Speaker 1", "Speaker 2")
                        - "text" (string, the spoken content)
                        ` 
                    }
                ]
            },
            config: {
                responseMimeType: 'application/json'
            }
        });

        const text = response.text;
        if (!text) throw new Error("Empty response from AI");
        
        return JSON.parse(text);
    } catch (error) {
        console.error("Transcription Error:", error);
        throw error;
    }
};
