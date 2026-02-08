
import React, { useState } from 'react';
import { Folder, Plus, Edit2, Trash2, FolderOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Folder as FolderType, Recording } from '../../../types';
import { ConfirmModal } from './ConfirmModal';
import { FolderModal } from './FolderModal';
import { useToast } from '../../../components/Toast';
import { useLanguage } from '../../../contexts/LanguageContext';

interface FolderListProps {
    onSelectFolder: (folderId: string | null) => void;
    selectedFolderId: string | null;
    userId?: string;
    folders: FolderType[];
    recordings: Recording[];
    onCreateFolder?: (name: string) => Promise<void>;
    onRenameFolder?: (id: string, name: string) => Promise<void>;
    onDeleteFolder?: (id: string) => Promise<void>;
}

export const FolderList: React.FC<FolderListProps> = ({
    onSelectFolder,
    selectedFolderId,
    folders,
    recordings,
    onCreateFolder,
    onRenameFolder,
    onDeleteFolder
}) => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [isExpanded, setIsExpanded] = useState(false);

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [folderToEdit, setFolderToEdit] = useState<FolderType | null>(null);
    const [folderToDelete, setFolderToDelete] = useState<string | null>(null);

    // Sorting Logic
    const sortedFolders = [...(folders || [])]
        .filter(folder => {
            const reservedNames = ['Todas las Grabaciones', 'All Recordings', 'Favoritos', 'Favorites'];
            return !reservedNames.some(reserved =>
                folder.name.toLowerCase().trim() === reserved.toLowerCase()
            );
        })
        .map(folder => {
            const folderRecordings = (recordings || []).filter(r => r.folderId === folder.id);
            const latestRecordingDate = folderRecordings.length > 0
                ? Math.max(...folderRecordings.map(r => new Date(r.date).getTime()))
                : new Date(folder.createdAt).getTime();

            return { ...folder, lastActivity: latestRecordingDate };
        })
        .sort((a, b) => b.lastActivity - a.lastActivity);

    const visibleFolders = isExpanded ? sortedFolders : sortedFolders.slice(0, 3);
    const hasMore = sortedFolders.length > 3;

    // Handlers
    const handleCreateConfirm = async (name: string) => {
        if (!onCreateFolder) return;
        try {
            await onCreateFolder(name);
            showToast(t('folderCreated') || 'Proyecto creado', 'success');
        } catch (error) {
            showToast(t('errorCreatingFolder') || 'Error al crear proyecto', 'error');
            throw error;
        }
    };

    const handleRenameConfirm = async (name: string) => {
        if (!onRenameFolder || !folderToEdit) return;
        try {
            await onRenameFolder(folderToEdit.id, name);
            showToast(t('folderRenamed') || 'Proyecto renombrado', 'success');
        } catch (error) {
            showToast(t('errorRenamingFolder') || 'Error al renombrar proyecto', 'error');
            throw error;
        }
    };

    const handleConfirmDelete = async () => {
        if (folderToDelete && onDeleteFolder) {
            try {
                await onDeleteFolder(folderToDelete);
                if (selectedFolderId === folderToDelete) onSelectFolder(null);
                setFolderToDelete(null);
                showToast(t('folderDeleted') || 'Proyecto eliminado', 'success');
            } catch (error) {
                showToast(t('errorDeletingFolder') || 'Error al eliminar proyecto', 'error');
                console.error("Delete failed:", error);
            }
        }
    };

    return (
        <div className="space-y-2 mt-6">
            {/* "All Recordings" */}
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

            {/* Projects Header */}
            <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-[0.7rem] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {t('projects') || 'Proyectos'}
                </span>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-md transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Folder List */}
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
                        <div className="flex items-center gap-2 truncate">
                            <Folder className={`w-4 h-4 ${selectedFolderId === folder.id ? 'text-blue-500' : 'text-blue-400'}`} fill={selectedFolderId === folder.id ? "currentColor" : "none"} />
                            <span className="truncate text-[0.8rem]">{folder.name}</span>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity duration-200">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFolderToEdit(folder);
                                }}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-blue-500 rounded transition-colors"
                            >
                                <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFolderToDelete(folder.id);
                                }}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 rounded transition-colors"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
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

            {/* Modals */}
            <FolderModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onConfirm={handleCreateConfirm}
                title={t('createProject') || 'Crear Proyecto'}
                placeholder={t('newProjectPlaceholder')}
            />

            <FolderModal
                isOpen={!!folderToEdit}
                onClose={() => setFolderToEdit(null)}
                onConfirm={handleRenameConfirm}
                initialName={folderToEdit?.name}
                title={t('renameProject') || 'Renombrar Proyecto'}
            />

            <ConfirmModal
                isOpen={!!folderToDelete}
                onClose={() => setFolderToDelete(null)}
                onConfirm={handleConfirmDelete}
                title={t('deleteProjectTitle')}
                message={t('deleteProjectConfirm')}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                isDestructive={true}
            />
        </div>
    );
};
