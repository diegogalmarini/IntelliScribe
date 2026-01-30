// @ts-ignore
import * as lamejs from 'lamejs';

// Fix for iOS/Safari: lamejs might expect MPEGMode to be globally available
if (typeof window !== 'undefined' && !(window as any).MPEGMode) {
    (window as any).MPEGMode = {
        STEREO: 0,
        JOINT_STEREO: 1,
        DUAL_CHANNEL: 2,
        MONO: 3
    };
}

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

/**
 * Universal utility to convert any Audio Blob to a compressed MP3
 * Uses 22050Hz Mono 64kbps for optimal voice quality/size balance.
 * Uses a Web Worker to avoid freezing the main thread.
 */
export async function convertAudioBlobToMp3(audioBlob: Blob): Promise<Blob> {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    try {
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Resample to 22k Mono for consistency
        const resampledBuffer = await resampleAndMixDown(audioBuffer, 22050);

        // Encode to MP3 using Worker
        return await audioBufferToMp3Worker(resampledBuffer, 64);
    } finally {
        await audioContext.close();
    }
}

/**
 * Worker-based MP3 encoding to prevent UI freezes
 */
export async function audioBufferToMp3Worker(buffer: AudioBuffer, kbps: number = 64): Promise<Blob> {
    return new Promise((resolve, reject) => {
        try {
            // Import worker using Vite syntax
            const worker = new Worker(new URL('./audioEncoder.worker.ts', import.meta.url), { type: 'module' });
            const mp3Data: Uint8Array[] = [];

            worker.onmessage = (e) => {
                const { type, payload } = e.data;
                if (type === 'CHUNK') {
                    mp3Data.push(new Uint8Array(payload));
                } else if (type === 'DONE') {
                    worker.terminate();
                    resolve(new Blob(mp3Data, { type: 'audio/mp3' }));
                }
            };

            worker.onerror = (err) => {
                worker.terminate();
                reject(err);
            };

            const sampleRate = buffer.sampleRate;
            const channels = buffer.numberOfChannels;

            worker.postMessage({
                type: 'INIT',
                payload: { sampleRate, channels, kbps }
            });

            // Process in larger chunks for efficiency but avoid memory overflow
            const sampleBlockSize = 16384;
            const left = buffer.getChannelData(0);
            const right = channels === 2 ? buffer.getChannelData(1) : null;

            for (let i = 0; i < left.length; i += sampleBlockSize) {
                const leftChunk = left.slice(i, i + sampleBlockSize);
                const rightChunk = right ? right.slice(i, i + sampleBlockSize) : null;

                worker.postMessage({
                    type: 'ENCODE',
                    payload: { left: leftChunk, right: rightChunk }
                });
            }

            worker.postMessage({ type: 'FINISH' });
        } catch (err) {
            reject(err);
        }
    });
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
    const mp3Blob = await audioBufferToMp3Worker(resampledBuffer, 64);

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
        segmentOffsets.push(totalDuration); // Ensure final offset is included

        console.log(`[audioConcat] Resampling to 22kHz Mono... (Original: ${concatenatedBuffer.sampleRate}Hz, ${numberOfChannels}ch)`);

        // 5. Resample to 22kHz Mono
        const resampledBuffer = await resampleAndMixDown(concatenatedBuffer, 22050);

        console.log('[audioConcat] Encoding to MP3 via Worker...');
        const audioBlob = await audioBufferToMp3Worker(resampledBuffer, 64);

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
