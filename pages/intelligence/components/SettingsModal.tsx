import React from 'react';
import { X } from 'lucide-react';
import { UserProfile } from '../../types';

interface SettingsModalProps {
    user: UserProfile;
    isOpen: boolean;
    onClose: () => void;
    onUpdateUser: (updates: Partial<UserProfile>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    user,
    isOpen,
    onClose,
    onUpdateUser
}) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-40 animate-fadeIn"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-[#2f2f2f] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden animate-slideUp">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5e5] dark:border-[#3c3c3c]">
                        <h2 className="text-xl font-semibold text-[#1f1f1f] dark:text-white">
                            Configuración
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[#f5f5f5] dark:hover:bg-[#3c3c3c] rounded-lg transition-colors"
                        >
                            <X size={20} className="text-[#444746] dark:text-slate-300" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex h-[calc(85vh-80px)]">
                        {/* Sidebar */}
                        <div className="w-64 border-r border-[#e5e5e5] dark:border-[#3c3c3c] p-4">
                            <nav className="space-y-1">
                                <button className="w-full text-left px-3 py-2 rounded-lg bg-[#f5f5f5] dark:bg-[#3c3c3c] text-[#1f1f1f] dark:text-white text-sm font-medium">
                                    General
                                </button>
                                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#3c3c3c] text-[#444746] dark:text-slate-300 text-sm">
                                    Notificaciones
                                </button>
                                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#3c3c3c] text-[#444746] dark:text-slate-300 text-sm">
                                    Privacidad
                                </button>
                            </nav>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="max-w-2xl space-y-6">
                                {/* Profile Header */}
                                <div className="flex items-center gap-4 pb-6 border-b border-[#e5e5e5] dark:border-[#3c3c3c]">
                                    {user.avatarUrl ? (
                                        <img
                                            src={user.avatarUrl}
                                            alt={user.firstName}
                                            className="w-16 h-16 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-medium">
                                            {user.firstName?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-semibold text-[#1f1f1f] dark:text-white text-lg">
                                            {user.firstName} {user.lastName}
                                        </div>
                                        <div className="text-sm text-[#444746] dark:text-slate-400">
                                            {user.email}
                                        </div>
                                        <div className="mt-2">
                                            <span className="inline-block px-2.5 py-1 bg-[#f0f0f0] dark:bg-[#2f2f2f] text-[#444746] dark:text-[#e3e3e3] text-xs font-medium rounded-md">
                                                {user.subscription?.planId ? user.subscription.planId.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Free'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Section */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-[#1f1f1f] dark:text-white uppercase tracking-wider">
                                        Perfil
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-[#444746] dark:text-slate-300 mb-1.5">
                                                Nombre
                                            </label>
                                            <input
                                                type="text"
                                                defaultValue={user.firstName}
                                                className="w-full px-3 py-2 bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#3c3c3c] rounded-lg text-[#1f1f1f] dark:text-white focus:outline-none focus:border-[#444746] dark:focus:border-[#4f4f4f]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-[#444746] dark:text-slate-300 mb-1.5">
                                                Apellido
                                            </label>
                                            <input
                                                type="text"
                                                defaultValue={user.lastName}
                                                className="w-full px-3 py-2 bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#3c3c3c] rounded-lg text-[#1f1f1f] dark:text-white focus:outline-none focus:border-[#444746] dark:focus:border-[#4f4f4f]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-[#444746] dark:text-slate-300 mb-1.5">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                defaultValue={user.email}
                                                disabled
                                                className="w-full px-3 py-2 bg-[#f5f5f5] dark:bg-[#2a2a2a] border border-[#e5e5e5] dark:border-[#3c3c3c] rounded-lg text-[#444746] dark:text-slate-400 cursor-not-allowed"
                                            />
                                            <p className="text-xs text-[#444746] dark:text-slate-500 mt-1">
                                                El email no se puede cambiar
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="pt-4">
                                    <button className="px-4 py-2 bg-[#1f1f1f] dark:bg-white text-white dark:text-[#1f1f1f] rounded-lg hover:bg-[#2f2f2f] dark:hover:bg-[#e5e5e5] transition-colors text-sm font-medium">
                                        Guardar cambios
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
