
import React, { useState, useEffect } from 'react';
import { Folder, Plus, MoreVertical, Edit2, Trash2, FolderOpen } from 'lucide-react';
import { folderService } from '../../../services/folderService';
import { Folder as FolderType } from '../../../types';

interface FolderListProps {
    onSelectFolder: (folderId: string | null) => void;
    selectedFolderId: string | null;
}

export const FolderList: React.FC<FolderListProps> = ({ onSelectFolder, selectedFolderId }) => {
    const [folders, setFolders] = useState<FolderType[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFolders();
    }, []);

    const loadFolders = async () => {
        const data = await folderService.getFolders();
        setFolders(data);
        setLoading(false);
    };

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        const newFolder = await folderService.createFolder(newFolderName);
        if (newFolder) {
            setFolders([newFolder, ...folders]);
            setNewFolderName('');
            setIsCreating(false);
        }
    };

    const handleDeleteFolder = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('¿Estás seguro de eliminar esta carpeta? Los audios no se borrarán, solo se desvincularán.')) {
            const success = await folderService.deleteFolder(id);
            if (success) {
                setFolders(folders.filter(f => f.id !== id));
                if (selectedFolderId === id) onSelectFolder(null);
            }
        }
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
                        <div className="flex items-center gap-2 truncate">
                            <Folder className="w-4 h-4 text-blue-400" fill={selectedFolderId === folder.id ? "currentColor" : "none"} />
                            <span className="truncate">{folder.name}</span>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 flex items-center">
                            <button
                                onClick={(e) => handleDeleteFolder(folder.id, e)}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 rounded transition-colors"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
