import React, { useState, useRef, useEffect } from 'react';
import { AppRoute, ChatMessage, TranscriptSegment, Recording, UserProfile } from '../types';
import { chatWithTranscript, transcribeAudio, generateMeetingSummary } from '../services/geminiService';
import { databaseService } from '../services/databaseService';
import { getSignedAudioUrl } from '../services/storageService';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { ThemeToggle } from '../components/ThemeToggle';
import { LimitReachedModal } from '../components/LimitReachedModal';
import { jsPDF } from 'jspdf';
import ReactMarkdown from 'react-markdown';
import { logger } from '../services/loggingService';
import { WaveformVisualizer } from '../components/WaveformVisualizer';
import { supabase } from '../lib/supabase';

interface TranscriptEditorProps {
    onNavigate: (route: AppRoute) => void;
    recording: Recording;
    onUpdateRecording: (id: string, updates: Partial<Recording>) => void;
    user: UserProfile;
}

export const TranscriptEditor: React.FC<TranscriptEditorProps> = ({
    onNavigate,
    recording: initialRecording,
    onUpdateRecording,
    user
}) => {
    const { t, language } = useLanguage();

    // State for the full recording details (Lazy Loaded)
    const [recording, setRecording] = useState<Recording>(initialRecording);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [signedAudioUrl, setSignedAudioUrl] = useState<string | null>(null);

    // AI / Chat State
    const [showChat, setShowChat] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [query, setQuery] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Limit Modal State
    const [showLimitModal, setShowLimitModal] = useState(false);

    // Title Editing State
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitle, setEditTitle] = useState(recording.title);

    // Summary & Template State
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('general');
    const [showTemplateMenu, setShowTemplateMenu] = useState(false);

    // Playback Speed State
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);

    // Audio Player State
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Audio Output Device State
    const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedOutputId, setSelectedOutputId] = useState<string>('');
    const [supportsSetSinkId, setSupportsSetSinkId] = useState(false);

    // Transcription State
    const [segments, setSegments] = useState<TranscriptSegment[]>(recording.segments || []);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [summary, setSummary] = useState<string>(recording.summary || '');

    // Export State
    const [showExportMenu, setShowExportMenu] = useState(false);

    // LAZY LOAD DETAILS & SIGN URL
    useEffect(() => {
        let mounted = true;

        const loadFullDetails = async () => {
            let currentRec = initialRecording;

            // Check if we need to fetch details (missing audioUrl OR (completed but missing segments))
            if (!currentRec.audioUrl || (currentRec.status === 'Completed' && (!currentRec.segments || currentRec.segments.length === 0))) {
                setIsLoadingDetails(true);
                const fullRec = await databaseService.getRecordingDetails(currentRec.id);
                if (mounted && fullRec) {
                    setRecording(fullRec);
                    setSegments(fullRec.segments || []);
                    setSummary(fullRec.summary || '');
                    // Sync title
                    setEditTitle(fullRec.title);
                    currentRec = fullRec;
                }
                if (mounted) setIsLoadingDetails(false);
            } else {
                // Determine if we need to sync props to state
                setRecording(currentRec);
                setSegments(currentRec.segments || []);
                setSummary(currentRec.summary || '');
                setEditTitle(currentRec.title);
            }

            // GENERATE SIGNED URL
            if (currentRec.id && currentRec.audioUrl) {
                if (currentRec.audioUrl.startsWith('data:')) {
                    if (mounted) setSignedAudioUrl(currentRec.audioUrl);
                } else {
                    const signed = await getSignedAudioUrl(currentRec.audioUrl);
                    if (mounted && signed) {
                        setSignedAudioUrl(signed);
                    }
                }
            }
        };

        loadFullDetails();

        return () => {
            mounted = false;
        };
    }, [initialRecording.id]);

    // Sync local state when props change meaningfully
    useEffect(() => {
        setRecording(prev => ({
            ...prev,
            title: initialRecording.title,
            date: initialRecording.date,
            status: initialRecording.status
        }));
        setEditTitle(initialRecording.title);
    }, [initialRecording.title, initialRecording.date, initialRecording.status]);

    // Audio Device Setup
    useEffect(() => {
        const checkOutputSupport = async () => {
            try {
                // Only request if permission not granted, but getUserMedia triggers prompt. 
                // We'll assume user might have granted or we skip.
                // await navigator.mediaDevices.getUserMedia({ audio: true }); 
                const devices = await navigator.mediaDevices.enumerateDevices();
                const outputs = devices.filter(d => d.kind === 'audiooutput');
                setOutputDevices(outputs);
                if (outputs.length > 0) setSelectedOutputId(outputs[0].deviceId);

                const audio = document.createElement('audio');
                setSupportsSetSinkId('setSinkId' in audio);
            } catch (e) {
                console.error("Error enumerating devices", e);
            }
        };
        checkOutputSupport();

        const handleDeviceChange = async () => {
            const devices = await navigator.mediaDevices.enumerateDevices();
            setOutputDevices(devices.filter(d => d.kind === 'audiooutput'));
        };

        navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
        return () => navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    }, []);

    const handleOutputChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const deviceId = e.target.value;
        setSelectedOutputId(deviceId);
        if (audioRef.current && 'setSinkId' in audioRef.current) {
            try {
                await (audioRef.current as any).setSinkId(deviceId);
            } catch (err) {
                console.error("Failed to set audio output", err);
            }
        }
    };

    // Audio Event Listeners
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = async () => {
            const d = audio.duration;
            if (d && isFinite(d) && !isNaN(d) && d > 0) {
                setDuration(d);

                // Sync to DB if stored duration is missing/zero or differs significantly
                const storedDuration = recording.durationSeconds || 0;
                if (Math.abs(d - storedDuration) > 1 && recording.id) {
                    console.log(`[TranscriptEditor] Syncing duration to metadata: ${d}s`);

                    const h = Math.floor(d / 3600).toString().padStart(2, '0');
                    const m = Math.floor((d % 3600) / 60).toString().padStart(2, '0');
                    const s = Math.floor(d % 60).toString().padStart(2, '0');
                    const durationStr = `${h}:${m}:${s}`;

                    await databaseService.updateRecording(recording.id, {
                        durationSeconds: Math.floor(d),
                        duration: durationStr
                    });

                    // Update local state to avoid repeat syncs
                    setRecording(prev => ({ ...prev, durationSeconds: Math.floor(d), duration: durationStr }));
                }
            } else {
                const fallback = Number(recording.durationSeconds);
                if (isFinite(fallback) && fallback > 0) setDuration(fallback);
            }
        };
        const onEnded = () => setIsPlaying(false);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('durationchange', updateDuration);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);

        // Manually trigger once in case it already loaded
        updateDuration();

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('durationchange', updateDuration);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
        };
    }, [signedAudioUrl]); // Re-attach if url changes (audio element might reset)

    const togglePlay = async () => {
        if (!audioRef.current || !signedAudioUrl) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.playbackRate = playbackRate;
            try {
                await audioRef.current.play();
            } catch (err) {
                console.error("Playback failed", err);
                setIsPlaying(false);
            }
        }
    };

    const handlePlaybackRateChange = (rate: number) => {
        setPlaybackRate(rate);
        if (audioRef.current) {
            audioRef.current.playbackRate = rate;
        }
        setShowSpeedMenu(false);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!audioRef.current) return;
        const time = Number(e.target.value);
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const handleSeekTime = (time: number) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const formatTime = (time: any) => {
        const t = Number(time);
        if (isNaN(t) || !isFinite(t) || t < 0) {
            return "00:00:00";
        }
        const h = Math.floor(t / 3600);
        const m = Math.floor((t % 3600) / 60);
        const s = Math.floor(t % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleTranscribeAudio = async () => {
        if (!signedAudioUrl) {
            alert(t('audioNotReady') || "Audio not ready");
            return;
        }

        // BILLING PROTECTION
        const limitCheck = await databaseService.checkUsageLimit(user.id!);
        if (!limitCheck.allowed) {
            setShowLimitModal(true);
            return;
        }

        setIsTranscribing(true);
        try {
            let mimeType = 'audio/mp3';
            let base64 = undefined;

            if (signedAudioUrl.startsWith('data:')) {
                const parts = signedAudioUrl.split(',');
                const meta = parts[0];
                base64 = parts[1];
                const matches = meta.match(/:(.*?);/);
                if (matches && matches[1]) mimeType = matches[1];
            } else {
                if (recording.audioUrl?.endsWith('.webm')) mimeType = 'audio/webm';
                else if (recording.audioUrl?.endsWith('.wav')) mimeType = 'audio/wav';
                else if (recording.audioUrl?.endsWith('.m4a')) mimeType = 'audio/x-m4a';
            }

            // Transcribe using the signed URL
            const result = await transcribeAudio(base64, mimeType, language, signedAudioUrl);

            const newSegments: TranscriptSegment[] = result.map((s, index) => ({
                id: Date.now().toString() + index,
                timestamp: s.timestamp || "00:00",
                speaker: s.speaker || "Speaker",
                text: s.text || "",
                speakerColor: index % 2 === 0 ? 'from-blue-400 to-purple-500' : 'from-orange-400 to-red-500'
            }));

            setSegments(newSegments);
            onUpdateRecording(recording.id, { segments: newSegments, status: 'Completed' });
            await databaseService.incrementUsage(user.id!, recording.durationSeconds);

        } catch (error) {
            logger.error('Failed to transcribe', { error, recordingId: recording.id, language }, user.id);
            alert("Failed to transcribe audio. Please check your API key.");
        } finally {
            setIsTranscribing(false);
        }
    };

    // Summary Logic
    const fullTranscript = segments.map(s => `${s.speaker}: ${s.text}`).join('\n');

    const handleSummarize = async () => {
        if (segments.length === 0) return;
        setIsSummarizing(true);
        try {
            const summaryText = await generateMeetingSummary(fullTranscript, language);
            setSummary(summaryText);
            onUpdateRecording(recording.id, { summary: summaryText });
            setShowSummaryModal(true);
        } catch (error) {
            logger.error('Failed to summarize', { error, recordingId: recording.id }, user.id);
            alert("Failed to generate summary.");
        } finally {
            setIsSummarizing(false);
            setShowTemplateMenu(false);
        }
    };

    // Chat Logic
    const handleAskDiktalo = async () => {
        if (!query.trim()) return;

        const newMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: query, timestamp: new Date() };
        setChatHistory(prev => [...prev, newMsg]);
        setQuery('');
        setIsTyping(true);
        setShowChat(true);

        const context = segments.length > 0 ? fullTranscript : "No transcript available yet.";
        const response = await chatWithTranscript(context, chatHistory, newMsg.text, language);

        setIsTyping(false);
        setChatHistory(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: response, timestamp: new Date() }]);
    };

    // Title Logic
    const handleTitleSave = () => {
        setIsEditingTitle(false);
        if (editTitle.trim() && editTitle !== recording.title) {
            onUpdateRecording(recording.id, { title: editTitle.trim() });
        } else {
            setEditTitle(recording.title);
        }
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleTitleSave();
        if (e.key === 'Escape') {
            setEditTitle(recording.title);
            setIsEditingTitle(false);
        }
    };

    // Export Logic
    const timeToSeconds = (timeStr: string): number => {
        const parts = timeStr.split(':');
        if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        return 0;
    };

    const secondsToSRTTime = (seconds: number): string => {
        const date = new Date(0);
        date.setSeconds(seconds);
        const iso = date.toISOString().substr(11, 8);
        return `${iso},000`;
    };

    const generateSRT = (segs: TranscriptSegment[]): string => {
        return segs.map((seg, index) => {
            const startSeconds = timeToSeconds(seg.timestamp);
            const nextSeg = segs[index + 1];
            const endSeconds = nextSeg ? timeToSeconds(nextSeg.timestamp) : startSeconds + 5;
            return `${index + 1}\n${secondsToSRTTime(startSeconds)} --> ${secondsToSRTTime(endSeconds)}\n${seg.speaker}: ${seg.text}\n`;
        }).join('\n');
    };

    // Download Audio Feature (Pro+)
    const handleDownloadAudio = async () => {
        // Plan gating: Free users cannot download
        if (user.subscription.planId === 'free') {
            setShowLimitModal(true);
            return;
        }

        if (!recording.audioUrl) {
            alert(t('downloadFailed'));
            return;
        }

        try {
            // Extract file extension from the original audio URL
            const urlParts = recording.audioUrl.split('.');
            const fileExtension = urlParts.length > 1 ? urlParts[urlParts.length - 1] : 'webm';
            const fileName = `${recording.title || 'audio'}.${fileExtension}`;

            // Determine MIME type based on extension
            const mimeTypes: Record<string, string> = {
                'mp3': 'audio/mpeg',
                'webm': 'audio/webm',
                'wav': 'audio/wav',
                'm4a': 'audio/mp4',
                'aac': 'audio/aac',
                'ogg': 'audio/ogg',
                'opus': 'audio/opus',
                'flac': 'audio/flac'
            };
            const mimeType = mimeTypes[fileExtension.toLowerCase()] || 'audio/mpeg';

            // Download file directly from Supabase Storage
            const { data, error } = await supabase.storage
                .from('recordings')
                .download(recording.audioUrl);

            if (error) throw error;

            if (data) {
                // Create a properly typed blob
                const typedBlob = new Blob([data], { type: mimeType });
                const blobUrl = URL.createObjectURL(typedBlob);

                const link = document.createElement('a');
                link.style.display = 'none';
                link.href = blobUrl;
                link.download = fileName;
                link.setAttribute('download', fileName); // Redundant but ensures compatibility

                document.body.appendChild(link);
                link.click();

                // Cleanup after a short delay
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(blobUrl);
                }, 100);
            }
        } catch (err) {
            logger.error('Failed to download audio', { error: err, recordingId: recording.id }, user.id);
            alert(t('downloadFailed'));
        }
    };

    const handleExport = (format: 'txt' | 'json' | 'srt' | 'clipboard') => {
        if (segments.length === 0) return;
        let content = '';
        let mimeType = 'text/plain';
        let extension = 'txt';

        switch (format) {
            case 'json':
                content = JSON.stringify(segments, null, 2);
                mimeType = 'application/json';
                extension = 'json';
                break;
            case 'srt':
                content = generateSRT(segments);
                extension = 'srt';
                break;
            case 'txt':
            case 'clipboard':
                content = segments.map(s => `[${s.timestamp}] ${s.speaker}: ${s.text}`).join('\n\n');
                break;
        }

        if (format === 'clipboard') {
            navigator.clipboard.writeText(content).then(() => {
                alert('Transcript copied to clipboard!');
                setShowExportMenu(false);
            });
            return;
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcript_${recording.title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setShowExportMenu(false);
    };

    if (isLoadingDetails) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-[#0f1117] text-slate-500 dark:text-slate-400">
                <span className="material-symbols-outlined text-4xl animate-spin mb-4 text-primary">progress_activity</span>
                <p>{t('loading')}...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-screen bg-background-light dark:bg-background-dark overflow-hidden transition-colors duration-200" onClick={() => { setShowExportMenu(false); setShowTemplateMenu(false); }}>
            {/* Hidden Audio Element - PRELOAD NONE for Security/Cost */}
            <audio ref={audioRef} src={signedAudioUrl || undefined} preload="none" />

            {/* Header */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-border-dark bg-[#111722] px-4 lg:px-10 py-3 sticky top-0 z-50 shadow-md">
                <div className="flex items-center gap-2 md:gap-4 text-white flex-shrink min-w-0">
                    <div className="size-6 text-primary cursor-pointer flex-shrink-0" onClick={() => onNavigate(AppRoute.DASHBOARD)}>
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 h-7">
                            {isEditingTitle ? (
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onBlur={handleTitleSave}
                                    onKeyDown={handleTitleKeyDown}
                                    autoFocus
                                    className="bg-transparent border-b border-primary text-white text-base md:text-lg font-bold outline-none p-0 w-[140px] md:w-[200px] h-full"
                                />
                            ) : (
                                <>
                                    <h2 className="text-white text-base md:text-lg font-bold cursor-pointer hover:text-primary transition-colors truncate max-w-[120px] sm:max-w-[200px] md:max-w-md" onClick={() => setIsEditingTitle(true)}>
                                        {recording.title}
                                    </h2>
                                    <button onClick={() => setIsEditingTitle(true)} className="text-slate-500 hover:text-primary transition-colors flex items-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-base">edit</span>
                                    </button>
                                </>
                            )}
                        </div>
                        <span className="text-[10px] md:text-xs text-[#92a4c9] truncate">{recording.date}</span>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex gap-2 items-center flex-shrink-0">
                    <div className="scale-90 origin-right md:scale-100 hidden sm:block"><ThemeToggle /></div>
                    <div className="scale-90 origin-right md:scale-100"><LanguageSelector /></div>

                    <div className="relative">
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowTemplateMenu(!showTemplateMenu); }}
                            disabled={segments.length === 0 || isSummarizing}
                            className="flex items-center justify-center rounded-lg h-9 w-9 md:w-auto md:h-10 md:px-4 bg-[#232f48] text-white text-sm font-medium hover:bg-[#2f3e5c] transition-colors gap-2 disabled:opacity-50">
                            {isSummarizing ? (
                                <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                            ) : (
                                <span className="material-symbols-outlined text-lg">analytics</span>
                            )}
                            <span className="hidden md:inline">{isSummarizing ? t('thinking') : t('summarize')}</span>
                            <span className="material-symbols-outlined text-sm hidden md:inline opacity-70">expand_more</span>
                        </button>
                        {showTemplateMenu && (
                            <div className="absolute right-0 top-12 w-64 bg-[#1e2736] border border-border-dark rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('selectTemplate')}</div>
                                {[
                                    { id: 'general', label: t('templateGeneral'), icon: 'summarize' },
                                    { id: 'medical', label: t('templateMedical'), icon: 'stethoscope' },
                                    { id: 'sales', label: t('templateSales'), icon: 'point_of_sale' },
                                    { id: 'legal', label: t('templateLegal'), icon: 'gavel' },
                                    { id: 'edu', label: t('templateEdu'), icon: 'school' },
                                ].map(tpl => (
                                    <button
                                        key={tpl.id}
                                        onClick={() => { setSelectedTemplate(tpl.id); handleSummarize(); }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-[#232f48] flex items-center gap-2 group">
                                        <span className={`material-symbols-outlined text-lg ${selectedTemplate === tpl.id ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`}>{tpl.icon}</span>
                                        <span>{tpl.label}</span>
                                        {selectedTemplate === tpl.id && <span className="ml-auto material-symbols-outlined text-sm text-primary">check</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); setShowChat(!showChat); }}
                        disabled={segments.length === 0}
                        className={`flex items-center justify-center rounded-lg h-9 w-9 md:w-auto md:h-10 md:px-4 text-white text-sm font-medium transition-colors gap-2 ${showChat ? 'bg-primary shadow-[0_0_15px_rgba(19,91,236,0.3)]' : 'bg-[#232f48] hover:bg-[#2f3e5c] disabled:opacity-50'}`}>
                        <span className="material-symbols-outlined text-lg">auto_awesome</span>
                        <span className="hidden md:inline">{t('askDiktalo')}</span>
                    </button>

                    {/* Download Original Audio Button (Pro+) */}
                    <button
                        onClick={handleDownloadAudio}
                        disabled={!recording.audioUrl}
                        title={user.subscription.planId === 'free' ? t('downloadRequiresPro') : t('downloadAudio')}
                        className={`flex items-center justify-center rounded-lg h-9 w-9 md:w-auto md:h-10 md:px-4 text-white text-sm font-medium transition-colors gap-2 ${user.subscription.planId === 'free' ? 'bg-slate-600 cursor-not-allowed opacity-70' : 'bg-[#232f48] hover:bg-[#2f3e5c]'} disabled:opacity-50`}>
                        {user.subscription.planId === 'free' && <span className="material-symbols-outlined text-sm">lock</span>}
                        <span className="material-symbols-outlined text-lg">download</span>
                        <span className="hidden md:inline">{t('downloadAudio')}</span>
                    </button>

                    <div className="relative">
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowExportMenu(!showExportMenu); }}
                            disabled={segments.length === 0}
                            className="flex items-center justify-center rounded-lg h-9 w-9 md:w-auto md:h-10 md:px-4 bg-[#232f48] text-white text-sm font-medium hover:bg-[#2f3e5c] transition-colors gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            <span className="material-symbols-outlined text-lg">download</span>
                            <span className="hidden md:inline">{t('export')}</span>
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-0 top-12 w-52 bg-[#1e2736] border border-border-dark rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                                {['txt', 'srt', 'json', 'clipboard'].map((fmt) => (
                                    <button key={fmt} onClick={() => handleExport(fmt as any)} className="w-full text-left px-4 py-2.5 text-xs md:text-sm text-white hover:bg-[#232f48] flex items-center gap-2">
                                        <span className="material-symbols-outlined text-base md:text-lg text-slate-400 flex-shrink-0">
                                            {fmt === 'txt' ? 'description' : fmt === 'srt' ? 'closed_caption' : fmt === 'json' ? 'data_object' : 'content_copy'}
                                        </span>
                                        <span className="truncate">{fmt.toUpperCase()}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Main Editor */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-10 flex justify-center">
                    <div className="flex flex-col max-w-4xl w-full gap-6">
                        {/* Premium Media Player Glassmorphism */}
                        <div className="sticky top-0 z-40 mb-6 group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-[#1e2736]/80 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10 shadow-2xl">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <button
                                            onClick={togglePlay}
                                            disabled={!signedAudioUrl}
                                            className={`size-12 md:size-16 rounded-full text-white flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 ${!signedAudioUrl ? 'bg-gray-600 opacity-50 cursor-not-allowed' : 'bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20 hover:shadow-primary/40'}`}>
                                            <span className="material-symbols-outlined text-3xl md:text-4xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
                                        </button>

                                        <div className="flex-1 flex flex-col gap-2">
                                            <div className="flex justify-between items-end mb-1">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">{t('playback')}</span>
                                                    <span className="text-xl md:text-2xl font-mono font-bold text-white tabular-nums leading-none">
                                                        {formatTime(currentTime)}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">{t('duration')}</span>
                                                    <span className="text-sm md:text-base font-mono font-medium text-slate-300 tabular-nums leading-none">
                                                        {formatTime(isFinite(duration) && duration > 0 ? duration : recording.durationSeconds)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="relative h-16 md:h-20 bg-black/20 rounded-xl border border-white/5 overflow-hidden group/wave">
                                                {signedAudioUrl ? (
                                                    <>
                                                        <WaveformVisualizer
                                                            audioUrl={signedAudioUrl}
                                                            currentTime={currentTime}
                                                            duration={isFinite(duration) && duration > 0 ? duration : Number(recording.durationSeconds) || 1}
                                                            onSeek={handleSeekTime}
                                                            barColor="#3b82f6"
                                                            progressColor="#60a5fa"
                                                            height={80}
                                                            barWidth={3}
                                                            barGap={2}
                                                        />
                                                        {/* Note Markers on Timeline Area (using the same duration) */}
                                                        {recording.notes && recording.notes.length > 0 && recording.notes.map((note) => {
                                                            const noteTime = Number(note.timestamp);
                                                            const totalD = isFinite(duration) && duration > 0 ? duration : Number(recording.durationSeconds) || 1;
                                                            if (isNaN(noteTime) || noteTime > totalD) return null;
                                                            const leftPos = (noteTime / totalD) * 100;
                                                            return (
                                                                <div
                                                                    key={note.id}
                                                                    className="absolute top-0 bottom-0 w-1 bg-yellow-400/50 hover:bg-yellow-400 z-20 cursor-help transition-colors"
                                                                    style={{ left: `${leftPos}%` }}
                                                                    title={note.text}
                                                                    onClick={(e) => { e.stopPropagation(); handleSeekTime(noteTime); }}
                                                                />
                                                            );
                                                        })}
                                                    </>
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs italic">
                                                        {t('loading')}...
                                                    </div>
                                                )}
                                            </div>

                                            {/* Explicit Visible Slider */}
                                            <div className="relative w-full h-6 flex items-center group/slider">
                                                <input
                                                    type="range"
                                                    min={0}
                                                    max={isFinite(duration) && duration > 0 ? duration : Number(recording.durationSeconds) || 100}
                                                    step={0.1}
                                                    value={currentTime}
                                                    onChange={handleSeek}
                                                    disabled={!signedAudioUrl}
                                                    className="absolute inset-0 w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary group-hover/slider:h-1.5 transition-all"
                                                />
                                                <div
                                                    className="absolute h-1 bg-primary rounded-full pointer-events-none"
                                                    style={{ width: `${(currentTime / ((isFinite(duration) && duration > 0 ? duration : Number(recording.durationSeconds)) || 1)) * 100}%` }}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between mt-1">
                                                <div className="flex items-center gap-2">
                                                    {supportsSetSinkId && outputDevices.length > 0 && (
                                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                                                            <span className="material-symbols-outlined text-base text-slate-400">volume_up</span>
                                                            <select
                                                                value={selectedOutputId}
                                                                onChange={handleOutputChange}
                                                                className="bg-transparent text-slate-300 text-[10px] md:text-xs outline-none focus:text-white max-w-[120px] md:max-w-none truncate cursor-pointer"
                                                            >
                                                                {outputDevices.map(device => (
                                                                    <option key={device.deviceId} value={device.deviceId} className="bg-[#1e2736]">
                                                                        {device.label || `Device ${device.deviceId.slice(0, 5)}...`}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}

                                                    {/* Speed Control Selector */}
                                                    <div className="relative">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); }}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 text-slate-300 text-[10px] md:text-xs hover:text-white transition-colors">
                                                            <span className="material-symbols-outlined text-sm">speed</span>
                                                            {playbackRate}x
                                                        </button>
                                                        {showSpeedMenu && (
                                                            <div className="absolute bottom-10 left-0 w-24 bg-[#1e2736] border border-white/10 rounded-xl shadow-2xl py-1 z-50">
                                                                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(rate => (
                                                                    <button
                                                                        key={rate}
                                                                        onClick={() => handlePlaybackRateChange(rate)}
                                                                        className={`w-full text-left px-4 py-2 text-xs hover:bg-white/5 ${playbackRate === rate ? 'text-primary font-bold' : 'text-slate-300'}`}
                                                                    >
                                                                        {rate === 1.0 ? 'Normal' : `${rate}x`}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transcript Content */}
                        <div className="bg-white dark:bg-[#1e2736] rounded-xl shadow-sm border border-slate-200 dark:border-border-dark min-h-[500px] p-6">
                            {segments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <div className="size-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4 text-slate-400">
                                        <span className="material-symbols-outlined text-3xl">graphic_eq</span>
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">{t('noTranscript')}</h3>
                                    <p className="text-sm text-slate-500 max-w-xs mb-6">{t('readyToTranscribe')}</p>
                                    <button
                                        onClick={handleTranscribeAudio}
                                        disabled={isTranscribing || !signedAudioUrl}
                                        className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors shadow-lg shadow-primary/20 disabled:opacity-50">
                                        {isTranscribing ? t('processing') : t('generateTranscript')}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {segments.map((segment) => (
                                        <div key={segment.id} className="flex gap-4 group">
                                            <div className="flex-shrink-0 w-16 pt-1">
                                                <button
                                                    onClick={() => {
                                                        if (audioRef.current) {
                                                            const time = timeToSeconds(segment.timestamp);
                                                            audioRef.current.currentTime = time;
                                                            setCurrentTime(time);
                                                            audioRef.current.play();
                                                            setIsPlaying(true);
                                                        }
                                                    }}
                                                    className="text-xs font-mono text-primary hover:bg-primary/10 px-1.5 py-0.5 rounded transition-colors"
                                                >
                                                    {segment.timestamp}
                                                </button>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-xs font-bold uppercase tracking-wider bg-gradient-to-r ${segment.speakerColor} bg-clip-text text-transparent`}>
                                                        {segment.speaker}
                                                    </span>
                                                </div>
                                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base">
                                                    {segment.text}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* AI Chat Sidebar */}
                {showChat && (
                    <div className="w-80 md:w-96 border-l border-slate-200 dark:border-border-dark bg-white dark:bg-[#1e2736] flex flex-col shadow-2xl absolute right-0 top-0 bottom-0 z-50 animate-in slide-in-from-right duration-200">
                        <div className="p-4 border-b border-slate-200 dark:border-border-dark flex justify-between items-center bg-[#111722] text-white">
                            <h3 className="font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                                {t('askDiktalo')}
                            </h3>
                            <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#161d2a]">
                            {chatHistory.length === 0 && (
                                <div className="text-center text-slate-500 dark:text-slate-400 mt-10 text-sm">
                                    <p>Ask questions about the transcript.</p>
                                    <p className="mt-2 text-xs">Example: "Summarize the main points"</p>
                                </div>
                            )}
                            {chatHistory.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white dark:bg-[#232f48] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-border-dark rounded-bl-none'}`}>
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-[#232f48] px-4 py-3 rounded-2xl rounded-bl-none border border-slate-200 dark:border-border-dark">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-border-dark bg-white dark:bg-[#1e2736]">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAskDiktalo()}
                                    placeholder={t('askPlaceholder')}
                                    className="flex-1 bg-slate-100 dark:bg-[#111722] border-none rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary text-slate-900 dark:text-white"
                                />
                                <button
                                    onClick={handleAskDiktalo}
                                    disabled={!query.trim() || isTyping}
                                    className="bg-primary hover:bg-primary-dark text-white p-2.5 rounded-lg transition-colors disabled:opacity-50">
                                    <span className="material-symbols-outlined text-xl">send</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Summary Modal */}
            {showSummaryModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#1e2736] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200 shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h3 className="text-xl font-bold text-white">{t('meetingSummary')}</h3>
                            <button
                                onClick={() => setShowSummaryModal(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 text-slate-300">
                            <div className="prose prose-invert max-w-none prose-sm">
                                <ReactMarkdown>
                                    {summary}
                                </ReactMarkdown>
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-[#161d2a] rounded-b-2xl">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(summary);
                                    alert(t('copyClipboard') || 'Copied!');
                                }}
                                className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-medium transition-colors"
                            >
                                <span className="material-symbols-outlined text-base align-text-bottom mr-1">content_copy</span>
                                {t('copyClipboard')}
                            </button>
                            <button
                                onClick={() => setShowSummaryModal(false)}
                                className="px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-bold transition-colors"
                            >
                                {t('done')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showLimitModal && <LimitReachedModal onClose={() => setShowLimitModal(false)} onNavigate={onNavigate} />}
        </div>
    );
};
