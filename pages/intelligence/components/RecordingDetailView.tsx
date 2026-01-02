import React, { useState } from 'react';
import { Recording } from '../../../types';
import { Play, Pause, Download, FileText, Share2, MoreVertical, Calendar, Clock, Lock, Mic, Sparkles, Sun, Moon, BarChart3, MessageCircle, Loader2, Pencil, Check, X, Volume2, VolumeX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../../../contexts/ThemeContext';
import { ChatModal } from './ChatModal';
import { AnalysisModal } from './AnalysisModal';
import { ExportModal } from './ExportModal';
import { useLanguage } from '../../../contexts/LanguageContext';

import { generateMeetingSummary } from '../../../services/geminiService';
import { getSignedAudioUrl } from '../../../services/storageService';
import * as exportUtils from '../../../utils/exportUtils';
import { supabase } from '../../../lib/supabase';

interface RecordingDetailViewProps {
    recording: Recording;
    onGenerateTranscript?: () => Promise<void>;
    onRename?: (newTitle: string) => void;
    onUpdateSpeaker?: (oldSpeaker: string, newSpeaker: string) => void;
    onUpdateSummary?: (summary: string) => void;
}

export const RecordingDetailView = ({ recording, onGenerateTranscript, onRename, onUpdateSpeaker, onUpdateSummary }: RecordingDetailViewProps) => {
    const { t } = useLanguage();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');

    // Speaker Editing State
    const [editingSpeaker, setEditingSpeaker] = useState<string | null>(null); // Stores the speaker ID/Name currently being edited
    const [editedSpeakerName, setEditedSpeakerName] = useState('');

    const [chatOpen, setChatOpen] = useState(false);
    const [analysisOpen, setAnalysisOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [signedAudioUrl, setSignedAudioUrl] = useState<string | null>(null);
    const audioRef = React.useRef<HTMLAudioElement>(null);

    // Simple markdown cleaner
    const cleanMarkdown = (text: string | undefined) => {
        if (!text) return '';
        return text.replace(/```markdown/g, '').replace(/```/g, '').trim();
    };

    React.useEffect(() => {
        const loadSignedUrl = async () => {
            if (recording.audioUrl) {
                const url = await getSignedAudioUrl(recording.audioUrl);
                setSignedAudioUrl(url);
            } else {
                setSignedAudioUrl(null);
            }
        };
        loadSignedUrl();
    }, [recording.audioUrl]);

    // Initialize duration from DB, fallback to loaded metadata later if DB is 0
    React.useEffect(() => {
        if (recording.durationSeconds) {
            setDuration(recording.durationSeconds);
        }
    }, [recording.durationSeconds]);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Convert timestamp string (MM:SS or HH:MM:SS) to seconds
    const timestampToSeconds = (timestamp: string): number => {
        const parts = timestamp.split(':').map(p => parseInt(p, 10));
        if (parts.length === 2) {
            // MM:SS
            return parts[0] * 60 + parts[1];
        } else if (parts.length === 3) {
            // HH:MM:SS
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
        return 0;
    };

    // Handle timestamp click to seek audio
    const handleTimestampClick = (timestamp: string) => {
        if (audioRef.current) {
            const seconds = timestampToSeconds(timestamp);
            audioRef.current.currentTime = seconds;
            setCurrentTime(seconds);
            // Optionally start playing
            if (!isPlaying) {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = parseFloat(e.target.value);
        setVolume(vol);
        if (audioRef.current) {
            audioRef.current.volume = vol;
        }
        setIsMuted(vol === 0);
    };

    const toggleMute = () => {
        if (audioRef.current) {
            const newMuteState = !isMuted;
            setIsMuted(newMuteState);
            audioRef.current.muted = newMuteState;
            if (newMuteState) {
                setVolume(0);
            } else {
                setVolume(1);
                audioRef.current.volume = 1;
            }
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Fecha no disponible';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Fecha no disponible';
        }
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const handleStartEdit = () => {
        setEditedTitle(recording.title);
        setIsEditingTitle(true);
    };

    const handleSaveTitle = () => {
        if (onRename && editedTitle.trim()) {
            onRename(editedTitle.trim());
        }
        setIsEditingTitle(false);
    };

    const handleCancelEdit = () => {
        setIsEditingTitle(false);
    };

    // Speaker Edit Handlers
    const handleStartEditSpeaker = (currentName: string) => {
        setEditingSpeaker(currentName);
        setEditedSpeakerName(currentName);
    };

    const handleSaveSpeaker = (oldName: string) => {
        if (onUpdateSpeaker && editedSpeakerName.trim() && editedSpeakerName !== oldName) {
            onUpdateSpeaker(oldName, editedSpeakerName.trim());
        }
        setEditingSpeaker(null);
    };

    const handleCancelEditSpeaker = () => {
        setEditingSpeaker(null);
    };

    const hasTranscript = recording.segments && recording.segments.length > 0;
    const hasSummary = recording.summary && recording.summary.trim().length > 0;

    const handleAnalyze = () => {
        setAnalysisOpen(true);
    };

    const handleGenerateSummary = async (template: string) => {
        if (!recording.segments) return;

        setIsGenerating(true);
        try {
            // Reconstruct full transcript
            const fullTranscript = recording.segments
                .map(s => `${s.speaker}: ${s.text}`)
                .join('\n');

            const summary = await generateMeetingSummary(fullTranscript, 'es', template);

            if (onUpdateSummary) {
                onUpdateSummary(summary);
            }
            setAnalysisOpen(false);
        } catch (error) {
            console.error(error);
            alert("Error generando resumen");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAskDiktalo = () => {
        setChatOpen(true);
    };



    const handleExport = () => {
        setExportOpen(true);
    };

    const handleDownloadAudio = async () => {
        console.log('[RecordingDetailView] Starting audio download:', recording.title);
        if (!recording.audioUrl) {
            alert('Audio no disponible para descargar');
            return;
        }

        try {
            // Extract file extension from the original audio URL
            const urlParts = recording.audioUrl.split('.');
            const fileExtension = urlParts.length > 1 ? urlParts[urlParts.length - 1] : 'wav';
            const fileName = `${recording.title || 'audio'}.${fileExtension}`;
            console.log('[RecordingDetailView] Download filename:', fileName);

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

            // Download file directly from Supabase Storage using SDK
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
                link.setAttribute('download', fileName);

                document.body.appendChild(link);
                link.click();

                // Cleanup after a short delay
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(blobUrl);
                }, 100);
                console.log('[RecordingDetailView] Download initiated successfully');
            }
        } catch (error) {
            console.error('[RecordingDetailView] Error downloading audio:', error);
            alert('Error al descargar el audio');
        }
    };





    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#1a1a1a]">
            {/* Header */}
            <div className="px-8 py-4 border-b border-black/[0.05] dark:border-white/[0.05]">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 mr-4">
                        {isEditingTitle ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    className="text-2xl font-normal text-[#1f1f1f] dark:text-white bg-transparent border-b border-blue-500 focus:outline-none w-full"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveTitle();
                                        if (e.key === 'Escape') handleCancelEdit();
                                    }}
                                />
                                <button onClick={handleSaveTitle} className="p-1 hover:bg-green-500/10 rounded-md text-green-600">
                                    <Check size={20} />
                                </button>
                                <button onClick={handleCancelEdit} className="p-1 hover:bg-red-500/10 rounded-md text-red-600">
                                    <X size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 group">
                                <h1 className="text-2xl font-normal text-[#1f1f1f] dark:text-white truncate">
                                    {recording.title || 'Grabación sin título'}
                                </h1>
                                {onRename && (
                                    <button
                                        onClick={handleStartEdit}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-md text-[#8e8e8e]"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        {/* Analizar */}
                        <button
                            onClick={handleAnalyze}
                            className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#0d0d0d] dark:text-[#ececec] hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <BarChart3 size={16} />
                            <span>Analizar</span>
                        </button>

                        {/* Preguntar a Diktalo */}
                        <button
                            onClick={handleAskDiktalo}
                            className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#0d0d0d] dark:text-[#ececec] hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <MessageCircle size={16} />
                            <span>Preguntar a Diktalo</span>
                        </button>

                        {/* Exportar */}
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#0d0d0d] dark:text-[#ececec] hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <Share2 size={16} />
                            <span>Exportar</span>
                        </button>
                    </div>
                </div>
                <p className="text-[12px] text-[#8e8e8e]">
                    {formatDate(recording.date)}
                </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Audio Player Card */}
                    <div className="bg-white dark:bg-[#2a2a2a] rounded-xl border border-black/[0.05] dark:border-white/[0.05] p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText size={16} className="text-[#8e8e8e]" />
                            <h2 className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-wider">
                                Audio Original
                            </h2>
                        </div>

                        {recording.audioUrl ? (
                            <div className="space-y-4">
                                <div className="bg-[#f7f7f8] dark:bg-[#1f1f1f] rounded-lg p-3 flex items-center gap-4">
                                    {/* Play/Pause Button */}
                                    <button
                                        onClick={togglePlay}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors flex-shrink-0"
                                    >
                                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                                    </button>

                                    {/* Time and Slider */}
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between text-[11px] text-[#8e8e8e] font-medium">
                                            <span>{formatTime(currentTime)}</span>
                                            <span>{formatTime(duration || 0)}</span>
                                        </div>
                                        <div className="relative h-1 bg-black/10 dark:bg-white/10 rounded-full cursor-pointer group">
                                            <input
                                                type="range"
                                                min="0"
                                                max={duration || 100}
                                                value={currentTime}
                                                onChange={handleSeek}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div
                                                className="absolute top-0 left-0 h-full bg-blue-600 rounded-full pointer-events-none transition-all duration-100"
                                                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                                            />
                                            {/* Thumb handle visual */}
                                            <div
                                                className="absolute top-1/2 -mt-1.5 h-3 w-3 bg-white border-2 border-blue-600 rounded-full shadow-sm pointer-events-none transition-all duration-100 opacity-0 group-hover:opacity-100"
                                                style={{ left: `calc(${(currentTime / (duration || 1)) * 100}% - 6px)` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Volume */}
                                    <div className="flex items-center gap-2 group relative w-8 hover:w-24 transition-all duration-300">
                                        <button onClick={toggleMute} className="text-[#8e8e8e] hover:text-[#1f1f1f] dark:hover:text-white transition-colors">
                                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                        </button>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={volume}
                                            onChange={handleVolumeChange}
                                            className="w-0 group-hover:w-16 h-1 bg-black/10 dark:bg-white/10 rounded-full cursor-pointer transition-all duration-300 opacity-0 group-hover:opacity-100 accent-blue-600"
                                        />
                                    </div>
                                </div>

                                <audio
                                    ref={audioRef}
                                    src={signedAudioUrl || undefined}
                                    onTimeUpdate={handleTimeUpdate}
                                    onEnded={handleEnded}
                                    className="hidden"
                                />

                                {/* Download Button */}
                                <button
                                    onClick={handleDownloadAudio}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#f7f7f8] dark:bg-[#2a2b32] border border-black/10 dark:border-white/10 rounded-lg text-[12px] text-[#0d0d0d] dark:text-[#ececec] hover:bg-[#ebebeb] dark:hover:bg-[#33343d] transition-colors"
                                >
                                    <Download size={14} />
                                    Descargar Audio
                                </button>
                            </div>
                        ) : (
                            <p className="text-[12px] text-[#8e8e8e]">
                                Audio no disponible
                            </p>
                        )}
                    </div>

                    {/* Transcription Card */}
                    {hasTranscript ? (
                        <div className="bg-white dark:bg-[#2a2a2a] rounded-xl border border-black/[0.05] dark:border-white/[0.05] p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <FileText size={16} className="text-[#8e8e8e]" />
                                    <h2 className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-wider">
                                        Transcripción
                                    </h2>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => exportUtils.exportAsPDF(recording)}
                                        className="text-[11px] font-medium text-[#8e8e8e] hover:text-[#0d0d0d] dark:hover:text-[#ececec] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-2 py-1 rounded transition-colors"
                                    >
                                        PDF
                                    </button>
                                    <button
                                        onClick={() => exportUtils.exportAsDoc(recording)}
                                        className="text-[11px] font-medium text-[#8e8e8e] hover:text-[#0d0d0d] dark:hover:text-[#ececec] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-2 py-1 rounded transition-colors"
                                    >
                                        DOC
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {recording.segments.map((segment, idx) => {
                                    // Check for temporal metadata matches
                                    const temporalMeta = recording.metadata?.segments?.find(
                                        meta => meta.segmentStartIndex === idx
                                    );

                                    // Calculate time gap from previous segment
                                    let timeGapDisplay = null;
                                    if (temporalMeta && idx > 0 && recording.metadata?.segments) {
                                        const prevMeta = recording.metadata.segments.find(m => m.segmentEndIndex === idx);
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
                                        <React.Fragment key={idx}>
                                            {/* Date Separator */}
                                            {temporalMeta && (
                                                <div className="relative py-6 flex items-center justify-center">
                                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                                        <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
                                                    </div>
                                                    <div className="relative flex flex-col items-center gap-1 bg-white dark:bg-[#2a2a2a] px-4">
                                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 flex items-center gap-1.5 shadow-sm">
                                                            <Calendar size={14} />
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
                                                            <span className="text-[10px] text-orange-600 dark:text-orange-400 italic flex items-center gap-1">
                                                                <Clock size={12} />
                                                                {timeGapDisplay}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Segment Content */}
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => handleTimestampClick(segment.timestamp)}
                                                    className="text-[11px] text-[#8e8e8e] hover:text-blue-600 dark:hover:text-blue-400 font-mono shrink-0 w-16 text-left cursor-pointer hover:underline transition-colors"
                                                    title="Click para saltar a este momento"
                                                >
                                                    {segment.timestamp}
                                                </button>
                                                <div className="flex-1">
                                                    <p className="text-[13px] text-[#0d0d0d] dark:text-[#ececec] leading-relaxed">
                                                        {editingSpeaker === segment.speaker ? (
                                                            <span className="inline-flex items-center gap-1 mr-2">
                                                                <input
                                                                    type="text"
                                                                    value={editedSpeakerName}
                                                                    onChange={(e) => setEditedSpeakerName(e.target.value)}
                                                                    className="text-blue-600 dark:text-blue-400 font-semibold bg-transparent border-b border-blue-500 focus:outline-none w-32"
                                                                    autoFocus
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') handleSaveSpeaker(segment.speaker!);
                                                                        if (e.key === 'Escape') handleCancelEditSpeaker();
                                                                    }}
                                                                />
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleSaveSpeaker(segment.speaker!); }}
                                                                    className="p-0.5 hover:bg-green-500/10 rounded text-green-600"
                                                                >
                                                                    <Check size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleCancelEditSpeaker(); }}
                                                                    className="p-0.5 hover:bg-red-500/10 rounded text-red-600"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </span>
                                                        ) : (
                                                            <span
                                                                className="font-semibold text-blue-600 dark:text-blue-400 mr-1 cursor-pointer hover:underline decoration-blue-400/50"
                                                                onClick={() => onUpdateSpeaker && handleStartEditSpeaker(segment.speaker!)}
                                                                title="Clic para cambiar nombre"
                                                            >
                                                                {segment.speaker}:
                                                            </span>
                                                        )}
                                                        {segment.text}
                                                    </p>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-[#2a2a2a] rounded-xl border border-black/[0.05] dark:border-white/[0.05] p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText size={16} className="text-[#8e8e8e]" />
                                <h2 className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-wider">
                                    Transcripción
                                </h2>
                            </div>
                            <div className="flex flex-col items-center justify-center py-8">
                                <Mic size={48} className="text-[#8e8e8e]/30 mb-4" />
                                <p className="text-[13px] text-[#8e8e8e] mb-6">Transcripción no disponible</p>
                                {onGenerateTranscript && (
                                    <button
                                        onClick={async () => {
                                            setIsGenerating(true);
                                            try {
                                                await onGenerateTranscript();
                                            } finally {
                                                setIsGenerating(false);
                                            }
                                        }}
                                        disabled={isGenerating}
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/70 text-white text-[13px] font-medium rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        {isGenerating ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Sparkles size={16} />
                                        )}
                                        {isGenerating ? 'Generando...' : 'Generar Transcripción'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Summary Card */}
                    {hasSummary && (
                        <div className="bg-white dark:bg-[#2a2a2a] rounded-xl border border-black/[0.05] dark:border-white/[0.05] p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={16} className="text-[#8e8e8e]" />
                                    <h2 className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-wider">
                                        Resumen IA
                                    </h2>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => exportUtils.exportAsPDF(recording)}
                                        className="text-[11px] font-medium text-[#8e8e8e] hover:text-[#0d0d0d] dark:hover:text-[#ececec] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-2 py-1 rounded transition-colors"
                                    >
                                        PDF
                                    </button>
                                    <button
                                        onClick={() => exportUtils.exportAsDoc(recording)}
                                        className="text-[11px] font-medium text-[#8e8e8e] hover:text-[#0d0d0d] dark:hover:text-[#ececec] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-2 py-1 rounded transition-colors"
                                    >
                                        DOC
                                    </button>
                                </div>
                            </div>

                            <div className="prose prose-sm dark:prose-invert max-w-none text-[13px] text-[#0d0d0d] dark:text-[#ececec] leading-relaxed">
                                <ReactMarkdown
                                    components={{
                                        h1: ({ node, ...props }) => <h1 className="text-[16px] font-bold mb-3 mt-4" {...props} />,
                                        h2: ({ node, ...props }) => <h2 className="text-[15px] font-semibold mb-2 mt-3" {...props} />,
                                        h3: ({ node, ...props }) => <h3 className="text-[14px] font-semibold mb-2 mt-3" {...props} />,
                                        p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2" {...props} />,
                                        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                        strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                                    }}
                                >
                                    {cleanMarkdown(recording.summary)}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {/* Processing State */}
                    {!hasTranscript && recording.status === 'Processing' && (
                        <div className="bg-white dark:bg-[#2a2a2a] rounded-xl border border-black/[0.05] dark:border-white/[0.05] p-12">
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-[12px] text-[#8e8e8e]">
                                    Procesando transcripción...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* No Transcript Available */}
                    {!hasTranscript && recording.status !== 'Processing' && (
                        <div className="bg-white dark:bg-[#2a2a2a] rounded-xl border border-black/[0.05] dark:border-white/[0.05] p-6">
                            <p className="text-[12px] text-[#8e8e8e] text-center">
                                Transcripción no disponible
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <AnalysisModal
                isOpen={analysisOpen}
                onClose={() => setAnalysisOpen(false)}
                onGenerate={handleGenerateSummary}
                isGenerating={isGenerating}
            />
            <ChatModal
                isOpen={chatOpen}
                onClose={() => setChatOpen(false)}
                recording={recording}
            />
            <ExportModal
                isOpen={exportOpen}
                onClose={() => setExportOpen(false)}
                recording={recording}
            />
        </div>
    );
};
