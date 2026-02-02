import { TranscriptSegment } from "../types";
import { AI_TEMPLATES } from "../constants/templates";

// Helper to call our secure backend
const callAIEndpoint = async (action: string, payload: any, language: string) => {
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

export const generateMeetingSummary = async (transcript: string, language: string = 'en', templateId: string = 'general', attachments?: any[]): Promise<string> => {
  try {
    const templateObj = AI_TEMPLATES.find(t => t.id === templateId) || AI_TEMPLATES[0];
    // Select the correct language prompt from the template
    const systemPrompt = templateObj.systemPrompt[language as 'es' | 'en'] || templateObj.systemPrompt.en;

    const result = await callAIEndpoint('summary', {
      transcript,
      template: templateId,
      systemPrompt, // Pass the specialized prompt
      attachments
    }, language);
    if (!result) throw new Error("No output from AI");
    return result;
  } catch (error: any) {
    throw new Error(language === 'es' ? "Error al generar el resumen de la reunión. Intente de nuevo." : "Failed to generate meeting summary. Please try again.");
  }
};

export const chatWithTranscript = async (
  transcript: string | any[],
  history: { role: 'user' | 'model', text: string }[],
  newMessage: string,
  language: string = 'en',
  recordingIds?: string[]
): Promise<string> => {
  try {
    const result = await callAIEndpoint('chat', {
      transcript,
      history,
      message: newMessage,
      recordingIds
    }, language);
    if (!result) throw new Error("No output from AI");
    return result;
  } catch (error: any) {
    throw new Error(language === 'es' ? "Lo siento, hubo un error al procesar tu mensaje." : "Sorry, there was an error processing your message.");
  }
};

export const transcribeAudio = async (
  audioBase64?: string,
  mimeType?: string,
  language: string = 'en',
  audioUrl?: string
): Promise<{ segments: Partial<TranscriptSegment>[], suggestedSpeakers?: Record<string, string> }> => {
  try {
    const result = await callAIEndpoint('transcribe', { audioBase64, mimeType, audioUrl }, language);

    // Check if result is already in the new format { segments, suggestedSpeakers }
    if (result && result.segments && Array.isArray(result.segments)) {
      return result;
    }

    // Otherwise wrap array into segments for legacy support
    return { segments: result || [] };
  } catch (error) {
    console.error("Transcription failed:", error);
    return { segments: [] };
  }
};

export const supportChat = async (
  userMessage: string,
  history: { role: 'user' | 'bot', content: string }[],
  language: string = 'es',
  systemInstruction?: string
): Promise<string> => {
  try {
    const result = await callAIEndpoint('support', {
      message: userMessage,
      history,
      systemInstruction,
      knowledgeBasePath: '/docs/chatbot-training/knowledge-base.json'
    }, language);
    if (!result) throw new Error("No output from AI");
    return result;
  } catch (error: any) {
    console.error("Support chat error:", error);
    throw error; // Propagate error to see what's happening
  }
};

export const generateTextEmbedding = async (text: string): Promise<number[]> => {
  try {
    const result = await callAIEndpoint('embed', { text }, 'en');
    return result || [];
  } catch (error) {
    console.error("Embedding generation failed:", error);
    return [];
  }
};
