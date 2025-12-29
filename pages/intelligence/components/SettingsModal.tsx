import React, { useState } from 'react';
import { X, User, CreditCard, Settings, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { UserProfile, AppRoute } from '../../../types';

interface SettingsModalProps {
    user: UserProfile;
    isOpen: boolean;
    onClose: () => void;
    onUpdateUser?: (updates: Partial<UserProfile>) => void;
    onNavigate: (route: AppRoute) => void;
    onLogout: () => void;
}

type Section = 'account' | 'plans' | 'settings' | 'help' | 'logout';

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
        { id: 'plans' as Section, icon: CreditCard, label: 'Planes y Suscripción' },
        { id: 'settings' as Section, icon: Settings, label: 'Configuración' },
        { id: 'help' as Section, icon: HelpCircle, label: 'Ayuda y Soporte' },
    ];

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        onLogout();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#2a2a2a] rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-64 border-r border-slate-200 dark:border-slate-700 flex flex-col">
                    {/* User Header */}
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-3">
                            {user.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.firstName}
                                    className="w-12 h-12 rounded-full"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-medium">
                                    {user.firstName?.charAt(0) || 'U'}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-[#1f1f1f] dark:text-white truncate">
                                    {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-[#444746] dark:text-slate-400 truncate">
                                    {user.email}
                                </div>
                            </div>
                        </div>
                        <span className="inline-block px-2.5 py-1 bg-[#f0f0f0] dark:bg-[#3c3c3c] text-[#444746] dark:text-[#e3e3e3] text-xs font-medium rounded-md">
                            {formatPlanName(user.subscription?.planId || 'free')}
                        </span>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex-1 p-3">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setSelectedSection(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors mb-1 ${selectedSection === item.id
                                        ? 'bg-[#f0f0f0] dark:bg-[#3c3c3c] text-[#1f1f1f] dark:text-white'
                                        : 'text-[#444746] dark:text-slate-400 hover:bg-[#f5f5f5] dark:hover:bg-[#333]'
                                    }`}
                            >
                                <item.icon size={18} />
                                <span className="flex-1 text-sm font-medium">{item.label}</span>
                                {selectedSection === item.id && (
                                    <ChevronRight size={16} />
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* Logout Button */}
                    <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                        <button
                            onClick={handleLogoutClick}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <LogOut size={18} />
                            <span className="text-sm font-medium">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-xl font-semibold text-[#1f1f1f] dark:text-white">
                            {menuItems.find(item => item.id === selectedSection)?.label}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-[#444746] dark:text-slate-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {selectedSection === 'account' && (
                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <h3 className="text-sm font-medium text-[#444746] dark:text-slate-400 mb-3">
                                        Información Personal
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-[#444746] dark:text-slate-400 mb-1">
                                                Nombre
                                            </label>
                                            <div className="text-base text-[#1f1f1f] dark:text-white">
                                                {user.firstName} {user.lastName}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-[#444746] dark:text-slate-400 mb-1">
                                                Email
                                            </label>
                                            <div className="text-base text-[#1f1f1f] dark:text-white">
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedSection === 'plans' && (
                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <h3 className="text-sm font-medium text-[#444746] dark:text-slate-400 mb-3">
                                        Plan Actual
                                    </h3>
                                    <div className="p-4 bg-[#f5f5f5] dark:bg-[#333] rounded-lg">
                                        <div className="text-2xl font-semibold text-[#1f1f1f] dark:text-white mb-2">
                                            {formatPlanName(user.subscription?.planId || 'free')}
                                        </div>
                                        {user.subscription?.minutesLimit !== -1 && (
                                            <div className="text-sm text-[#444746] dark:text-slate-400">
                                                {user.subscription?.minutesUsed || 0} / {user.subscription?.minutesLimit || 0} minutos usados
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        onNavigate(AppRoute.SUBSCRIPTION);
                                        onClose();
                                    }}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Ver Todos los Planes
                                </button>
                            </div>
                        )}

                        {selectedSection === 'settings' && (
                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <h3 className="text-sm font-medium text-[#444746] dark:text-slate-400 mb-3">
                                        Apariencia y Preferencias
                                    </h3>
                                    <p className="text-sm text-[#444746] dark:text-slate-400">
                                        Configuraciones de tema, idioma y notificaciones próximamente.
                                    </p>
                                </div>
                            </div>
                        )}

                        {selectedSection === 'help' && (
                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <h3 className="text-sm font-medium text-[#444746] dark:text-slate-400 mb-3">
                                        Recursos de Ayuda
                                    </h3>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => {
                                                onNavigate(AppRoute.MANUAL);
                                                onClose();
                                            }}
                                            className="w-full text-left p-4 bg-[#f5f5f5] dark:bg-[#333] rounded-lg hover:bg-[#e5e5e5] dark:hover:bg-[#3c3c3c] transition-colors"
                                        >
                                            <div className="font-medium text-[#1f1f1f] dark:text-white mb-1">
                                                Manual de Usuario
                                            </div>
                                            <div className="text-sm text-[#444746] dark:text-slate-400">
                                                Aprende a usar todas las funciones
                                            </div>
                                        </button>

                                        <div className="p-4 bg-[#f5f5f5] dark:bg-[#333] rounded-lg">
                                            <div className="font-medium text-[#1f1f1f] dark:text-white mb-2">
                                                Chat de Soporte
                                            </div>
                                            <div className="text-sm text-[#444746] dark:text-slate-400 mb-3">
                                                Habla con nuestro equipo de soporte
                                            </div>
                                            <button
                                                onClick={() => {
                                                    // Trigger Crisp chat
                                                    if (window.$crisp) {
                                                        window.$crisp.push(['do', 'chat:open']);
                                                    }
                                                }}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                            >
                                                Abrir Chat
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <div className="bg-white dark:bg-[#2a2a2a] rounded-2xl p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-semibold text-[#1f1f1f] dark:text-white mb-2">
                            ¿Cerrar sesión?
                        </h3>
                        <p className="text-sm text-[#444746] dark:text-slate-400 mb-6">
                            ¿Estás seguro que deseas cerrar tu sesión?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-[#1f1f1f] dark:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
