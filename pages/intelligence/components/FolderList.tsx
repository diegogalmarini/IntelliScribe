
import React, { useState, useEffect } from 'react';
import { Folder, Plus, MoreVertical, Edit2, Trash2, FolderOpen } from 'lucide-react';
import { Folder as FolderType } from '../../../types';
import { ConfirmModal } from './ConfirmModal';

interface FolderListProps {
    onSelectFolder: (folderId: string | null) => void;
    selectedFolderId: string | null;
    userId?: string;
    folders: FolderType[];
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
    onCreateFolder,
    onRenameFolder,
    onDeleteFolder
}) => {
    const { t } = useLanguage();
    // Removed internal folders state - now using prop
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    // Removed loading state - driven by parent
    const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    // Removed useEffect loadFolders - parent handles data fetching

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim() || !onCreateFolder) return;

        try {
            await onCreateFolder(newFolderName);
            setNewFolderName('');
            setIsCreating(false);
        } catch (error) {
            console.error("Create folder failed:", error);
            alert("Error creating folder");
        }
    };

    const startEditing = (folder: FolderType, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingFolderId(folder.id);
        setEditName(folder.name);
    };

    const handleRenameFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editName.trim() || !editingFolderId || !onRenameFolder) return;

        try {
            await onRenameFolder(editingFolderId, editName.trim());
            setEditingFolderId(null);
            setEditName('');
        } catch (error) {
            console.error("Rename folder failed:", error);
            alert("Error renaming folder");
        }
    };

    const confirmDeleteFolder = async () => {
        if (folderToDelete && onDeleteFolder) {
            try {
                await onDeleteFolder(folderToDelete);
                // Selection logic handled by parent or effect
                if (selectedFolderId === folderToDelete) onSelectFolder(null); // Local optim
                setFolderToDelete(null);
            } catch (error) {
                console.error("Delete folder failed:", error);
                alert("Error deleting folder");
            }
        }
    };

    const handleDeleteFolder = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setFolderToDelete(id);
    };

    return (
        <div className="space-y-2 mt-6">
            <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('projects')}</h3>
                <button
                    onClick={() => setIsCreating(true)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-md transition-colors"
                >
                    <Plus className="w-3.5 h-3.5 text-slate-400" />
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreateFolder} className="px-2 mb-2">
                    <input
                        autoFocus
                        type="text"
                        placeholder={t('newProjectPlaceholder')}
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onBlur={() => !newFolderName && setIsCreating(false)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                </form>
            )}

            <div className="space-y-0.5">
                <button
                    onClick={() => onSelectFolder(null)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[0.8rem] transition-colors ${selectedFolderId === null
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                        }`}
                >
                    <FolderOpen className="w-4 h-4" />
                    <span className="truncate">{t('allFiles')}</span>
                </button>

                {(folders || []).map(folder => (
                    <div
                        key={folder.id}
                        className={`group flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${selectedFolderId === folder.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                            }`}
                        onClick={() => onSelectFolder(folder.id)}
                    >
                        {editingFolderId === folder.id ? (
                            <form onSubmit={handleRenameFolder} className="flex-1 mr-2" onClick={e => e.stopPropagation()}>
                                <input
                                    autoFocus
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onBlur={() => {
                                        // Delay to allow form submit to fire if Enter was pressed
                                        setTimeout(() => {
                                            if (editingFolderId === folder.id) {
                                                setEditingFolderId(null);
                                            }
                                        }, 200);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleRenameFolder(e);
                                        }
                                        if (e.key === 'Escape') {
                                            e.preventDefault();
                                            setEditingFolderId(null);
                                        }
                                    }}
                                    className="w-full bg-white dark:bg-slate-800 border border-blue-500 rounded text-sm px-1.5 py-0.5 focus:outline-none"
                                />
                            </form>
                        ) : (
                            <div className="flex items-center gap-2 truncate">
                                <Folder className="w-4 h-4 text-blue-400" fill={selectedFolderId === folder.id ? "currentColor" : "none"} />
                                <span className="truncate text-[0.8rem]">{folder.name}</span>
                            </div>
                        )}

                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
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
                    </div>
                ))}
            </div>

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
