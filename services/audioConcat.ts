interface ConcatenationResult {
    blob: Blob;
    segmentOffsets: number[];
    totalDuration: number;
}

export const concatenateAudios = async (
    audioFiles: File[]
): Promise<ConcatenationResult> => {
    if (audioFiles.length === 0) {
        throw new Error('No audio files provided');
    }

    console.log('[audioConcat] Starting concatenation of', audioFiles.length, 'files');

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const buffers: AudioBuffer[] = [];
    const segmentOffsets: number[] = [0];

    for (const file of audioFiles) {
        try {
            console.log('[audioConcat] Decoding', file.name);
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            buffers.push(audioBuffer);

            const lastOffset = segmentOffsets[segmentOffsets.length - 1];
            segmentOffsets.push(lastOffset + audioBuffer.duration);
        } catch (error) {
            console.error(`Failed to decode audio file: ${file.name}`, error);
            throw new Error(`Failed to decode ${file.name}`);
        }
    }

    console.log('[audioConcat] All files decoded');

    const totalLength = buffers.reduce((sum, buffer) => sum + buffer.length, 0);
    const sampleRate = buffers[0].sampleRate;
    const totalDuration = buffers.reduce((sum, buffer) => sum + buffer.duration, 0);

    const concatenatedBuffer = audioContext.createBuffer(2, totalLength, sampleRate);

    let offset = 0;
    for (const buffer of buffers) {
        for (let channel = 0; channel < Math.min(2, buffer.numberOfChannels); channel++) {
            const sourceData = buffer.getChannelData(channel);
            const destChannel = concatenatedBuffer.getChannelData(channel);
            for (let i = 0; i < buffer.length; i++) {
                destChannel[offset + i] = sourceData[i];
            }
        }
        offset += buffer.length;
    }

    console.log('[audioConcat] Encoding to WAV...');

    const audioBlob = audioBufferToWav(concatenatedBuffer);

    console.log('[audioConcat] Encoding complete, blob size:', audioBlob.size, 'bytes');

    segmentOffsets.pop();

    return { blob: audioBlob, segmentOffsets, totalDuration };
};

function audioBufferToWav(buffer: AudioBuffer): Blob {
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numberOfChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels = [];
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

    setUint32(0x46464952);
    setUint32(length - 8);
    setUint32(0x45564157);

    setUint32(0x20746d66);
    setUint32(16);
    setUint16(1);
    setUint16(numberOfChannels);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * numberOfChannels * 2);
    setUint16(numberOfChannels * 2);
    setUint16(16);

    setUint32(0x61746164);
    setUint32(length - pos - 4);

    for (let i = 0; i < numberOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
        for (let i = 0; i < numberOfChannels; i++) {
            const sample = Math.max(-1, Math.min(1, channels[i][offset]));
            view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            pos += 2;
        }
        offset++;
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

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
