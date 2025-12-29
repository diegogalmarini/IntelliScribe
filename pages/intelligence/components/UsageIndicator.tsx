import React from 'react';
import { UserProfile } from '../../../types';
import { useLanguage } from '../../../contexts/LanguageContext';

interface UsageIndicatorProps {
    user: UserProfile;
}

export const UsageIndicator: React.FC<UsageIndicatorProps> = ({ user }) => {
    const { t } = useLanguage();
    const { minutesUsed, minutesLimit } = user.subscription;

    // Calculate percentage
    const percentage = minutesLimit === -1 ? 0 : (minutesUsed / minutesLimit) * 100;
    const isUnlimited = minutesLimit === -1;

    return (
        <div className="px-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">
                {isUnlimited ? (
                    <span>{t('unlimited') || 'Ilimitado'}</span>
                ) : (
                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <span>{minutesUsed} / {minutesLimit} min</span>
                            <span className="font-medium">{Math.round(percentage)}%</span>
                        </div>
                        <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all ${percentage > 90 ? 'bg-red-500' :
                                    percentage > 70 ? 'bg-yellow-500' :
                                        'bg-blue-500'
                                    }`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
