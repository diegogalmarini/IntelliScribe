import { TranscriptSegment } from "../types";

// Helper to call our secure backend
const callAIEndpoint = async (action: string, payload: any, language: 'en' | 'es') => {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload, language }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `AI Service Error (${response.status})`);
    }

    const json = await response.json();
    return json.data;
  } catch (error: any) {
    console.error(`API Call Failed (${action}):`, error);
    throw error; // Throw so UI can handle retry
  }
};

export const generateMeetingSummary = async (transcript: string, language: 'en' | 'es' = 'en', template: string = 'general'): Promise<string> => {
  try {
    const result = await callAIEndpoint('summary', { transcript, template }, language);
    if (!result) throw new Error("No output from AI");
    return result;
  } catch (error: any) {
    throw new Error(language === 'es' ? "Error al generar el resumen de la reunión. Intente de nuevo." : "Failed to generate meeting summary. Please try again.");
  }
};

export const chatWithTranscript = async (
  transcript: string,
  history: { role: 'user' | 'model', text: string }[],
  newMessage: string,
  language: 'en' | 'es' = 'en'
): Promise<string> => {
  try {
    const result = await callAIEndpoint('chat', { transcript, history, message: newMessage }, language);
    if (!result) throw new Error("No output from AI");
    return result;
  } catch (error: any) {
    throw new Error(language === 'es' ? "Lo siento, hubo un error al procesar tu mensaje." : "Sorry, there was an error processing your message.");
  }
};

export const transcribeAudio = async (
  audioBase64?: string,
  mimeType?: string,
  language: 'en' | 'es' = 'en',
  audioUrl?: string
): Promise<Partial<TranscriptSegment>[]> => {
  try {
    const result = await callAIEndpoint('transcribe', { audioBase64, mimeType, audioUrl }, language);
    return result || [];
  } catch (error) {
    console.error("Transcription failed:", error);
    return []; // Return empty for legacy compatibility or allow UI to handle
  }
};
