
import React, { useState, useRef, useEffect } from 'react';
import { AppRoute, ChatMessage, TranscriptSegment, Recording } from '../types';
import { chatWithTranscript, transcribeAudio, generateMeetingSummary } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { ThemeToggle } from '../components/ThemeToggle';

interface TranscriptEditorProps {
    onNavigate: (route: AppRoute) => void;
    recording: Recording;
    onUpdateRecording: (id: string, updates: Partial<Recording>) => void;
}

export const TranscriptEditor: React.FC<TranscriptEditorProps> = ({ onNavigate, recording, onUpdateRecording }) => {
    const { t, language } = useLanguage();
    const [showChat, setShowChat] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [query, setQuery] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Title Editing State
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitle, setEditTitle] = useState(recording.title);

    // Summary & Template State
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('general');
    const [showTemplateMenu, setShowTemplateMenu] = useState(false);

    // Audio Player State
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Audio Output Device State
    const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedOutputId, setSelectedOutputId] = useState<string>('');
    const [supportsSetSinkId, setSupportsSetSinkId] = useState(false);

    // Transcription State (Initialize from recording prop)
    const [segments, setSegments] = useState<TranscriptSegment[]>(recording.segments || []);
    const [isTranscribing, setIsTranscribing] = useState(false);

    // Export State
    const [showExportMenu, setShowExportMenu] = useState(false);

    // Sync edit title with prop
    useEffect(() => {
        setEditTitle(recording.title);
    }, [recording.title]);

    // Update local segments if recording prop changes (e.g. re-opening)
    useEffect(() => {
        if (recording.segments) {
            setSegments(recording.segments);
        }
    }, [recording.segments]);

    useEffect(() => {
        // Check output device support
        const checkOutputSupport = async () => {
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true }); // Req permission for labels
                const devices = await navigator.mediaDevices.enumerateDevices();
                const outputs = devices.filter(d => d.kind === 'audiooutput');
                setOutputDevices(outputs);
                if (outputs.length > 0) setSelectedOutputId(outputs[0].deviceId);

                // Basic feature detection
                const audio = document.createElement('audio');
                setSupportsSetSinkId('setSinkId' in audio);
            } catch (e) {
                console.error("Error enumerating devices", e);
            }
        };
        checkOutputSupport();

        navigator.mediaDevices.addEventListener('devicechange', async () => {
            const devices = await navigator.mediaDevices.enumerateDevices();
            setOutputDevices(devices.filter(d => d.kind === 'audiooutput'));
        });
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

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const onEnded = () => setIsPlaying(false);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
        };
    }, []);

    const togglePlay = async () => {
        if (!audioRef.current) return;

        try {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                await audioRef.current.play();
            }
        } catch (err) {
            console.error("Playback failed", err);
            setIsPlaying(false); // Force state sync
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!audioRef.current) return;
        const time = Number(e.target.value);
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "00:00";
        const m = Math.floor(time / 60).toString().padStart(2, '0');
        const s = Math.floor(time % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                // Remove data url prefix (e.g. "data:audio/webm;base64,")
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const fullTranscript = segments.map(s => `${s.speaker}: ${s.text}`).join('\n');

    const handleTranscribeAudio = async () => {
        if (!recording.audioUrl) return;

        setIsTranscribing(true);
        try {
            // Check if audioUrl is a Data URI (starts with data:) or Blob URL (starts with blob:)
            let mimeType = 'audio/mp3';
            let base64 = '';

            if (recording.audioUrl.startsWith('data:')) {
                // It's a base64 data URI
                const parts = recording.audioUrl.split(',');
                const meta = parts[0]; // data:audio/webm;base64
                base64 = parts[1];
                // Extract mime
                const matches = meta.match(/:(.*?);/);
                if (matches && matches[1]) mimeType = matches[1];
            } else {
                // It's a blob URL (unlikely with new persistence logic, but fallback)
                const response = await fetch(recording.audioUrl);
                const blob = await response.blob();
                base64 = await blobToBase64(blob);
                mimeType = blob.type || 'audio/mp3';
            }

            const result = await transcribeAudio(base64, mimeType, language);

            // Map partial result to full TranscriptSegment with colors
            const newSegments: TranscriptSegment[] = result.map((s, index) => ({
                id: Date.now().toString() + index,
                timestamp: s.timestamp || "00:00",
                speaker: s.speaker || "Speaker",
                text: s.text || "",
                speakerColor: index % 2 === 0 ? 'from-blue-400 to-purple-500' : 'from-orange-400 to-red-500'
            }));

            setSegments(newSegments);

            // Save back to parent state
            onUpdateRecording(recording.id, {
                segments: newSegments,
                status: 'Completed'
            });

        } catch (error) {
            console.error("Failed to transcribe", error);
            alert("Failed to transcribe audio. Please check your API key.");
        } finally {
            setIsTranscribing(false);
        }
    };

    const handleSummarize = async () => {
        // Logic handled in menu selection now
        if (segments.length === 0) return;
        setIsSummarizing(true);
        try {
            // Here we would ideally pass the template to the backend.
            // For now, we simulate the 'intelligence' by just generating the standard summary
            // In a real implementation, `generateMeetingSummary` would take `selectedTemplate`
            const summary = await generateMeetingSummary(fullTranscript, language);

            // Update parent state
            onUpdateRecording(recording.id, { summary });
            setShowSummaryModal(true);
        } catch (error) {
            console.error("Failed to summarize", error);
            alert("Failed to generate summary.");
        } finally {
            setIsSummarizing(false);
            setShowTemplateMenu(false);
        }
    };

    const handleTitleSave = () => {
        setIsEditingTitle(false);
        if (editTitle.trim() && editTitle !== recording.title) {
            onUpdateRecording(recording.id, { title: editTitle.trim() });
        } else {
            setEditTitle(recording.title); // Revert if empty
        }
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleTitleSave();
        if (e.key === 'Escape') {
            setEditTitle(recording.title);
            setIsEditingTitle(false);
        }
    };

    // --- Export Logic ---

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
            // Estimate end time (next segment start or +5 seconds)
            const nextSeg = segs[index + 1];
            const endSeconds = nextSeg ? timeToSeconds(nextSeg.timestamp) : startSeconds + 5;

            return `${index + 1}\n${secondsToSRTTime(startSeconds)} --> ${secondsToSRTTime(endSeconds)}\n${seg.speaker}: ${seg.text}\n`;
        }).join('\n');
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

    return (
        <div className="flex-1 flex flex-col h-screen bg-background-light dark:bg-background-dark overflow-hidden transition-colors duration-200" onClick={() => { setShowExportMenu(false); setShowTemplateMenu(false); }}>
            {/* Hidden Audio Element */}
            <audio ref={audioRef} src={recording.audioUrl || undefined} />

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
                    {/* Theme Toggle - Compact */}
                    <div className="scale-90 origin-right md:scale-100 hidden sm:block">
                        <ThemeToggle />
                    </div>

                    {/* Language Selector - Compact on mobile */}
                    <div className="scale-90 origin-right md:scale-100">
                        <LanguageSelector />
                    </div>

                    {/* Analyze Button (Updated with Dropdown) */}
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

                    {/* Export Dropdown */}
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
                                <button onClick={() => handleExport('txt')} className="w-full text-left px-4 py-2.5 text-xs md:text-sm text-white hover:bg-[#232f48] flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base md:text-lg text-slate-400 flex-shrink-0">description</span>
                                    <span className="truncate">Text File (.txt)</span>
                                </button>
                                <button onClick={() => handleExport('srt')} className="w-full text-left px-4 py-2.5 text-xs md:text-sm text-white hover:bg-[#232f48] flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base md:text-lg text-slate-400 flex-shrink-0">closed_caption</span>
                                    <span className="truncate">Subtitles (.srt)</span>
                                </button>
                                <button onClick={() => handleExport('json')} className="w-full text-left px-4 py-2.5 text-xs md:text-sm text-white hover:bg-[#232f48] flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base md:text-lg text-slate-400 flex-shrink-0">data_object</span>
                                    <span className="truncate">JSON Data</span>
                                </button>
                                <div className="h-px bg-border-dark my-1"></div>
                                <button onClick={() => handleExport('clipboard')} className="w-full text-left px-4 py-2.5 text-xs md:text-sm text-white hover:bg-[#232f48] flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base md:text-lg text-slate-400 flex-shrink-0">content_copy</span>
                                    <span className="truncate">{t('copyClipboard')}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Main Editor */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-10 flex justify-center">
                    <div className="flex flex-col max-w-4xl w-full gap-6">
                        {/* Media Player Sticky */}
                        <div className="sticky top-0 z-40 bg-[#1e2736] rounded-xl p-3 md:p-4 border border-[#232f48] shadow-lg mb-2 md:mb-4">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <button
                                        onClick={togglePlay}
                                        disabled={!recording.audioUrl}
                                        className={`size-10 md:size-12 rounded-full text-white flex items-center justify-center transition-all ${!recording.audioUrl ? 'bg-gray-600 opacity-50 cursor-not-allowed' : 'bg-primary hover:bg-blue-600 shadow-lg'}`}>
                                        <span className="material-symbols-outlined text-2xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
                                    </button>

                                    <div className="flex-1 flex flex-col gap-1">
                                        {/* Waveform / Progress */}
                                        <div className="h-8 bg-[#111722] rounded overflow-hidden relative flex items-center px-2">
                                            <div className="absolute inset-0 flex items-center justify-around opacity-30 pointer-events-none">
                                                {Array.from({ length: 60 }).map((_, i) => (
                                                    <div key={i} className="w-1 bg-primary rounded-full" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
                                                ))}
                                            </div>
                                            <input
                                                type="range"
                                                min={0}
                                                max={duration || 100}
                                                value={currentTime}
                                                onChange={handleSeek}
                                                disabled={!recording.audioUrl}
                                                className="w-full h-full opacity-0 cursor-pointer absolute inset-0 z-10"
                                            />
                                            <div className="absolute left-0 top-0 bottom-0 bg-primary/20 pointer-events-none" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
                                            <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_white] pointer-events-none transition-all" style={{ left: `${(currentTime / duration) * 100}%` }}></div>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] md:text-xs font-mono text-[#92a4c9]">
                                            <span>{formatTime(currentTime)}</span>

                                            {/* Speaker Selector (Google Meet Style) */}
                                            {supportsSetSinkId && outputDevices.length > 0 && (
                                                <div className="hidden sm:flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-sm">volume_up</span>
                                                    <select
                                                        value={selectedOutputId}
                                                        onChange={handleOutputChange}
                                                        className="bg-[#111722] border border-[#232f48] rounded text-xs text-white py-0.5 px-2 focus:ring-1 focus:ring-primary outline-none max-w-[150px] truncate"
                                                    >
                                                        {outputDevices.map(device => (
                                                            <option key={device.deviceId} value={device.deviceId}>
                                                                {device.label || `Speaker ${device.deviceId.slice(0, 4)}...`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}

                                            <span>{formatTime(duration)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Empty State / Transcribe Button */}
                        {!recording.audioUrl && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg flex items-center gap-3 text-yellow-500">
                                <span className="material-symbols-outlined">warning</span>
                                <p className="text-sm">No recording found. Please start a new recording from the dashboard.</p>
                            </div>
                        )}

                        {recording.audioUrl && segments.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 bg-[#1e2736]/30 rounded-xl border border-dashed border-[#232f48] text-center px-4">
                                <div className="size-16 bg-[#111722] rounded-full flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-3xl text-primary">graphic_eq</span>
                                </div>
                                <h3 className="text-white text-xl font-bold mb-2">{t('readyTranscribe')}</h3>
                                <p className="text-[#92a4c9] max-w-md mb-6">
                                    {t('readyTranscribeDesc')}
                                </p>
                                <button
                                    onClick={handleTranscribeAudio}
                                    disabled={isTranscribing}
                                    className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-blue-900/40 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                                    {isTranscribing ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                            <span>{t('transcribing')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">auto_awesome</span>
                                            <span>{t('genTranscript')}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Segments */}
                        {segments.length > 0 && (
                            <div className="flex flex-col gap-4 pb-20">
                                {segments.map((seg) => (
                                    <div key={seg.id} className="group flex flex-col md:flex-row gap-2 md:gap-4 p-3 md:p-4 rounded-xl bg-[#1e2736] border border-transparent hover:border-[#232f48] transition-all">
                                        <div className="flex md:flex-col gap-3 min-w-[140px] items-center md:items-start flex-shrink-0">
                                            <span className="text-[#92a4c9] font-mono text-xs font-medium">{seg.timestamp}</span>
                                            <div className="flex items-center gap-2 text-[#92a4c9] text-xs md:text-sm font-medium bg-[#111722] px-2 md:px-3 py-1.5 rounded-lg border border-[#232f48]">
                                                <div className={`size-3 md:size-4 rounded-full bg-gradient-to-br ${seg.speakerColor} flex-shrink-0`}></div>
                                                <span className="truncate max-w-[80px] md:max-w-none">{seg.speaker}</span>
                                            </div>
                                        </div>
                                        <p className="flex-1 text-sm md:text-base lg:text-lg text-[#e2e8f0] leading-relaxed outline-none focus:ring-1 ring-primary rounded p-1 break-words" contentEditable suppressContentEditableWarning>
                                            {seg.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Modal */}
                {showSummaryModal && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-[#1e2736] border border-brand-grey/40 ring-1 ring-brand-grey/40 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200 shadow-2xl shadow-brand-grey/30">
                            <div className="flex items-center justify-between p-6 border-b border-border-dark">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-2xl">analytics</span>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{t('meetingSummary')}</h3>
                                        <div className="text-xs text-slate-400 flex items-center gap-1 uppercase tracking-wide font-bold">
                                            <span>Template:</span>
                                            <span className="text-primary">{selectedTemplate}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowSummaryModal(false)}
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    <span className="material-symbols-outlined text-2xl">close</span>
                                </button>
                            </div>

                            {/* Visual Tabs simulation */}
                            <div className="flex border-b border-border-dark bg-[#161d2a]">
                                <button className="flex-1 py-3 text-sm font-bold text-white border-b-2 border-primary">Text View</button>
                                <button className="flex-1 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors relative">
                                    Visual Map
                                    <span className="absolute top-2 right-4 text-[9px] bg-primary px-1 rounded text-white">BETA</span>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 text-slate-200">
                                {recording.summary ? (
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        {/* Simple renderer for formatting */}
                                        {recording.summary.split('\n').map((line, i) => {
                                            if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-white mt-4 mb-2 flex items-center gap-2"><span className="w-1 h-5 bg-primary rounded-full inline-block"></span>{line.replace('## ', '')}</h2>;
                                            if (line.startsWith('- **')) {
                                                const parts = line.split('**');
                                                return <li key={i} className="ml-4 mb-2 p-2 bg-white/5 rounded-lg border border-white/5"><strong className="text-primary block mb-1">{parts[1]}</strong>{parts[2]}</li>;
                                            }
                                            if (line.match(/^\d+\./)) return <div key={i} className="ml-4 mb-1 text-slate-300 font-medium">{line}</div>;
                                            return <p key={i} className="mb-2 leading-relaxed">{line}</p>;
                                        })}
                                    </div>
                                ) : (
                                    <p>No summary available.</p>
                                )}
                            </div>
                            <div className="p-6 border-t border-border-dark flex justify-end gap-3 bg-[#161d2a] rounded-b-2xl">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(recording.summary || '');
                                        alert(t('copyClipboard'));
                                    }}
                                    className="px-4 py-2 rounded-lg border border-border-dark text-slate-300 hover:bg-[#232f48] hover:text-white transition-colors text-sm font-medium"
                                >
                                    {t('copyClipboard')}
                                </button>
                                <button
                                    onClick={() => setShowSummaryModal(false)}
                                    className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-colors"
                                >
                                    {t('done')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Ask Diktalo Sidebar */}
                {showChat && (
                    <div className="w-full md:w-96 bg-[#111722] border-l border-border-dark flex flex-col shadow-2xl z-50 absolute right-0 top-0 bottom-0 border-t border-border-dark lg:border-t-0" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-border-dark flex justify-between items-center">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                                {t('askDiktalo')}
                            </h3>
                            <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                            {chatHistory.length === 0 && (
                                <div className="text-center text-slate-500 mt-10">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">psychology</span>
                                    <p className="text-sm whitespace-pre-wrap">{t('askEmpty')}</p>
                                </div>
                            )}
                            {chatHistory.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-[#1e2736] text-slate-200'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-[#1e2736] p-3 rounded-lg text-sm text-slate-400 flex items-center gap-1">
                                        <span className="size-2 bg-slate-400 rounded-full animate-bounce"></span>
                                        <span className="size-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                        <span className="size-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-border-dark bg-[#161d2a]">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAskDiktalo()}
                                    placeholder={t('askPlaceholder')}
                                    className="w-full bg-[#1e2736] border border-[#2a3649] rounded-lg pl-4 pr-10 py-3 text-sm text-white focus:ring-1 focus:ring-primary focus:border-primary"
                                />
                                <button
                                    onClick={handleAskDiktalo}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-white p-1 rounded transition-colors">
                                    <span className="material-symbols-outlined">send</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
