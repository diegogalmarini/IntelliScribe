import React from 'react';
import { Mic, Upload, MessageSquare, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface EmptyStateCleanProps {
    userName: string;
    onAction: (type: 'record' | 'upload' | 'multiaudio') => void;
}

export const EmptyStateClean: React.FC<EmptyStateCleanProps> = ({
    userName,
    onAction
}) => {
    const { t } = useLanguage();

    const actions = [
        {
            type: 'record' as const,
            icon: Mic,
            label: t('recordAudio') || 'Grabar Audio',
        },
        {
            type: 'upload' as const,
            icon: Upload,
            label: t('uploadFile') || 'Subir Archivo',
        },
        {
            type: 'multiaudio' as const,
            icon: MessageCircle,
            label: 'Multi-Audio',
        },
    ];

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-4xl mx-auto">
            {/* Greeting */}
            <h1 className="text-2xl md:text-4xl font-normal text-[#1f1f1f] dark:text-white mb-2 md:mb-3">
                Hola, {userName}
            </h1>
            <p className="text-[#8e8e8e] dark:text-[#8e8e8e] text-sm md:text-lg mb-8 md:mb-16 text-center px-4">
                {t('intelligenceWelcome') || '¿Qué quieres capturar hoy? Tu cerebro digital está listo para procesar.'}
            </p>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                {actions.map((action, idx) => (
                    <button
                        key={action.type}
                        onClick={() => onAction(action.type)}
                        className={`group flex flex-col items-center gap-4 p-6 rounded-2xl border transition-all duration-200
                            ${idx === 2 ? 'col-span-2' : 'col-span-1'}
                            bg-white dark:bg-[#1e1e1e] 
                            border-gray-200 dark:border-white/5
                            hover:border-blue-500/50 hover:bg-blue-50/50 
                            dark:hover:bg-blue-500/10 dark:hover:border-blue-500/30
                            hover:shadow-lg hover:shadow-blue-500/5 dark:hover:shadow-none
                            active:scale-[0.98]
                        `}
                    >
                        <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <action.icon size={24} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};
