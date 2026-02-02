/**
 * api/_utils/chunker.ts
 * 
 * Logic to split long transcripts into manageable chunks for RAG.
 */

export interface Chunk {
    text: string;
    index: number;
}

/**
 * Splits a text into chunks of approximately targetLength.
 * Tries to break at sentence ends (. or ?) to maintain semantic context.
 */
export function chunkText(text: string, targetLength: number = 800): Chunk[] {
    if (!text) return [];

    // Simple strategy: split by sentences but keep chunks under limit
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks: Chunk[] = [];
    let currentChunk = "";
    let currentIndex = 0;

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > targetLength && currentChunk.length > 0) {
            chunks.push({
                text: currentChunk.trim(),
                index: currentIndex++
            });
            currentChunk = "";
        }
        currentChunk += sentence;
    }

    if (currentChunk.trim().length > 0) {
        chunks.push({
            text: currentChunk.trim(),
            index: currentIndex++
        });
    }

    return chunks;
}
