import React from 'react';
import { Mic, Upload, MessageCircle, Chrome, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface EmptyStateCleanProps {
    userName: string;
    onAction: (type: 'record' | 'upload' | 'multiaudio' | 'extension') => void;
}

export const EmptyStateClean: React.FC<EmptyStateCleanProps> = ({ userName, onAction }) => {
    const { t, language } = useLanguage();

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-4xl font-normal text-[#1f1f1f] dark:text-white mb-2 md:mb-3">
                {t('dashboard_greeting').replace('{name}', userName)}
            </h1>
            <p className="text-[#8e8e8e] text-sm md:text-lg mb-8 md:mb-12 text-center px-4">
                {t('intelligenceWelcome')}
            </p>

            {/* Primary CTA — Chrome Extension */}
            <button
                onClick={() => onAction('extension')}
                className="w-full max-w-lg mb-4 group flex items-center gap-5 p-6 rounded-2xl border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 hover:bg-blue-100/50 dark:hover:bg-blue-500/20 hover:border-blue-600 shadow-md hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 active:scale-[0.99]"
            >
                <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                    <Chrome size={26} className="text-white" />
                </div>
                <div className="text-left flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-bold text-gray-900 dark:text-white">
                            {t('emptystate_ext_title')}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-blue-500 text-white rounded-full">
                            {language === 'es' ? 'RECOMENDADO' : 'RECOMMENDED'}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t('emptystate_ext_desc')}
                    </p>
                </div>
                <ArrowRight size={20} className="text-blue-500 dark:text-blue-400 ml-auto flex-shrink-0 group-hover:translate-x-1 transition-transform duration-200" />
            </button>

            {/* Secondary Actions */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
                {[
                    { type: 'record' as const, icon: Mic, label: t('recordAudio') || 'Grabar Audio' },
                    { type: 'upload' as const, icon: Upload, label: t('uploadFile') || 'Subir Archivo' },
                    { type: 'multiaudio' as const, icon: MessageCircle, label: t('multi_audio_label') },
                ].map((action) => (
                    <button
                        key={action.type}
                        onClick={() => onAction(action.type)}
                        className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-all duration-200 active:scale-[0.98]"
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors duration-200">
                            <action.icon size={18} className="text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        </div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-blue-700 dark:group-hover:text-white transition-colors text-center">
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};
