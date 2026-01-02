import lamejs from 'lamejs';

interface ConcatenationResult {
    blob: Blob;
    segmentOffsets: number[]; // Seconds where each audio segment starts
    totalDuration: number;
}

/**
 * Concatenates multiple audio files into a single MP3
 * @param audioFiles - Array of File objects (OGG, MP3, WAV, etc.)
 * @returns Blob containing concatenated MP3 and timing data
 */
export const concatenateAudios = async (
    audioFiles: File[]
): Promise<ConcatenationResult> => {
    if (audioFiles.length === 0) {
        throw new Error('No audio files provided');
    }

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const buffers: AudioBuffer[] = [];
    const segmentOffsets: number[] = [0];

    // 1. Decode all audio files
    for (const file of audioFiles) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            buffers.push(audioBuffer);

            // Calculate offset for next segment
            const lastOffset = segmentOffsets[segmentOffsets.length - 1];
            segmentOffsets.push(lastOffset + audioBuffer.duration);
        } catch (error) {
            console.error(`Failed to decode audio file: ${file.name}`, error);
            throw new Error(`Failed to decode ${file.name}`);
        }
    }

    // 2. Calculate total length
    const totalLength = buffers.reduce((sum, buffer) => sum + buffer.length, 0);
    const sampleRate = buffers[0].sampleRate;
    const totalDuration = buffers.reduce((sum, buffer) => sum + buffer.duration, 0);

    // 3. Create concatenated buffer (mono for smaller file size)
    const numberOfChannels = 1; // Mono for optimization
    const concatenatedBuffer = audioContext.createBuffer(
        numberOfChannels,
        totalLength,
        sampleRate
    );

    // 4. Copy each buffer into the concatenated buffer
    let offset = 0;
    for (const buffer of buffers) {
        // Mix down to mono if stereo
        const sourceData = buffer.getChannelData(0);
        const destChannel = concatenatedBuffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
            destChannel[offset + i] = sourceData[i];
        }

        offset += buffer.length;
    }

    // 5. Encode to MP3 using lamejs
    const mp3Blob = await encodeToMP3(concatenatedBuffer, sampleRate);

    // Remove last offset (it's the total duration)
    segmentOffsets.pop();

    return {
        blob: mp3Blob,
        segmentOffsets,
        totalDuration
    };
};

/**
 * Encode AudioBuffer to MP3 using lamejs
 */
const encodeToMP3 = async (
    audioBuffer: AudioBuffer,
    sampleRate: number
): Promise<Blob> => {
    const mp3encoder = new lamejs.Mp3Encoder(1, sampleRate, 128); // Mono, 128kbps
    const samples = audioBuffer.getChannelData(0);

    // Convert float32 to int16
    const int16Samples = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        int16Samples[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    // Encode in chunks
    const mp3Data: Uint8Array[] = [];
    const sampleBlockSize = 1152; // Standard MP3 frame size

    for (let i = 0; i < int16Samples.length; i += sampleBlockSize) {
        const sampleChunk = int16Samples.subarray(i, i + sampleBlockSize);
        const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }
    }

    // Flush remaining data
    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
    }

    // Create blob
    return new Blob(mp3Data as BlobPart[], { type: 'audio/mp3' });
};

/**
 * Helper to convert seconds to HH:MM:SS format
 */
export const formatTimeFromSeconds = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/**
 * Helper to convert HH:MM:SS or MM:SS to seconds
 */
export const timeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':').map(p => parseInt(p));
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }
    return 0;
};
