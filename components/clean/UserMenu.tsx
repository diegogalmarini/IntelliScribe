import React, { useState, useRef, useEffect } from 'react';
import { AppRoute, UserProfile } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import {
    User,
    CreditCard,
    Puzzle,
    BookOpen,
    Settings,
    Sun,
    Moon,
    Monitor,
    LogOut,
    ChevronDown
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface UserMenuProps {
    user: UserProfile;
    onNavigate: (route: AppRoute) => void;
    onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, onNavigate, onLogout }) => {
    const { t } = useLanguage();
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const menuItems = [
        { icon: User, label: t('profile') || 'Perfil', action: () => onNavigate(AppRoute.SETTINGS) },
        { icon: CreditCard, label: t('plans') || 'Planes', action: () => onNavigate(AppRoute.SUBSCRIPTION) },
        { icon: Puzzle, label: t('integrations') || 'Integraciones', action: () => onNavigate(AppRoute.INTEGRATIONS) },
        { icon: BookOpen, label: t('manual') || 'Manual y ayuda', action: () => onNavigate(AppRoute.MANUAL) },
        { icon: Settings, label: t('settings') || 'Configuración', action: () => onNavigate(AppRoute.SETTINGS) },
    ];

    const themeOptions = [
        { icon: Sun, label: t('lightMode') || 'Claro', value: 'light' as const },
        { icon: Moon, label: t('darkMode') || 'Oscuro', value: 'dark' as const },
        { icon: Monitor, label: t('systemMode') || 'Sistema', value: 'system' as const },
    ];

    return (
        <div className="relative" ref={menuRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
                {user.avatarUrl ? (
                    <img
                        src={user.avatarUrl}
                        alt={user.firstName}
                        className="w-8 h-8 rounded-full"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                        {user.firstName?.charAt(0) || 'U'}
                    </div>
                )}
                <ChevronDown size={16} className={`text-slate-600 dark:text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                        <div className="font-medium text-slate-900 dark:text-white">
                            {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                            {user.email}
                        </div>
                        <div className="mt-2">
                            <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded">
                                {user.subscription.planId.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        {menuItems.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    item.action();
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Theme Selector */}
                    <div className="border-t border-slate-200 dark:border-slate-700 py-1">
                        <div className="px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                            {t('theme') || 'Tema'}
                        </div>
                        {themeOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    setTheme(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${theme === option.value
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                                    }`}
                            >
                                <option.icon size={18} />
                                <span>{option.label}</span>
                                {theme === option.value && (
                                    <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-slate-200 dark:border-slate-700 py-1">
                        <button
                            onClick={() => {
                                onLogout();
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                            <LogOut size={18} />
                            <span>{t('logout') || 'Cerrar sesión'}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
