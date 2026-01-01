import React from 'react';
import { Mic, Upload } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface EmptyStateCleanProps {
    userName: string;
    onAction: (type: 'record' | 'upload') => void;
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
            <div className="flex gap-3 md:gap-6 flex-wrap justify-center w-full max-w-md">
                {actions.map(action => (
                    <button
                        key={action.type}
                        onClick={() => onAction(action.type)}
                        className="flex flex-col items-center gap-3 md:gap-4 p-6 md:p-8 rounded-2xl border border-[#e5e5e5] dark:border-[#3c3c3c] hover:border-[#d0d0d0] dark:hover:border-[#4f4f4f] hover:bg-[#fafafa] dark:hover:bg-[#2a2a2a] transition-all flex-1 min-w-[140px] md:min-w-[180px]"
                    >
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#f5f5f5] dark:bg-[#2f2f2f] flex items-center justify-center">
                            <action.icon size={22} className="text-[#444746] dark:text-slate-300 md:w-[26px] md:h-[26px]" />
                        </div>
                        <span className="text-xs md:text-sm font-medium text-[#1f1f1f] dark:text-slate-300">
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};
