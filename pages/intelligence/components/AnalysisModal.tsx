import React from 'react';
import { Recording } from '../../../types';
import { X, Clock, FileText, Users, TrendingUp } from 'lucide-react';

interface AnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    recording: Recording;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, recording }) => {
    if (!isOpen) return null;

    // Calculate statistics
    const calculateWordCount = () => {
        if (!recording.segments) return 0;
        return recording.segments.reduce((total, seg) => {
            return total + seg.text.split(/\s+/).length;
        }, 0);
    };

    const calculateDuration = () => {
        return recording.duration || 'No disponible';
    };

    const getSpeakerCount = () => {
        if (!recording.segments) return 0;
        const speakers = new Set(recording.segments.map(seg => seg.speaker));
        return speakers.size;
    };

    const wordCount = calculateWordCount();
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl mx-4 bg-white dark:bg-[#2a2a2a] rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-black/[0.05] dark:border-white/[0.05]">
                    <div>
                        <h2 className="text-lg font-semibold text-[#0d0d0d] dark:text-white">
                            Análisis de Grabación
                        </h2>
                        <p className="text-[12px] text-[#8e8e8e] mt-1">
                            {recording.title}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-[#8e8e8e]" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Duration */}
                        <div className="bg-[#f7f7f8] dark:bg-[#33343d] rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Clock size={18} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-[#8e8e8e] uppercase tracking-wide">Duración</p>
                                    <p className="text-[18px] font-semibold text-[#0d0d0d] dark:text-white">
                                        {calculateDuration()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Word Count */}
                        <div className="bg-[#f7f7f8] dark:bg-[#33343d] rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <FileText size={18} className="text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-[#8e8e8e] uppercase tracking-wide">Palabras</p>
                                    <p className="text-[18px] font-semibold text-[#0d0d0d] dark:text-white">
                                        {wordCount.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Speakers */}
                        <div className="bg-[#f7f7f8] dark:bg-[#33343d] rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <Users size={18} className="text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-[#8e8e8e] uppercase tracking-wide">Participantes</p>
                                    <p className="text-[18px] font-semibold text-[#0d0d0d] dark:text-white">
                                        {getSpeakerCount()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Reading Time */}
                        <div className="bg-[#f7f7f8] dark:bg-[#33343d] rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                    <TrendingUp size={18} className="text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-[#8e8e8e] uppercase tracking-wide">Lectura</p>
                                    <p className="text-[18px] font-semibold text-[#0d0d0d] dark:text-white">
                                        {readingTime} min
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-6 bg-[#f7f7f8] dark:bg-[#33343d] rounded-xl p-4">
                        <h3 className="text-[13px] font-semibold text-[#0d0d0d] dark:text-white mb-3">
                            Información Adicional
                        </h3>
                        <div className="space-y-2 text-[12px]">
                            <div className="flex justify-between">
                                <span className="text-[#8e8e8e]">Estado:</span>
                                <span className="text-[#0d0d0d] dark:text-white font-medium">
                                    {recording.status || 'Completada'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#8e8e8e]">Fecha:</span>
                                <span className="text-[#0d0d0d] dark:text-white font-medium">
                                    {new Date(recording.date).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            {recording.audioUrl && (
                                <div className="flex justify-between">
                                    <span className="text-[#8e8e8e]">Tiene audio:</span>
                                    <span className="text-green-600 dark:text-green-400 font-medium">Sí</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-black/[0.05] dark:border-white/[0.05]">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};
