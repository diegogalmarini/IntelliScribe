import React, { useEffect, useRef, useState, useMemo } from 'react';

interface WaveformVisualizerProps {
    audioUrl: string;
    currentTime: number;
    duration: number;
    onSeek: (time: number) => void;
    barColor?: string;
    progressColor?: string;
    height?: number;
    barWidth?: number;
    barGap?: number;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
    audioUrl,
    currentTime,
    duration,
    onSeek,
    barColor = '#3b82f6', // Tailwind blue-500
    progressColor = '#60a5fa', // Tailwind blue-400
    height = 60,
    barWidth = 2,
    barGap = 2
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [audioData, setAudioData] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch and decode audio data
    useEffect(() => {
        let isMounted = true;
        if (!audioUrl) return;

        const loadAudio = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(audioUrl);
                const arrayBuffer = await response.arrayBuffer();
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                const channelData = audioBuffer.getChannelData(0); // Get first channel
                const samples = 150; // Number of bars to show
                const blockSize = Math.floor(channelData.length / samples);
                const filteredData = [];

                for (let i = 0; i < samples; i++) {
                    let blockStart = blockSize * i;
                    let sum = 0;
                    for (let j = 0; j < blockSize; j++) {
                        sum += Math.abs(channelData[blockStart + j]);
                    }
                    filteredData.push(sum / blockSize);
                }

                // Normalize data
                const multiplier = Math.max(...filteredData);
                const normalizedData = filteredData.map(n => n / multiplier);

                if (isMounted) {
                    setAudioData(normalizedData);
                    setIsLoading(false);
                }

                await audioContext.close();
            } catch (error) {
                console.error("Error generating waveform:", error);
                if (isMounted) setIsLoading(false);
            }
        };

        loadAudio();
        return () => { isMounted = false; };
    }, [audioUrl]);

    // Draw waveform
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || audioData.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const padding = 10;
        const width = canvas.offsetWidth;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, width, height);

        const progress = currentTime / (duration || 1);
        const barsCount = audioData.length;
        const totalBarWidth = (width - (barsCount - 1) * barGap) / barsCount;

        audioData.forEach((val, i) => {
            const x = i * (totalBarWidth + barGap);
            const barHeight = Math.max(2, val * (height - padding));
            const y = (height - barHeight) / 2;

            const isPlayed = (i / barsCount) < progress;

            // Premium Gradient/Color
            if (isPlayed) {
                ctx.fillStyle = progressColor;
                ctx.globalAlpha = 1.0;
            } else {
                ctx.fillStyle = barColor;
                ctx.globalAlpha = 0.25;
            }

            // Draw Symmetrical Rounded Bar
            ctx.beginPath();
            ctx.roundRect(x, y, totalBarWidth, barHeight, totalBarWidth / 2);
            ctx.fill();
        });

    }, [audioData, currentTime, duration, barColor, progressColor, height, barWidth, barGap]);

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current || !duration) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const progress = x / rect.width;
        onSeek(progress * duration);
    };

    return (
        <div className="relative w-full overflow-hidden" style={{ height }}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-transparent">
                    <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="w-1 h-4 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
                        ))}
                    </div>
                </div>
            )}
            <canvas
                ref={canvasRef}
                className="w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
                onClick={handleCanvasClick}
            />
        </div>
    );
};
