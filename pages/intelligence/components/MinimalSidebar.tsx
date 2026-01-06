import React, { useState, useRef, useEffect } from 'react';
import { Recording, UserProfile, Folder } from '../../../types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Plus, MoreHorizontal, FileText, Edit3, FolderInput, Trash2, Mic, Search, X, LayoutTemplate, Star } from 'lucide-react';
import { FolderList } from './FolderList';

interface MinimalSidebarProps {
    recordings: Recording[];
    selectedId: string | null;
    onSelectRecording: (id: string) => void;
    onNewRecording: () => void;
    userFirstName: string;
    user: UserProfile;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    onRenameRecording?: (id: string, newTitle: string) => void;
    onDeleteRecording?: (id: string) => void;
    onMoveRecording?: (id: string, folderId: string) => void;

    // Carpeta Props
    folders?: Folder[];
    selectedFolderId?: string | null;
    onSelectFolder?: (folderId: string | null) => void;

    onLogoClick?: () => void;
    currentView?: 'recordings' | 'subscription' | 'templates';
    onViewChange?: (view: 'recordings' | 'subscription' | 'templates') => void;
}

export const MinimalSidebar: React.FC<MinimalSidebarProps> = ({
    recordings,
    selectedId,
    onSelectRecording,
    onNewRecording,
    userFirstName,
    user,
    searchQuery = '',
    onSearchChange,
    onRenameRecording,
    onDeleteRecording,
    onMoveRecording,

    // Carpeta Defaults
    folders = [],
    selectedFolderId = null,
    onSelectFolder,

    onLogoClick,
    currentView,
    onViewChange
}) => {
    const { t } = useLanguage();
    const [contextMenuId, setContextMenuId] = useState<string | null>(null);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [moveModalId, setMoveModalId] = useState<string | null>(null);
    const renameInputRef = useRef<HTMLInputElement>(null);

    // ... (UseEffects and ContextMenu handlers remain the same) ...

    useEffect(() => {
        if (renamingId && renameInputRef.current) {
            renameInputRef.current.focus();
            renameInputRef.current.select();
        }
    }, [renamingId]);

    const handleContextMenu = (e: React.MouseEvent, recordingId: string) => {
        e.stopPropagation();
        setContextMenuId(contextMenuId === recordingId ? null : recordingId);
    };

    const closeContextMenu = () => {
        setContextMenuId(null);
    };

    const handleRename = (id: string) => {
        const recording = recordings.find(r => r.id === id);
        if (recording) {
            setRenameValue(recording.title || '');
            setRenamingId(id);
        }
        closeContextMenu();
    };

    const saveRename = () => {
        if (renamingId && renameValue.trim() && onRenameRecording) {
            onRenameRecording(renamingId, renameValue.trim());
        }
        setRenamingId(null);
        setRenameValue('');
    };

    const cancelRename = () => {
        setRenamingId(null);
        setRenameValue('');
    };

    const handleMoveTo = (id: string) => {
        setMoveModalId(id);
        closeContextMenu();
    };

    const handleMoveToFolder = (recordingId: string, folderId: string) => {
        if (onMoveRecording) {
            onMoveRecording(recordingId, folderId);
        }
        setMoveModalId(null);
    };

    const handleDelete = (id: string) => {
        setDeleteConfirmId(id);
        closeContextMenu();
    };

    const confirmDelete = () => {
        if (deleteConfirmId && onDeleteRecording) {
            onDeleteRecording(deleteConfirmId);
        }
        setDeleteConfirmId(null);
    };

    const handleViewNotes = (id: string) => {
        console.log('View notes for:', id);
        closeContextMenu();
    };

    return (
        <div className="hidden md:flex md:w-64 h-full bg-white dark:bg-surface-dark flex-col border-r border-black/[0.05] dark:border-white/[0.05] overflow-x-hidden">
            {/* Logo */}
            <div className="p-3 border-b border-black/[0.05] dark:border-white/[0.05]">
                <div
                    className="flex items-center justify-center px-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={onLogoClick}
                >
                    <img
                        src={document.documentElement.classList.contains('dark') ? '/logo-diktalo-b.svg' : '/logo-diktalo.svg'}
                        alt="Diktalo"
                        className="h-8 w-auto"
                    />
                </div>
            </div>

            {/* Usage Indicator */}
            <div className="px-3 py-3 border-b border-black/[0.05] dark:border-white/[0.05]">
                <div className="px-2 text-[12px] text-[#676767] dark:text-[#c5c5c5]">
                    {user.subscription.minutesLimit === -1 ? (
                        <span className="font-normal">Ilimitado</span>
                    ) : (
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <span className="font-normal">{user.subscription.minutesUsed} / {user.subscription.minutesLimit} min</span>
                                <span className="font-normal">{Math.round((user.subscription.minutesUsed / user.subscription.minutesLimit) * 100)}%</span>
                            </div>
                            <div className="h-1 bg-[#e5e5e5] dark:bg-card-dark rounded-full overflow-hidden">
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

            {/* FOLDER LIST INTEGRATION */}
            {onSelectFolder && (
                <FolderList
                    onSelectFolder={onSelectFolder}
                    selectedFolderId={selectedFolderId || null}
                />
            )}

            <div className="my-2 border-t border-black/[0.05] dark:border-white/[0.05]"></div>

            {/* Search Bar */}
            {onSearchChange && (
                <div className="px-3 py-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-[#8e8e8e]" size={14} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Buscar..."
                            className="w-full pl-9 pr-8 py-2 bg-[#f7f7f8] dark:bg-card-dark border-0 rounded-lg text-[12px] text-[#0d0d0d] dark:text-white placeholder-[#8e8e8e] focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => onSearchChange('')}
                                className="absolute right-2 top-2 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
                            >
                                <X size={14} className="text-[#8e8e8e]" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* New Recording Button */}
            <div className="p-2">
                <button
                    onClick={onNewRecording}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-normal text-[#0d0d0d] dark:text-white hover:bg-[#f0f0f0] dark:hover:bg-white/[0.08] rounded-lg transition-colors border border-black/10 dark:border-white/10"
                >
                    <Plus size={16} strokeWidth={2} />
                    <span>Nueva Sesión</span>
                </button>
            </div>

            {/* Recordings List */}
            <div className="flex-1 overflow-y-auto px-2 pb-2">
                {recordings.length === 0 ? (
                    <p className="text-[12px] text-[#8e8e8e] dark:text-[#8e8e8e] text-center py-8 px-3">
                        {searchQuery ? 'No hay resultados' : (selectedFolderId ? 'Carpeta vacía' : 'No hay grabaciones')}
                    </p>
                ) : (
                    <div className="space-y-0.5">
                        {recordings.map(recording => (
                            <div key={recording.id} className="relative">
                                {/* Recording Item Button */}
                                <button
                                    onClick={() => onSelectRecording(recording.id)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors group ${selectedId === recording.id
                                        ? 'bg-[#f0f0f0] dark:bg-card-dark text-[#0d0d0d] dark:text-white'
                                        : 'text-[#676767] dark:text-[#c5c5c5] hover:bg-[#f7f7f8] dark:hover:bg-white/[0.05]'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            {renamingId === recording.id ? (
                                                <input
                                                    ref={renameInputRef}
                                                    type="text"
                                                    value={renameValue}
                                                    onChange={(e) => setRenameValue(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveRename();
                                                        if (e.key === 'Escape') cancelRename();
                                                    }}
                                                    onBlur={saveRename}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-full px-2 py-1 bg-white dark:bg-[#1a1a1a] border border-blue-500 rounded text-[13px] text-[#0d0d0d] dark:text-white focus:outline-none"
                                                />
                                            ) : (
                                                <div className="truncate font-normal">
                                                    {recording.title || 'Sin título'}
                                                </div>
                                            )}
                                            <div className="text-[11px] text-[#8e8e8e] dark:text-[#8e8e8e] mt-0.5">
                                                {(() => {
                                                    const date = new Date(recording.date);
                                                    if (isNaN(date.getTime())) return 'Sin fecha';
                                                    return date.toLocaleDateString('es-ES', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    });
                                                })()}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => handleContextMenu(e, recording.id)}
                                            className={`p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-opacity ${contextMenuId === recording.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
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
                                            className="fixed inset-0 z-[100]"
                                            onClick={closeContextMenu}
                                        />

                                        <div className="absolute right-1 top-8 w-56 bg-[#2a2a2a] rounded-xl shadow-2xl border border-white/10 py-2 z-[200]">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewNotes(recording.id);
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-[14px] text-[#ececec] hover:bg-white/10 flex items-center gap-3 transition-colors"
                                            >
                                                <FileText size={18} strokeWidth={1.5} />
                                                <span>Ver Notas y Archivos</span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRename(recording.id);
                                                }}
                                                className="w-full text-left px-3 py-2 text-[14px] text-white hover:bg-white/10 flex items-center gap-3 transition-colors"
                                            >
                                                <Edit3 size={18} strokeWidth={1.5} />
                                                <span>Renombrar</span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMoveTo(recording.id);
                                                }}
                                                className="w-full text-left px-3 py-2 text-[14px] text-white hover:bg-white/10 flex items-center gap-3 transition-colors"
                                            >
                                                <FolderInput size={18} strokeWidth={1.5} />
                                                <span>Mover a...</span>
                                            </button>
                                            <div className="my-1.5 border-t border-white/10"></div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(recording.id);
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-[14px] text-red-400 hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                                            >
                                                <Trash2 size={18} strokeWidth={1.5} />
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

            {/* DELETE MODAL & MOVE MODAL (Existing logic...) */}
            {deleteConfirmId && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-[300]" onClick={() => setDeleteConfirmId(null)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-card-dark rounded-2xl shadow-2xl z-[400] p-6">
                        <h3 className="text-lg font-semibold text-[#0d0d0d] dark:text-white mb-2">
                            ¿Eliminar grabación?
                        </h3>
                        <p className="text-[13px] text-[#676767] dark:text-[#c5c5c5] mb-6">Esta acción no se puede deshacer.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="flex-1 px-4 py-2.5 bg-[#f7f7f8] dark:bg-[#333] text-[#0d0d0d] dark:text-white rounded-lg text-[13px] font-medium hover:bg-[#ebebeb] dark:hover:bg-[#444] transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-[13px] font-medium hover:bg-red-700 transition-colors"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </>
            )}

            {moveModalId && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-[300]" onClick={() => setMoveModalId(null)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-card-dark rounded-2xl shadow-2xl z-[400] p-6">
                        <h3 className="text-lg font-semibold text-[#0d0d0d] dark:text-white mb-4">Mover a carpeta</h3>
                        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                            <button
                                onClick={() => handleMoveToFolder(moveModalId, 'root')}
                                className="w-full text-left px-4 py-3 bg-[#f7f7f8] dark:bg-[#333] text-[#0d0d0d] dark:text-white rounded-lg text-[13px] hover:bg-[#ebebeb] dark:hover:bg-[#444] transition-colors font-medium border border-blue-100 dark:border-blue-900/30"
                            >
                                📂 Sin Carpeta (Raíz)
                            </button>
                            {folders.length === 0 ? (
                                <p className="text-[13px] text-[#676767] dark:text-[#c5c5c5] text-center pt-2">No tienes carpetas creadas</p>
                            ) : (
                                folders.map(folder => (
                                    <button
                                        key={folder.id}
                                        onClick={() => handleMoveToFolder(moveModalId, folder.id)}
                                        className="w-full text-left px-4 py-3 bg-[#f7f7f8] dark:bg-[#333] text-[#0d0d0d] dark:text-white rounded-lg text-[13px] hover:bg-[#ebebeb] dark:hover:bg-[#444] transition-colors"
                                    >
                                        📁 {folder.name}
                                    </button>
                                ))
                            )}
                        </div>
                        <button
                            onClick={() => setMoveModalId(null)}
                            className="w-full px-4 py-2.5 bg-[#f7f7f8] dark:bg-[#333] text-[#0d0d0d] dark:text-white rounded-lg text-[13px] font-medium hover:bg-[#ebebeb] dark:hover:bg-[#444] transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
