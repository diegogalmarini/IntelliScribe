import React from 'react';
import { Recording } from '../../types';
import { Clock, PlayCircle } from 'lucide-react';

interface RecordingCardProps {
    recording: Recording;
    isActive: boolean;
    onClick: () => void;
}

export const RecordingCard: React.FC<RecordingCardProps> = ({ recording, isActive, onClick }) => {
    // Format date elegantly
    const date = new Date(recording.created_at).toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
    });

    return (
        <div
            onClick={onClick}
            className={`group flex flex-col p-4 border-b border-border-light dark:border-border-dark cursor-pointer transition-all duration-200 hover:bg-slate-50 dark:hover:bg-white/5
        ${isActive ? 'bg-blue-50/60 dark:bg-blue-900/20 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}
      `}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className={`font-semibold text-sm line-clamp-2 ${isActive ? 'text-blue-900 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
                    {recording.title || 'Grabación sin título'}
                </h3>
                <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap ml-2">{date}</span>
            </div>

            <div className="flex items-center justify-between mt-1">
                <div className="flex items-center space-x-3">
                    <span className="flex items-center text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        <Clock size={12} className="mr-1" />
                        {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')}
                    </span>
                    {recording.transcription_status === 'completed' && (
                        <span className="text-[10px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                            Procesado
                        </span>
                    )}
                </div>

                <PlayCircle size={16} className={`text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`} />
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 line-clamp-2">
                {recording.summary || recording.transcription_text || "Sin transcripción disponible..."}
            </p>
        </div>
    );
};
