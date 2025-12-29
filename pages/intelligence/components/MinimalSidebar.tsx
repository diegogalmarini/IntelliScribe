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
        <div className="w-64 h-full bg-white dark:bg-[#171717] flex flex-col border-r border-black/[0.05] dark:border-white/[0.05]">
            {/* Logo */}
            <div className="p-3 border-b border-black/[0.05] dark:border-white/[0.05]">
                <div className="flex items-center gap-2 px-2">
                    <span className="text-[15px] font-semibold text-[#0d0d0d] dark:text-[#ececec]">
                        Diktalo
                    </span>
                </div>
            </div>

            {/* Usage Indicator */}
            <div className="px-3 py-3 border-b border-black/[0.05] dark:border-white/[0.05]">
                <div className="px-2 text-[13px] text-[#676767] dark:text-[#8e8e8e]">
                    {user.subscription.minutesLimit === -1 ? (
                        <span className="font-normal">Ilimitado</span>
                    ) : (
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <span className="font-normal">{user.subscription.minutesUsed} / {user.subscription.minutesLimit} min</span>
                                <span className="font-normal">{Math.round((user.subscription.minutesUsed / user.subscription.minutesLimit) * 100)}%</span>
                            </div>
                            <div className="h-1 bg-[#e5e5e5] dark:bg-[#2a2a2a] rounded-full overflow-hidden">
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
            <div className="p-2">
                <button
                    onClick={onNewRecording}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-[14px] font-normal text-[#0d0d0d] dark:text-[#ececec] hover:bg-[#f0f0f0] dark:hover:bg-white/[0.08] rounded-lg transition-colors border border-black/10 dark:border-white/10"
                >
                    <Plus size={16} strokeWidth={2} />
                    <span>Nueva Sesión</span>
                </button>
            </div>

            {/* Recordings List */}
            <div className="flex-1 overflow-y-auto px-2 pb-2">
                {recordings.length === 0 ? (
                    <p className="text-[13px] text-[#8e8e8e] dark:text-[#565656] text-center py-8 px-3">
                        No hay grabaciones
                    </p>
                ) : (
                    <div className="space-y-0.5">
                        {recordings.map(recording => (
                            <button
                                key={recording.id}
                                onClick={() => onSelectRecording(recording.id)}
                                className={`w-full text-left px-3 py-2.5 rounded-lg text-[14px] transition-colors ${selectedId === recording.id
                                        ? 'bg-[#f0f0f0] dark:bg-[#2a2a2a] text-[#0d0d0d] dark:text-[#ececec]'
                                        : 'text-[#676767] dark:text-[#acacac] hover:bg-[#f7f7f8] dark:hover:bg-white/[0.05]'
                                    }`}
                            >
                                <div className="truncate font-normal">
                                    {recording.title || 'Sin título'}
                                </div>
                                <div className="text-[12px] text-[#8e8e8e] dark:text-[#6e6e6e] mt-1">
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
