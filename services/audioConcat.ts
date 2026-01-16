// Exported for single file compression
export async function resampleAndMixDown(buffer: AudioBuffer, targetSampleRate: number = 12000): Promise<AudioBuffer> {
    // Calculate new length
    const ratio = targetSampleRate / buffer.sampleRate;
    const newLength = Math.round(buffer.length * ratio);

    // Create offline context at 16k mono
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

// Helper to convert AudioBuffer to WAV blob
function audioBufferToWavInternal(buffer: AudioBuffer): Blob {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;

    function setUint16(data: number) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    function setUint32(data: number) {
        view.setUint32(pos, data, true);
        pos += 4;
    }

    // write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // write interleaved data
    for (i = 0; i < buffer.numberOfChannels; i++)
        channels.push(buffer.getChannelData(i));

    while (pos < length) {
        for (i = 0; i < numOfChan; i++) {
            sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * Compress a single audio file to 16kHz mono WAV
 * Reduces file size dramatically: 61MB -> ~6MB
 */
export async function compressAudioFile(file: File): Promise<Blob> {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const originalSizeMB = (file.size / 1024 / 1024).toFixed(1);
    console.log(`[audioConcat] Compressing ${file.name} (${originalSizeMB}MB)`);

    // 1. Decode the file
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    console.log(`[audioConcat] Original: ${audioBuffer.sampleRate}Hz, ${audioBuffer.numberOfChannels}ch, ${audioBuffer.duration.toFixed(1)}s`);

    // 2. Resample to 16kHz Mono
    const resampledBuffer = await resampleAndMixDown(audioBuffer, 12000);

    // 3. Convert to WAV
    const wavBlob = audioBufferToWavInternal(resampledBuffer);

    const compressedSizeMB = (wavBlob.size / 1024 / 1024).toFixed(1);
    console.log(`[audioConcat] Compressed: ${originalSizeMB}MB -> ${compressedSizeMB}MB (${((1 - wavBlob.size / file.size) * 100).toFixed(0)}% reduction)`);

    // Close the audio context
    await audioContext.close();

    return wavBlob;
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

        console.log(`[audioConcat] Resampling to 12kHz Mono... (Original: ${concatenatedBuffer.sampleRate}Hz, ${numberOfChannels}ch)`);

        // 5. Resample to 16kHz Mono to drastically reduce size
        // 46MB (44.1k Stereo) -> ~5MB (16k Mono)
        const resampledBuffer = await resampleAndMixDown(concatenatedBuffer, 12000);

        console.log('[audioConcat] Encoding to WAV...');
        const audioBlob = audioBufferToWavInternal(resampledBuffer);

        console.log(`[audioConcat] Encoding complete, blob size: ${audioBlob.size} bytes`);

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
