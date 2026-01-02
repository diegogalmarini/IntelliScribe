interface ConcatenationResult {
    blob: Blob;
    segment Offsets: number[];
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

    console.log('[audioConcat] Encoding...');

    const audioBlob = await encodeWithMediaRecorder(concatenatedBuffer, sampleRate);

    segmentOffsets.pop();

    return { blob: audioBlob, segmentOffsets, totalDuration };
};

const encodeWithMediaRecorder = async (audioBuffer: AudioBuffer, sampleRate: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const offlineContext = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, sampleRate);
        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineContext.destination);
        source.start(0);

        offlineContext.startRendering().then(renderedBuffer => {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source2 = audioContext.createBufferSource();
            source2.buffer = renderedBuffer;
            const dest = audioContext.createMediaStreamDestination();
            source2.connect(dest);

            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
            const mediaRecorder = new MediaRecorder(dest.stream, { mimeType, audioBitsPerSecond: 128000 });
            const chunks: Blob[] = [];

            mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
            mediaRecorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
            mediaRecorder.onerror = reject;

            mediaRecorder.start();
            source2.start(0);
            setTimeout(() => { mediaRecorder.stop(); source2.stop(); }, renderedBuffer.duration * 1000 + 100);
        }).catch(reject);
    });
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
