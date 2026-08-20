import React, { useState, useRef, useEffect, useMemo, useCallback, useSyncExternalStore } from 'react';
import { ChevronRight, Plus, MoreHorizontal, FileText, Edit3, FolderInput, Trash2 } from 'lucide-react';
import { Recording, Folder as FolderType } from '../../../types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../components/Toast';
import { ConfirmModal } from './ConfirmModal';
import { FolderModal } from './FolderModal';

const EXPANDED_STORAGE_KEY = 'diktalo_sidebar_expanded';

interface SidebarTreeProps {
    /** TODAS las grabaciones, sin filtrar por carpeta: el árbol es quien agrupa. */
    recordings: Recording[];
    folders: FolderType[];
    /** 'ALL' o el id de un proyecto real. Nunca null. */
    selectedFolderId: string;
    selectedRecordingId: string | null;
    onSelectFolder: (folderId: string) => void;
    onSelectRecording: (id: string) => void;
    onAddFolder?: (name: string) => Promise<void>;
    onRenameFolder?: (id: string, name: string) => Promise<void>;
    onDeleteFolder?: (id: string) => Promise<void>;
    onRenameRecording?: (id: string, newTitle: string) => void;
    onDeleteRecording?: (id: string) => void;
    onMoveRecording?: (id: string, folderId: string) => void;
}

const readExpanded = (): Set<string> => {
    try {
        const raw = localStorage.getItem(EXPANDED_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return new Set(Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []);
    } catch {
        return new Set();
    }
};

/**
 * El dashboard monta MinimalSidebar dos veces a la vez (móvil y escritorio) y
 * ninguna se desmonta. Con el estado dentro del componente, cada instancia tenía
 * su propio conjunto y ambas escribían la misma clave: la invisible pisaba a la
 * visible y al recargar aparecían proyectos que nadie había cerrado.
 */
let expandedStore: Set<string> = readExpanded();
const expandedListeners = new Set<() => void>();

const writeExpanded = (next: Set<string>) => {
    expandedStore = next;
    try {
        localStorage.setItem(EXPANDED_STORAGE_KEY, JSON.stringify([...next]));
    } catch {
        // Modo privado o cuota llena: el árbol sigue funcionando sin recordar.
    }
    expandedListeners.forEach(notify => notify());
};

const useExpandedFolders = () => {
    const subscribe = useCallback((cb: () => void) => {
        expandedListeners.add(cb);
        return () => { expandedListeners.delete(cb); };
    }, []);
    const expanded = useSyncExternalStore(subscribe, () => expandedStore, () => expandedStore);

    const toggle = useCallback((id: string) => {
        const next = new Set(expandedStore);
        if (next.has(id)) next.delete(id); else next.add(id);
        writeExpanded(next);
    }, []);

    const expand = useCallback((id: string) => {
        if (expandedStore.has(id)) return;
        writeExpanded(new Set(expandedStore).add(id));
    }, []);

    return { expanded, toggle, expand };
};

/** Un solo timestamp inválido contaminaba el Math.max y dejaba el orden en NaN. */
const timeOf = (value?: string): number => {
    if (!value) return 0;
    const t = new Date(value).getTime();
    return Number.isNaN(t) ? 0 : t;
};

export const SidebarTree: React.FC<SidebarTreeProps> = ({
    recordings,
    folders,
    selectedFolderId,
    selectedRecordingId,
    onSelectFolder,
    onSelectRecording,
    onAddFolder,
    onRenameFolder,
    onDeleteFolder,
    onRenameRecording,
    onDeleteRecording,
    onMoveRecording
}) => {
    const { t } = useLanguage();
    const { showToast } = useToast();

    const { expanded: expandedIds, toggle: toggleExpanded, expand: expandFolder } = useExpandedFolders();

    // Proyectos
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [folderToEdit, setFolderToEdit] = useState<FolderType | null>(null);
    const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
    const [folderMenuId, setFolderMenuId] = useState<string | null>(null);

    // Grabaciones
    const [menuId, setMenuId] = useState<string | null>(null);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [pendingRename, setPendingRename] = useState<{ id: string; value: string } | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [moveModalId, setMoveModalId] = useState<string | null>(null);
    const renameInputRef = useRef<HTMLInputElement>(null);

    // `folders` trae dos pseudo-carpetas sintéticas que App.tsx inyecta y que no
    // existen en la base de datos. Filtrar por `type` y no por nombre traducido:
    // un proyecto real llamado "Favoritos" desaparecía del sidebar.
    // Se descartan las de sistema en vez de exigir type === 'user': si una fila
    // llegara con el type vacio o inesperado, exigir 'user' la borraria del arbol
    // y arrastraria sus grabaciones a "Sin proyecto".
    const projects = useMemo(
        () => (folders || []).filter(f => f.type !== 'system'),
        [folders]
    );

    const byFolder = useMemo(() => {
        const map = new Map<string, Recording[]>();
        const loose: Recording[] = [];
        for (const rec of recordings || []) {
            const fid = rec.folderId;
            if (!fid) { loose.push(rec); continue; }
            const bucket = map.get(fid);
            if (bucket) bucket.push(rec); else map.set(fid, [rec]);
        }
        // Una grabación cuyo proyecto ya no existe quedaría invisible en el árbol.
        const known = new Set(projects.map(p => p.id));
        for (const [fid, recs] of map) {
            if (!known.has(fid)) { loose.push(...recs); map.delete(fid); }
        }
        const byDate = (a: Recording, b: Recording) => timeOf(b.date) - timeOf(a.date);
        for (const recs of map.values()) recs.sort(byDate);
        loose.sort(byDate);
        return { map, loose };
    }, [recordings, projects]);

    const sortedProjects = useMemo(() => {
        return [...projects]
            .map(p => {
                const recs = byFolder.map.get(p.id) || [];
                const last = recs.length ? Math.max(...recs.map(r => timeOf(r.date))) : timeOf(p.createdAt);
                return { folder: p, recordings: recs, lastActivity: last };
            })
            .sort((a, b) => b.lastActivity - a.lastActivity);
    }, [projects, byFolder]);

    const folderOfSelected = useMemo(
        () => (recordings || []).find(r => r.id === selectedRecordingId)?.folderId || null,
        [recordings, selectedRecordingId]
    );

    // Abrir el proyecto que contiene la grabación abierta, o el árbol miente: la
    // fila seleccionada quedaría escondida dentro de un nodo cerrado.
    //
    // La dependencia es el id de la carpeta y no el array `recordings`: con el
    // array, cualquier setRecordings (renombrar, editar un segmento, un UPDATE de
    // Realtime) reejecutaba el efecto y volvia a abrir el proyecto que el usuario
    // acababa de cerrar a mano.
    useEffect(() => {
        if (folderOfSelected) expandFolder(folderOfSelected);
    }, [folderOfSelected, expandFolder]);

    useEffect(() => {
        if (renamingId && renameInputRef.current) {
            renameInputRef.current.focus();
            renameInputRef.current.select();
        }
    }, [renamingId]);

    useEffect(() => {
        if (!pendingRename) return;
        const rec = recordings.find(r => r.id === pendingRename.id);
        if (rec && rec.title === pendingRename.value) setPendingRename(null);
    }, [recordings, pendingRename]);

    const handleProjectClick = (id: string) => {
        onSelectFolder(id);
        expandFolder(id);
    };

    // Mover a un proyecto cerrado hacia desaparecer la grabacion de la vista sin
    // decir a donde ha ido.
    const handleMove = (recordingId: string, folderId: string) => {
        onMoveRecording?.(recordingId, folderId);
        if (folderId) expandFolder(folderId);
        setMoveModalId(null);
    };

    const startRename = (id: string) => {
        const rec = recordings.find(r => r.id === id);
        if (rec) {
            setRenameValue(rec.title || '');
            setRenamingId(id);
        }
        setMenuId(null);
    };

    const saveRename = () => {
        if (renamingId && renameValue.trim() && onRenameRecording) {
            onRenameRecording(renamingId, renameValue.trim());
            setPendingRename({ id: renamingId, value: renameValue.trim() });
        }
        setRenamingId(null);
        setRenameValue('');
    };

    const cancelRename = () => {
        setRenamingId(null);
        setRenameValue('');
    };

    const confirmDeleteRecording = () => {
        if (deleteConfirmId && onDeleteRecording) onDeleteRecording(deleteConfirmId);
        setDeleteConfirmId(null);
    };

    const handleCreateFolder = async (name: string) => {
        if (!onAddFolder) return;
        try {
            await onAddFolder(name);
            showToast(t('folderCreated'), 'success');
        } catch (error) {
            showToast(t('errorCreatingFolder'), 'error');
            throw error;
        }
    };

    const handleRenameFolderConfirm = async (name: string) => {
        if (!onRenameFolder || !folderToEdit) return;
        try {
            await onRenameFolder(folderToEdit.id, name);
            showToast(t('folderRenamed'), 'success');
        } catch (error) {
            showToast(t('errorRenamingFolder'), 'error');
            throw error;
        }
    };

    const handleDeleteFolderConfirm = async () => {
        if (!folderToDelete || !onDeleteFolder) return;
        try {
            await onDeleteFolder(folderToDelete);
            setFolderToDelete(null);
            showToast(t('folderDeleted'), 'success');
        } catch (error) {
            showToast(t('errorDeletingFolder'), 'error');
        }
    };

    const menuItem = 'w-full text-left px-3 py-2 text-[13px] hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2.5 transition-colors';
    const sectionLabel = 'px-2 text-[11px] font-medium text-[#8e8e8e] dark:text-[#8e8e8e]';

    const renderRecordingRow = (rec: Recording) => {
        const isSelected = selectedRecordingId === rec.id;
        const title = pendingRename?.id === rec.id ? pendingRename.value : (rec.title || t('untitledRecording'));

        return (
            <div key={rec.id} className="relative">
                <div
                    className={`group flex items-center gap-1 rounded-lg pl-2 pr-1 transition-colors ${isSelected
                        ? 'bg-black/[0.05] dark:bg-white/[0.07] text-[#0d0d0d] dark:text-white'
                        : 'text-[#676767] dark:text-[#c5c5c5] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                        }`}
                >
                    {renamingId === rec.id ? (
                        <input
                            ref={renameInputRef}
                            type="text"
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') saveRename();
                                if (e.key === 'Escape') cancelRename();
                            }}
                            onBlur={saveRename}
                            className="flex-1 min-w-0 my-1 px-2 py-1 bg-white dark:bg-[#1a1a1a] border border-primary rounded text-[13px] text-[#0d0d0d] dark:text-white focus:outline-none"
                        />
                    ) : (
                        <button
                            onClick={() => onSelectRecording(rec.id)}
                            className="flex-1 min-w-0 text-left py-1.5 text-[13px] truncate"
                            title={title}
                        >
                            {title}
                        </button>
                    )}
                    <button
                        onClick={e => { e.stopPropagation(); setMenuId(menuId === rec.id ? null : rec.id); }}
                        className={`shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-opacity ${menuId === rec.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'
                            }`}
                        aria-label={t('options')}
                    >
                        <MoreHorizontal size={15} strokeWidth={1.5} />
                    </button>
                </div>

                {menuId === rec.id && (
                    <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setMenuId(null)} />
                        <div className="absolute right-1 top-8 w-52 bg-white dark:bg-[#2a2a2a] rounded-xl shadow-2xl border border-black/5 dark:border-white/10 py-1.5 z-[200]">
                            <button
                                onClick={e => { e.stopPropagation(); onSelectRecording(rec.id); setMenuId(null); }}
                                className={`${menuItem} text-[#0d0d0d] dark:text-[#ececec]`}
                            >
                                <FileText size={15} strokeWidth={1.5} />
                                <span>{t('viewContext')}</span>
                            </button>
                            <button
                                onClick={e => { e.stopPropagation(); startRename(rec.id); }}
                                className={`${menuItem} text-[#0d0d0d] dark:text-[#ececec]`}
                            >
                                <Edit3 size={15} strokeWidth={1.5} />
                                <span>{t('rename')}</span>
                            </button>
                            <button
                                onClick={e => { e.stopPropagation(); setMoveModalId(rec.id); setMenuId(null); }}
                                className={`${menuItem} text-[#0d0d0d] dark:text-[#ececec]`}
                            >
                                <FolderInput size={15} strokeWidth={1.5} />
                                <span>{t('move_to_folder_title')}</span>
                            </button>
                            <div className="my-1 border-t border-black/5 dark:border-white/10" />
                            <button
                                onClick={e => { e.stopPropagation(); setDeleteConfirmId(rec.id); setMenuId(null); }}
                                className={`${menuItem} text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20`}
                            >
                                <Trash2 size={15} strokeWidth={1.5} />
                                <span>{t('delete')}</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    };

    const hasAnything = recordings.length > 0 || sortedProjects.length > 0;

    return (
        <div className="flex-1 overflow-y-auto px-2 pb-4">
            {/* Sin esta fila no habia forma de volver a 'ALL' una vez pulsado un
                proyecto: el proyecto activo se quedaba pegado y toda grabacion
                nueva caia dentro de el en silencio, porque selectedFolderId es
                tambien la carpeta destino de lo que se graba o se sube. */}
            <button
                onClick={() => onSelectFolder('ALL')}
                className={`w-full text-left rounded-lg px-2 py-1.5 mt-1 text-[13px] truncate transition-colors ${selectedFolderId === 'ALL'
                    ? 'bg-black/[0.05] dark:bg-white/[0.07] text-[#0d0d0d] dark:text-white font-medium'
                    : 'text-[#676767] dark:text-[#c5c5c5] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                    }`}
            >
                {t('allRecordings')}
            </button>

            {/* Proyectos */}
            <div className="flex items-center justify-between py-1.5">
                <span className={sectionLabel}>{t('projects')}</span>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="p-1 mr-1 text-[#8e8e8e] hover:text-[#0d0d0d] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors"
                    aria-label={t('createProject')}
                >
                    <Plus size={14} strokeWidth={1.5} />
                </button>
            </div>

            <div className="space-y-0.5">
                {sortedProjects.map(({ folder, recordings: recs }) => {
                    const isExpanded = expandedIds.has(folder.id);
                    const isActive = selectedFolderId === folder.id;

                    return (
                        <div key={folder.id} className="relative">
                            <div
                                className={`group flex items-center rounded-lg pr-1 transition-colors ${isActive
                                    ? 'bg-black/[0.05] dark:bg-white/[0.07] text-[#0d0d0d] dark:text-white'
                                    : 'text-[#676767] dark:text-[#c5c5c5] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                                    }`}
                            >
                                <button
                                    onClick={e => { e.stopPropagation(); toggleExpanded(folder.id); }}
                                    className="shrink-0 p-1 ml-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                    aria-label={`${isExpanded ? t('collapse') : t('expand')}: ${folder.name}`}
                                    aria-expanded={isExpanded}
                                >
                                    <ChevronRight
                                        size={14}
                                        strokeWidth={1.75}
                                        className={`transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}
                                    />
                                </button>
                                <button
                                    onClick={() => handleProjectClick(folder.id)}
                                    className={`flex-1 min-w-0 text-left py-1.5 pr-1 text-[13px] truncate ${isActive ? 'font-medium' : ''}`}
                                    title={folder.name}
                                >
                                    {folder.name}
                                </button>
                                {!isExpanded && recs.length > 0 && (
                                    <span className="shrink-0 px-1 text-[11px] text-[#8e8e8e] group-hover:opacity-0 transition-opacity">
                                        {recs.length}
                                    </span>
                                )}
                                <button
                                    onClick={e => { e.stopPropagation(); setFolderMenuId(folderMenuId === folder.id ? null : folder.id); }}
                                    className={`shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-opacity ${folderMenuId === folder.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'
                                        }`}
                                    aria-label={t('options')}
                                >
                                    <MoreHorizontal size={15} strokeWidth={1.5} />
                                </button>
                            </div>

                            {folderMenuId === folder.id && (
                                <>
                                    <div className="fixed inset-0 z-[100]" onClick={() => setFolderMenuId(null)} />
                                    <div className="absolute right-1 top-8 w-52 bg-white dark:bg-[#2a2a2a] rounded-xl shadow-2xl border border-black/5 dark:border-white/10 py-1.5 z-[200]">
                                        <button
                                            onClick={e => { e.stopPropagation(); setFolderToEdit(folder); setFolderMenuId(null); }}
                                            className={`${menuItem} text-[#0d0d0d] dark:text-[#ececec]`}
                                        >
                                            <Edit3 size={15} strokeWidth={1.5} />
                                            <span>{t('rename')}</span>
                                        </button>
                                        <div className="my-1 border-t border-black/5 dark:border-white/10" />
                                        <button
                                            onClick={e => { e.stopPropagation(); setFolderToDelete(folder.id); setFolderMenuId(null); }}
                                            className={`${menuItem} text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20`}
                                        >
                                            <Trash2 size={15} strokeWidth={1.5} />
                                            <span>{t('delete')}</span>
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* La regla vertical es lo que hace legible la pertenencia. */}
                            {isExpanded && (
                                <div className="ml-[15px] pl-[18px] border-l border-black/[0.10] dark:border-white/[0.12] space-y-0.5 mt-0.5">
                                    {recs.length === 0 ? (
                                        <p className="px-2 py-1.5 text-[12px] text-[#8e8e8e]">{t('no_recordings_short')}</p>
                                    ) : (
                                        recs.map(renderRecordingRow)
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Grabaciones sin proyecto */}
            {byFolder.loose.length > 0 && (
                <>
                    <div className={`${sectionLabel} pt-4 pb-1.5`}>{t('sidebar_no_project')}</div>
                    <div className="space-y-0.5">
                        {byFolder.loose.map(renderRecordingRow)}
                    </div>
                </>
            )}

            {!hasAnything && (
                <p className="text-[12px] text-[#8e8e8e] text-center py-8 px-3">{t('no_recordings_short')}</p>
            )}

            {/* Modales */}
            <FolderModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onConfirm={handleCreateFolder}
                title={t('createProject')}
                placeholder={t('newProjectPlaceholder')}
            />

            <FolderModal
                isOpen={!!folderToEdit}
                onClose={() => setFolderToEdit(null)}
                onConfirm={handleRenameFolderConfirm}
                initialName={folderToEdit?.name}
                title={t('renameProject')}
            />

            <ConfirmModal
                isOpen={!!folderToDelete}
                onClose={() => setFolderToDelete(null)}
                onConfirm={handleDeleteFolderConfirm}
                title={t('deleteProjectTitle')}
                message={t('deleteProjectConfirm')}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                isDestructive
            />

            <ConfirmModal
                isOpen={!!deleteConfirmId}
                onClose={() => setDeleteConfirmId(null)}
                onConfirm={confirmDeleteRecording}
                title={t('delete_recording_confirm_title')}
                message={t('delete_recording_confirm_desc')}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                isDestructive
            />

            {moveModalId && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-[300]" onClick={() => setMoveModalId(null)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-card-dark rounded-2xl shadow-2xl z-[400] p-6">
                        <h3 className="text-lg font-semibold text-[#0d0d0d] dark:text-white mb-4">{t('move_to_folder_title')}</h3>
                        <div className="space-y-1.5 mb-6 max-h-60 overflow-y-auto">
                            <button
                                onClick={() => handleMove(moveModalId, '')}
                                className="w-full text-left px-4 py-2.5 bg-[#f7f7f8] dark:bg-[#333] text-[#0d0d0d] dark:text-white rounded-lg text-[13px] hover:bg-[#ebebeb] dark:hover:bg-[#444] transition-colors font-medium"
                            >
                                {t('no_folder_root_label')}
                            </button>
                            {projects.length === 0 ? (
                                <p className="text-[13px] text-[#676767] dark:text-[#c5c5c5] text-center pt-2">{t('no_folders_created_label')}</p>
                            ) : (
                                projects.map(folder => (
                                    <button
                                        key={folder.id}
                                        onClick={() => handleMove(moveModalId, folder.id)}
                                        className="w-full text-left px-4 py-2.5 bg-[#f7f7f8] dark:bg-[#333] text-[#0d0d0d] dark:text-white rounded-lg text-[13px] hover:bg-[#ebebeb] dark:hover:bg-[#444] transition-colors"
                                    >
                                        {folder.name}
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
