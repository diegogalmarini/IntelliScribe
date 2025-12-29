import React from 'react';
import { Recording } from '../../../types';
import { MessageSquare, User, Sparkles } from 'lucide-react';

interface ChatInterfaceProps {
    recording: Recording;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ recording }) => {
    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-3xl mx-auto px-6 py-8">
                {/* Recording Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-normal text-[#1f1f1f] dark:text-white mb-2">
                        {recording.title || 'Conversación sin título'}
                    </h1>
                    <p className="text-sm text-[#444746] dark:text-slate-400">
                        {new Date(recording.date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>

                {/* Audio Player */}
                {recording.audioUrl && (
                    <div className="mb-8 p-4 bg-slate-50 dark:bg-[#2a2a2a] rounded-2xl">
                        <div className="flex items-center gap-3 mb-3">
                            <MessageSquare size={20} className="text-[#444746] dark:text-slate-400" />
                            <span className="text-sm font-medium text-[#444746] dark:text-slate-300">
                                Audio original
                            </span>
                        </div>
                        <audio
                            controls
                            src={recording.audioUrl}
                            className="w-full"
                        />
                    </div>
                )}

                {/* Transcription as Chat Messages */}
                {recording.segments && recording.segments.length > 0 && (
                    <div className="space-y-6 mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                            <span className="text-xs font-medium text-[#444746] dark:text-slate-400 uppercase tracking-wider">
                                Transcripción
                            </span>
                            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                        </div>

                        {recording.segments.map((segment, idx) => (
                            <div key={idx} className="flex gap-4 animate-fadeIn">
                                {/* Speaker Avatar */}
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                        <User size={16} className="text-white" />
                                    </div>
                                </div>

                                {/* Message Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="font-semibold text-[#1f1f1f] dark:text-white">
                                            {segment.speaker}
                                        </span>
                                        <span className="text-xs text-[#444746] dark:text-slate-500">
                                            {segment.timestamp}
                                        </span>
                                    </div>
                                    <p className="text-[#1f1f1f] dark:text-slate-200 leading-relaxed text-base">
                                        {segment.text}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Summary as AI Response */}
                {recording.summary && (
                    <div className="mt-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-[#2a2a2a] dark:to-[#1f2937] rounded-2xl border border-slate-200 dark:border-slate-700">
                        <div className="flex gap-4">
                            {/* AI Avatar */}
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                    <Sparkles size={16} className="text-white" />
                                </div>
                            </div>

                            {/* Summary Content */}
                            <div className="flex-1 min-w-0">
                                <div className="mb-2">
                                    <span className="font-semibold text-[#1f1f1f] dark:text-white">
                                        Resumen generado por IA
                                    </span>
                                </div>
                                <p className="text-[#1f1f1f] dark:text-slate-200 leading-relaxed text-base whitespace-pre-wrap">
                                    {recording.summary}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {(!recording.segments || recording.segments.length === 0) && !recording.summary && (
                    <div className="text-center py-12">
                        <MessageSquare size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-500 dark:text-slate-400">
                            No hay transcripción disponible para esta grabación
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
