/**
 * Example of a robust Gemini configuration optimized for a SaaS.
 * This template follows the logic of the 'optimizing-gemini-models' skill.
 */

export const GEMINI_SaaS_CONFIG = {
    apiVersion: 'v1beta',
    modelPriorities: [
        'gemini-1.5-flash-latest', // Fast, cheap, high context
        'gemini-1.5-pro-latest',   // Precise, reasoning-heavy
        'gemini-1.0-pro'           // Legacy fallback
    ],
    actions: {
        // Precise summaries require high-quality extraction
        summary: {
            preferredModel: 'gemini-1.5-pro-latest',
            temperature: 0.3,
            maxOutputTokens: 2048
        },
        // Fast responses for support chatbots
        support: {
            preferredModel: 'gemini-1.5-flash-latest',
            temperature: 0.9,
            maxOutputTokens: 1024
        },
        // High-precision chat with context awareness
        chat: {
            preferredModel: 'gemini-1.5-pro-latest',
            temperature: 0.7
        },
        // Specialized logic for long audio transcription
        transcription: {
            preferredModel: 'gemini-1.5-flash-latest',
            temperature: 0.1
        },
        // Embeddings always use a specific vector model
        embed: {
            preferredModel: 'text-embedding-004'
        }
    }
};
