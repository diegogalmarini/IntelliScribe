import * as lamejs from 'lamejs';

// Exported for single file compression
export async function resampleAndMixDown(buffer: AudioBuffer, targetSampleRate: number = 22050): Promise<AudioBuffer> {
    // Calculate new length
    const ratio = targetSampleRate / buffer.sampleRate;
    const newLength = Math.round(buffer.length * ratio);

    // Create offline context at target sample rate mono
    const offlineCtx = new OfflineAudioContext(1, newLength, targetSampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(offlineCtx.destination);
    source.start();

    // Render
    return await offlineCtx.startRendering();
}

interface ConcatenationResult {
    blob: Blob;
    segmentOffsets: number[];
    totalDuration: number;
}

// Helper to convert AudioBuffer to MP3 blob
function audioBufferToMp3(buffer: AudioBuffer, kbps: number = 64): Blob {
    const sampleRate = buffer.sampleRate;
    const channels = buffer.numberOfChannels;

    // LameJS works with Int16Array
    const encoder = new (lamejs as any).Mp3Encoder(channels, sampleRate, kbps);
    const mp3Data: any[] = [];

    // Process in chunks to avoid memory pressure
    const sampleBlockSize = 1152;

    if (channels === 2) {
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);

        for (let i = 0; i < left.length; i += sampleBlockSize) {
            const leftChunk = left.subarray(i, i + sampleBlockSize);
            const rightChunk = right.subarray(i, i + sampleBlockSize);

            // Convert Float32 to Int16
            const leftInt16 = new Int16Array(leftChunk.length);
            const rightInt16 = new Int16Array(rightChunk.length);

            for (let j = 0; j < leftChunk.length; j++) {
                leftInt16[j] = leftChunk[j] < 0 ? leftChunk[j] * 32768 : leftChunk[j] * 32767;
                rightInt16[j] = rightChunk[j] < 0 ? rightChunk[j] * 32768 : rightChunk[j] * 32767;
            }

            const mp3buf = encoder.encodeBuffer(leftInt16, rightInt16);
            if (mp3buf.length > 0) mp3Data.push(mp3buf);
        }
    } else {
        const mono = buffer.getChannelData(0);
        for (let i = 0; i < mono.length; i += sampleBlockSize) {
            const chunk = mono.subarray(i, i + sampleBlockSize);
            const int16 = new Int16Array(chunk.length);
            for (let j = 0; j < chunk.length; j++) {
                int16[j] = Math.max(-1, Math.min(1, chunk[j]));
                int16[j] = int16[j] < 0 ? int16[j] * 32768 : int16[j] * 32767;
            }
            const mp3buf = encoder.encodeBuffer(int16);
            if (mp3buf.length > 0) mp3Data.push(mp3buf);
        }
    }

    const mp3buf = encoder.flush();
    if (mp3buf.length > 0) mp3Data.push(mp3buf);

    return new Blob(mp3Data, { type: 'audio/mp3' });
}

/**
 * Compress a single audio file to 22kHz mono MP3
 * Reduces file size dramatically
 */
export async function compressAudioFile(file: File): Promise<Blob> {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const originalSizeMB = (file.size / 1024 / 1024).toFixed(1);
    console.log(`[audioConcat] Compressing ${file.name} (${originalSizeMB}MB)`);

    // 1. Decode the file
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    console.log(`[audioConcat] Original: ${audioBuffer.sampleRate}Hz, ${audioBuffer.numberOfChannels}ch, ${audioBuffer.duration.toFixed(1)}s`);

    // 2. Resample to 22kHz Mono
    const resampledBuffer = await resampleAndMixDown(audioBuffer, 22050);

    // 3. Convert to MP3
    const mp3Blob = audioBufferToMp3(resampledBuffer, 64);

    const compressedSizeMB = (mp3Blob.size / 1024 / 1024).toFixed(1);
    console.log(`[audioConcat] MP3 Compressed: ${originalSizeMB}MB -> ${compressedSizeMB}MB (${((1 - mp3Blob.size / file.size) * 100).toFixed(0)}% reduction)`);

    // Close the audio context
    await audioContext.close();

    return mp3Blob;
}

export const concatenateAudios = async (audioFiles: File[]): Promise<ConcatenationResult> => {
    try {
        console.log(`[audioConcat] Starting concatenation of ${audioFiles.length} files`);
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        // 1. Decode all files
        const audioBuffers: AudioBuffer[] = [];
        for (const file of audioFiles) {
            console.log(`[audioConcat] Decoding ${file.name}`);
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            audioBuffers.push(audioBuffer);
        }

        console.log('[audioConcat] All files decoded');

        // 2. Calculate total length and segment offsets
        const totalDuration = audioBuffers.reduce((acc, buf) => acc + buf.duration, 0);
        const totalLength = audioBuffers.reduce((acc, buf) => acc + buf.length, 0);
        const numberOfChannels = audioBuffers[0].numberOfChannels;

        // 3. Create output buffer (in original sample rate first)
        const concatenatedBuffer = audioContext.createBuffer(
            numberOfChannels,
            totalLength,
            audioBuffers[0].sampleRate
        );

        // 4. Fill buffer
        let offset = 0;
        const segmentOffsets: number[] = [0]; // Store cumulative durations for segment start times

        for (const buffer of audioBuffers) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
                concatenatedBuffer.getChannelData(channel).set(buffer.getChannelData(channel), offset);
            }

            offset += buffer.length;
            segmentOffsets.push(offset / concatenatedBuffer.sampleRate); // Add cumulative duration
        }
        segmentOffsets.pop(); // Remove the last cumulative duration which is the total duration

        console.log(`[audioConcat] Resampling to 22kHz Mono... (Original: ${concatenatedBuffer.sampleRate}Hz, ${numberOfChannels}ch)`);

        // 5. Resample to 22kHz Mono
        const resampledBuffer = await resampleAndMixDown(concatenatedBuffer, 22050);

        console.log('[audioConcat] Encoding to MP3...');
        const audioBlob = audioBufferToMp3(resampledBuffer, 64);

        console.log(`[audioConcat] MP3 Encoding complete, blob size: ${audioBlob.size} bytes (~${(audioBlob.size / 1024 / 1024).toFixed(2)} MB)`);

        return {
            blob: audioBlob,
            segmentOffsets,
            totalDuration
        };

    } catch (error) {
        console.error('[audioConcat] Concatenation failed:', error);
        throw error;
    }
};

export const formatTimeFromSeconds = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const timeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':').map(p => parseInt(p));
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
};
