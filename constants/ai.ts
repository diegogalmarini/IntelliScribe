/**
 * AI Configuration and Model Priorities
 * This file centralizes all AI model strings to prevent hardcoding
 * and facilitate "Self-Healing" logic when upstream APIs change.
 */

export const GEMINI_CONFIG = {
    // Current stable API version
    apiVersion: 'v1beta',

    // Prioritized list of models for general text/chat tasks
    // If the first one fails (404), the API will fallback to the next one.
    modelPriorities: [
        'gemini-2.0-flash-exp', // Fast, cheap, and capable
        'gemini-1.5-flash',     // Reliable fallback
        'gemini-1.5-pro'        // Powerful fallback (expensive)
    ],

    // Specific configurations for different actions
    actions: {
        summary: {
            preferredModel: 'gemini-2.0-flash-exp',
            temperature: 0.7
        },
        chat: {
            preferredModel: 'gemini-2.0-flash-exp',
            temperature: 0.8
        },
        support: {
            preferredModel: 'gemini-1.5-flash', // Nati Pol usually needs stable context
            temperature: 0.9
        },
        transcription: {
            preferredModel: 'gemini-2.0-flash-exp',
            temperature: 0.1
        }
    }
};
