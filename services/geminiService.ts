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
      throw new Error(errorData.error || 'AI Service Error');
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error(`API Call Failed (${action}):`, error);
    return null;
  }
};

export const generateMeetingSummary = async (transcript: string, language: 'en' | 'es' = 'en'): Promise<string> => {
  const result = await callAIEndpoint('summary', { transcript }, language);
  return result || (language === 'es' ? "Error generando resumen." : "Error generating summary.");
};

export const chatWithTranscript = async (
  transcript: string,
  history: { role: 'user' | 'model', text: string }[],
  newMessage: string,
  language: 'en' | 'es' = 'en'
): Promise<string> => {
  const result = await callAIEndpoint('chat', { transcript, history, message: newMessage }, language);
  return result || (language === 'es' ? "No pude responder." : "I couldn't generate a response.");
};

export const transcribeAudio = async (
  audioBase64?: string,
  mimeType?: string,
  language: 'en' | 'es' = 'en',
  audioUrl?: string
): Promise<Partial<TranscriptSegment>[]> => {
  const result = await callAIEndpoint('transcribe', { audioBase64, mimeType, audioUrl }, language);
  return result || [];
};
