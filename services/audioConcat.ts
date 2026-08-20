import { setupLamePolyfill } from './lamePolyfill';
// @ts-ignore
import * as lamejs from 'lamejs';

// Setup exhaustive lamejs globals if missing (critical for internal dependencies like BitStream, EQ, etc.)
setupLamePolyfill();

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

/** Tramo que ocupa un fichero dentro del audio unido, en segundos. */
export interface SpeakerRange {
    start: number;
    end: number;
}

interface ConcatenationResult {
    blob: Blob;
    /** Un tramo por fichero, en el mismo orden. */
    speakerRanges: SpeakerRange[];
    /**
     * Inicio de cada fichero. Antes esta lista mezclaba inicios, finales y un
     * duplicado del total, con lo que un segmento fechado al final del audio
     * indexaba fuera del array de ficheros y reventaba la importacion entera.
     */
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

/** Silencio insertado entre audios, en segundos.
 *
 * Sin el, los ficheros quedan pegados sin costura audible y el modelo produce
 * un unico segmento que cruza la frontera entre dos hablantes: ese segmento
 * recibe una sola marca de tiempo, la de su inicio, y se atribuye entero al
 * hablante equivocado.
 */
const SPEAKER_GAP_SECONDS = 0.6;

/** Todo se normaliza a esta frecuencia ANTES de unir. */
const TARGET_SAMPLE_RATE = 22050;

export const concatenateAudios = async (audioFiles: File[]): Promise<ConcatenationResult> => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    try {
        console.log(`[audioConcat] Uniendo ${audioFiles.length} ficheros`);

        // 1. Decodificar y normalizar CADA fichero a 22 kHz mono antes de unir.
        //
        // Antes se copiaban las muestras crudas de cada fichero dentro de un
        // buffer creado con la frecuencia del PRIMERO. Con ficheros de origen
        // distinto —una nota de voz de WhatsApp a 48 kHz junto a un mp3 a
        // 44,1 kHz— eso reproduce el segundo a otra velocidad y desplaza toda
        // la linea de tiempo a partir de ahi: las fronteras entre hablantes
        // dejan de caer donde se cree y el audio se atribuye a quien no es.
        // Normalizar primero elimina la deriva y, de paso, iguala los canales.
        const buffers: AudioBuffer[] = [];
        for (const file of audioFiles) {
            const arrayBuffer = await file.arrayBuffer();
            const decoded = await audioContext.decodeAudioData(arrayBuffer);
            console.log(`[audioConcat] ${file.name}: ${decoded.sampleRate}Hz ${decoded.numberOfChannels}ch ${decoded.duration.toFixed(1)}s`);
            buffers.push(await resampleAndMixDown(decoded, TARGET_SAMPLE_RATE));
        }

        const gapLength = Math.round(SPEAKER_GAP_SECONDS * TARGET_SAMPLE_RATE);
        const totalLength =
            buffers.reduce((acc, buf) => acc + buf.length, 0) +
            gapLength * Math.max(0, buffers.length - 1);

        const concatenated = audioContext.createBuffer(1, totalLength, TARGET_SAMPLE_RATE);
        const channel = concatenated.getChannelData(0);

        // 2. Volcar en orden, anotando el tramo real de cada hablante.
        let offset = 0;
        const speakerRanges: SpeakerRange[] = [];
        buffers.forEach((buffer, index) => {
            channel.set(buffer.getChannelData(0), offset);
            const start = offset / TARGET_SAMPLE_RATE;
            offset += buffer.length;
            speakerRanges.push({ start, end: offset / TARGET_SAMPLE_RATE });
            // El hueco ya es silencio: el buffer nace a cero, solo hay que saltarlo.
            if (index < buffers.length - 1) offset += gapLength;
        });

        const totalDuration = totalLength / TARGET_SAMPLE_RATE;

        console.log('[audioConcat] Codificando a MP3...');
        const audioBlob = await audioBufferToMp3Worker(concatenated, 64);
        console.log(`[audioConcat] Listo: ${(audioBlob.size / 1024 / 1024).toFixed(2)} MB, ${totalDuration.toFixed(1)}s`);

        return {
            blob: audioBlob,
            speakerRanges,
            segmentOffsets: speakerRanges.map(r => r.start),
            totalDuration
        };
    } catch (error) {
        console.error('[audioConcat] Concatenation failed:', error);
        throw error;
    } finally {
        await audioContext.close();
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
