import React, { useState } from 'react';
import { X, User, CreditCard, Settings, HelpCircle, LogOut, ChevronRight, ExternalLink } from 'lucide-react';
import { UserProfile, AppRoute } from '../../../types';

interface SettingsModalProps {
    user: UserProfile;
    isOpen: boolean;
    onClose: () => void;
    onUpdateUser?: (updates: Partial<UserProfile>) => void;
    onNavigate: (route: AppRoute) => void;
    onLogout: () => void;
}

type Section = 'account' | 'settings' | 'help';

export const SettingsModal: React.FC<SettingsModalProps> = ({
    user,
    isOpen,
    onClose,
    onUpdateUser,
    onNavigate,
    onLogout
}) => {
    const [selectedSection, setSelectedSection] = useState<Section>('account');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    if (!isOpen) return null;

    const formatPlanName = (planId: string) => {
        const names: Record<string, string> = {
            'free': 'Free',
            'pro': 'Pro',
            'business': 'Business',
            'business_plus': 'Business Plus'
        };
        return names[planId] || planId;
    };

    const menuItems = [
        { id: 'account' as Section, icon: User, label: 'Mi Cuenta' },
        { id: 'settings' as Section, icon: Settings, label: 'Configuración' },
        { id: 'help' as Section, icon: HelpCircle, label: 'Ayuda' },
    ];

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        onLogout();
        onClose();
    };

    const handlePlansClick = () => {
        onClose();
        onNavigate(AppRoute.SUBSCRIPTION);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#202123] rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex overflow-hidden border border-black/10 dark:border-white/10">
                {/* Sidebar Navigation */}
                <div className="w-56 bg-[#f9f9f9] dark:bg-[#1a1a1a] border-r border-black/5 dark:border-white/5 flex flex-col">
                    {/* User Header */}
                    <div className="p-4">
                        <div className="flex items-start gap-3 mb-2">
                            {user.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.firstName}
                                    className="w-10 h-10 rounded-full ring-1 ring-black/10 dark:ring-white/10"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium ring-1 ring-black/10">
                                    {user.firstName?.charAt(0) || 'U'}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-[#0d0d0d] dark:text-[#ececec] text-sm truncate">
                                    {user.firstName} {user.lastName}
                                </div>
                                <div className="text-xs text-[#676767] dark:text-[#8e8e8e] truncate">
                                    {formatPlanName(user.subscription?.planId || 'free')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex-1 px-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setSelectedSection(item.id)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition-colors mb-0.5 ${selectedSection === item.id
                                        ? 'bg-white dark:bg-[#2a2b32] text-[#0d0d0d] dark:text-white'
                                        : 'text-[#676767] dark:text-[#c5c5d2] hover:bg-white/50 dark:hover:bg-white/5'
                                    }`}
                            >
                                <item.icon size={16} strokeWidth={2} />
                                <span className="text-sm">{item.label}</span>
                            </button>
                        ))}

                        {/* Plans Button */}
                        <button
                            onClick={handlePlansClick}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition-colors mb-0.5 text-[#676767] dark:text-[#c5c5d2] hover:bg-white/50 dark:hover:bg-white/5"
                        >
                            <CreditCard size={16} strokeWidth={2} />
                            <span className="text-sm flex-1">Planes</span>
                            <ExternalLink size={14} />
                        </button>
                    </nav>

                    {/* Logout Button */}
                    <div className="p-2 border-t border-black/5 dark:border-white/5">
                        <button
                            onClick={handleLogoutClick}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <LogOut size={16} strokeWidth={2} />
                            <span className="text-sm">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col bg-white dark:bg-[#202123]">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5">
                        <h2 className="text-lg font-medium text-[#0d0d0d] dark:text-[#ececec]">
                            {menuItems.find(item => item.id === selectedSection)?.label}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors"
                        >
                            <X size={18} className="text-[#676767] dark:text-[#8e8e8e]" strokeWidth={2} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        {selectedSection === 'account' && (
                            <div className="space-y-6 max-w-xl">
                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-[#0d0d0d] dark:text-[#ececec] mb-1.5">
                                        Email
                                    </label>
                                    <div className="text-sm text-[#676767] dark:text-[#8e8e8e]">
                                        {user.email}
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-[#0d0d0d] dark:text-[#ececec] mb-1.5">
                                        Nombre
                                    </label>
                                    <div className="text-sm text-[#676767] dark:text-[#8e8e8e]">
                                        {user.firstName} {user.lastName}
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedSection === 'settings' && (
                            <div className="space-y-6 max-w-xl">
                                <div className="text-sm text-[#676767] dark:text-[#8e8e8e]">
                                    Configuraciones de apariencia e idioma próximamente.
                                </div>
                            </div>
                        )}

                        {selectedSection === 'help' && (
                            <div className="space-y-4 max-w-xl">
                                {/* Manual */}
                                <button
                                    onClick={() => {
                                        onNavigate(AppRoute.MANUAL);
                                        onClose();
                                    }}
                                    className="w-full text-left p-4 bg-[#f9f9f9] dark:bg-[#2a2b32] rounded-lg hover:bg-[#f0f0f0] dark:hover:bg-[#33343d] transition-colors border border-black/5 dark:border-white/5"
                                >
                                    <div className="font-medium text-[#0d0d0d] dark:text-[#ececec] mb-1 text-sm">
                                        Manual de Usuario
                                    </div>
                                    <div className="text-xs text-[#676767] dark:text-[#8e8e8e]">
                                        Aprende a usar todas las funciones
                                    </div>
                                </button>

                                {/* Crisp Chat */}
                                <div className="p-4 bg-[#f9f9f9] dark:bg-[#2a2b32] rounded-lg border border-black/5 dark:border-white/5">
                                    <div className="font-medium text-[#0d0d0d] dark:text-[#ececec] mb-1 text-sm">
                                        Chat de Soporte
                                    </div>
                                    <div className="text-xs text-[#676767] dark:text-[#8e8e8e] mb-3">
                                        Habla con nuestro equipo
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (window.$crisp) {
                                                window.$crisp.push(['do', 'chat:open']);
                                            }
                                        }}
                                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                                    >
                                        Abrir Chat
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Logout Confirmation */}
            {showLogoutConfirm && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="bg-white dark:bg-[#202123] rounded-xl p-6 max-w-sm w-full mx-4 border border-black/10 dark:border-white/10">
                        <h3 className="text-base font-semibold text-[#0d0d0d] dark:text-[#ececec] mb-2">
                            ¿Cerrar sesión?
                        </h3>
                        <p className="text-sm text-[#676767] dark:text-[#8e8e8e] mb-6">
                            ¿Estás seguro que deseas cerrar tu sesión?
                        </p>
                        <div className="flex gap-2.5">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 px-4 py-2 border border-black/10 dark:border-white/20 text-[#0d0d0d] dark:text-[#ececec] rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm font-medium"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
