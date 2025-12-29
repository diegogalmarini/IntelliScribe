import React from 'react';
import { Mic, Upload, Phone } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface EmptyStateCleanProps {
    userName: string;
    onAction: (type: 'record' | 'upload' | 'call') => void;
    showCallButton: boolean;
}

export const EmptyStateClean: React.FC<EmptyStateCleanProps> = ({
    userName,
    onAction,
    showCallButton
}) => {
    const { t } = useLanguage();

    const actions = [
        {
            type: 'record' as const,
            icon: Mic,
            label: t('recordAudio') || 'Grabar Audio',
            show: true
        },
        {
            type: 'upload' as const,
            icon: Upload,
            label: t('uploadFile') || 'Subir Archivo',
            show: true
        },
        {
            type: 'call' as const,
            icon: Phone,
            label: t('makeCall') || 'Hacer Llamada',
            show: showCallButton
        },
    ];

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            {/* Greeting */}
            <h1 className="text-3xl font-normal text-slate-900 dark:text-white mb-2">
                {t('greetingHello') || 'Hola'}, {userName}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-12">
                {t('intelligenceWelcome') || '¿Por dónde empezamos?'}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4 flex-wrap justify-center max-w-2xl">
                {actions.filter(action => action.show).map(action => (
                    <button
                        key={action.type}
                        onClick={() => onAction(action.type)}
                        className="flex flex-col items-center gap-3 p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-white/5 transition-all min-w-[160px]"
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <action.icon size={24} className="text-slate-700 dark:text-slate-300" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};
