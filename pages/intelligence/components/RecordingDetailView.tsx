import React, { useState } from 'react';
import { Recording } from '../../../types';
import { Play, Pause, Download, FileText, Share2, MoreVertical, Calendar, Clock, Lock, Mic, Sparkles, Sun, Moon, BarChart3, MessageCircle, Loader2, Pencil, Check, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../../../contexts/ThemeContext';
import { ChatModal } from './ChatModal';
import { AnalysisModal } from './AnalysisModal';
import { ExportModal } from './ExportModal';
import { useLanguage } from '../../../contexts/LanguageContext'; // Added based on instruction
import { getSignedAudioUrl } from '../../../services/storageService';

interface RecordingDetailViewProps {
    recording: Recording;
    onGenerateTranscript?: () => Promise<void>;
    onRename?: (newTitle: string) => void;
}

export const RecordingDetailView = ({ recording, onGenerateTranscript, onRename }: RecordingDetailViewProps) => {
    const { t } = useLanguage();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [chatOpen, setChatOpen] = useState(false);
    const [analysisOpen, setAnalysisOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [signedAudioUrl, setSignedAudioUrl] = useState<string | null>(null);

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

    const hasTranscript = recording.segments && recording.segments.length > 0;
    const hasSummary = recording.summary && recording.summary.trim().length > 0;

    const handleAnalyze = () => {
        setAnalysisOpen(true);
    };

    const handleAskDiktalo = () => {
        setChatOpen(true);
    };



    const handleExport = () => {
        setExportOpen(true);
    };

    const handleDownloadAudio = async () => {
        if (!recording.audioUrl) return;

        try {
            const response = await fetch(recording.audioUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${recording.title || 'audio'}.mp3`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading audio:', error);
        }
    };



    // Clean markdown from code blocks
    const cleanMarkdown = (text: string) => {
        if (!text) return '';

        // Remove markdown code block wrappers (```markdown ... ```)
        let cleaned = text.replace(/```markdown\s*/g, '').replace(/```\s*/g, '');

        // Remove any other code block indicators
        cleaned = cleaned.replace(/```[\s\S]*?```/g, '');

        return cleaned.trim();
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
                                <audio
                                    controls
                                    src={signedAudioUrl || undefined}
                                    className="w-full"
                                    style={{
                                        height: '40px',
                                        borderRadius: '8px'
                                    }}
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
                            <div className="flex items-center gap-2 mb-4">
                                <FileText size={16} className="text-[#8e8e8e]" />
                                <h2 className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-wider">
                                    Transcripción
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {recording.segments.map((segment, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <span className="text-[11px] text-[#8e8e8e] font-mono shrink-0 w-16">
                                            {segment.timestamp}
                                        </span>
                                        <div className="flex-1">
                                            <p className="text-[13px] text-[#0d0d0d] dark:text-[#ececec] leading-relaxed">
                                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                    {segment.speaker}:
                                                </span>{' '}
                                                {segment.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
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
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles size={16} className="text-[#8e8e8e]" />
                                <h2 className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-wider">
                                    Resumen IA
                                </h2>
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
            <ChatModal
                isOpen={chatOpen}
                onClose={() => setChatOpen(false)}
                recording={recording}
            />
            <AnalysisModal
                isOpen={analysisOpen}
                onClose={() => setAnalysisOpen(false)}
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
