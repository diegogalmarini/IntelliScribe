import React, { useState } from 'react';
import { Recording, UserProfile, Folder } from '../../../types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Search, ChevronDown, Menu, Plus, Mic, Upload, MessageCircle, Youtube } from 'lucide-react';
import { SidebarTree } from './SidebarTree';

interface MinimalSidebarProps {
    /** Sin filtrar por carpeta: el árbol es quien agrupa por proyecto. */
    recordings: Recording[];
    selectedId: string | null;
    onSelectRecording: (id: string) => void;
    user: UserProfile;
    onRenameRecording?: (id: string, newTitle: string) => void;
    onDeleteRecording?: (id: string) => void;
    onMoveRecording?: (id: string, folderId: string) => void;

    folders?: Folder[];
    selectedFolderId?: string;
    onSelectFolder?: (folderId: string) => void;
    onAddFolder?: (name: string) => Promise<void>;
    onRenameFolder?: (id: string, name: string) => Promise<void>;
    onDeleteFolder?: (id: string) => Promise<void>;

    onToggle: () => void;
    onOpenSearch?: () => void;
    /** Crear algo nuevo desde cualquier punto, no solo desde el estado vacio. */
    onNewAction?: (type: 'record' | 'upload' | 'multiaudio' | 'youtube') => void;
}

export const MinimalSidebar: React.FC<MinimalSidebarProps> = ({
    recordings,
    selectedId,
    onSelectRecording,
    user,
    onRenameRecording,
    onDeleteRecording,
    onMoveRecording,
    folders = [],
    selectedFolderId = 'ALL',
    onSelectFolder,
    onAddFolder,
    onRenameFolder,
    onDeleteFolder,
    onToggle,
    onOpenSearch,
    onNewAction
}) => {
    const { t } = useLanguage();
    const [statsCollapsed, setStatsCollapsed] = useState(false);
    const [menuNuevoAbierto, setMenuNuevoAbierto] = useState(false);

    // Grabar, subir, multi-audio y YouTube solo existian en el estado vacio, que
    // desaparece en cuanto hay una grabacion seleccionada. Con veinte audios en
    // la lista no habia forma de crear nada sin volver atras.
    const accionesNuevo = [
        { tipo: 'record' as const, icono: Mic, etiqueta: t('recordAudio') },
        { tipo: 'upload' as const, icono: Upload, etiqueta: t('uploadFile') },
        { tipo: 'multiaudio' as const, icono: MessageCircle, etiqueta: t('multi_audio_label') },
        { tipo: 'youtube' as const, icono: Youtube, etiqueta: t('youtube_label') }
    ];

    const iconButton = 'p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors';

    return (
        <div className="flex flex-col h-full bg-surface-light dark:bg-surface-dark border-r border-black/[0.05] dark:border-white/[0.05] pt-0">
            <div className="flex items-center justify-between px-4 py-3">
                <button onClick={onToggle} className={iconButton} aria-label={t('menu')}>
                    <Menu size={20} strokeWidth={1.5} />
                </button>
                <div className="flex items-center gap-1">
                    {onNewAction && (
                        <div className="relative">
                            <button
                                onClick={() => setMenuNuevoAbierto(v => !v)}
                                className={iconButton}
                                aria-label={t('new_session_btn')}
                                aria-expanded={menuNuevoAbierto}
                            >
                                <Plus size={20} strokeWidth={1.5} />
                            </button>
                            {menuNuevoAbierto && (
                                <>
                                    <div className="fixed inset-0 z-[100]" onClick={() => setMenuNuevoAbierto(false)} />
                                    <div className="absolute right-0 top-11 w-52 bg-white dark:bg-[#2a2a2a] rounded-xl shadow-2xl border border-black/5 dark:border-white/10 py-1.5 z-[200]">
                                        {accionesNuevo.map(a => (
                                            <button
                                                key={a.tipo}
                                                onClick={() => { setMenuNuevoAbierto(false); onNewAction(a.tipo); }}
                                                className="w-full text-left px-3 py-2 text-[13px] text-[#0d0d0d] dark:text-[#ececec] hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2.5 transition-colors"
                                            >
                                                <a.icono size={15} strokeWidth={1.5} />
                                                <span>{a.etiqueta}</span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    <button onClick={onOpenSearch} className={iconButton} aria-label={t('search')}>
                        <Search size={20} strokeWidth={1.5} />
                    </button>
                </div>
            </div>

            {/* Uso del plan - plegable */}
            <div className="border-b border-black/[0.05] dark:border-white/[0.05]">
                <button
                    onClick={() => setStatsCollapsed(v => !v)}
                    className="w-full flex items-center justify-end px-4 py-1.5 text-slate-300 dark:text-slate-600 hover:text-slate-400 dark:hover:text-slate-400 transition-colors"
                >
                    <ChevronDown
                        size={13}
                        strokeWidth={1.5}
                        className={`transition-transform duration-200 ${statsCollapsed ? '-rotate-90' : ''}`}
                    />
                </button>

                <div className={`overflow-hidden transition-all duration-200 ${statsCollapsed ? 'max-h-0' : 'max-h-96'}`}>
                    <div className="px-5 pb-3 text-[12px] text-[#676767] dark:text-[#c5c5c5]">
                        {user.subscription.minutesLimit === -1 ? (
                            <span className="font-normal">{t('unlimited_label')}</span>
                        ) : (
                            <div className="space-y-4">
                                {/* Minutos */}
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

                                {/* Almacenamiento */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[11px]">
                                        <span className="font-medium">
                                            {(user.subscription.storageUsed || 0) / 1024 / 1024 < 1024
                                                ? `${((user.subscription.storageUsed || 0) / 1024 / 1024).toFixed(1)} MB`
                                                : `${((user.subscription.storageUsed || 0) / 1024 / 1024 / 1024).toFixed(1)} GB`}
                                            / {user.subscription.storageLimit === -1 ? '∞' : ((user.subscription.storageLimit || 0) / 1024 / 1024 / 1024).toFixed(1)} GB
                                        </span>
                                        <span className="font-medium">
                                            {(user.subscription.storageLimit || 0) > 0 ? Math.min(100, Math.round(((user.subscription.storageUsed || 0) / user.subscription.storageLimit!) * 100)) : 0}%
                                        </span>
                                    </div>
                                    <div className="h-1 bg-slate-100 dark:bg-card-dark rounded-full overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-500 bg-[#0055FF]"
                                            style={{
                                                width: `${(user.subscription.storageLimit || 0) > 0
                                                    ? Math.min(100, ((user.subscription.storageUsed || 0) / user.subscription.storageLimit!) * 100)
                                                    : 0}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Días del ciclo */}
                                {(() => {
                                    const startDateStr = user.createdAt;
                                    const endDateStr = user.subscription.trialEndsAt || user.subscription.currentPeriodEnd;

                                    if (!startDateStr || !endDateStr) return null;

                                    const startDate = new Date(startDateStr);
                                    const endDate = new Date(endDateStr);
                                    const now = new Date();

                                    const totalMs = endDate.getTime() - startDate.getTime();
                                    const totalDays = Math.max(1, Math.ceil(totalMs / (1000 * 60 * 60 * 24)));

                                    const elapsedMs = now.getTime() - startDate.getTime();
                                    const usedDays = Math.max(0, Math.min(totalDays, Math.ceil(elapsedMs / (1000 * 60 * 60 * 24))));

                                    const percentage = Math.min(100, Math.round((usedDays / totalDays) * 100));

                                    return (
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center text-[11px]">
                                                <span className="font-medium">{usedDays} / {totalDays} {t('days_short')}</span>
                                                <span className="font-medium">{percentage}%</span>
                                            </div>
                                            <div className="h-1 bg-slate-100 dark:bg-card-dark rounded-full overflow-hidden">
                                                <div
                                                    className="h-full transition-all duration-500 bg-[#0055FF]"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Minutos de llamada - solo Business Plus */}
                                {user.subscription.planId === 'business_plus' && (
                                    <div className="space-y-1.5 pt-1 border-t border-black/[0.03] dark:border-white/[0.03]">
                                        {((user.subscription.callLimit || 0) > 0) && (
                                            <>
                                                <div className="flex justify-between items-center text-[11px]">
                                                    <span className="font-medium">{(user.subscription.callMinutesUsed || 0)} / {user.subscription.callLimit || 0} {t('calls_short')}</span>
                                                    <span className="font-medium">{(user.subscription.callLimit || 0) > 0 ? Math.min(100, Math.round(((user.subscription.callMinutesUsed || 0) / user.subscription.callLimit!) * 100)) : 0}%</span>
                                                </div>
                                                <div className="h-1 bg-slate-100 dark:bg-card-dark rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full transition-all duration-500 bg-green-500"
                                                        style={{ width: `${(user.subscription.callLimit || 0) > 0 ? Math.min(100, ((user.subscription.callMinutesUsed || 0) / user.subscription.callLimit!) * 100) : 0}%` }}
                                                    />
                                                </div>
                                            </>
                                        )}
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-[10px] text-slate-400 uppercase tracking-tighter font-bold">{t('voice_credits_label')}</span>
                                            <span className="text-[11px] font-bold text-green-600 dark:text-green-400">{(user.subscription.voiceCredits || 0).toFixed(0)} creds</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* El id lo consumen WelcomeTour y las acciones de resalte del asistente. */}
            <div id="folder-list-section" className="flex-1 flex flex-col min-h-0 mt-1">
                <SidebarTree
                    recordings={recordings}
                    folders={folders}
                    selectedFolderId={selectedFolderId}
                    selectedRecordingId={selectedId}
                    onSelectFolder={onSelectFolder || (() => { })}
                    onSelectRecording={onSelectRecording}
                    onAddFolder={onAddFolder}
                    onRenameFolder={onRenameFolder}
                    onDeleteFolder={onDeleteFolder}
                    onRenameRecording={onRenameRecording}
                    onDeleteRecording={onDeleteRecording}
                    onMoveRecording={onMoveRecording}
                />
            </div>
        </div>
    );
};
