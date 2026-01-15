import React from 'react';
import { Lock } from 'lucide-react';

interface PremiumFeatureButtonProps {
    onClick: () => void;
    disabled?: boolean;
    isFreeUser: boolean;
    onUpgradeClick: () => void;
    icon: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    title?: string;
}

/**
 * Reusable button component that shows lock icon for FREE users
 * and triggers upgrade modal when clicked
 */
export const PremiumFeatureButton: React.FC<PremiumFeatureButtonProps> = ({
    onClick,
    disabled = false,
    isFreeUser,
    onUpgradeClick,
    icon,
    children,
    className = '',
    title
}) => {
    const handleClick = () => {
        if (isFreeUser) {
            onUpgradeClick();
        } else {
            onClick();
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled && !isFreeUser}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#0d0d0d] dark:text-[#ececec] bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors shadow-sm ${disabled && !isFreeUser ? 'opacity-50 cursor-not-allowed' : ''
                } ${isFreeUser ? 'relative' : ''} ${className}`}
            title={title}
        >
            {isFreeUser ? (
                <>
                    <Lock size={14} className="text-blue-500" />
                    <span className="hidden sm:inline">{children}</span>
                </>
            ) : (
                <>
                    {icon}
                    <span className="hidden sm:inline">{children}</span>
                </>
            )}
        </button>
    );
};
