import React from 'react';
import { Recording, UserProfile } from '../../../types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Plus } from 'lucide-react';

interface MinimalSidebarProps {
    recordings: Recording[];
    selectedId: string | null;
    onSelectRecording: (id: string) => void;
    onNewRecording: () => void;
    userFirstName: string;
    user: UserProfile;
}

export const MinimalSidebar: React.FC<MinimalSidebarProps> = ({
    recordings,
    selectedId,
    onSelectRecording,
    onNewRecording,
    userFirstName,
    user
}) => {
    const { t } = useLanguage();

    return (
        <div className="w-64 h-full bg-slate-50 dark:bg-[#0f0f0f] flex flex-col border-r border-slate-200 dark:border-slate-800">
            {/* Logo */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <img
                    src="/logo-diktalo.svg"
                    alt="Diktalo"
                    className="h-6 w-auto dark:brightness-0 dark:invert"
                />
            </div>

            {/* Usage Indicator */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                    {user.subscription.minutesLimit === -1 ? (
                        <span className="font-medium">Ilimitado</span>
                    ) : (
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <span>{user.subscription.minutesUsed} / {user.subscription.minutesLimit} min</span>
                                <span className="font-medium">{Math.round((user.subscription.minutesUsed / user.subscription.minutesLimit) * 100)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all ${(user.subscription.minutesUsed / user.subscription.minutesLimit) * 100 > 90 ? 'bg-red-500' :
                                        (user.subscription.minutesUsed / user.subscription.minutesLimit) * 100 > 70 ? 'bg-yellow-500' :
                                            'bg-blue-500'
                                        }`}
                                    style={{ width: `${Math.min((user.subscription.minutesUsed / user.subscription.minutesLimit) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* New Recording Button */}
            <div className="p-3">
                <button
                    onClick={onNewRecording}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    <span>{t('newSession') || 'Nueva grabación'}</span>
                </button>
            </div>

            {/* Recordings List */}
            <div className="flex-1 overflow-y-auto px-3 pb-3">
                {recordings.length === 0 ? (
                    <p className="text-xs text-slate-400 dark:text-slate-600 text-center py-8">
                        {t('noRecordingsYet') || 'No hay grabaciones'}
                    </p>
                ) : (
                    <div className="space-y-1">
                        {recordings.map(recording => (
                            <button
                                key={recording.id}
                                onClick={() => onSelectRecording(recording.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedId === recording.id
                                    ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                                    }`}
                            >
                                <div className="truncate font-medium">
                                    {recording.title || t('untitledRecording') || 'Sin título'}
                                </div>
                                <div className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">
                                    {new Date(recording.date).toLocaleDateString('es-ES', {
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
