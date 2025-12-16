import React, { useState, useEffect, useRef } from 'react';
import { AppRoute, NoteItem, MediaItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { ThemeToggle } from '../components/ThemeToggle';

interface LiveRecordingProps {
    onNavigate: (route: AppRoute) => void;
    onRecordingComplete: (url: string, durationSeconds: number, customTitle: string, notes: NoteItem[], media: MediaItem[], audioBlob?: Blob) => void;
}

export const LiveRecording: React.FC<LiveRecordingProps> = ({ onNavigate, onRecordingComplete }) => {
    const { t } = useLanguage();

    // Need to load user to get verified number
    const loadUser = () => {
        try {
            const stored = localStorage.getItem('user_profile');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    };
    const user = loadUser();
    const callerId = (user && user.phoneVerified) ? user.phone : 'Unknown (Set up in Settings)';

    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [recordingMode, setRecordingMode] = useState<'meeting' | 'call'>('meeting');

    // Call Specific State
    const [callMethod, setCallMethod] = useState<'external' | 'voip'>('external');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active' | 'ended'>('idle');

    // Title State & Ref
    const [sessionTitle, setSessionTitle] = useState('');
    const sessionTitleRef = useRef('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!sessionTitle) {
            const defaultTitle = t('newSession');
            setSessionTitle(defaultTitle);
            sessionTitleRef.current = defaultTitle;
        }
    }, [t]);

    useEffect(() => {
        sessionTitleRef.current = sessionTitle;
    }, [sessionTitle]);

    useEffect(() => {
        if (isEditingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
        }
    }, [isEditingTitle]);

    // Device Management
    const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
    const [showInputMenu, setShowInputMenu] = useState(false);

    // Audio Pipeline Refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const mimeTypeRef = useRef<string>(''); // Store the supported mime type

    // Web Audio API Nodes (The Router)
    const audioContextRef = useRef<AudioContext | null>(null);
    const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    // Stream Ref (User Media)
    const streamRef = useRef<MediaStream | null>(null);
    const requestRef = useRef<number | null>(null);

    const [visualizerData, setVisualizerData] = useState<number[]>(new Array(20).fill(10));

    // Context Panel State
    const [activeTab, setActiveTab] = useState<'notes' | 'media'>('notes');
    const [notes, setNotes] = useState<NoteItem[]>([]);
    const notesRef = useRef<NoteItem[]>([]);

    const [currentNote, setCurrentNote] = useState('');
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const mediaItemsRef = useRef<MediaItem[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const notesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => { notesRef.current = notes; }, [notes]);
    useEffect(() => { mediaItemsRef.current = mediaItems; }, [mediaItems]);

    // --- AUDIO PIPELINE SETUP ---

    const ensureAudioContext = () => {
        if (!audioContextRef.current) {
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
                    noiseSuppression: recordingMode === 'meeting', // Less aggressive suppression for calls via speaker
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
            'audio/mp4', // iOS Safari 14.5+
            'audio/aac',
            'audio/ogg'
        ];
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) return type;
        }
        return '';
    };

    useEffect(() => {
        const init = async () => {
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
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
                alert("Microphone access required. Please check your browser settings.");
            }
        };
        init();

        navigator.mediaDevices.addEventListener('devicechange', async () => {
            const devices = await navigator.mediaDevices.enumerateDevices();
            setInputDevices(devices.filter(d => d.kind === 'audioinput'));
        });

        return () => cleanupAudio();
    }, [recordingMode]); // Re-init when mode changes (for echo cancellation settings)

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
                const type = mimeTypeRef.current || 'audio/webm';
                const audioBlob = new Blob(audioChunksRef.current, { type });

                // CONVERT TO BASE64 DATA URI FOR PERSISTENCE
                // This fixes the "broken play button after refresh" issue
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const base64Audio = reader.result as string;
                    // Add tag for mode
                    const callType = recordingMode === 'call' ? (callMethod === 'voip' ? 'VoIP Call' : 'Speakerphone') : 'In-Person';
                    // Add phone number to title if VoIP
                    if (callMethod === 'voip' && phoneNumber) {
                        sessionTitleRef.current = `${sessionTitleRef.current} (${phoneNumber})`;
                    }

                    // Add tags
                    const tags = ['Live Capture', callType];

                    onRecordingComplete(base64Audio, seconds, sessionTitleRef.current, notesRef.current, mediaItemsRef.current, audioBlob);
                };
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
        }
        if (sourceNodeRef.current) sourceNodeRef.current.disconnect();
        if (audioContextRef.current) audioContextRef.current.close();
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };

    useEffect(() => {
        let interval: any;
        if (isRecording && !isPaused) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording, isPaused]);

    useEffect(() => {
        if (notesContainerRef.current) {
            notesContainerRef.current.scrollTop = notesContainerRef.current.scrollHeight;
        }
    }, [notes]);

    const handleDeviceChange = async (deviceId: string) => {
        setSelectedDeviceId(deviceId);

        if (isRecording || isPaused) {
            await setupInputStream(deviceId);
        } else {
            if (sourceNodeRef.current) sourceNodeRef.current.disconnect();
            await setupInputStream(deviceId);
        }
    };

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

    const startRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
            mediaRecorderRef.current.start(1000);
            setIsRecording(true);
            if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
        }
    };

    const handleStopButton = () => {
        if (callStatus === 'active') {
            endCall();
            return;
        }
        setIsRecording(false);
        if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    };

    const togglePause = () => {
        if (!mediaRecorderRef.current) return;

        if (isPaused) {
            mediaRecorderRef.current.resume();
            if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
        } else {
            mediaRecorderRef.current.pause();
            if (audioContextRef.current?.state === 'running') audioContextRef.current.suspend();
        }
        setIsPaused(!isPaused);
    };

    // VoIP Simulation
    const handleDial = () => {
        if (!phoneNumber.trim()) return;

        setCallStatus('connecting');

        // Simulate connection time
        setTimeout(() => {
            setCallStatus('active');
            // Auto start recording when call connects
            startRecording();
        }, 1500);
    };

    const endCall = () => {
        setCallStatus('ended');
        if (isRecording) {
            setIsRecording(false);
            if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
        }
    };

    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const formatTimeShort = (totalSeconds: number) => {
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleTitleSave = () => {
        setIsEditingTitle(false);
        if (!sessionTitle.trim()) setSessionTitle(t('newSession'));
    };

    const handleKeyDownTitle = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleTitleSave();
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
            text: `🚩 ${t('markedPoint')}`
        };
        setNotes(prev => [...prev, newNote]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendNote();
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    const newMedia: MediaItem = {
                        id: Date.now().toString(),
                        timestamp: formatTimeShort(seconds),
                        url: ev.target.result as string,
                        name: file.name
                    };
                    setMediaItems(prev => [...prev, newMedia]);
                }
            };
            reader.readAsDataURL(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="flex flex-1 flex-col py-6 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full h-[calc(100vh-65px)] overflow-y-auto lg:overflow-hidden bg-background-light dark:bg-background-dark transition-colors duration-200" onClick={() => setShowInputMenu(false)}>
            <div className="mb-6">
                <div className="flex flex-wrap gap-2 mb-2 items-center">
                    <button onClick={() => onNavigate(AppRoute.DASHBOARD)} className="text-slate-500 dark:text-text-secondary text-sm font-medium hover:underline">{t('dashboard')}</button>
                    <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
                    <span className="text-slate-900 dark:text-white text-sm font-medium">{t('recording')}</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            {isEditingTitle ? (
                                <input
                                    ref={titleInputRef}
                                    type="text"
                                    value={sessionTitle}
                                    onChange={(e) => setSessionTitle(e.target.value)}
                                    onBlur={handleTitleSave}
                                    onKeyDown={handleKeyDownTitle}
                                    className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold bg-transparent border-b border-primary outline-none min-w-[200px] h-10 p-0"
                                />
                            ) : (
                                <>
                                    <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold truncate">{sessionTitle}</h1>
                                    <button onClick={() => setIsEditingTitle(true)} className="text-slate-400 hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-xl">edit</span>
                                    </button>
                                </>
                            )}
                        </div>
                        {/* Mode Switcher */}
                        <div className="flex flex-col gap-2 mt-2">
                            <p className="text-slate-500 dark:text-text-secondary text-sm flex items-center gap-2">
                                {new Date().toLocaleDateString()}
                                <span className="h-3 w-px bg-slate-400"></span>
                                <span>{recordingMode === 'call' && callMethod === 'voip' ? 'VoIP Call' : 'Recording'}</span>
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {/* Main Mode Toggle */}
                                <div className="flex bg-slate-200 dark:bg-surface-dark rounded-lg p-0.5 w-fit">
                                    <button
                                        onClick={() => setRecordingMode('meeting')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${recordingMode === 'meeting' ? 'bg-white dark:bg-primary text-primary dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                        {t('modeMeeting')}
                                    </button>
                                    <button
                                        onClick={() => setRecordingMode('call')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${recordingMode === 'call' ? 'bg-white dark:bg-primary text-primary dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                        {t('modeCall')}
                                    </button>
                                </div>

                                {/* Sub Mode Toggle (Only visible if Call) */}
                                {recordingMode === 'call' && (
                                    <div className="flex bg-slate-200 dark:bg-surface-dark rounded-lg p-0.5 w-fit animate-in fade-in slide-in-from-left-2">
                                        <button
                                            onClick={() => setCallMethod('external')}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${callMethod === 'external' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                            <span className="material-symbols-outlined text-[14px]">speaker_phone</span>
                                            {t('methodExternal')}
                                        </button>
                                        <button
                                            onClick={() => setCallMethod('voip')}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${callMethod === 'voip' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 shadow-sm border border-green-500/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                            <span className="material-symbols-outlined text-[14px]">dialpad</span>
                                            {t('methodVoip')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <LanguageSelector />
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isRecording && !isPaused ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
                            <div className={`size-2.5 rounded-full ${isRecording && !isPaused ? 'bg-red-500 animate-pulse-red' : 'bg-yellow-500'}`}></div>
                            <span className={`${isRecording && !isPaused ? 'text-red-500' : 'text-yellow-500'} text-xs font-bold uppercase tracking-wider`}>
                                {isPaused ? t('paused') : (isRecording ? t('recording') : t('ready'))}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-full min-h-0 flex-1">
                <div className="w-full lg:w-2/3 flex flex-col gap-6 h-auto min-h-[400px] lg:h-full shrink-0">
                    <div className="flex-1 flex flex-col bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm relative overflow-hidden h-[400px] lg:h-auto transition-all">

                        {/* Dynamic Instruction Banner */}
                        {recordingMode === 'call' && !isRecording && (
                            <div className={`absolute top-0 left-0 right-0 border-b text-xs px-4 py-2 z-20 text-center animate-in fade-in slide-in-from-top-2 ${callMethod === 'voip' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}`}>
                                {callMethod === 'voip' ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-sm">headset_mic</span>
                                        {t('voipFeatureDesc')}
                                    </span>
                                ) : (
                                    <p dangerouslySetInnerHTML={{ __html: t('callInstruction').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }}></p>
                                )}
                            </div>
                        )}

                        {/* Microphone Source Selector */}
                        <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 mt-8 md:mt-0">
                            <div className="relative">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowInputMenu(!showInputMenu); }}
                                    disabled={isRecording && !isPaused}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#111722]/80 backdrop-blur border border-border-light dark:border-border-dark text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1e2736] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="material-symbols-outlined text-sm">mic</span>
                                    <span className="max-w-[150px] truncate">
                                        {inputDevices.find(d => d.deviceId === selectedDeviceId)?.label || 'Default Microphone'}
                                    </span>
                                    <span className="material-symbols-outlined text-sm">expand_more</span>
                                </button>

                                {showInputMenu && (
                                    <div className="absolute top-full left-0 mt-2 w-72 max-h-60 overflow-y-auto bg-white dark:bg-[#1e2736] border border-border-light dark:border-border-dark rounded-xl shadow-xl z-20 py-1">
                                        {inputDevices.length === 0 && (
                                            <div className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">{t('noMic')}</div>
                                        )}
                                        {inputDevices.map((device) => (
                                            <button
                                                key={device.deviceId}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeviceChange(device.deviceId);
                                                    setShowInputMenu(false);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-[#232f48] transition-colors ${selectedDeviceId === device.deviceId ? 'text-primary bg-primary/5' : 'text-slate-700 dark:text-slate-300'}`}
                                            >
                                                <span className={`material-symbols-outlined text-sm ${selectedDeviceId === device.deviceId ? 'opacity-100' : 'opacity-0'}`}>check</span>
                                                <span className="truncate">
                                                    {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* MAIN CONTENT AREA */}
                        <div className="flex-1 flex items-center justify-center relative bg-gradient-to-b from-transparent to-primary/5">

                            {/* VoIP Dialer Interface */}
                            {recordingMode === 'call' && callMethod === 'voip' && callStatus === 'idle' ? (
                                <div className="flex flex-col gap-6 items-center w-full max-w-xs animate-in zoom-in-95 duration-200 z-10">
                                    {/* CALLER ID INFO */}
                                    <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold flex flex-col items-center">
                                        <span>{t('callingAs')}</span>
                                        {user?.phoneVerified ? (
                                            <span className="text-primary mt-1 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">verified</span>
                                                {callerId}
                                            </span>
                                        ) : (
                                            <button onClick={() => onNavigate(AppRoute.SETTINGS)} className="text-yellow-500 mt-1 flex items-center gap-1 hover:underline">
                                                <span className="material-symbols-outlined text-sm">warning</span>
                                                {t('setupCallerId')}
                                            </button>
                                        )}
                                    </div>

                                    <input
                                        type="tel"
                                        placeholder={t('enterNumber')}
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full text-center text-2xl md:text-3xl font-bold bg-transparent border-b-2 border-slate-300 dark:border-slate-600 focus:border-green-500 outline-none pb-2 text-slate-900 dark:text-white placeholder-slate-400"
                                    />
                                    <div className="grid grid-cols-3 gap-4 w-full px-4">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((key) => (
                                            <button
                                                key={key}
                                                onClick={() => setPhoneNumber(p => p + key)}
                                                className="aspect-square rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-lg font-bold text-slate-700 dark:text-slate-200 transition-colors"
                                            >
                                                {key}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleDial}
                                        disabled={!phoneNumber}
                                        className="size-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <span className="material-symbols-outlined text-3xl">call</span>
                                    </button>
                                </div>
                            ) : (
                                // Normal Visualizer View (Used for Meeting, External Call, or Active VoIP Call)
                                <div className="flex items-center gap-1.5 h-32 w-full justify-center opacity-80">
                                    {visualizerData.map((h, i) => (
                                        <div
                                            key={i}
                                            className={`w-2 rounded-full transition-all duration-75 ${isRecording ? 'bg-primary' : 'bg-slate-400 dark:bg-slate-600'}`}
                                            style={{ height: `${h}%` }}
                                        ></div>
                                    ))}
                                </div>
                            )}

                            {/* Status Overlays */}
                            {callStatus === 'connecting' && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background-light/90 dark:bg-surface-dark/90 z-20">
                                    <div className="size-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-4 animate-pulse">
                                        <span className="material-symbols-outlined text-4xl">wifi_calling_3</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('connecting')}</h3>
                                    <p className="text-slate-500">{phoneNumber}</p>
                                </div>
                            )}

                            {/* Ready State Label (Only if not VoIP dialer mode) */}
                            {!isRecording && callStatus === 'idle' && !(recordingMode === 'call' && callMethod === 'voip') && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="flex flex-col items-center gap-2">
                                        <p className="text-slate-400 dark:text-slate-500 font-medium bg-surface-light/80 dark:bg-surface-dark/80 px-4 py-2 rounded-full backdrop-blur-sm border border-border-light dark:border-border-dark">
                                            {recordingMode === 'call' ? t('methodExternal') : t('readyCapture')}
                                        </p>
                                        {recordingMode === 'call' && <span className="material-symbols-outlined text-slate-500 text-3xl">phone_iphone</span>}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* FOOTER CONTROLS */}
                        <div className="px-4 md:px-8 pb-8 pt-4 flex flex-col items-center border-t border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
                            {/* Timer */}
                            <div className={`text-5xl md:text-7xl font-mono font-bold tracking-wider mb-8 tabular-nums ${callStatus === 'active' ? 'text-green-500' : 'text-slate-900 dark:text-white'}`}>
                                {formatTime(seconds)}
                            </div>

                            <div className="flex items-center gap-6 md:gap-8 w-full justify-center max-w-xl relative">
                                {/* Mark button */}
                                {(isRecording || callStatus === 'active') && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 md:block">
                                        <button
                                            onClick={handleMark}
                                            className="group flex flex-col items-center gap-1 text-slate-500 hover:text-primary transition-colors">
                                            <div className="size-10 md:size-12 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center bg-transparent group-hover:bg-primary/10 group-hover:border-primary transition-all">
                                                <span className="material-symbols-outlined text-xl md:text-2xl">flag</span>
                                            </div>
                                            <span className="hidden md:block text-xs font-medium">{t('mark')}</span>
                                        </button>
                                    </div>
                                )}

                                {/* Main Action Buttons */}
                                {callMethod === 'voip' ? (
                                    // VOIP CONTROLS
                                    callStatus === 'idle' ? (
                                        <div className="h-20 flex items-center text-slate-400 text-sm">
                                            {t('enterNumber')}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={endCall}
                                            className="size-16 md:size-20 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 text-white flex items-center justify-center transition-all transform hover:scale-105" title="Hang Up">
                                            <span className="material-symbols-outlined text-3xl md:text-4xl">call_end</span>
                                        </button>
                                    )
                                ) : (
                                    // STANDARD RECORDING CONTROLS
                                    !isRecording ? (
                                        <button
                                            onClick={startRecording}
                                            className="size-16 md:size-20 rounded-full bg-primary hover:bg-primary-hover shadow-lg shadow-primary/30 text-white flex items-center justify-center transition-all transform hover:scale-105" title="Start Recording">
                                            <span className="material-symbols-outlined text-3xl md:text-4xl">mic</span>
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleStopButton}
                                                className="size-12 md:size-14 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white flex items-center justify-center transition-all" title="Stop Recording">
                                                <span className="material-symbols-outlined text-2xl md:text-3xl">stop_circle</span>
                                            </button>
                                            <button
                                                onClick={togglePause}
                                                className="size-16 md:size-20 rounded-full bg-primary hover:bg-primary-hover shadow-lg shadow-primary/30 text-white flex items-center justify-center transition-all transform hover:scale-105" title={isPaused ? "Resume" : "Pause"}>
                                                <span className="material-symbols-outlined text-4xl md:text-5xl">{isPaused ? 'play_arrow' : 'pause'}</span>
                                            </button>
                                        </>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-1/3 flex flex-col gap-4 h-auto min-h-[400px] lg:h-full shrink-0 pb-6 lg:pb-0">
                    <div className="flex flex-col h-full bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden h-[400px] lg:h-auto">
                        <div className="flex items-center border-b border-border-light dark:border-border-dark px-2">
                            <button
                                onClick={() => setActiveTab('notes')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'notes' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                                {t('notes')}
                            </button>
                            <button
                                onClick={() => setActiveTab('media')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'media' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                                {t('media')}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 relative bg-slate-50 dark:bg-[#151b26] min-h-0" ref={notesContainerRef}>
                            <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400 shrink-0">
                                <span className="font-mono">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span>{t('sessionInit')}</span>
                            </div>

                            {isRecording && (
                                <div className="flex gap-3 text-xs text-primary bg-primary/10 p-2 rounded shrink-0">
                                    <span className="font-bold">Info:</span>
                                    <span>{callStatus === 'active' ? t('callActive') : t('recordingProgress')}</span>
                                </div>
                            )}

                            {activeTab === 'notes' ? (
                                <>
                                    {notes.length === 0 && !isRecording && (
                                        <div className="flex flex-col items-center justify-center flex-1 text-slate-400 opacity-60">
                                            <span className="material-symbols-outlined text-4xl mb-2">edit_note</span>
                                            <p className="text-sm">Notes you take will appear here.</p>
                                        </div>
                                    )}
                                    {notes.map(note => (
                                        <div key={note.id} className="flex gap-3 animate-in slide-in-from-bottom-2 fade-in duration-300">
                                            <div className="pt-1">
                                                <div className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">{note.timestamp}</div>
                                            </div>
                                            <div className="flex-1 bg-white dark:bg-surface-dark p-3 rounded-lg rounded-tl-none border border-border-light dark:border-border-dark shadow-sm">
                                                <p className="text-sm text-slate-800 dark:text-slate-200">{note.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <>
                                    {mediaItems.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center flex-1 text-slate-400 opacity-60">
                                            <span className="material-symbols-outlined text-4xl mb-2">image</span>
                                            <p className="text-sm text-center">Upload whiteboards, slides, or<br />photos to add context.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3">
                                            {mediaItems.map(item => (
                                                <div key={item.id} className="relative aspect-video rounded-lg overflow-hidden border border-border-light dark:border-border-dark group">
                                                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                                    <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                                                        {item.timestamp}
                                                    </div>
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="p-4 border-t border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
                            {activeTab === 'notes' ? (
                                <div className="relative">
                                    <textarea
                                        value={currentNote}
                                        onChange={(e) => setCurrentNote(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="w-full bg-slate-50 dark:bg-[#151b26] border border-border-light dark:border-border-dark rounded-lg p-3 pr-12 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-24 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                                        placeholder={t('typeNote')}
                                    ></textarea>
                                    <div className="absolute bottom-2 right-2 flex gap-1">
                                        <button
                                            onClick={handleSendNote}
                                            className="p-1.5 text-primary hover:text-primary-hover rounded-md hover:bg-primary/10 transition-colors"
                                            disabled={!currentNote.trim()}>
                                            <span className="material-symbols-outlined text-xl">send</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelected}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        onClick={handleUploadClick}
                                        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg h-24 text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all group">
                                        <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">cloud_upload</span>
                                        <span className="text-sm font-medium">{t('uploadImage')}</span>
                                    </button>
                                    <p className="text-[10px] text-center text-slate-400">{t('supportedFormats')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
