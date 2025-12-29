import React from 'react';
import { Mic, Upload, Phone, Sparkles } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const EmptyState: React.FC<{ onCreate: (type: string) => void; userName?: string }> = ({ onCreate, userName = 'Diego' }) => {
    const { t } = useLanguage();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('goodMorning') || 'Buenos días';
        if (hour < 20) return t('goodAfternoon') || 'Buenas tardes';
        return t('goodEvening') || 'Buenas noches';
    };

    return (
        <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-surface-dark p-8 text-center animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-200 dark:shadow-blue-900/50">
                <Sparkles className="text-white w-8 h-8" />
            </div>

            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {getGreeting()}, {userName}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-md">
                {t('intelligenceWelcome') || '¿Qué quieres capturar hoy? Tu cerebro digital está listo para procesar.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                <button
                    onClick={() => onCreate('mic')}
                    className="group flex flex-col items-center p-6 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all duration-300"
                >
                    <div className="w-12 h-12 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-3 group-hover:bg-red-600 group-hover:text-white transition-colors">
                        <Mic size={24} />
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-white">{t('recordAudio') || 'Grabar Audio'}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('inPersonMeetings') || 'Reuniones presenciales'}</span>
                </button>

                <button
                    onClick={() => onCreate('call')}
                    className="group flex flex-col items-center p-6 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all duration-300"
                >
                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <Phone size={24} />
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-white">{t('makeCall') || 'Hacer Llamada'}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('integratedVoIP') || 'Telefonía IP integrada'}</span>
                </button>

                <button
                    onClick={() => onCreate('upload')}
                    className="group flex flex-col items-center p-6 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all duration-300"
                >
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Upload size={24} />
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-white">{t('uploadFile') || 'Subir Archivo'}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">MP3, M4A, WAV</span>
                </button>
            </div>
        </div>
    );
};
