import React from 'react';
import { RefreshCw, Sparkles, Share2, Loader2, Trash2 } from 'lucide-react';
import { PremiumFeatureButton } from './PremiumFeatureButton';
import { useLanguage } from '../../../contexts/LanguageContext';

interface RecordingActionsProps {
    isTranscribing: boolean;
    isGeneratingSummary: boolean;
    onTranscribe: () => void;
    onGenerateSummary: (template: string, language: string) => void;
    onSaveNotes: () => void;
    onExport: () => void;
    onDelete: () => void;
    canTranscribe: boolean;
}

/**
 * Action buttons for recording detail view
 * Includes: Regenerate, Summary, Export, Delete
 */
export const RecordingActions: React.FC<RecordingActionsProps> = ({
    isTranscribing,
    isGeneratingSummary,
    onTranscribe,
    onGenerateSummary,
    onSaveNotes,
    onExport,
    onDelete,
    canTranscribe
}) => {
    const { t, language } = useLanguage();

    return (
        <div className="flex items-center gap-2 shrink-0">
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
                onClick={() => onGenerateSummary('general', language)}
                disabled={isGeneratingSummary}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#0d0d0d] dark:text-[#ececec] bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors shadow-sm disabled:opacity-50"
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
