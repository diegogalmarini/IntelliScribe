import React, { useState } from 'react';
import {
    X, User, Shield, Bell, Puzzle, Settings as SettingsIcon,
    Database, HelpCircle, LogOut, ChevronRight, ExternalLink,
    Camera, Mail, Phone, Globe, Lock, Key, Smartphone,
    Monitor, Download, Trash2, Save
} from 'lucide-react';
import { UserProfile, AppRoute } from '../../../types';

interface SettingsModalProps {
    user: UserProfile;
    isOpen: boolean;
    onClose: () => void;
    onUpdateUser?: (updates: Partial<UserProfile>) => void;
    onNavigate: (route: AppRoute) => void;
    onLogout: () => void;
}

type Section = 'profile' | 'security' | 'notifications' | 'integrations' | 'settings' | 'privacy' | 'help';

export const SettingsModal: React.FC<SettingsModalProps> = ({
    user,
    isOpen,
    onClose,
    onUpdateUser,
    onNavigate,
    onLogout
}) => {
    const [selectedSection, setSelectedSection] = useState<Section>('profile');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Form states
    const [emailNotifications, setEmailNotifications] = useState({
        recordingProcessed: true,
        weeklyInsights: true,
        productUpdates: false
    });
    const [pushNotifications, setPushNotifications] = useState(true);

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
        { id: 'profile' as Section, icon: User, label: 'Mi Perfil' },
        { id: 'security' as Section, icon: Shield, label: 'Seguridad' },
        { id: 'notifications' as Section, icon: Bell, label: 'Notificaciones' },
        { id: 'integrations' as Section, icon: Puzzle, label: 'Integraciones' },
        { id: 'settings' as Section, icon: SettingsIcon, label: 'Configuración' },
        { id: 'privacy' as Section, icon: Database, label: 'Privacidad' },
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
            <div className="bg-white dark:bg-[#202123] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex overflow-hidden border border-black/[0.05] dark:border-white/[0.05]">
                {/* Sidebar Navigation */}
                <div className="w-64 bg-[#f7f7f8] dark:bg-[#1a1a1a] border-r border-black/[0.03] dark:border-white/[0.03] flex flex-col">

                    {/* Navigation Menu */}
                    <nav className="flex-1 px-2 py-3 overflow-y-auto">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setSelectedSection(item.id)}
                                className={`w-full flex items-center gap-3 px-2.5 py-1 rounded-lg text-left transition-colors mb-0.5 ${selectedSection === item.id
                                    ? 'bg-white dark:bg-[#2a2b32] text-[#0d0d0d] dark:text-[#ececec] shadow-sm'
                                    : 'text-[#676767] dark:text-[#acacac] hover:bg-white/60 dark:hover:bg-white/5'
                                    }`}
                            >
                                <item.icon size={18} strokeWidth={2} />
                                <span className="text-[11px] font-normal">{item.label}</span>
                            </button>
                        ))}

                        {/* Divider */}
                        <div className="my-3 border-t border-black/[0.05] dark:border-white/[0.05]"></div>

                        <button
                            onClick={handlePlansClick}
                            className="w-full flex items-center gap-3 px-2.5 py-1 rounded-lg text-left transition-colors text-[#676767] dark:text-[#b4b4b4] hover:bg-white/60 dark:hover:bg-white/[0.03]"
                        >
                            <ExternalLink size={18} strokeWidth={2} />
                            <span className="text-[11px] font-normal flex-1">Planes</span>
                        </button>
                    </nav>

                    {/* Logout Button */}
                    <div className="p-2 border-t border-black/[0.05] dark:border-white/[0.05]">
                        <button
                            onClick={handleLogoutClick}
                            className="w-full flex items-center gap-3 px-2.5 py-1 rounded-lg text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                            <LogOut size={18} strokeWidth={2} />
                            <span className="text-[11px] font-normal">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col bg-white dark:bg-[#202123]">
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-4 border-b border-black/5 dark:border-white/5">
                        <h2 className="text-[11px] font-semibold text-[#0d0d0d] dark:text-[#ececec]">
                            {menuItems.find(item => item.id === selectedSection)?.label}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-[#676767] dark:text-[#acacac]" strokeWidth={2} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-8 py-6">
                        {/* MI PERFIL */}
                        {selectedSection === 'profile' && (
                            <div className="space-y-8 max-w-2xl">
                                {/* Avatar Section */}
                                <div>
                                    <h3 className="text-[12px] font-semibold text-[#0d0d0d] dark:text-[#ececec] mb-2">
                                        Foto de Perfil
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        {user.avatarUrl ? (
                                            <img
                                                src={user.avatarUrl}
                                                alt={user.firstName}
                                                className="w-20 h-20 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-medium">
                                                {user.firstName?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                        <button className="px-4 py-1.5 bg-[#f7f7f8] dark:bg-[#2a2b32] text-[#0d0d0d] dark:text-[#ececec] text-[11px] font-normal rounded-lg hover:bg-[#ebebeb] dark:hover:bg-[#33343d] transition-colors flex items-center gap-2">
                                            <Camera size={16} />
                                            Cambiar Foto
                                        </button>
                                    </div>
                                </div>

                                {/* Personal Info */}
                                <div>
                                    <h3 className="text-[11px] font-semibold text-[#0d0d0d] dark:text-[#ececec] mb-3">
                                        Información Personal
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[11px] font-normal text-[#0d0d0d] dark:text-[#ececec] mb-1">
                                                    Nombre
                                                </label>
                                                <input
                                                    type="text"
                                                    defaultValue={user.firstName}
                                                    className="w-full px-2.5 py-1 bg-[#f7f7f8] dark:bg-[#2a2b32] border border-black/10 dark:border-white/10 rounded-lg text-[#0d0d0d] dark:text-[#ececec] text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-normal text-[#0d0d0d] dark:text-[#ececec] mb-2">
                                                    Apellidos
                                                </label>
                                                <input
                                                    type="text"
                                                    defaultValue={user.lastName}
                                                    className="w-full px-2.5 py-1 bg-[#f7f7f8] dark:bg-[#2a2b32] border border-black/10 dark:border-white/10 rounded-lg text-[#0d0d0d] dark:text-[#ececec] text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-normal text-[#0d0d0d] dark:text-[#ececec] mb-2">
                                                Email
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="email"
                                                    value={user.email}
                                                    disabled
                                                    className="flex-1 px-2.5 py-1 bg-[#f7f7f8] dark:bg-[#2a2b32] border border-black/10 dark:border-white/10 rounded-lg text-[#676767] dark:text-[#acacac] text-[12px]"
                                                />
                                                <Mail size={16} className="text-[#676767]" />
                                            </div>
                                            <p className="text-xs text-[#676767] dark:text-[#acacac] mt-1">
                                                Tu email no puede ser cambiado
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-normal text-[#0d0d0d] dark:text-[#ececec] mb-2 flex items-center gap-2">
                                                Teléfono
                                                {user.subscription?.planId === 'business_plus' && (
                                                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded">
                                                        Business+
                                                    </span>
                                                )}
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="tel"
                                                    placeholder="+34 XXX XXX XXX"
                                                    disabled={user.subscription?.planId !== 'business_plus'}
                                                    className="flex-1 px-2.5 py-1 bg-[#f7f7f8] dark:bg-[#2a2b32] border border-black/10 dark:border-white/10 rounded-lg text-[#0d0d0d] dark:text-[#ececec] text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                                />
                                                <Phone size={16} className="text-[#676767]" />
                                            </div>
                                            {user.subscription?.planId !== 'business_plus' && (
                                                <p className="text-xs text-[#676767] dark:text-[#acacac] mt-1">
                                                    Actualiza a Business+ para habilitar llamadas
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-normal text-[#0d0d0d] dark:text-[#ececec] mb-2">
                                                Zona Horaria
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <select className="flex-1 px-2.5 py-1 bg-[#f7f7f8] dark:bg-[#2a2b32] border border-black/10 dark:border-white/10 rounded-lg text-[#0d0d0d] dark:text-[#ececec] text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                    <option>Europa/Madrid (GMT+1)</option>
                                                    <option>Europa/London (GMT+0)</option>
                                                    <option>America/New_York (GMT-5)</option>
                                                </select>
                                                <Globe size={16} className="text-[#676767]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="pt-4 border-t border-black/5 dark:border-white/5">
                                    <button className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-normal rounded-lg transition-colors flex items-center gap-2">
                                        <Save size={16} />
                                        Guardar Cambios
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* SEGURIDAD */}
                        {selectedSection === 'security' && (
                            <div className="space-y-8 max-w-2xl">
                                {/* Change Password */}
                                <div>
                                    <h3 className="text-[12px] font-semibold text-[#0d0d0d] dark:text-[#ececec] mb-2">
                                        Cambiar Contraseña
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[11px] font-normal text-[#0d0d0d] dark:text-[#ececec] mb-2">
                                                Contraseña Actual
                                            </label>
                                            <input
                                                type="password"
                                                className="w-full px-2.5 py-1 bg-[#f7f7f8] dark:bg-[#2a2b32] border border-black/10 dark:border-white/10 rounded-lg text-[#0d0d0d] dark:text-[#ececec] text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-normal text-[#0d0d0d] dark:text-[#ececec] mb-2">
                                                Nueva Contraseña
                                            </label>
                                            <input
                                                type="password"
                                                className="w-full px-2.5 py-1 bg-[#f7f7f8] dark:bg-[#2a2b32] border border-black/10 dark:border-white/10 rounded-lg text-[#0d0d0d] dark:text-[#ececec] text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-normal text-[#0d0d0d] dark:text-[#ececec] mb-2">
                                                Confirmar Nueva Contraseña
                                            </label>
                                            <input
                                                type="password"
                                                className="w-full px-2.5 py-1 bg-[#f7f7f8] dark:bg-[#2a2b32] border border-black/10 dark:border-white/10 rounded-lg text-[#0d0d0d] dark:text-[#ececec] text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <button className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-normal rounded-lg transition-colors flex items-center gap-2">
                                            <Lock size={16} />
                                            Cambiar Contraseña
                                        </button>
                                    </div>
                                </div>

                                {/* Active Sessions */}
                                <div className="pt-8 border-t border-black/5 dark:border-white/5">
                                    <h3 className="text-[12px] font-semibold text-[#0d0d0d] dark:text-[#ececec] mb-2">
                                        Sesiones Activas
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="p-4 bg-[#f7f7f8] dark:bg-[#2a2b32] rounded-lg border border-black/5 dark:border-white/5">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <Monitor size={20} className="text-[#676767] mt-0.5" />
                                                    <div>
                                                        <div className="font-medium text-[#0d0d0d] dark:text-[#ececec] text-[12px]">
                                                            Chrome en Windows
                                                        </div>
                                                        <div className="text-xs text-[#676767] dark:text-[#acacac] mt-1">
                                                            Madrid, España • Activo ahora
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded">
                                                    Actual
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="mt-4 text-[12px] text-red-600 dark:text-red-400 hover:underline">
                                        Cerrar todas las demás sesiones
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* NOTIFICACIONES */}
                        {selectedSection === 'notifications' && (
                            <div className="space-y-8 max-w-2xl">
                                {/* Email Notifications */}
                                <div>
                                    <h3 className="text-[12px] font-semibold text-[#0d0d0d] dark:text-[#ececec] mb-2">
                                        Notificaciones por Email
                                    </h3>
                                    <div className="space-y-4">
                                        <label className="flex items-start justify-between p-4 bg-[#f7f7f8] dark:bg-[#2a2b32] rounded-lg border border-black/5 dark:border-white/5 cursor-pointer hover:border-black/10 dark:hover:border-white/10 transition-colors">
                                            <div className="flex-1">
                                                <div className="font-medium text-[#0d0d0d] dark:text-[#ececec] text-[12px] mb-1">
                                                    Nueva Grabación Procesada
                                                </div>
                                                <div className="text-xs text-[#676767] dark:text-[#acacac]">
                                                    Recibe un email cuando tu transcripción esté lista
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={emailNotifications.recordingProcessed}
                                                onChange={(e) => setEmailNotifications({ ...emailNotifications, recordingProcessed: e.target.checked })}
                                                className="mt-1 w-5 h-5 rounded accent-blue-600"
                                            />
                                        </label>

                                        <label className="flex items-start justify-between p-4 bg-[#f7f7f8] dark:bg-[#2a2b32] rounded-lg border border-black/5 dark:border-white/5 cursor-pointer hover:border-black/10 dark:hover:border-white/10 transition-colors">
                                            <div className="flex-1">
                                                <div className="font-medium text-[#0d0d0d] dark:text-[#ececec] text-[12px] mb-1">
                                                    Resumen Semanal de Insights
                                                </div>
                                                <div className="text-xs text-[#676767] dark:text-[#acacac]">
                                                    Un resumen de todas tus reuniones de la semana
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={emailNotifications.weeklyInsights}
                                                onChange={(e) => setEmailNotifications({ ...emailNotifications, weeklyInsights: e.target.checked })}
                                                className="mt-1 w-5 h-5 rounded accent-blue-600"
                                            />
                                        </label>

                                        <label className="flex items-start justify-between p-4 bg-[#f7f7f8] dark:bg-[#2a2b32] rounded-lg border border-black/5 dark:border-white/5 cursor-pointer hover:border-black/10 dark:hover:border-white/10 transition-colors">
                                            <div className="flex-1">
                                                <div className="font-medium text-[#0d0d0d] dark:text-[#ececec] text-[12px] mb-1">
                                                    Novedades del Producto
                                                </div>
                                                <div className="text-xs text-[#676767] dark:text-[#acacac]">
                                                    Noticias sobre nuevas funciones y promociones
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={emailNotifications.productUpdates}
                                                onChange={(e) => setEmailNotifications({ ...emailNotifications, productUpdates: e.target.checked })}
                                                className="mt-1 w-5 h-5 rounded accent-blue-600"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Push Notifications */}
                                <div className="pt-8 border-t border-black/5 dark:border-white/5">
                                    <h3 className="text-[12px] font-semibold text-[#0d0d0d] dark:text-[#ececec] mb-2">
                                        Alertas de Navegador
                                    </h3>
                                    <label className="flex items-start justify-between p-4 bg-[#f7f7f8] dark:bg-[#2a2b32] rounded-lg border border-black/5 dark:border-white/5 cursor-pointer hover:border-black/10 dark:hover:border-white/10 transition-colors">
                                        <div className="flex-1">
                                            <div className="font-medium text-[#0d0d0d] dark:text-[#ececec] text-[12px] mb-1">
                                                Notificaciones Push
                                            </div>
                                            <div className="text-xs text-[#676767] dark:text-[#acacac]">
                                                Recibe alertas incluso con la pestaña cerrada
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={pushNotifications}
                                            onChange={(e) => setPushNotifications(e.target.checked)}
                                            className="mt-1 w-5 h-5 rounded accent-blue-600"
                                        />
                                    </label>
                                </div>

                                {/* Save Button */}
                                <div className="pt-4 border-t border-black/5 dark:border-white/5">
                                    <button className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-normal rounded-lg transition-colors flex items-center gap-2">
                                        <Save size={16} />
                                        Guardar Preferencias
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* INTEGRACIONES */}
                        {selectedSection === 'integrations' && (
                            <div className="space-y-6 max-w-2xl">
                                <p className="text-[12px] text-[#676767] dark:text-[#acacac]">
                                    Conecta Diktalo con tus herramientas favoritas.
                                </p>
                                <div className="text-[12px] text-[#676767] dark:text-[#acacac]">
                                    Integraciones próximamente disponibles.
                                </div>
                            </div>
                        )}

                        {/* CONFIGURACIÓN */}
                        {selectedSection === 'settings' && (
                            <div className="space-y-6 max-w-2xl">
                                <h3 className="text-[11px] font-semibold text-[#0d0d0d] dark:text-[#ececec] mb-2">
                                    Apariencia
                                </h3>

                                <div>
                                    <label className="block text-[11px] font-normal text-[#0d0d0d] dark:text-[#ececec] mb-2">
                                        Tema
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => setTheme('light')}
                                            className={`px-4 py-2 rounded-lg border text-[12px] font-normal transition-colors ${theme === 'light'
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-[#f7f7f8] dark:bg-[#2a2b32] border-black/10 dark:border-white/10 text-[#0d0d0d] dark:text-[#ececec] hover:border-black/20 dark:hover:border-white/20'
                                                }`}
                                        >
                                            Claro
                                        </button>
                                        <button
                                            onClick={() => setTheme('dark')}
                                            className={`px-4 py-2 rounded-lg border text-[12px] font-normal transition-colors ${theme === 'dark'
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-[#f7f7f8] dark:bg-[#2a2b32] border-black/10 dark:border-white/10 text-[#0d0d0d] dark:text-[#ececec] hover:border-black/20 dark:hover:border-white/20'
                                                }`}
                                        >
                                            Oscuro
                                        </button>
                                        <button
                                            onClick={() => setTheme('system')}
                                            className={`px-4 py-2 rounded-lg border text-[12px] font-normal transition-colors ${theme === 'system'
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-[#f7f7f8] dark:bg-[#2a2b32] border-black/10 dark:border-white/10 text-[#0d0d0d] dark:text-[#ececec] hover:border-black/20 dark:hover:border-white/20'
                                                }`}
                                        >
                                            Sistema
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PRIVACIDAD */}
                        {selectedSection === 'privacy' && (
                            <div className="space-y-8 max-w-2xl">
                                <div>
                                    <h3 className="text-[12px] font-semibold text-[#0d0d0d] dark:text-[#ececec] mb-2">
                                        Exportar Datos
                                    </h3>
                                    <p className="text-[12px] text-[#676767] dark:text-[#acacac] mb-2">
                                        Descarga una copia de todos tus datos.
                                    </p>
                                    <button className="px-5 py-1.5 bg-[#f7f7f8] dark:bg-[#2a2b32] text-[#0d0d0d] dark:text-[#ececec] text-[11px] font-normal rounded-lg hover:bg-[#ebebeb] dark:hover:bg-[#33343d] transition-colors flex items-center gap-2">
                                        <Download size={16} />
                                        Exportar Datos
                                    </button>
                                </div>

                                <div className="pt-8 border-t border-black/5 dark:border-white/5">
                                    <h3 className="text-[12px] font-semibold text-red-600 dark:text-red-400 mb-2">
                                        Eliminar Cuenta
                                    </h3>
                                    <p className="text-[12px] text-[#676767] dark:text-[#acacac] mb-2">
                                        Esta acción es permanente y no se puede deshacer.
                                    </p>
                                    <button className="px-5 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[11px] font-normal rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2">
                                        <Trash2 size={16} />
                                        Eliminar Mi Cuenta
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* AYUDA */}
                        {selectedSection === 'help' && (
                            <div className="space-y-4 max-w-2xl">
                                <button
                                    onClick={() => {
                                        onNavigate(AppRoute.MANUAL);
                                        onClose();
                                    }}
                                    className="w-full text-left p-5 bg-[#f7f7f8] dark:bg-[#2a2b32] rounded-xl hover:bg-[#ebebeb] dark:hover:bg-[#33343d] transition-colors border border-black/5 dark:border-white/5"
                                >
                                    <div className="font-semibold text-[#0d0d0d] dark:text-[#ececec] mb-1">
                                        Manual de Usuario
                                    </div>
                                    <div className="text-[12px] text-[#676767] dark:text-[#acacac]">
                                        Aprende a usar todas las funciones de Diktalo
                                    </div>
                                </button>

                                <div className="p-5 bg-[#f7f7f8] dark:bg-[#2a2b32] rounded-xl border border-black/5 dark:border-white/5">
                                    <div className="font-semibold text-[#0d0d0d] dark:text-[#ececec] mb-1">
                                        Chat de Soporte
                                    </div>
                                    <div className="text-[12px] text-[#676767] dark:text-[#acacac] mb-2">
                                        Habla con nuestro equipo de soporte
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (window.$crisp) {
                                                window.$crisp.push(['do', 'chat:open']);
                                            }
                                        }}
                                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-[11px] font-normal"
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
                        <h3 className="text-lg font-semibold text-[#0d0d0d] dark:text-[#ececec] mb-2">
                            ¿Cerrar sesión?
                        </h3>
                        <p className="text-[12px] text-[#676767] dark:text-[#acacac] mb-6">
                            ¿Estás seguro que deseas cerrar tu sesión?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 px-4 py-1.5 border border-black/10 dark:border-white/20 text-[#0d0d0d] dark:text-[#ececec] rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[11px] font-normal"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-[11px] font-normal"
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


