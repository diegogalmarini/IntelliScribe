import React from 'react';
import { AppRoute } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface LimitReachedModalProps {
    onClose: () => void;
    onNavigate: (route: AppRoute) => void;
}

export const LimitReachedModal: React.FC<LimitReachedModalProps> = ({ onClose, onNavigate }) => {
    const { t } = useLanguage();

    const handleUpgrade = () => {
        onClose();
        onNavigate(AppRoute.SUBSCRIPTION);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-scale-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    <span className="material-symbols-outlined text-2xl">close</span>
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-5xl">block</span>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-3">
                    {t('limitReachedTitle') || 'Monthly Limit Reached'}
                </h2>

                {/* Message */}
                <p className="text-center text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                    {t('limitReachedMessage') || 'You have reached your monthly transcription limit. Upgrade your plan to continue recording and transcribing.'}
                </p>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleUpgrade}
                        className="w-full py-3 rounded-xl bg-gradient-brand hover:opacity-90 text-white font-bold transition-all shadow-lg text-sm uppercase tracking-wider"
                    >
                        {t('upgradePlan') || 'Upgrade Plan'}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl border-2 border-slate-200 dark:border-border-dark text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm"
                    >
                        {t('cancel') || 'Cancel'}
                    </button>
                </div>
            </div>
        </div>
    );
};
