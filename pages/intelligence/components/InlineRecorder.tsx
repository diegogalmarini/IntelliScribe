import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, NoteItem, MediaItem } from '../../../types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Mic, Square, Pause, Play, Flag, ChevronDown } from 'lucide-react';
import { useToast } from '../../../components/Toast';
import * as Analytics from '../../../utils/analytics';

interface InlineRecorderProps {
    user: UserProfile;
    onComplete: (audioBlob: Blob, durationSeconds: number, title: string, notes: NoteItem[], media: MediaItem[]) => void;
    onCancel: () => void;
    onStateChange?: (state: 'idle' | 'recording' | 'paused') => void;
}

export const InlineRecorder: React.FC<InlineRecorderProps> = ({ user, onComplete, onCancel, onStateChange }) => {
    const { t } = useLanguage();
    const { showToast } = useToast();

    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const secondsRef = useRef(0);

    // Hold interaction states
    const [holdType, setHoldType] = useState<'pause' | 'stop' | null>(null);
    const [holdProgress, setHoldProgress] = useState(0);
    const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
    const holdSuccessRef = useRef(false);
    const shouldSaveRef = useRef(false);

    // Session data
    const [sessionTitle, setSessionTitle] = useState(t('newSession') || 'Nueva Sesión');
    const [recordingMode, setRecordingMode] = useState<'meeting' | 'call' | 'speaker'>('meeting');

    // Audio devices
    const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
    const [showDeviceMenu, setShowDeviceMenu] = useState(false);

    // Notes
    const [notes, setNotes] = useState<NoteItem[]>([]);
    const [currentNote, setCurrentNote] = useState('');
    const notesRef = useRef<NoteItem[]>([]);
    const notesContainerRef = useRef<HTMLDivElement>(null);

    // Media
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const mediaItemsRef = useRef<MediaItem[]>([]);

    // Audio refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const mimeTypeRef = useRef<string>('');
    const audioContextRef = useRef<AudioContext | null>(null);
    const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const requestRef = useRef<number | null>(null);

    // Visualizer
    const [visualizerData, setVisualizerData] = useState<number[]>(new Array(20).fill(10));

    useEffect(() => { notesRef.current = notes; }, [notes]);
    useEffect(() => { mediaItemsRef.current = mediaItems; }, [mediaItems]);

    // --- AUDIO SETUP ---
    const ensureAudioContext = () => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            const Ctx = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new Ctx();
            destinationRef.current = audioContextRef.current.createMediaStreamDestination();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 64;
        }
        return {
            ctx: audioContextRef.current!,
            dest: destinationRef.current!,
            analyser: analyserRef.current!
        };
    };

    const setupInputStream = async (deviceId?: string) => {
        try {
            const { ctx, dest, analyser } = ensureAudioContext();

            const constraints = {
                audio: {
                    deviceId: deviceId ? { exact: deviceId } : undefined,
                    echoCancellation: true,
                    noiseSuppression: recordingMode === 'meeting',
                    autoGainControl: true
                }
            };
            const newStream = await navigator.mediaDevices.getUserMedia(constraints);

            if (sourceNodeRef.current) {
                sourceNodeRef.current.disconnect();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }

            streamRef.current = newStream;
            const newSource = ctx.createMediaStreamSource(newStream);
            newSource.connect(dest);
            newSource.connect(analyser);
            sourceNodeRef.current = newSource;

            if (ctx.state === 'suspended') {
                await ctx.resume();
            }

            return dest.stream;
        } catch (err) {
            console.error("Error setting up input stream:", err);
            throw err;
        }
    };

    const getSupportedMimeType = () => {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/mp4',
            'audio/aac',
            'audio/ogg'
        ];
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) return type;
        }
        return '';
    };

    const prepareRecorder = () => {
        const { dest } = ensureAudioContext();
        const mimeType = getSupportedMimeType();
        mimeTypeRef.current = mimeType;

        const options = mimeType ? { mimeType } : undefined;

        try {
            const mediaRecorder = new MediaRecorder(dest.stream, options);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = () => {
                if (!shouldSaveRef.current) {
                    console.log('Recording discarded (shouldSave=false)');
                    return;
                }
                const type = mimeTypeRef.current || 'audio/webm';
                const audioBlob = new Blob(audioChunksRef.current, { type });
                onComplete(audioBlob, secondsRef.current, sessionTitle, notesRef.current, mediaItemsRef.current);

                // TRACK: Recording Complete
                if (Analytics && typeof Analytics.trackEvent === 'function') {
                    Analytics.trackEvent('record_complete', {
                        duration_seconds: secondsRef.current,
                        mode: recordingMode,
                        notes_count: notesRef.current.length,
                        media_count: mediaItemsRef.current.length
                    });
                }
            };
        } catch (e) {
            console.error("Failed to create MediaRecorder", e);
        }
    };

    const cleanupAudio = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (sourceNodeRef.current) {
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
            destinationRef.current = null;
            analyserRef.current = null;
        }
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };

    // Initialize
    useEffect(() => {
        const init = async () => {
            try {
                const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                tempStream.getTracks().forEach(track => track.stop());

                const devices = await navigator.mediaDevices.enumerateDevices();
                const inputs = devices.filter(d => d.kind === 'audioinput');
                setInputDevices(inputs);

                const defaultId = inputs[0]?.deviceId;
                if (defaultId) setSelectedDeviceId(defaultId);

                await setupInputStream(defaultId);
                prepareRecorder();
                startVisualizer();

            } catch (err) {
                console.error("Init error:", err);
                showToast("Microphone access required.", 'error');
            }
        };
        init();

        return () => {
            cleanupAudio();
        };
    }, [recordingMode]);

    // Timer
    useEffect(() => {
        let interval: any;
        if (isRecording && !isPaused) {
            interval = setInterval(() => {
                setSeconds(s => {
                    const next = s + 1;
                    secondsRef.current = next;
                    return next;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording, isPaused]);

    // Auto-scroll notes
    useEffect(() => {
        if (notesContainerRef.current) {
            notesContainerRef.current.scrollTop = notesContainerRef.current.scrollHeight;
        }
    }, [notes]);

    const startVisualizer = () => {
        const animate = () => {
            if (!analyserRef.current) return;
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);

            const step = Math.floor(dataArray.length / 20);
            const newData = [];
            for (let i = 0; i < 20; i++) {
                const val = dataArray[i * step] || 0;
                const height = Math.max(10, (val / 255) * 100);
                newData.push(height);
            }
            setVisualizerData(newData);
            requestRef.current = requestAnimationFrame(animate);
        };
        animate();
    };

    const handleDeviceChange = async (deviceId: string) => {
        setSelectedDeviceId(deviceId);
        await setupInputStream(deviceId);
    };

    const startRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
            secondsRef.current = 0;
            setSeconds(0);
            mediaRecorderRef.current.start(1000);
            setIsRecording(true);
            onStateChange?.('recording');
            if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();

            // TRACK: Recording Started
            if (Analytics && typeof Analytics.trackEvent === 'function') {
                Analytics.trackEvent('start_recording', {
                    mode: recordingMode,
                    transcription_language: user.transcriptionLanguage || 'es'
                });
            }
        }
    };

    const togglePause = () => {
        if (!mediaRecorderRef.current) return;

        if (isPaused) {
            mediaRecorderRef.current.resume();
            if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
            onStateChange?.('recording');
        } else {
            mediaRecorderRef.current.pause();
            if (audioContextRef.current?.state === 'running') audioContextRef.current.suspend();
            onStateChange?.('paused');
        }
        setIsPaused(!isPaused);
    };

    const stopRecording = () => {
        shouldSaveRef.current = true;
        setIsRecording(false);
        onStateChange?.('idle');
        if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    };

    // --- HOLD TO ACTION LOGIC ---
    const HOLD_DURATION_PAUSE = 2000;
    const HOLD_DURATION_STOP = 3000;

    const startHold = (type: 'pause' | 'stop') => {
        if (holdTimerRef.current) return;

        setHoldType(type);
        setHoldProgress(0);
        const startTime = Date.now();
        const duration = type === 'pause' ? HOLD_DURATION_PAUSE : HOLD_DURATION_STOP;

        holdTimerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / duration) * 100, 100);
            setHoldProgress(progress);

            if (elapsed >= duration) {
                holdSuccessRef.current = true;
                cancelHold();
                if (type === 'pause') togglePause();
                else stopRecording();

                setTimeout(() => { holdSuccessRef.current = false; }, 500);
            }
        }, 16); // ~60fps
    };

    const cancelHold = () => {
        if (holdTimerRef.current) {
            clearInterval(holdTimerRef.current);
            holdTimerRef.current = null;
        }
        setHoldType(null);
        setHoldProgress(0);
    };

    const handleResumeTap = (e?: React.MouseEvent) => {
        if (holdSuccessRef.current) {
            if (e && e.stopPropagation) e.stopPropagation();
            return;
        }
        if (isPaused) togglePause();
    };

    const handleSendNote = () => {
        if (!currentNote.trim()) return;
        const newNote: NoteItem = {
            id: Date.now().toString(),
            timestamp: formatTimeShort(seconds),
            text: currentNote
        };
        setNotes(prev => [...prev, newNote]);
        setCurrentNote('');
    };

    const handleMark = () => {
        const newNote: NoteItem = {
            id: Date.now().toString(),
            timestamp: formatTimeShort(seconds),
            text: `🚩 ${t('markedPoint') || 'Marca'}`
        };
        setNotes(prev => [...prev, newNote]);
    };

    const formatTime = (time: any) => {
        const t = Number(time);
        if (isNaN(t) || !isFinite(t) || t < 0) return "00:00:00";
        const h = Math.floor(t / 3600).toString().padStart(2, '0');
        const m = Math.floor((t % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(t % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const formatTimeShort = (time: any) => {
        const t = Number(time);
        if (isNaN(t) || !isFinite(t) || t < 0) return "00:00";
        const m = Math.floor((t % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(t % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#1a1a1a] overflow-hidden">
            {/* Header */}
            <div className="px-8 py-4 border-b border-black/[0.05] dark:border-white/[0.05]">
                <div className="flex items-center justify-between">
                    <div>
                        <input
                            type="text"
                            value={sessionTitle}
                            onChange={(e) => setSessionTitle(e.target.value)}
                            className="text-2xl font-normal text-[#1f1f1f] dark:text-white bg-transparent border-b border-transparent hover:border-[#8e8e8e] focus:border-blue-500 outline-none transition-colors"
                            placeholder={t('sessionTitlePlaceholder')}
                        />
                        <p className="text-[#8e8e8e] text-sm mt-1">{new Date().toLocaleDateString()}</p>
                    </div>

                    {/* Close Button (Replaces Modes & Footer Cancel) */}
                    <button
                        onClick={onCancel}
                        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#8e8e8e] hover:text-[#1f1f1f] dark:hover:text-white transition-colors"
                        title="Cerrar grabadora"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
                {/* Left: Recording Area */}
                <div className="flex-1 flex flex-col min-h-[450px] lg:min-h-0">
                    {/* Device Selector */}
                    <div className="px-8 py-3 border-b border-black/[0.05] dark:border-white/[0.05]">
                        <div className="relative inline-block">
                            <button
                                onClick={() => setShowDeviceMenu(!showDeviceMenu)}
                                disabled={isRecording && !isPaused}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f5f5f5] dark:bg-[#2f2f2f] text-sm text-[#444746] dark:text-[#e3e3e3] hover:bg-[#ebebeb] dark:hover:bg-[#3c3c3c] transition-colors disabled:opacity-50"
                            >
                                <Mic size={16} />
                                <span className="max-w-[200px] truncate">
                                    {inputDevices.find(d => d.deviceId === selectedDeviceId)?.label || t('defaultMicrophone')}
                                </span>
                                <ChevronDown size={16} />
                            </button>

                            {showDeviceMenu && (
                                <div className="absolute top-full left-0 mt-2 w-72 max-h-60 overflow-y-auto bg-white dark:bg-[#2a2a2a] border border-black/10 dark:border-white/10 rounded-lg shadow-xl z-20 py-1">
                                    {inputDevices.map((device) => (
                                        <button
                                            key={device.deviceId}
                                            onClick={() => {
                                                handleDeviceChange(device.deviceId);
                                                setShowDeviceMenu(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-[#f5f5f5] dark:hover:bg-[#3c3c3c] transition-colors ${selectedDeviceId === device.deviceId
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-[#1f1f1f] dark:text-[#e3e3e3]'
                                                }`}
                                        >
                                            {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Visualizer */}
                    <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-transparent to-black/[0.02] dark:to-white/[0.02]">
                        <div className="flex items-center gap-1.5 h-32 w-full justify-center px-8">
                            {visualizerData.map((h, i) => (
                                <div
                                    key={i}
                                    className={`w-2 rounded-full transition-all duration-75 ${isRecording
                                        ? isPaused
                                            ? 'bg-[#8e8e8e]'
                                            : 'bg-red-500'
                                        : 'bg-[#d0d0d0] dark:bg-[#3c3c3c]'
                                        }`}
                                    style={{ height: `${h}%` }}
                                ></div>
                            ))}
                        </div>
                    </div>

                    {/* Timer & Controls */}
                    <div className="px-8 py-6 border-t border-black/[0.05] dark:border-white/[0.05]">
                        <div className="text-center">
                            <div className={`text-6xl font-mono font-bold tabular-nums mb-6 ${isRecording && !isPaused ? 'text-red-500' : 'text-[#1f1f1f] dark:text-white'
                                }`}>
                                {formatTime(seconds)}
                            </div>

                            <div className="flex items-center justify-center gap-4">
                                {isRecording && (
                                    <button
                                        onClick={handleMark}
                                        className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                        title="Marcar punto"
                                    >
                                        <Flag size={20} className="text-[#8e8e8e]" />
                                    </button>
                                )}

                                {!isRecording ? (
                                    <button
                                        onClick={startRecording}
                                        className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all"
                                    >
                                        <Mic size={28} />
                                    </button>
                                ) : (
                                    <>
                                        {/* STOP BUTTON */}
                                        <div className="relative group p-2">
                                            <svg className="absolute inset-0 size-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                                                <circle
                                                    cx="50" cy="50" r="46"
                                                    fill="transparent" stroke="currentColor" strokeWidth="4"
                                                    className="text-[#d0d0d0] dark:text-[#3c3c3c]"
                                                />
                                                {holdType === 'stop' && (
                                                    <circle
                                                        cx="50" cy="50" r="46"
                                                        fill="transparent" stroke="currentColor" strokeWidth="4"
                                                        strokeDasharray="289"
                                                        strokeDashoffset={289 - (289 * holdProgress) / 100}
                                                        strokeLinecap="round"
                                                        className="text-red-500 transition-all duration-75"
                                                    />
                                                )}
                                            </svg>
                                            <button
                                                onMouseDown={() => startHold('stop')}
                                                onMouseUp={cancelHold}
                                                onMouseLeave={cancelHold}
                                                onTouchStart={(e) => { e.preventDefault(); startHold('stop'); }}
                                                onTouchEnd={(e) => { e.preventDefault(); cancelHold(); }}
                                                onContextMenu={(e) => e.preventDefault()}
                                                style={{
                                                    WebkitUserSelect: 'none',
                                                    userSelect: 'none',
                                                    WebkitTouchCallout: 'none',
                                                    touchAction: 'manipulation'
                                                }}
                                                className="w-14 h-14 rounded-full bg-[#1f1f1f] dark:bg-white text-white dark:text-[#1f1f1f] flex items-center justify-center transition-all active:scale-95 z-10 relative"
                                                title={t('holdToStop')}
                                            >
                                                <Square size={24} />
                                            </button>
                                            <p className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#8e8e8e] uppercase whitespace-nowrap opacity-60 group-hover:opacity-100 transition-opacity text-center mt-2 leading-tight">
                                                MANTÉN PARA<br />DETENER (3S)
                                            </p>
                                        </div>

                                        {/* PAUSE / RESUME BUTTON */}
                                        <div className="relative group p-2">
                                            <svg className="absolute inset-0 size-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                                                <circle
                                                    cx="50" cy="50" r="46"
                                                    fill="transparent" stroke="currentColor" strokeWidth="4"
                                                    className="text-[#d0d0d0] dark:text-[#3c3c3c]"
                                                />
                                                {holdType === 'pause' && (
                                                    <circle
                                                        cx="50" cy="50" r="46"
                                                        fill="transparent" stroke="currentColor" strokeWidth="4"
                                                        strokeDasharray="289"
                                                        strokeDashoffset={289 - (289 * holdProgress) / 100}
                                                        strokeLinecap="round"
                                                        className="text-red-500 transition-all duration-75"
                                                    />
                                                )}
                                            </svg>
                                            <button
                                                onMouseDown={() => !isPaused && startHold('pause')}
                                                onMouseUp={cancelHold}
                                                onMouseLeave={cancelHold}
                                                onTouchStart={(e) => { e.preventDefault(); !isPaused && startHold('pause'); }}
                                                onTouchEnd={(e) => { e.preventDefault(); cancelHold(); }}
                                                onContextMenu={(e) => e.preventDefault()}
                                                onClick={handleResumeTap}
                                                style={{
                                                    WebkitUserSelect: 'none',
                                                    userSelect: 'none',
                                                    WebkitTouchCallout: 'none',
                                                    touchAction: 'manipulation'
                                                }}
                                                className="w-14 h-14 rounded-full bg-[#8e8e8e] hover:bg-[#444746] text-white flex items-center justify-center transition-all active:scale-95 z-10 relative"
                                                title={isPaused ? t('tapToResume') : t('holdToPause')}
                                            >
                                                {isPaused ? <Play size={24} /> : <Pause size={24} />}
                                            </button>
                                            <p className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#8e8e8e] uppercase whitespace-nowrap opacity-60 group-hover:opacity-100 transition-opacity text-center mt-2 leading-tight">
                                                {isPaused ? 'TOCA PARA REANUDAR' : <>MANTÉN PARA<br />PAUSA (2S)</>}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Notes Panel - Stacks on bottom on mobile */}
                <div className="w-full lg:w-80 h-[400px] lg:h-auto flex-shrink-0 border-t lg:border-t-0 lg:border-l border-black/[0.05] dark:border-white/[0.05] flex flex-col bg-white dark:bg-[#1a1a1a]">
                    <div className="px-4 py-3 border-b border-black/[0.05] dark:border-white/[0.05]">
                        <h3 className="text-sm font-medium text-[#1f1f1f] dark:text-white">{t('notes')}</h3>
                    </div>

                    <div ref={notesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                        {notes.map((note) => (
                            <div key={note.id} className="text-sm">
                                <div className="text-xs text-[#8e8e8e] mb-1">{note.timestamp}</div>
                                <div className="text-[#1f1f1f] dark:text-[#e3e3e3]">{note.text}</div>
                            </div>
                        ))}
                        {notes.length === 0 && (
                            <p className="text-sm text-[#8e8e8e] text-center mt-8">
                                {t('notesPlaceholder')}
                            </p>
                        )}
                    </div>

                    <div className="p-4 border-t border-black/[0.05] dark:border-white/[0.05]">
                        <textarea
                            value={currentNote}
                            onChange={(e) => setCurrentNote(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendNote();
                                }
                            }}
                            placeholder={t('writeNotePlaceholder')}
                            className="w-full px-3 py-2 bg-[#f5f5f5] dark:bg-[#2f2f2f] border border-black/10 dark:border-white/10 rounded-lg text-sm text-[#1f1f1f] dark:text-white placeholder-[#8e8e8e] outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={3}
                        />
                        <button
                            onClick={handleSendNote}
                            disabled={!currentNote.trim()}
                            className="mt-2 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-[#d0d0d0] disabled:text-[#8e8e8e] text-white text-sm rounded-lg transition-colors disabled:cursor-not-allowed"
                        >
                            {t('addNote')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
