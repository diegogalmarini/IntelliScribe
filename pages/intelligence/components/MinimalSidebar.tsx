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

    // Folder Actions
    onAddFolder?: (name: string) => Promise<void>;
    onRenameFolder?: (id: string, name: string) => Promise<void>;
    onDeleteFolder?: (id: string) => Promise<void>;

    onLogoClick?: () => void;
    currentView: 'recordings' | 'subscription' | 'templates';
    onViewChange: (view: 'recordings' | 'subscription' | 'templates') => void;

    // New Mobile/Collapse Props
    isOpen: boolean;
    onToggle: () => void;
    isRecording?: boolean; // NEW: Navigation Guard prop
    useSemanticSearch?: boolean;
    onSemanticToggle?: () => void;
    onOpenSearch?: () => void; // NEW
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
    onAddFolder,
    onRenameFolder,
    onDeleteFolder,

    onLogoClick,
    currentView,
    onViewChange,
    isOpen,
    onToggle,
    isRecording = false, // Default to false
    useSemanticSearch = false,
    onSemanticToggle,
    onOpenSearch
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
        onSelectRecording(id);
        closeContextMenu();
    };

    const handleLogoClick = () => {
        if (onLogoClick) onLogoClick();
    };

    return (
        <div className="flex flex-col h-full bg-surface-light dark:bg-surface-dark border-r border-black/[0.05] dark:border-white/[0.05] pt-0">
            {/* NEW: Sidebar Header (Gemini Style) */}
            <div className="flex items-center gap-2 px-4 py-3">
                <button
                    onClick={onToggle}
                    className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <button
                    onClick={onOpenSearch}
                    className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                    title="Buscar"
                >
                    <Search size={20} />
                </button>
            </div>

            {/* Usage Indicator - Moved to top as quick status */}
            <div className="px-3 py-3 border-b border-black/[0.05] dark:border-white/[0.05]">
                {/* ... (Usage Content Kept Same) ... */}
                <div className="px-2 text-[12px] text-[#676767] dark:text-[#c5c5c5]">
                    {user.subscription.minutesLimit === -1 ? (
                        <span className="font-normal">{t('unlimited_label')}</span>
                    ) : (
                        <div className="space-y-4">
                            {/* Minutes Usage */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="font-medium">{user.subscription.minutesUsed} / {user.subscription.minutesLimit} {t('min_short')}</span>
                                    <span className="font-medium">{Math.min(100, Math.round((user.subscription.minutesUsed / Math.max(user.subscription.minutesLimit, 1)) * 100))}%</span>
                                </div>
                                <div className="h-1 bg-slate-100 dark:bg-card-dark rounded-full overflow-hidden">
                                    <div
                                        className="h-full transition-all duration-500 bg-[#0055FF]"
                                        style={{ width: `${Math.min(100, (user.subscription.minutesUsed / Math.max(user.subscription.minutesLimit, 1)) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Storage Usage (Condensed for cleaner sidebar) */}
                            {(user.subscription.storageUsed || 0) > 0 && (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[11px]">
                                        <span className="font-medium">
                                            Storage
                                        </span>
                                        <span className="font-medium">
                                            {((user.subscription.storageUsed || 0) / 1024 / 1024).toFixed(0)} MB
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* FOLDER LIST INTEGRATION */}
            <div id="folder-list-section" className="mt-2">
                {onSelectFolder && (
                    <FolderList
                        onSelectFolder={onSelectFolder}
                        selectedFolderId={selectedFolderId || null}
                        userId={user?.id}
                        folders={folders}
                        onCreateFolder={onAddFolder}
                        onRenameFolder={onRenameFolder}
                        onDeleteFolder={onDeleteFolder}
                    />
                )}
            </div>

            <div className="my-2 border-t border-black/[0.05] dark:border-white/[0.05]"></div>

            {/* Recordings List */}
            <div className="flex-1 overflow-y-auto px-2 pb-2">
                {recordings.length === 0 ? (
                    <p className="text-[12px] text-[#8e8e8e] dark:text-[#8e8e8e] text-center py-8 px-3">
                        {searchQuery ? t('no_results_found_short') : (selectedFolderId ? t('folder_empty_short') : t('no_recordings_short'))}
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
                                                    {recording.title || t('untitledRecording')}
                                                </div>
                                            )}
                                            <div className="text-[11px] text-[#8e8e8e] dark:text-[#8e8e8e] mt-0.5">
                                                {(() => {
                                                    const date = new Date(recording.date);
                                                    if (isNaN(date.getTime())) return t('no_date_label');
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

                                        <div className="absolute right-1 top-8 w-56 bg-white dark:bg-[#2a2a2a] rounded-xl shadow-2xl border border-black/5 dark:border-white/10 py-2 z-[200]">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewNotes(recording.id);
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-[14px] text-[#0d0d0d] dark:text-[#ececec] hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 transition-colors"
                                            >
                                                <FileText size={18} strokeWidth={1.5} />
                                                <span>{t('viewContext')}</span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRename(recording.id);
                                                }}
                                                className="w-full text-left px-3 py-2 text-[14px] text-[#0d0d0d] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 transition-colors"
                                            >
                                                <Edit3 size={18} strokeWidth={1.5} />
                                                <span>{t('rename')}</span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMoveTo(recording.id);
                                                }}
                                                className="w-full text-left px-3 py-2 text-[14px] text-[#0d0d0d] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3 transition-colors"
                                            >
                                                <FolderInput size={18} strokeWidth={1.5} />
                                                <span>{t('move_to_folder_title')}</span>
                                            </button>
                                            <div className="my-1.5 border-t border-black/5 dark:border-white/10"></div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(recording.id);
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-[14px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                                            >
                                                <Trash2 size={18} strokeWidth={1.5} />
                                                <span>{t('delete')}</span>
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
                            {t('delete_recording_confirm_title')}
                        </h3>
                        <p className="text-[13px] text-[#676767] dark:text-[#c5c5c5] mb-6">{t('delete_recording_confirm_desc')}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="flex-1 px-4 py-2.5 bg-[#f7f7f8] dark:bg-[#333] text-[#0d0d0d] dark:text-white rounded-lg text-[13px] font-medium hover:bg-[#ebebeb] dark:hover:bg-[#444] transition-colors"
                            >
                                {t('cancel_btn')}
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-[13px] font-medium hover:bg-red-700 transition-colors"
                            >
                                {t('delete')}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {moveModalId && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-[300]" onClick={() => setMoveModalId(null)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-card-dark rounded-2xl shadow-2xl z-[400] p-6">
                        <h3 className="text-lg font-semibold text-[#0d0d0d] dark:text-white mb-4">{t('move_to_folder_title')}</h3>
                        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                            <button
                                onClick={() => handleMoveToFolder(moveModalId, 'root')}
                                className="w-full text-left px-4 py-3 bg-[#f7f7f8] dark:bg-[#333] text-[#0d0d0d] dark:text-white rounded-lg text-[13px] hover:bg-[#ebebeb] dark:hover:bg-[#444] transition-colors font-medium border border-blue-100 dark:border-blue-900/30"
                            >
                                📂 {t('no_folder_root_label')}
                            </button>
                            {folders.filter(f => f.type === 'user').length === 0 ? (
                                <p className="text-[13px] text-[#676767] dark:text-[#c5c5c5] text-center pt-2">{t('no_folders_created_label')}</p>
                            ) : (
                                folders
                                    .filter(f => f.type === 'user')
                                    .map(folder => (
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
                            {t('cancel_btn')}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
