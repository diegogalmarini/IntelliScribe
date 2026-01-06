
import React, { useState, useEffect } from 'react';
import { Folder, Plus, MoreVertical, Edit2, Trash2, FolderOpen } from 'lucide-react';
import { databaseService } from '../../../services/databaseService';
import { Folder as FolderType } from '../../../types';
import { ConfirmModal } from './ConfirmModal';

interface FolderListProps {
    onSelectFolder: (folderId: string | null) => void;
    selectedFolderId: string | null;
    userId?: string;
}

export const FolderList: React.FC<FolderListProps> = ({ onSelectFolder, selectedFolderId, userId }) => {
    const [folders, setFolders] = useState<FolderType[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [loading, setLoading] = useState(true);
    const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        if (userId) {
            loadFolders();
        } else {
            setLoading(false);
        }
    }, [userId]);

    const loadFolders = async () => {
        if (!userId) return;
        const data = await databaseService.getFolders(userId);
        setFolders(data);
        setLoading(false);
    };

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        const newFolder = await databaseService.createFolder(newFolderName);
        if (newFolder) {
            setFolders([newFolder, ...folders]);
            setNewFolderName('');
            setIsCreating(false);
        }
    };

    const startEditing = (folder: FolderType, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingFolderId(folder.id);
        setEditName(folder.name);
    };

    const handleRenameFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editName.trim() || !editingFolderId) return;

        const originalFolders = [...folders];
        const folderIdToRename = editingFolderId;
        const newName = editName.trim();

        // 1. Optimistic Update
        setFolders(folders.map(f => f.id === folderIdToRename ? { ...f, name: newName } : f));
        setEditingFolderId(null);
        setEditName('');

        // 2. Background DB Update
        try {
            const { success, error } = await databaseService.renameFolder(folderIdToRename, newName);
            if (!success) {
                // Log and Alert detailed error
                console.error('Rename failed DB response:', error);
                const errorMsg = error?.message || JSON.stringify(error) || 'Unknown DB Error';
                alert(`Error al renombrar: ${errorMsg}`);
                setFolders(originalFolders); // Revert on failure
            }
        } catch (error: any) {
            console.error('Rename failed exception:', error);
            alert(`Error inesperado: ${error.message || error}`);
            setFolders(originalFolders); // Revert on failure
        }
    };

    const confirmDeleteFolder = async () => {
        if (folderToDelete) {
            const success = await databaseService.deleteFolder(folderToDelete);
            if (success) {
                setFolders(folders.filter(f => f.id !== folderToDelete));
                if (selectedFolderId === folderToDelete) onSelectFolder(null);
            }
            setFolderToDelete(null);
        }
    };

    const handleDeleteFolder = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setFolderToDelete(id);
    };

    return (
        <div className="space-y-2 mt-6">
            <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Carpetas</h3>
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
                        placeholder="Nueva carpeta..."
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
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${selectedFolderId === null
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                        }`}
                >
                    <FolderOpen className="w-4 h-4" />
                    <span className="truncate">Todos los archivos</span>
                </button>

                {folders.map(folder => (
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
                                <span className="truncate text-sm">{folder.name}</span>
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
                title="Eliminar Carpeta"
                message="¿Estás seguro de eliminar esta carpeta? Los audios no se borrarán, solo se desvincularán."
                confirmText="Eliminar"
                cancelText="Cancelar"
                isDestructive={true}
            />
        </div>
    );
};
