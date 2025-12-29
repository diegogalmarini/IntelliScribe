import React from 'react';
import { Mic, Upload, Phone } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

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
        <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto">
            {/* Greeting */}
            <h1 className="text-4xl font-normal text-[#1f1f1f] dark:text-white mb-3">
                {t('greetingHello') || 'Hola'}, {userName}
            </h1>
            <p className="text-[#444746] dark:text-slate-400 text-lg mb-16">
                {t('intelligenceWelcome') || '¿Por dónde empezamos?'}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-6 flex-wrap justify-center">
                {actions.filter(action => action.show).map(action => (
                    <button
                        key={action.type}
                        onClick={() => onAction(action.type)}
                        className="flex flex-col items-center gap-4 p-8 rounded-2xl border border-[#e5e5e5] dark:border-[#3c3c3c] hover:border-[#d0d0d0] dark:hover:border-[#4f4f4f] hover:bg-[#fafafa] dark:hover:bg-[#2a2a2a] transition-all min-w-[180px]"
                    >
                        <div className="w-14 h-14 rounded-full bg-[#f5f5f5] dark:bg-[#2f2f2f] flex items-center justify-center">
                            <action.icon size={26} className="text-[#444746] dark:text-slate-300" />
                        </div>
                        <span className="text-sm font-medium text-[#1f1f1f] dark:text-slate-300">
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};
