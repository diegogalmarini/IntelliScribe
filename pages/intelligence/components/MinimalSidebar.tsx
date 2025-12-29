import React, { useState } from 'react';
import { Recording, UserProfile } from '../../../types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Plus, MoreHorizontal, FileText, Edit3, FolderInput, Trash2 } from 'lucide-react';

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
    const [contextMenuId, setContextMenuId] = useState<string | null>(null);

    const handleContextMenu = (e: React.MouseEvent, recordingId: string) => {
        e.stopPropagation();
        setContextMenuId(contextMenuId === recordingId ? null : recordingId);
    };

    const closeContextMenu = () => {
        setContextMenuId(null);
    };

    const handleRename = (id: string) => {
        // TODO: Implement rename functionality
        console.log('Rename recording:', id);
        closeContextMenu();
    };

    const handleMoveTo = (id: string) => {
        // TODO: Implement move to project
        console.log('Move recording:', id);
        closeContextMenu();
    };

    const handleDelete = (id: string) => {
        // TODO: Implement delete with confirmation
        console.log('Delete recording:', id);
        closeContextMenu();
    };

    const handleViewNotes = (id: string) => {
        // TODO: Open notes/files panel
        console.log('View notes for:', id);
        closeContextMenu();
    };

    return (
        <div className="w-64 h-full bg-white dark:bg-[#171717] flex flex-col border-r border-black/[0.05] dark:border-white/[0.05]">
            {/* Logo */}
            <div className="p-3 border-b border-black/[0.05] dark:border-white/[0.05]">
                <div className="flex items-center gap-2 px-2">
                    <span className="text-[15px] font-semibold text-[#0d0d0d] dark:text-white">
                        Diktalo
                    </span>
                </div>
            </div>

            {/* Usage Indicator */}
            <div className="px-3 py-3 border-b border-black/[0.05] dark:border-white/[0.05]">
                <div className="px-2 text-[13px] text-[#676767] dark:text-[#c5c5c5]">
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
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-[14px] font-normal text-[#0d0d0d] dark:text-white hover:bg-[#f0f0f0] dark:hover:bg-white/[0.08] rounded-lg transition-colors border border-black/10 dark:border-white/10"
                >
                    <Plus size={16} strokeWidth={2} />
                    <span>Nueva Sesión</span>
                </button>
            </div>

            {/* Recordings List */}
            <div className="flex-1 overflow-y-auto px-2 pb-2">
                {recordings.length === 0 ? (
                    <p className="text-[13px] text-[#8e8e8e] dark:text-[#8e8e8e] text-center py-8 px-3">
                        No hay grabaciones
                    </p>
                ) : (
                    <div className="space-y-0.5">
                        {recordings.map(recording => (
                            <div key={recording.id} className="relative group">
                                <button
                                    onClick={() => onSelectRecording(recording.id)}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-[14px] transition-colors ${selectedId === recording.id
                                            ? 'bg-[#f0f0f0] dark:bg-[#2a2a2a] text-[#0d0d0d] dark:text-white'
                                            : 'text-[#676767] dark:text-[#c5c5c5] hover:bg-[#f7f7f8] dark:hover:bg-white/[0.05]'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="truncate font-normal">
                                                {recording.title || 'Sin título'}
                                            </div>
                                            <div className="text-[12px] text-[#8e8e8e] dark:text-[#8e8e8e] mt-1">
                                                {new Date(recording.date).toLocaleDateString('es-ES', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => handleContextMenu(e, recording.id)}
                                            className={`p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${contextMenuId === recording.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                                }`}
                                        >
                                            <MoreHorizontal size={16} className="text-[#676767] dark:text-[#c5c5c5]" />
                                        </button>
                                    </div>
                                </button>

                                {/* Context Menu */}
                                {contextMenuId === recording.id && (
                                    <>
                                        {/* Backdrop to close menu */}
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={closeContextMenu}
                                        />

                                        <div className="absolute right-2 top-full mt-1 w-48 bg-white dark:bg-[#2a2a2a] rounded-lg shadow-lg border border-black/10 dark:border-white/10 py-1 z-20">
                                            <button
                                                onClick={() => handleViewNotes(recording.id)}
                                                className="w-full text-left px-3 py-2 text-[13px] text-[#0d0d0d] dark:text-[#ececec] hover:bg-[#f0f0f0] dark:hover:bg-white/5 flex items-center gap-2"
                                            >
                                                <FileText size={14} />
                                                <span>Ver Notas y Archivos</span>
                                            </button>
                                            <button
                                                onClick={() => handleRename(recording.id)}
                                                className="w-full text-left px-3 py-2 text-[13px] text-[#0d0d0d] dark:text-[#ececec] hover:bg-[#f0f0f0] dark:hover:bg-white/5 flex items-center gap-2"
                                            >
                                                <Edit3 size={14} />
                                                <span>Renombrar</span>
                                            </button>
                                            <button
                                                onClick={() => handleMoveTo(recording.id)}
                                                className="w-full text-left px-3 py-2 text-[13px] text-[#0d0d0d] dark:text-[#ececec] hover:bg-[#f0f0f0] dark:hover:bg-white/5 flex items-center gap-2"
                                            >
                                                <FolderInput size={14} />
                                                <span>Mover a...</span>
                                            </button>
                                            <div className="my-1 border-t border-black/5 dark:border-white/5"></div>
                                            <button
                                                onClick={() => handleDelete(recording.id)}
                                                className="w-full text-left px-3 py-2 text-[13px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                                            >
                                                <Trash2 size={14} />
                                                <span>Eliminar</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
