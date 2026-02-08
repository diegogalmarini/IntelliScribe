
import React, { useState, useEffect } from 'react';
import { Folder, Plus, MoreVertical, Edit2, Trash2, FolderOpen, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { Folder as FolderType, Recording } from '../../../types';
import { ConfirmModal } from './ConfirmModal';
import { useToast } from '../../../components/Toast';

interface FolderListProps {
    onSelectFolder: (folderId: string | null) => void;
    selectedFolderId: string | null;
    userId?: string;
    folders: FolderType[];
    recordings: Recording[];
    // Handlers from Parent (App)
    onCreateFolder?: (name: string) => Promise<void>;
    onRenameFolder?: (id: string, name: string) => Promise<void>;
    onDeleteFolder?: (id: string) => Promise<void>;
    onAction?: (id: string, action: string) => void; // Legacy or future usage
}

import { useLanguage } from '../../../contexts/LanguageContext';

export const FolderList: React.FC<FolderListProps> = ({
    onSelectFolder,
    selectedFolderId,
    userId,
    folders,
    recordings,
    onCreateFolder,
    onRenameFolder,
    onDeleteFolder
}) => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    // Calculate activity scores for folders based on latest recording
    const sortedFolders = [...(folders || [])]
        .filter(folder => {
            const reservedNames = ['Todas las Grabaciones', 'All Recordings', 'Favoritos', 'Favorites'];
            return !reservedNames.some(reserved =>
                folder.name.toLowerCase().trim() === reserved.toLowerCase()
            );
        })
        .map(folder => {
            // Find latest recording in this folder
            const folderRecordings = (recordings || []).filter(r => r.folderId === folder.id);
            const latestRecordingDate = folderRecordings.length > 0
                ? Math.max(...folderRecordings.map(r => new Date(r.date).getTime()))
                : new Date(folder.createdAt).getTime();

            return {
                ...folder,
                lastActivity: latestRecordingDate
            };
        })
        .sort((a, b) => b.lastActivity - a.lastActivity);

    const visibleFolders = isExpanded ? sortedFolders : sortedFolders.slice(0, 3);
    const hasMore = sortedFolders.length > 3;

    const handleCreateFolder = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newFolderName.trim() || !onCreateFolder) return;

        try {
            await onCreateFolder(newFolderName);
            setNewFolderName('');
            setIsCreating(false);
        } catch (error) {
            console.error("Create folder failed:", error);
            showToast("Error creating folder", 'error');
        }
    };

    const startEditing = (folder: FolderType, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingFolderId(folder.id);
        setEditName(folder.name);
    };

    const handleRenameFolder = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!editName.trim() || !editingFolderId || !onRenameFolder) return;

        try {
            await onRenameFolder(editingFolderId, editName.trim());
            setEditingFolderId(null);
            setEditName('');
        } catch (error) {
            console.error("Rename folder failed:", error);
            showToast("Error renaming folder", 'error');
        }
    };

    const confirmDeleteFolder = async () => {
        if (folderToDelete && onDeleteFolder) {
            try {
                await onDeleteFolder(folderToDelete);
                if (selectedFolderId === folderToDelete) onSelectFolder(null);
                setFolderToDelete(null);
            } catch (error) {
                console.error("Delete folder failed:", error);
                showToast("Error deleting folder", 'error');
            }
        }
    };

    const handleDeleteFolder = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setFolderToDelete(id);
    };

    return (
        <div className="space-y-2 mt-6">
            {/* "All Recordings" - Main root folder */}
            <div className="space-y-0.5 mb-3">
                <button
                    onClick={() => onSelectFolder(null)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[0.8rem] transition-colors ${selectedFolderId === null
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                        }`}
                >
                    <FolderOpen className="w-4 h-4" />
                    <span className="truncate">{t('allRecordings') || 'Todas las Grabaciones'}</span>
                </button>
            </div>

            {/* User's Projects Section Title & Create Button */}
            <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-[0.7rem] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('projects') || 'Proyectos'}</span>
                <button
                    onClick={() => setIsCreating(true)}
                    className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-md transition-colors"
                    title={t('createProject')}
                >
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>

            {isCreating && (
                <div className="px-2 mb-2">
                    <form onSubmit={handleCreateFolder} className="relative flex items-center gap-1">
                        <input
                            autoFocus
                            type="text"
                            placeholder={t('newProjectPlaceholder')}
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') setIsCreating(false);
                            }}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm px-2 py-1.5 pr-14 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                        <div className="absolute right-1 flex items-center gap-0.5">
                            <button
                                type="submit"
                                className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                disabled={!newFolderName.trim()}
                            >
                                <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List with internal scrolling if many */}
            <div className={`space-y-0.5 ${isExpanded ? 'max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800' : ''}`}>
                {visibleFolders.map(folder => (
                    <div
                        key={folder.id}
                        className={`group flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${selectedFolderId === folder.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                            }`}
                        onClick={() => onSelectFolder(folder.id)}
                    >
                        {editingFolderId === folder.id ? (
                            <form onSubmit={handleRenameFolder} className="flex-1 relative flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                <input
                                    autoFocus
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') setEditingFolderId(null);
                                    }}
                                    className="w-full bg-white dark:bg-slate-800 border border-blue-500 rounded text-sm px-2 py-1 pr-14 focus:outline-none"
                                />
                                <div className="absolute right-1 flex items-center gap-0.5">
                                    <button
                                        type="submit"
                                        className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                        disabled={!editName.trim()}
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingFolderId(null)}
                                        className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 truncate">
                                    <Folder className="w-4 h-4 text-blue-400" fill={selectedFolderId === folder.id ? "currentColor" : "none"} />
                                    <span className="truncate text-[0.8rem]">{folder.name}</span>
                                </div>

                                <div className="opacity-40 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                                    <button
                                        onClick={(e) => startEditing(folder, e)}
                                        className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-blue-500 rounded transition-colors"
                                        title="Renombrar"
                                    >
                                        <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteFolder(folder.id, e)}
                                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 rounded transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {hasMore && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center gap-2 px-2 py-1 text-[0.75rem] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                    {isExpanded ? (
                        <>
                            <ChevronUp className="w-3 h-3" />
                            <span>{t('showLess') || 'Mostrar menos'}</span>
                        </>
                    ) : (
                        <>
                            <ChevronDown className="w-3 h-3" />
                            <span>{t('showMore') || 'Mostrar más'} ({sortedFolders.length - 3})</span>
                        </>
                    )}
                </button>
            )}

            <ConfirmModal
                isOpen={!!folderToDelete}
                onClose={() => setFolderToDelete(null)}
                onConfirm={confirmDeleteFolder}
                title={t('deleteProjectTitle')}
                message={t('deleteProjectConfirm')}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                isDestructive={true}
            />
        </div>
    );
};
