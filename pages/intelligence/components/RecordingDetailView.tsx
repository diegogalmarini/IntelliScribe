import React from 'react';
import { Recording } from '../../../types';
import { Download, FileText, Sparkles, Moon, Sun, BarChart3, MessageCircle, Mic, Share2 } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface RecordingDetailViewProps {
    recording: Recording;
}

export const RecordingDetailView: React.FC<RecordingDetailViewProps> = ({ recording }) => {
    const { theme, setTheme } = useTheme();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Fecha no disponible';
        }
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const hasTranscript = recording.segments && recording.segments.length > 0;
    const hasSummary = recording.summary && recording.summary.trim().length > 0;

    const handleAnalyze = () => {
        // TODO: Implement analyze functionality
        console.log('Analyze recording:', recording.id);
    };

    const handleAskDiktalo = () => {
        // TODO: Implement ask Diktalo functionality
        console.log('Ask Diktalo about:', recording.id);
    };

    const handleAudio = () => {
        // TODO: Implement audio actions
        console.log('Audio actions for:', recording.id);
    };

    const handleExport = () => {
        // TODO: Implement export functionality
        console.log('Export recording:', recording.id);
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#1a1a1a]">
            {/* Header */}
            <div className="px-8 py-4 border-b border-black/[0.05] dark:border-white/[0.05]">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-2xl font-normal text-[#1f1f1f] dark:text-white">
                        {recording.title || 'Grabación sin título'}
                    </h1>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        {/* Dark/Light Mode Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                        >
                            {theme === 'dark' ? (
                                <Sun size={18} className="text-[#8e8e8e]" />
                            ) : (
                                <Moon size={18} className="text-[#8e8e8e]" />
                            )}
                        </button>

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

                        {/* Audio */}
                        <button
                            onClick={handleAudio}
                            className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#0d0d0d] dark:text-[#ececec] hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <Mic size={16} />
                            <span>Audio</span>
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
                                    src={recording.audioUrl}
                                    className="w-full"
                                    style={{
                                        height: '40px',
                                        borderRadius: '8px'
                                    }}
                                />

                                {/* Download Button */}
                                <a
                                    href={recording.audioUrl}
                                    download={recording.title || 'audio.mp3'}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#f7f7f8] dark:bg-[#2a2b32] border border-black/10 dark:border-white/10 rounded-lg text-[12px] text-[#0d0d0d] dark:text-[#ececec] hover:bg-[#ebebeb] dark:hover:bg-[#33343d] transition-colors"
                                >
                                    <Download size={14} />
                                    Descargar Audio
                                </a>
                            </div>
                        ) : (
                            <p className="text-[12px] text-[#8e8e8e]">
                                Audio no disponible
                            </p>
                        )}
                    </div>

                    {/* Transcription Card */}
                    {hasTranscript && (
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

                            <p className="text-[13px] text-[#0d0d0d] dark:text-[#ececec] leading-relaxed">
                                {recording.summary}
                            </p>
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
        </div>
    );
};
