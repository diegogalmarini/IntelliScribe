import React from 'react';
import { RefreshCw, Sparkles, Share2, Loader2, Trash2 } from 'lucide-react';
import { PremiumFeatureButton } from './PremiumFeatureButton';
import { useLanguage } from '../../../contexts/LanguageContext';

interface RecordingActionsProps {
    isTranscribing: boolean;
    isGeneratingSummary: boolean;
    isZapierSyncing?: boolean; // NEW
    onTranscribe: () => void;
    onGenerateSummary: () => void;
    onSaveNotes: () => void;
    onExport: () => void;
    onDelete: () => void;
    onZapierSync?: () => void; // NEW
    canTranscribe: boolean;
    showZapier?: boolean; // NEW
}

/**
 * Action buttons for recording detail view
 * Includes: Regenerate, Summary, Export, Delete
 */
export const RecordingActions: React.FC<RecordingActionsProps> = ({
    isTranscribing,
    isGeneratingSummary,
    isZapierSyncing,
    onTranscribe,
    onGenerateSummary,
    onSaveNotes,
    onExport,
    onDelete,
    onZapierSync,
    canTranscribe,
    showZapier
}) => {
    const { t, language } = useLanguage();

    return (
        <div className="flex items-center gap-2 shrink-0">
            {/* Zapier Sync - Business Feature */}
            {showZapier && (
                <button
                    onClick={onZapierSync}
                    disabled={isZapierSyncing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-white bg-gradient-to-r from-[#FF4A00] to-[#FF8C00] hover:from-[#E64200] hover:to-[#FF7A00] rounded-lg transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 active:scale-95 group"
                    title="Sync with Zapier"
                >
                    {isZapierSyncing ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <span className="material-symbols-outlined text-[16px] group-hover:animate-pulse">bolt</span>
                    )}
                    <span className="hidden md:inline">{isZapierSyncing ? 'Syncing...' : 'Zapier Sync'}</span>
                </button>
            )}

            {/* Regenerate - Available for all users */}
            <button
                onClick={onTranscribe}
                disabled={isTranscribing || !canTranscribe}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#0d0d0d] dark:text-[#ececec] bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                title={t('regenerateTranscription')}
            >
                {isTranscribing ? (
                    <Loader2 size={14} className="animate-spin text-brand-purple" />
                ) : (
                    <RefreshCw size={14} className="text-brand-purple" />
                )}
                <span className="hidden sm:inline">{isTranscribing ? t('regenerating') : t('regenerate')}</span>
            </button>

            {/* Summarize - AI Feature */}
            <button
                onClick={onGenerateSummary}
                disabled={isGeneratingSummary}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#1f1f1f] dark:text-[#ececec] bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                title={t('summarize')}
            >
                {isGeneratingSummary ? (
                    <Loader2 size={14} className="animate-spin text-brand-purple" />
                ) : (
                    <Sparkles size={14} className="text-brand-purple" />
                )}
                <span className="hidden sm:inline">{t('summarize')}</span>
            </button>

            {/* Export */}
            <button
                onClick={onExport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#0d0d0d] dark:text-[#ececec] bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors shadow-sm"
                title={t('export')}
            >
                <Share2 size={14} />
                <span className="hidden sm:inline">{t('export')}</span>
            </button>

            {/* Delete */}
            <button
                onClick={onDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-red-600 dark:text-red-400 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors shadow-sm"
                title={t('delete')}
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
};
