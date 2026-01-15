import React from 'react';
import { RefreshCw, Sparkles, Share2, Loader2 } from 'lucide-react';
import { PremiumFeatureButton } from './PremiumFeatureButton';
import { useLanguage } from '../../../contexts/LanguageContext';

interface RecordingActionsProps {
    isFreeUser: boolean;
    isTranscribing: boolean;
    onTranscribe: () => void;
    onAnalyze: () => void;
    onExport: () => void;
    onShowUpgrade: (featureName: string) => void;
    canTranscribe: boolean;
}

/**
 * Action buttons for recording detail view
 * Includes: Regenerate, Analyze, Export
 */
export const RecordingActions: React.FC<RecordingActionsProps> = ({
    isFreeUser,
    isTranscribing,
    onTranscribe,
    onAnalyze,
    onExport,
    onShowUpgrade,
    canTranscribe
}) => {
    const { t } = useLanguage();

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

            {/* Analyze - Premium Feature */}
            <PremiumFeatureButton
                onClick={onAnalyze}
                isFreeUser={isFreeUser}
                onUpgradeClick={() => onShowUpgrade('Análisis con IA')}
                icon={<Sparkles size={14} className="text-brand-purple" />}
                title={t('summarize')}
            >
                {t('summarize')}
            </PremiumFeatureButton>

            {/* Export - Premium Feature */}
            <PremiumFeatureButton
                onClick={onExport}
                isFreeUser={isFreeUser}
                onUpgradeClick={() => onShowUpgrade('Exportar')}
                icon={<Share2 size={14} />}
                title={t('export')}
            >
                {t('export')}
            </PremiumFeatureButton>
        </div>
    );
};
