import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, TranscriptSegment, Recording, UserProfile } from '../../../types';
import { chatWithTranscript, transcribeAudio, generateMeetingSummary } from '../../../services/geminiService';
import { databaseService } from '../../../services/databaseService';
import { getSignedAudioUrl } from '../../../services/storageService';
import { useLanguage } from '../../../contexts/LanguageContext';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { jsPDF } from 'jspdf';
import ReactMarkdown from 'react-markdown';
import { logger } from '../../../services/loggingService';
import { WaveformVisualizer } from '../../../components/WaveformVisualizer';
import { supabase } from '../../../lib/supabase';

interface InlineEditorProps {
    recording: Recording;
    user: UserProfile;
    onUpdateRecording: (id: string, updates: Partial<Recording>) => void;
    onClose: () => void;
}

export const InlineEditor: React.FC<InlineEditorProps> = ({
    recording: initialRecording,
    user,
    onUpdateRecording,
    onClose
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
    const [summaryError, setSummaryError] = useState<string | null>(null);

    // Export State
    const [showExportMenu, setShowExportMenu] = useState(false);

    // Speaker Renaming State
    const [renamingSpeakerId, setRenamingSpeakerId] = useState<string | null>(null);
    const [newSpeakerName, setNewSpeakerName] = useState('');

    // LAZY LOAD DETAILS & SIGN URL
    useEffect(() => {
        let mounted = true;

        const loadFullDetails = async () => {
            console.log('[InlineEditor] Loading full details for:', initialRecording.id);

            // ALWAYS load from database to ensure complete data
            setIsLoadingDetails(true);
            const fullRec = await databaseService.getRecordingDetails(initialRecording.id);

            if (mounted && fullRec) {
                console.log('[InlineEditor] Loaded full recording:', {
                    id: fullRec.id,
                    hasAudio: !!fullRec.audioUrl,
                    segmentsCount: fullRec.segments?.length || 0,
                    hasSummary: !!fullRec.summary
                });

                setRecording(fullRec);
                setSegments(fullRec.segments || []);
                setSummary(fullRec.summary || '');
                setEditTitle(fullRec.title);

                // GENERATE SIGNED URL
                if (fullRec.audioUrl) {
                    if (fullRec.audioUrl.startsWith('data:')) {
                        setSignedAudioUrl(fullRec.audioUrl);
                    } else {
                        const signed = await getSignedAudioUrl(fullRec.audioUrl);
                        if (mounted && signed) {
                            setSignedAudioUrl(signed);
                        }
                    }
                }
            } else {
                console.error('[InlineEditor] Failed to load recording details');
            }

            if (mounted) setIsLoadingDetails(false);
        };

        loadFullDetails();

        return () => {
            mounted = false;
        };
    }, [initialRecording.id]);

    // Sync local state when initialRecording prop updates (to handle parent updates like speaker renames or title changes)
    useEffect(() => {
        if (initialRecording.segments && initialRecording.segments.length > 0) {
            setSegments(initialRecording.segments);
        }
    }, [initialRecording.segments]);

    useEffect(() => {
        if (initialRecording.summary) {
            setSummary(initialRecording.summary);
        }
    }, [initialRecording.summary]);

    useEffect(() => {
        if (initialRecording.title && !isEditingTitle) {
            setEditTitle(initialRecording.title);
        }
    }, [initialRecording.title, isEditingTitle]);

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

    const handleRenameSpeaker = (oldName: string) => {
        if (!newSpeakerName.trim()) {
            setRenamingSpeakerId(null);
            return;
        }

        const updatedSegments = segments.map(seg =>
            seg.speaker === oldName ? { ...seg, speaker: newSpeakerName.trim() } : seg
        );

        setSegments(updatedSegments);
        onUpdateRecording(recording.id, { segments: updatedSegments });
        setRenamingSpeakerId(null);
        setNewSpeakerName('');
    };

    const formatSpeakerName = (rawName: string) => {
        if (rawName.startsWith('SPEAKER_')) {
            const num = rawName.split('_')[1];
            return `Hablante ${parseInt(num) + 1}`;
        }
        return rawName;
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
                // Defensive check for meta
                if (meta) {
                    const matches = meta.match(/:(.*?);/);
                    if (matches && matches[1]) mimeType = matches[1];
                }
            } else {
                if (recording.audioUrl?.endsWith('.webm')) mimeType = 'audio/webm';
                else if (recording.audioUrl?.endsWith('.wav')) mimeType = 'audio/wav';
                else if (recording.audioUrl?.endsWith('.m4a')) mimeType = 'audio/x-m4a';
            }

            // Transcribe using the signed URL
            const targetLang = user.transcriptionLanguage || language || 'es';
            const result = await transcribeAudio(base64, mimeType, targetLang, signedAudioUrl);

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

        // Plan gating: Free users cannot generate summaries
        if (user.subscription.planId === 'free') {
            setShowLimitModal(true);
            return;
        }

        setIsSummarizing(true);
        setSummaryError(null);
        setShowSummaryModal(true); // Abrir modal de inmediato para mostrar estado de carga
        try {
            const targetLang = user.transcriptionLanguage || language || 'es';

            // Prepare attachments with relative timestamps
            // Prepare attachments with relative timestamps AND SIGNED URLS
            let preparedAttachments: any[] = [];
            if (recording.metadata?.attachments && recording.date) {
                const startTime = new Date(recording.date).getTime();

                preparedAttachments = await Promise.all(recording.metadata.attachments.map(async (att) => {
                    const diffMs = att.timestamp - startTime;
                    const diffSec = Math.max(0, Math.floor(diffMs / 1000));
                    const h = Math.floor(diffSec / 3600).toString().padStart(2, '0');
                    const m = Math.floor((diffSec % 3600) / 60).toString().padStart(2, '0');
                    const s = (diffSec % 60).toString().padStart(2, '0');

                    // Sign the URL if path exists
                    let finalUrl = att.url;
                    if (att.path) {
                        const signed = await getSignedAudioUrl(att.path);
                        if (signed) finalUrl = signed;
                    }

                    return {
                        time: `${h}:${m}:${s}`,
                        url: finalUrl
                    };
                }));
            }

            const summaryText = await generateMeetingSummary(fullTranscript, targetLang, selectedTemplate, preparedAttachments);
            setSummary(summaryText);
            onUpdateRecording(recording.id, { summary: summaryText });
        } catch (error: any) {
            logger.error('Failed to summarize', { error, recordingId: recording.id }, user.id);
            setSummaryError(error.message || "Failed to generate summary.");
        } finally {
            setIsSummarizing(false);
            setShowTemplateMenu(false);
        }
    };

    // Chat Logic
    const handleAskDiktalo = async () => {
        if (!query.trim()) return;

        // Plan gating: Free users cannot use Ask Diktalo
        if (user.subscription.planId === 'free') {
            setShowLimitModal(true);
            setQuery('');
            return;
        }

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
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#0b0f17] overflow-hidden transition-colors duration-200" onClick={() => { setShowExportMenu(false); setShowTemplateMenu(false); }}>
            {/* Hidden Audio Element */}
            <audio ref={audioRef} src={signedAudioUrl || undefined} preload="none" />

            {/* FIXED AREA: Header + Slim Player */}
            <div className="flex-shrink-0 flex flex-col z-50 border-b border-black/[0.05] dark:border-white/[0.05]">
                {/* Header */}
                <header className="flex items-center justify-between whitespace-nowrap bg-white dark:bg-background-dark px-6 py-3">
                    <div className="flex items-center gap-4 text-slate-900 dark:text-white flex-shrink min-w-0">
                        <div className="size-8 text-[#8e8e8e] hover:text-[#0d0d0d] dark:hover:text-white cursor-pointer flex items-center justify-center rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-all" onClick={onClose}>
                            <span className="material-symbols-outlined text-xl">close</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                                {isEditingTitle ? (
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        onBlur={handleTitleSave}
                                        onKeyDown={handleTitleKeyDown}
                                        autoFocus
                                        className="bg-transparent border-b border-blue-600 text-[#0d0d0d] dark:text-white text-[15px] font-semibold outline-none p-0 w-[200px]"
                                    />
                                ) : (
                                    <>
                                        <h2 className="text-[#0d0d0d] dark:text-white text-[15px] font-semibold cursor-pointer hover:text-blue-600 transition-colors truncate max-w-[200px] md:max-w-md" onClick={() => setIsEditingTitle(true)}>
                                            {recording.title}
                                        </h2>
                                        <button onClick={() => setIsEditingTitle(true)} className="text-[#8e8e8e] hover:text-blue-600 transition-colors flex items-center">
                                            <span className="material-symbols-outlined text-xs">edit</span>
                                        </button>
                                    </>
                                )}
                            </div>
                            <span className="text-[11px] text-[#8e8e8e] font-medium">{recording.date}</span>
                        </div>
                    </div>

                    {/* Right Actions - Slimmer but Functional */}
                    <div className="flex gap-2 items-center flex-shrink-0">
                        <div className="hidden sm:block"><ThemeToggle /></div>

                        {/* Regenerate Transcription - Only when transcript exists */}
                        {segments.length > 0 && (
                            <button
                                onClick={handleTranscribeAudio}
                                disabled={isTranscribing || !signedAudioUrl}
                                title="Regenerar transcripción"
                                className="flex items-center h-8 px-3 rounded-full bg-slate-200 dark:bg-[#232f48] text-slate-900 dark:text-white text-xs font-semibold hover:bg-slate-300 dark:hover:bg-[#2f3e5c] transition-all gap-1.5 disabled:opacity-50"
                            >
                                {isTranscribing ? (
                                    <span className="material-symbols-outlined animate-spin text-base">sync</span>
                                ) : (
                                    <span className="material-symbols-outlined text-base">refresh</span>
                                )}
                                <span className="hidden md:inline">Regenerar</span>
                            </button>
                        )}

                        <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowTemplateMenu(!showTemplateMenu); }}
                                disabled={segments.length === 0 || isSummarizing}
                                className="flex items-center h-8 px-3 rounded-full bg-slate-200 dark:bg-[#232f48] text-slate-900 dark:text-white text-xs font-semibold hover:bg-slate-300 dark:hover:bg-[#2f3e5c] transition-all gap-1.5 disabled:opacity-50">
                                {isSummarizing ? (
                                    <span className="material-symbols-outlined animate-spin text-base">sync</span>
                                ) : (
                                    <span className="material-symbols-outlined text-base">analytics</span>
                                )}
                                <span className="hidden md:inline">{isSummarizing ? t('thinking') : t('summarize')}</span>
                                <span className="material-symbols-outlined text-xs opacity-50">expand_more</span>
                            </button>
                            {showTemplateMenu && (
                                <div className="absolute right-0 top-10 w-64 bg-white dark:bg-[#1e2736] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl py-1 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                    <div className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-white/5">{t('selectTemplate')}</div>
                                    {[
                                        { id: 'general', label: t('templateGeneral'), icon: 'summarize' },
                                        { id: 'medical', label: t('templateMedical'), icon: 'stethoscope' },
                                        { id: 'sales', label: t('templateSales'), icon: 'point_of_sale' },
                                        { id: 'legal', label: t('templateLegal'), icon: 'gavel' },
                                        { id: 'edu', label: t('templateEdu'), icon: 'school' },
                                    ].map(tpl => (
                                        <button
                                            key={tpl.id}
                                            onClick={() => { setSelectedTemplate(tpl.id); handleSummarize(); setShowTemplateMenu(false); }}
                                            className="w-full text-left px-4 py-2 text-xs text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2 group transition-colors">
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
                            className={`flex items-center h-8 px-3 rounded-full text-xs font-semibold transition-all gap-1.5 ${showChat ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-[#232f48] text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-[#2f3e5c] disabled:opacity-50'}`}>
                            <span className="material-symbols-outlined text-base">auto_awesome</span>
                            <span className="hidden md:inline">{t('askDiktalo')}</span>
                        </button>

                        <button
                            onClick={handleDownloadAudio}
                            disabled={!recording.audioUrl}
                            title={user.subscription.planId === 'free' ? t('downloadRequiresPro') : t('downloadAudio')}
                            className={`flex items-center h-8 px-3 rounded-full text-xs font-semibold transition-all gap-1.5 ${user.subscription.planId === 'free' ? 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-400 opacity-50 cursor-not-allowed' : 'bg-slate-200 dark:bg-[#232f48] text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-[#2f3e5c] disabled:opacity-50'}`}>
                            <span className="material-symbols-outlined text-base">{user.subscription.planId === 'free' ? 'lock' : 'download'}</span>
                            <span className="hidden md:inline text-[10px] md:text-xs">Audio</span>
                        </button>

                        <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowExportMenu(!showExportMenu); }}
                                disabled={segments.length === 0}
                                className="flex items-center h-8 w-8 md:w-auto md:px-3 rounded-full bg-slate-200 dark:bg-[#232f48] text-slate-900 dark:text-white text-xs font-semibold hover:bg-slate-300 dark:hover:bg-[#2f3e5c] transition-all gap-1.5 disabled:opacity-50">
                                <span className="material-symbols-outlined text-base">ios_share</span>
                                <span className="hidden md:inline">{t('export')}</span>
                            </button>
                            {showExportMenu && (
                                <div className="absolute right-0 top-10 w-48 bg-white dark:bg-[#1e2736] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl py-1 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                    {['txt', 'srt', 'json', 'clipboard'].map((fmt) => (
                                        <button key={fmt} onClick={() => { handleExport(fmt as any); setShowExportMenu(false); }} className="w-full text-left px-4 py-2.5 text-xs text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2 transition-colors">
                                            <span className="material-symbols-outlined text-base text-slate-400">
                                                {fmt === 'txt' ? 'description' : fmt === 'srt' ? 'closed_caption' : fmt === 'json' ? 'data_object' : 'content_copy'}
                                            </span>
                                            <span className="uppercase">{fmt}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* SLIM PLAYER BAR */}
                <div className="bg-white dark:bg-background-dark px-6 py-4 flex items-center gap-4">
                    <button
                        onClick={togglePlay}
                        disabled={!signedAudioUrl}
                        className={`size-10 rounded-full text-white flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 flex-shrink-0 ${!signedAudioUrl ? 'bg-gray-400 dark:bg-gray-700 opacity-50' : 'bg-primary shadow-lg shadow-primary/20'}`}>
                        <span className="material-symbols-outlined text-2xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
                    </button>

                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            <span className="text-slate-900 dark:text-white font-bold">{formatTime(currentTime)}</span>
                            <span>{formatTime(isFinite(duration) && duration > 0 ? duration : recording.durationSeconds)}</span>
                        </div>

                        <div className="relative h-8 bg-slate-200 dark:bg-black/40 rounded-lg overflow-hidden group/wave border border-slate-300 dark:border-white/5">
                            {signedAudioUrl ? (
                                <WaveformVisualizer
                                    audioUrl={signedAudioUrl}
                                    currentTime={currentTime}
                                    duration={isFinite(duration) && duration > 0 ? duration : Number(recording.durationSeconds) || 1}
                                    onSeek={handleSeekTime}
                                    barColor="#3b82f6"
                                    progressColor="#60a5fa"
                                    height={32}
                                    barWidth={2}
                                    barGap={1}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-500 dark:text-slate-600 text-[10px] italic">
                                    {t('loading')}...
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0 pl-2">
                        {/* Speed Toggle */}
                        <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); }}
                                className="flex items-center gap-1.5 h-8 px-2.5 bg-slate-200 dark:bg-white/5 rounded-full border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 text-[10px] font-bold hover:text-slate-900 dark:hover:text-white transition-all">
                                <span className="material-symbols-outlined text-base">speed</span>
                                {playbackRate}x
                            </button>
                            {showSpeedMenu && (
                                <div className="absolute bottom-10 right-0 w-24 bg-white dark:bg-[#1e2736] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl py-1 z-50">
                                    {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(rate => (
                                        <button
                                            key={rate}
                                            onClick={() => { handlePlaybackRateChange(rate); setShowSpeedMenu(false); }}
                                            className={`w-full text-left px-4 py-2 text-[10px] hover:bg-slate-100 dark:hover:bg-white/5 ${playbackRate === rate ? 'text-primary font-bold' : 'text-slate-700 dark:text-slate-300'}`}
                                        >
                                            {rate === 1.0 ? 'Normal' : `${rate}x`}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Speaker Toggle */}
                        {supportsSetSinkId && outputDevices.length > 0 && (
                            <div className="relative">
                                <div className="flex items-center gap-1.5 h-8 px-2.5 bg-slate-200 dark:bg-white/5 rounded-full border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-base">volume_up</span>
                                    <select
                                        value={selectedOutputId}
                                        onChange={handleOutputChange}
                                        className="bg-transparent text-slate-700 dark:text-slate-300 text-[10px] font-bold outline-none focus:text-slate-900 dark:focus:text-white max-w-[100px] truncate cursor-pointer"
                                    >
                                        {outputDevices.map(device => (
                                            <option key={device.deviceId} value={device.deviceId} className="bg-white dark:bg-[#1e2736]">
                                                {device.label || `Device ${device.deviceId.slice(0, 5)}...`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* SCROLLABLE AREA: Transcript */}
            <div className="flex-1 overflow-y-auto relative bg-white dark:bg-background-dark">
                <main className="max-w-4xl mx-auto w-full px-6 py-8 mb-20">
                    <div className="min-h-[500px]">
                        {segments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                                <div className="size-20 rounded-full bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                                    <span className="material-symbols-outlined text-4xl">mic</span>
                                </div>
                                <h3 className="text-xl font-semibold text-[#0d0d0d] dark:text-white mb-2">{t('noTranscript')}</h3>
                                <p className="text-[#8e8e8e] max-w-xs mb-8">{t('readyToTranscribe')}</p>
                                <button
                                    onClick={handleTranscribeAudio}
                                    disabled={isTranscribing || !signedAudioUrl}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2 text-sm">
                                    {isTranscribing ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                                            {t('processing')}
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-lg">auto_awesome</span>
                                            {t('generateTranscript')}
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {segments.map((segment, index) => {
                                    // Check for temporal metadata matches
                                    const temporalMeta = recording.metadata?.segments?.find(
                                        meta => meta.segmentStartIndex === index
                                    );

                                    // DEBUG: Check why metadata might be missing
                                    if (index === 0) {
                                        console.log('[InlineEditor Debug] Recording:', recording.id);
                                        console.log('[InlineEditor Debug] Metadata:', recording.metadata);
                                        console.log('[InlineEditor Debug] Segments Length:', segments.length);
                                    }
                                    if (temporalMeta) {
                                        console.log('[InlineEditor Debug] Found Temporal Meta for index', index, temporalMeta);
                                    }

                                    // Calculate significant time gap (> 5 hours) from previous segment
                                    let timeGapDisplay = null;
                                    if (temporalMeta && index > 0 && recording.metadata?.segments) {
                                        const prevMeta = recording.metadata.segments.find(m => m.segmentEndIndex === index);
                                        if (prevMeta) {
                                            const prevDate = new Date(prevMeta.recordedAt);
                                            const currDate = new Date(temporalMeta.recordedAt);
                                            const diffHours = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60);

                                            if (diffHours > 24) {
                                                const diffDays = Math.floor(diffHours / 24);
                                                timeGapDisplay = `${diffDays} día${diffDays > 1 ? 's' : ''} después`;
                                            } else if (diffHours > 1) {
                                                timeGapDisplay = `${Math.floor(diffHours)} horas después`;
                                            }
                                        }
                                    }

                                    return (
                                        <React.Fragment key={segment.id}>
                                            {/* Date Separator */}
                                            {temporalMeta && (
                                                <div className="relative py-6 flex items-center justify-center">
                                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                                        <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
                                                    </div>
                                                    <div className="relative flex flex-col items-center gap-1 bg-slate-50 dark:bg-[#1a1a1a] px-4">
                                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 flex items-center gap-1.5 shadow-sm">
                                                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                                                            {new Date(temporalMeta.recordedAt).toLocaleDateString('es-ES', {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                        {timeGapDisplay && (
                                                            <span className="text-[10px] font-medium text-amber-600 dark:text-amber-500 flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-[12px]">schedule</span>
                                                                {timeGapDisplay}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div
                                                key={`segment-div-${segment.id}`}
                                                className="flex gap-6 group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] p-4 -mx-4 rounded-xl transition-all duration-200"
                                                onMouseUp={() => {
                                                    try {
                                                        const selection = window.getSelection();
                                                        if (selection && !selection.isCollapsed && selection.anchorNode && selection.focusNode) {
                                                            // Selection is valid
                                                        }
                                                    } catch (e) {
                                                        console.warn('Selection error suppressed:', e);
                                                    }
                                                }}
                                            >
                                                <div className="flex-shrink-0 w-12 pt-1">
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
                                                        className="text-[11px] font-mono font-medium text-[#8e8e8e] hover:text-blue-600 transition-colors"
                                                    >
                                                        {segment.timestamp}
                                                    </button>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        {renamingSpeakerId === segment.id ? (
                                                            <input
                                                                type="text"
                                                                value={newSpeakerName}
                                                                onChange={(e) => setNewSpeakerName(e.target.value)}
                                                                onBlur={() => handleRenameSpeaker(segment.speaker)}
                                                                onKeyDown={(e) => e.key === 'Enter' && handleRenameSpeaker(segment.speaker)}
                                                                autoFocus
                                                                className="bg-primary/20 border border-primary/40 text-[10px] font-black uppercase tracking-wider text-primary px-1.5 py-0.5 rounded outline-none w-24"
                                                            />
                                                        ) : (
                                                            <span
                                                                onClick={() => {
                                                                    setRenamingSpeakerId(segment.id);
                                                                    setNewSpeakerName(segment.speaker);
                                                                }}
                                                                className={`text-[10px] font-black uppercase tracking-[0.15em] cursor-pointer hover:underline px-0.5 transition-all bg-gradient-to-r ${segment.speakerColor} bg-clip-text text-transparent`}
                                                            >
                                                                {formatSpeakerName(segment.speaker)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-700 dark:text-slate-300 leading-normal text-sm lg:text-[15px] font-medium tracking-tight whitespace-pre-wrap">
                                                        {segment.text}
                                                    </p>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        )}

                        {/* Notes and Media Section */}
                        {(recording.notes && recording.notes.length > 0) || (recording.media && recording.media.length > 0) ? (
                            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/5">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">note</span>
                                    {'Notas y Adjuntos'}
                                </h3>

                                {/* Notes */}
                                {recording.notes && recording.notes.length > 0 && (
                                    <div className="mb-8 space-y-3">
                                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                                            {t('notes') || 'Notas'}
                                        </h4>
                                        {recording.notes.map((note) => (
                                            <div key={note.id} className="flex gap-4 items-start p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/30">
                                                <div className="flex-shrink-0">
                                                    <button
                                                        onClick={() => {
                                                            const timestamp = note.timestamp;
                                                            const parts = timestamp.split(':');
                                                            let seconds = 0;
                                                            if (parts.length === 2) {
                                                                seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
                                                            }
                                                            if (audioRef.current) {
                                                                audioRef.current.currentTime = seconds;
                                                                setCurrentTime(seconds);
                                                                audioRef.current.play();
                                                                setIsPlaying(true);
                                                            }
                                                        }}
                                                        className="text-xs font-mono font-bold text-amber-700 dark:text-amber-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                    >
                                                        {note.timestamp}
                                                    </button>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                                        {note.text}
                                                    </p>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-500 text-lg">edit_note</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Media Attachments */}
                                {recording.media && recording.media.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                                            {'Archivos Adjuntos'}
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {recording.media.map((media) => (
                                                <div key={media.id} className="flex flex-col gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800/30">
                                                    <div className="flex items-center justify-between">
                                                        <button
                                                            onClick={() => {
                                                                const timestamp = media.timestamp;
                                                                const parts = timestamp.split(':');
                                                                let seconds = 0;
                                                                if (parts.length === 2) {
                                                                    seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
                                                                }
                                                                if (audioRef.current) {
                                                                    audioRef.current.currentTime = seconds;
                                                                    setCurrentTime(seconds);
                                                                    audioRef.current.play();
                                                                    setIsPlaying(true);
                                                                }
                                                            }}
                                                            className="text-xs font-mono font-bold text-blue-700 dark:text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                        >
                                                            {media.timestamp}
                                                        </button>
                                                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-500 text-lg">image</span>
                                                    </div>

                                                    {/* Image Preview */}
                                                    <div className="relative rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                                                        <img
                                                            src={media.url}
                                                            alt={media.name}
                                                            className="w-full h-auto max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                            onClick={() => window.open(media.url, '_blank')}
                                                        />
                                                    </div>

                                                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate font-medium">
                                                        {media.name}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </main>
            </div>

            {/* AI Chat Sidebar */}
            {showChat && (
                <div className="w-80 md:w-96 border-l border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b0f17] flex flex-col shadow-2xl absolute right-0 top-0 bottom-0 z-[60] animate-in slide-in-from-right duration-300">
                    <div className="p-4 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-[#111722] text-slate-900 dark:text-white">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">auto_awesome</span>
                            {t('askDiktalo')}
                        </h3>
                        <button onClick={() => setShowChat(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {chatHistory.length === 0 && (
                            <div className="text-center text-slate-500 mt-10 text-xs px-6">
                                <p className="font-medium">Ask questions about the transcript.</p>
                                <p className="mt-2 opacity-60">Try: "Summarize the main points"</p>
                            </div>
                        )}
                        {chatHistory.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-slate-100 dark:bg-[#1e2736] text-slate-900 dark:text-slate-300 border border-slate-200 dark:border-white/5 rounded-bl-none'}`}>
                                    <div className="prose prose-invert prose-sm">
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 dark:bg-[#1e2736] rounded-2xl px-4 py-3 border border-slate-200 dark:border-white/5 rounded-bl-none">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#111722]">
                        <div className="relative">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAskDiktalo()}
                                placeholder={t('askDiktalo')}
                                className="w-full bg-white dark:bg-[#1e2736] text-slate-900 dark:text-white rounded-full py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 border border-slate-200 dark:border-white/10"
                            />
                            <button
                                onClick={handleAskDiktalo}
                                disabled={!query.trim() || isTyping}
                                className="absolute right-2 top-1.5 p-1 text-primary hover:bg-primary/10 rounded-full transition-colors disabled:opacity-50">
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showSummaryModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#111722] rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10">
                        <div className="p-5 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-[#111722] text-slate-900 dark:text-white">
                            <h3 className="text-base font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
                                {t('meetingSummary')}
                            </h3>
                            <button onClick={() => setShowSummaryModal(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 md:p-10 prose prose-invert prose-sm md:prose-base max-w-none">
                            {isSummarizing ? (
                                <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                                    <span className="material-symbols-outlined text-4xl animate-spin mb-4 text-primary">sync</span>
                                    <p className="text-sm">{t('thinking')}...</p>
                                </div>
                            ) : summaryError ? (
                                <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                                    <span className="material-symbols-outlined text-4xl text-red-500 mb-4">error</span>
                                    <p className="text-sm text-slate-400 mb-6">{summaryError}</p>
                                    <button
                                        onClick={handleSummarize}
                                        className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full text-sm font-bold border border-white/10 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-sm">replay</span>
                                        {t('retry') || 'Retry'}
                                    </button>
                                </div>
                            ) : (
                                <ReactMarkdown>{summary}</ReactMarkdown>
                            )}
                        </div>
                        <div className="p-5 border-t border-slate-200 dark:border-white/5 flex justify-end gap-3 bg-slate-50 dark:bg-[#0b0f17]">
                            {!summaryError && summary && (
                                <button
                                    onClick={() => { navigator.clipboard.writeText(summary); alert('Summary copied!'); }}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    {t('export')}
                                </button>
                            )}
                            <button
                                onClick={() => setShowSummaryModal(false)}
                                className="px-6 py-2 bg-primary hover:bg-blue-600 text-white rounded-full text-sm font-bold shadow-lg shadow-primary/20 transition-all">
                                {t('close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showLimitModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={() => setShowLimitModal(false)}>
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-8 max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-[#1f1f1f] dark:text-white mb-4">Límite alcanzado</h2>
                        <p className="text-[#8e8e8e] mb-6">Has alcanzado el límite de tu plan. Actualiza para continuar.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLimitModal(false)}
                                className="flex-1 px-4 py-2 bg-[#f5f5f5] dark:bg-[#2f2f2f] text-[#1f1f1f] dark:text-white rounded-lg hover:bg-[#ebebeb] dark:hover:bg-[#3c3c3c] transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
