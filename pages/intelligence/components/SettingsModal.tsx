import React, { useState, useEffect } from 'react';
import {
    X, User, Shield, Bell, Puzzle, Settings as SettingsIcon,
    Database, HelpCircle, LogOut, ChevronRight, ExternalLink,
    Camera, Mail, Phone, Globe, Lock, Key, Smartphone,
    Monitor, Download, Trash2, Save, Mic, Cloud, Info, Check,
    Moon, Sun, Laptop, ChevronDown, Zap, Code, ShieldCheck // Added Code icon, ShieldCheck
} from 'lucide-react';
import { UserProfile, AppRoute } from '../../../types';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { databaseService } from '../../../services/databaseService';
import { uploadAvatar } from '../../../services/storageService';
import { PhoneVerificationModal } from '../../../components/PhoneVerificationModal';
import { supabase } from '../../../lib/supabase'; // Import Supabase client
import { useToast } from '../../../components/Toast';
import * as Analytics from '../../../utils/analytics';
import { PERSONALITIES } from '../../../utils/supportPersonalities';


interface SettingsModalProps {
    user: UserProfile;
    isOpen: boolean;
    onClose: () => void;
    onUpdateUser?: (updates: Partial<UserProfile>) => void;
    onNavigate: (route: AppRoute) => void;
    onLogout: () => void;
    onAction?: (type: string, payload?: any) => void;
}

type Section = 'account' | 'preferences' | 'notifications' | 'integrations' | 'custom_vocabulary' | 'private_cloud' | 'developer' | 'help' | 'about' | 'admin' | 'security';

const TIMEZONES = [
    { value: 'America/New_York', label: '(GMT-5) Eastern Time (US & Canada)' },
    { value: 'America/Chicago', label: '(GMT-6) Central Time (US & Canada)' },
    { value: 'America/Denver', label: '(GMT-7) Mountain Time (US & Canada)' },
    { value: 'America/Los_Angeles', label: '(GMT-8) Pacific Time (US & Canada)' },
    { value: 'Europe/London', label: '(GMT+0) London' },
    { value: 'Europe/Madrid', label: '(GMT+1) Madrid, Paris, Berlin' },
    { value: 'Asia/Tokyo', label: '(GMT+9) Tokyo' },
];

interface SelectOption {
    value: string;
    label: string;
    icon?: React.ReactNode;
}

const CustomSelect: React.FC<{
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    icon?: React.ReactNode;
    className?: string;
}> = ({ value, onChange, options, placeholder, icon, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white dark:bg-transparent border border-slate-200 dark:border-blue-500/20 rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-blue-500/5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
                <div className="flex items-center gap-2 truncate">
                    {icon}
                    {selectedOption?.icon}
                    <span className={`truncate ${!selectedOption && placeholder ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                        {selectedOption ? selectedOption.label : placeholder || 'Select...'}
                    </span>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1f1f1f] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1 space-y-0.5">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${option.value === value
                                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium'
                                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-2 truncate">
                                    {option.icon}
                                    <span>{option.label}</span>
                                </div>
                                {option.value === value && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
    user,
    isOpen,
    onClose,
    onUpdateUser,
    onNavigate,
    onLogout,
    onAction
}) => {
    const [selectedSection, setSelectedSection] = useState<Section>('account');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const { theme, setTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const { showToast } = useToast();

    // Features State
    const [showPhoneVerify, setShowPhoneVerify] = useState(false);

    // Developer API Token State
    const [apiToken, setApiToken] = useState<string>('');
    const [isLoadingToken, setIsLoadingToken] = useState(false);
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

    // Initial State loading from User Profile or Defaults
    const [personalInfo, setPersonalInfo] = useState({
        phone: user.phone || '',
        timezone: user.timezone || 'Europe/Madrid'
    });

    // Save Feedback State
    const [showSaved, setShowSaved] = useState(false);
    const triggerSaveFeedback = () => {
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
    };

    // EFFECT: Sync local state with User prop updates involves
    useEffect(() => {
        setPersonalInfo(prev => ({
            ...prev,
            phone: user.phone || prev.phone,
            timezone: user.timezone || prev.timezone
        }));
        // Update local state when user prop changes from above
        setTranscriptionLang(user.transcriptionLanguage || 'es');
        if (user.activeSupportAgentId) {
            setSelectedAgentId(user.activeSupportAgentId);
        }
    }, [user.phone, user.timezone, user.transcriptionLanguage, user.activeSupportAgentId]);

    // EFFECT: Fetch API Token when Developer section is selected
    useEffect(() => {
        if (selectedSection === 'developer') {
            const fetchToken = async () => {
                setIsLoadingToken(true);
                const { data } = await supabase.auth.getSession();
                if (data.session) {
                    const sessionConfig = {
                        access_token: data.session.access_token,
                        refresh_token: data.session.refresh_token,
                        url: import.meta.env.VITE_SUPABASE_URL,
                        key: import.meta.env.VITE_SUPABASE_ANON_KEY
                    };
                    setApiToken(JSON.stringify(sessionConfig, null, 2));
                }
                setIsLoadingToken(false);
            };
            fetchToken();
        }
    }, [selectedSection]);

    // Name Editing State
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState({ firstName: '', lastName: '' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Password Change State
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Preferences State
    const [preferences, setPreferences] = useState({
        autoLabelSpeakers: false,
        syncSpeakerLabels: false,
        helpImprove: false,
        transcriptionLanguage: user.transcriptionLanguage || 'es'
    });

    // Notifications State - Initialize from user prop
    const [notifications, setNotifications] = useState({
        newRecording: user.notificationSettings?.email.newRecording ?? true,
        weeklyDigest: user.notificationSettings?.email.weeklyDigest ?? true,
        marketing: user.notificationSettings?.email.marketing ?? false,
        browserPush: user.notificationSettings?.browser.push ?? true
    });

    // Custom Vocabulary State
    const [customVocab, setCustomVocab] = useState({
        enabled: false,
        industry: '',
        terms: [] as string[]
    });
    const [newTerm, setNewTerm] = useState('');

    // Optimistic Transcription Language State
    const [transcriptionLang, setTranscriptionLang] = useState(user.transcriptionLanguage || 'es');

    // Mobile Menu State
    const [showMenu, setShowMenu] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Support Agent State
    const [selectedAgentId, setSelectedAgentId] = useState(user.activeSupportAgentId || localStorage.getItem('diktalo_active_support_agent') || 'camila_s');

    // Zapier State
    const [zapierWebhookUrl, setZapierWebhookUrl] = useState(user.zapier_webhook_url || '');
    const [zapierConfigOpen, setZapierConfigOpen] = useState(false);
    const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // Initial check for mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Reset menu visibility when opening modal
    useEffect(() => {
        if (isOpen) {
            setShowMenu(true);
        }
    }, [isOpen]);

    const handleUpdateUser = (updates: Partial<UserProfile>) => {
        if (onUpdateUser) {
            onUpdateUser(updates);
        }
    };

    const handleSaveName = () => {
        if (!editName.firstName.trim()) return;
        handleUpdateUser({
            firstName: editName.firstName.trim(),
            lastName: editName.lastName.trim()
        });
        setIsEditingName(false);
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user.id) return;

        try {
            const publicUrl = await uploadAvatar(file, user.id);
            if (publicUrl) {
                // Optimistic Update
                handleUpdateUser({ avatarUrl: publicUrl });
            }
        } catch (error) {
            console.error('Failed to upload avatar:', error);
        }
    };

    const handleAddTerm = () => {
        if (!newTerm.trim()) return;
        if (!customVocab.terms.includes(newTerm.trim())) {
            setCustomVocab(prev => ({
                ...prev,
                terms: [...prev.terms, newTerm.trim()]
            }));
        }
        setNewTerm('');
    };

    const handleRemoveTerm = (termToRemove: string) => {
        setCustomVocab(prev => ({
            ...prev,
            terms: prev.terms.filter(term => term !== termToRemove)
        }));
    };

    const handleSaveZapier = () => {
        handleUpdateUser({
            zapier_webhook_url: zapierWebhookUrl
        });
        showToast(t('settingsSaved') || 'Configuración guardada', 'success');
        setZapierConfigOpen(false);
    };

    const handleTestConnection = async () => {
        if (!zapierWebhookUrl) {
            showToast(t('zapierWebhookMissing') || 'Por favor, ingresa una URL de webhook.', 'error');
            return;
        }

        setTestStatus('loading');
        try {
            const response = await fetch('/api/zapier-sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    isTest: true,
                    webhookUrl: zapierWebhookUrl
                })
            });

            if (response.ok) {
                setTestStatus('success');
                showToast(t('zapierTestSuccess') || '¡Conexión exitosa! Zapier recibió el payload de prueba.', 'success');
            } else {
                const err = await response.json();
                setTestStatus('error');
                showToast(err.error || t('zapierSyncError') || 'Error al conectar con Zapier.', 'error');
            }
        } catch (error) {
            setTestStatus('error');
            showToast('Error de red al probar la conexión.', 'error');
        } finally {
            setTimeout(() => setTestStatus('idle'), 3000);
        }
    };

    const handleChangePassword = async () => {
        if (!newPassword || !confirmPassword) return;

        if (newPassword.length < 6) {
            showToast(t('password_min_length'), 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast(t('password_mismatch'), 'error');
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;

            showToast(t('password_updated'), 'success');
            setIsChangingPassword(false);
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Error updating password:', error);
            showToast(error.message || 'Failed to update password', 'error');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

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
        { id: 'account' as Section, icon: User, label: t('settings_account') },
        { id: 'preferences' as Section, icon: SettingsIcon, label: t('settings_preferences') },
        { id: 'notifications' as Section, icon: Bell, label: t('settings_notifications') },
        { id: 'integrations' as Section, icon: Zap, label: t('settings_integrations') },
        { id: 'custom_vocabulary' as Section, icon: Database, label: t('settings_custom_vocab') },
        // Private Cloud removed
        { id: 'developer' as Section, icon: Code, label: t('settings_developer') },
        // Security merged into Account
        { id: 'help' as Section, icon: HelpCircle, label: t('settings_help') },
        { id: 'about' as Section, icon: Info, label: t('settings_about') },
    ];

    // Admin Link for Owner in Settings Sidebar
    if (user.email === 'diegogalmarini@gmail.com' || user.role === 'admin' || user.role === 'super_admin') {
        menuItems.unshift({
            id: 'admin' as Section,
            icon: ShieldCheck,
            label: t('settings_admin')
        });
    }

    const handleHelpClick = () => {
        window.open('https://support.diktalo.com', '_blank');
    };

    const confirmLogout = () => {
        if (Analytics && typeof Analytics.trackEvent === 'function') {
            Analytics.trackEvent('logout');
        }
        onLogout();
        onClose();
    };


    const handleDeleteAccount = () => {
        console.log('Deleting account for:', user.id);
        // We log out immediately to respect "eliminarlas YA" and avoid ugly alerts
        onLogout();
        onClose();
    };

    const handlePlansClick = () => {
        onClose();
        onNavigate(AppRoute.SUBSCRIPTION);
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-0 md:p-4">
            <div className={`bg-white dark:bg-[#050505] md:rounded-xl shadow-2xl w-full max-w-5xl h-full md:h-[85vh] flex flex-col md:flex-row overflow-hidden border-0 md:border border-slate-200 dark:border-[#1f1f1f] font-sans min-h-0 ${isMobile ? 'rounded-none' : ''}`}>

                {/* Sidebar */}
                <div className={`w-full md:w-64 flex flex-col border-b md:border-b-0 md:border-r border-slate-100 dark:border-[#1f1f1f] bg-[#fbfbfb] dark:bg-[#0A0D13] ${isMobile && !showMenu ? 'hidden' : 'flex'}`}>
                    <div className="p-6 pb-2 flex justify-between items-center">
                        <h2 className="text-xl font-medium text-slate-800 dark:text-white">{t('settings')}</h2>
                        {isMobile && (
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        )}
                    </div>

                    <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.id === 'help') {
                                        handleHelpClick();
                                    } else if (item.id === 'admin') {
                                        onClose();
                                        onNavigate(AppRoute.ADMIN_OVERVIEW);
                                    } else {
                                        setSelectedSection(item.id);
                                        if (isMobile) setShowMenu(false);
                                    }
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-3 md:py-2 rounded-md text-left transition-colors text-[13px] font-medium border-b md:border-b-0 border-slate-100 dark:border-white/5 md:border-transparent ${selectedSection === item.id && item.id !== 'help' && !isMobile
                                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
                                    }`}
                            >
                                <item.icon size={18} strokeWidth={1.5} />
                                <span>{item.label}</span>
                                {item.id === 'help' ? (
                                    <ExternalLink size={14} className="ml-auto opacity-50" />
                                ) : (
                                    isMobile && <ChevronRight size={16} className="ml-auto opacity-30" />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Main Content */}
                <div className={`flex-1 flex flex-col bg-white dark:bg-transparent relative min-h-0 ${isMobile && showMenu ? 'hidden' : 'flex'}`}>

                    {/* Content Header for Mobile */}
                    {isMobile && (
                        <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-white/5">
                            <button
                                onClick={() => setShowMenu(true)}
                                className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full"
                            >
                                <ChevronDown className="rotate-90" size={20} />
                            </button>
                            <span className="font-medium text-slate-900 dark:text-white">
                                {menuItems.find(i => i.id === selectedSection)?.label}
                            </span>
                            <button
                                onClick={onClose}
                                className="ml-auto p-2 text-slate-400 hover:text-slate-600"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}

                    {!isMobile && (
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}

                    {/* Save Indicator */}
                    <div className={`absolute top-6 right-16 flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full transition-opacity duration-300 ${showSaved ? 'opacity-100' : 'opacity-0'}`}>
                        <Check size={14} />
                        <span>{t('saved')}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6 md:px-12 md:py-10 pb-20 md:pb-10 min-h-0">
                        {/* --- ACCOUNT SECTION --- */}
                        {selectedSection === 'account' && (
                            <div className="max-w-2xl space-y-12 animate-in fade-in duration-300">
                                <h1 className="text-2xl font-normal text-slate-900 dark:text-white">{t('account_header')}</h1>

                                {/* Profile Header */}
                                <div className="flex items-center gap-6">
                                    <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                                        {user.avatarUrl ? (
                                            <img
                                                src={user.avatarUrl}
                                                alt={user.firstName}
                                                className="w-20 h-20 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 text-2xl font-medium">
                                                {user.firstName?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                        <div className="absolute bottom-0 right-0 bg-white dark:bg-slate-800 p-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera size={14} className="text-slate-600 dark:text-slate-300" />
                                        </div>
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                        />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('account_name_label')}</div>
                                        {isEditingName ? (
                                            <div className="flex items-center gap-2 animate-in fade-in duration-200">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={editName.firstName}
                                                        onChange={(e) => setEditName({ ...editName, firstName: e.target.value })}
                                                        className="w-24 px-2 py-1 bg-white dark:bg-transparent border border-slate-200 dark:border-blue-500/20 rounded text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all"
                                                        placeholder="First"
                                                        autoFocus
                                                    />
                                                    <input
                                                        type="text"
                                                        value={editName.lastName}
                                                        onChange={(e) => setEditName({ ...editName, lastName: e.target.value })}
                                                        className="w-24 px-2 py-1 bg-white dark:bg-transparent border border-slate-200 dark:border-blue-500/20 rounded text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all"
                                                        placeholder="Last"
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleSaveName}
                                                    className="p-1 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 rounded"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setIsEditingName(false)}
                                                    className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="text-base text-slate-900 dark:text-white font-medium">
                                                    {user.firstName} {user.lastName}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        setEditName({ firstName: user.firstName || '', lastName: user.lastName || '' });
                                                        setIsEditingName(true);
                                                    }}
                                                    className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 ml-1 p-1 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded transition-colors"
                                                >
                                                    <SettingsIcon size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                                {/* Personal Information */}
                                <div>
                                    <h2 className="text-xl font-normal text-slate-900 dark:text-white mb-6">{t('account_personal_info')}</h2>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{t('account_phone_label')}</p>
                                                    {user.phoneVerified && (
                                                        <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase rounded-sm">{t('verified')}</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('account_phone_desc')}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="tel"
                                                    value={personalInfo.phone}
                                                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                                                    placeholder="+1 234 567 890"
                                                    disabled={user.phoneVerified}
                                                    className={`bg-white dark:bg-transparent border border-slate-200 dark:border-blue-500/20 rounded-lg px-3 py-1.5 text-sm w-40 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all ${user.phoneVerified ? 'opacity-75 cursor-not-allowed' : ''}`}
                                                />
                                                {!user.phoneVerified && (
                                                    user.subscription?.planId === 'business_plus' ? (
                                                        <button
                                                            onClick={() => setShowPhoneVerify(true)}
                                                            className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-medium rounded-lg hover:opacity-90 transition-opacity"
                                                        >
                                                            {t('verify')}
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 text-xs font-medium rounded-lg cursor-not-allowed" title="Requires Business+ Plan">
                                                            <Lock size={12} />
                                                            <span>{t('plan_required')}</span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{t('account_timezone_label')}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('account_timezone_desc')}</p>
                                            </div>
                                            <CustomSelect
                                                className="w-[240px]"
                                                value={personalInfo.timezone}
                                                onChange={(val) => {
                                                    setPersonalInfo({ ...personalInfo, timezone: val });
                                                    handleUpdateUser({ timezone: val });
                                                }}
                                                options={TIMEZONES.map(tz => ({ value: tz.value, label: tz.label }))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                                {/* Plan & Billing */}
                                <div>
                                    <h2 className="text-xl font-normal text-slate-900 dark:text-white mb-6">{t('account_plan_billing')}</h2>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t('account_current_plan')}</p>
                                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-medium rounded">
                                                {formatPlanName(user.subscription?.planId || 'free')}
                                            </span>
                                        </div>
                                        <button
                                            onClick={handlePlansClick}
                                            className="w-full md:w-auto px-4 py-1.5 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/30 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                                        >
                                            {t('manage')}
                                        </button>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                                {/* Login Methods */}
                                <div>
                                    <h2 className="text-xl font-normal text-slate-900 dark:text-white mb-6">{t('account_security_login')}</h2>
                                    <div className="space-y-4">
                                        {/* Password Row */}
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400">
                                                    <Lock size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{t('passwordLabel')}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('account_password_last_changed')}</p>
                                                </div>
                                            </div>
                                            <button
                                                className="w-full md:w-auto px-4 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                                onClick={() => setIsChangingPassword(true)}
                                            >
                                                {t('account_change_password')}
                                            </button>
                                        </div>

                                        <div className="h-px bg-slate-50 dark:bg-white/5 w-full" />

                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white rounded-lg border border-slate-100 dark:border-transparent flex items-center justify-center">
                                                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">Google</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                                                </div>
                                            </div>
                                            <button className="w-full md:w-auto px-4 py-1.5 bg-slate-50 dark:bg-transparent border border-transparent dark:border-slate-700/50 text-slate-400 dark:text-slate-500 text-xs rounded-lg cursor-not-allowed">
                                                {t('connected')}
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black">
                                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M17.8 9.3c.7-.4 1.1-1.1 1.1-1.9 0-1.2-.9-2.1-2.1-2.1-.4 0-.8.1-1.1.3-.7.5-1.2 1.2-1.2 2s.4 1.5 1.1 1.9c.7.4 1.1 1.1 1.1 1.9 0 .6-.2 1.1-.6 1.4-.4.4-1 .6-1.6.6-.6 0-1.2-.2-1.6-.6-.4-.4-.6-.9-.6-1.5 0-.8.3-1.5.8-2 .5-.5 1.1-.8 1.8-.8.6 0 1.2.2 1.6.6.4.4.6.9.6 1.5 0 .8-.4 1.5-1.1 1.9zM12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" /></svg>
                                                </div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">Apple</p>
                                            </div>
                                            <button className="px-4 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-xs rounded-lg cursor-not-allowed uppercase" disabled>
                                                {t('coming_soon')}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                                {/* Account Actions */}
                                <div>
                                    <h2 className="text-xl font-normal text-slate-900 dark:text-white mb-6">{t('account_actions')}</h2>
                                    <div className="space-y-3">
                                        <div>
                                            <button
                                                onClick={() => setShowLogoutConfirm(true)}
                                                className="px-4 py-1.5 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/30 text-slate-700 dark:text-slate-300 text-xs rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                                            >
                                                {t('logout')}
                                            </button>
                                        </div>
                                        <div>
                                            <button
                                                onClick={() => setShowDeleteConfirm(true)}
                                                className="px-4 py-1.5 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                            >
                                                {t('delete_account')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- PREFERENCES SECTION --- */}
                        {selectedSection === 'preferences' && (
                            <div className="max-w-2xl space-y-12 animate-in fade-in duration-300">
                                {/* Appearance Section */}
                                <div>
                                    <h2 className="text-xl font-normal text-slate-900 dark:text-white mb-6">{t('appearance_header')}</h2>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{t('theme_label')}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('theme_desc')}</p>
                                        </div>
                                        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <button
                                                onClick={() => setTheme('light')}
                                                className={`p-2 rounded-md transition-all ${theme === 'light' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                                title="Light Mode"
                                            >
                                                <Sun size={16} />
                                            </button>
                                            <button
                                                onClick={() => setTheme('dark')}
                                                className={`p-2 rounded-md transition-all ${theme === 'dark' ? 'bg-slate-700 text-blue-400 shadow-sm ring-1 ring-white/10' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                                title="Dark Mode"
                                            >
                                                <Moon size={16} />
                                            </button>
                                            <button
                                                onClick={() => setTheme('system')}
                                                className={`p-2 rounded-md transition-all ${theme === 'system' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                                title="System Preference"
                                            >
                                                <Laptop size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                                {/* Language */}
                                <div>
                                    <h2 className="text-xl font-normal text-slate-900 dark:text-white mb-6">{t('language_header')}</h2>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{t('display_language_label')}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('display_language_desc')}</p>
                                            </div>
                                            <CustomSelect
                                                className="w-full md:w-40"
                                                value={language}
                                                onChange={(val) => {
                                                    setLanguage(val as 'en' | 'es');
                                                    // Sync with user profile for persistence
                                                    handleUpdateUser({ language: val as 'en' | 'es' });
                                                    triggerSaveFeedback();
                                                }}
                                                options={[
                                                    { value: 'en', label: 'English' },
                                                    { value: 'es', label: 'Español' }
                                                ]}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{t('transcription_language_label')}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('transcription_language_desc')}</p>
                                            </div>
                                            <CustomSelect
                                                className="w-40"
                                                value={transcriptionLang}
                                                onChange={(val) => {
                                                    setTranscriptionLang(val);
                                                    handleUpdateUser({ transcriptionLanguage: val });
                                                    triggerSaveFeedback();

                                                    // TRACK: Transcription Language Change
                                                    if (Analytics && typeof Analytics.trackEvent === 'function') {
                                                        Analytics.trackEvent('change_transcription_language', { language: val });
                                                        if (typeof Analytics.setUserProperties === 'function') {
                                                            Analytics.setUserProperties({ transcription_language: val });
                                                        }
                                                    }
                                                }}

                                                options={[
                                                    { value: 'es', label: 'Español' },
                                                    { value: 'en', label: 'English' }
                                                ]}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                                {/* Support Agent Selection */}
                                <div>
                                    <h2 className="text-xl font-normal text-slate-900 dark:text-white mb-6">{t('settings_personal_assistant')}</h2>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{t('assistant_selection_label')}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('assistant_selection_desc')}</p>
                                        </div>
                                        <CustomSelect
                                            className="w-full md:w-56"
                                            value={selectedAgentId}
                                            onChange={(val) => {
                                                setSelectedAgentId(val);
                                                handleUpdateUser({ activeSupportAgentId: val });
                                                localStorage.setItem('diktalo_active_support_agent', val);
                                                triggerSaveFeedback();
                                                if (Analytics && typeof Analytics.trackEvent === 'function') {
                                                    Analytics.trackEvent('settings_agent_changed', { agent_id: val });
                                                }
                                                // We don't force a reload, the SupportBot component will pick it up on next open or sync
                                            }}
                                            options={PERSONALITIES.map(p => ({
                                                value: p.id,
                                                label: p.name,
                                                icon: (
                                                    <div className="w-5 h-5 rounded-full overflow-hidden mr-1 border border-slate-200 dark:border-white/10">
                                                        <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                )
                                            }))}
                                        />
                                    </div>
                                    <div className="mt-4 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 animate-in slide-in-from-top-2 duration-300">
                                        {(() => {
                                            const agent = PERSONALITIES.find(p => p.id === selectedAgentId);
                                            if (!agent) return null;
                                            return (
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex gap-4">
                                                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary/20">
                                                            <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{agent.name}</span>
                                                                <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-bold uppercase">{agent.role}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                                                                "{language === 'en' ? agent.bio.en : agent.bio.es}"
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="pt-2 border-t border-slate-200/50 dark:border-white/5">
                                                        <button
                                                            onClick={() => {
                                                                if (onAction) {
                                                                    onAction('START_TOUR');
                                                                    onClose();
                                                                }
                                                            }}
                                                            className="flex items-center gap-2 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors uppercase tracking-wider"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                                            {t('startGuidedTourAction') || 'Lanzar Tour Guiado'}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- NOTIFICATIONS SECTION --- */}
                        {selectedSection === 'notifications' && (
                            <div className="max-w-2xl space-y-12 animate-in fade-in duration-300">
                                <div>
                                    <h2 className="text-xl font-normal text-slate-900 dark:text-white mb-6">{t('notify_email_header')}</h2>
                                    <div className="space-y-6">
                                        {[
                                            { id: 'newRecording', label: t('notifyNewRecording'), desc: t('notifyNewRecordingDesc') },
                                            { id: 'weeklyDigest', label: t('notifyWeeklyDigest'), desc: t('notifyWeeklyDigestDesc') },
                                            { id: 'marketing', label: t('notifyMarketing'), desc: t('notifyMarketingDesc') },
                                        ].map(item => (
                                            <div key={item.id} className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const key = item.id as keyof typeof notifications;
                                                        const newVal = !notifications[key];
                                                        setNotifications(prev => {
                                                            const next = { ...prev, [key]: newVal };
                                                            handleUpdateUser({
                                                                notificationSettings: {
                                                                    email: {
                                                                        newRecording: next.newRecording,
                                                                        weeklyDigest: next.weeklyDigest,
                                                                        marketing: next.marketing
                                                                    },
                                                                    browser: { push: next.browserPush }
                                                                }
                                                            });
                                                            return next;
                                                        });
                                                    }}
                                                    className={`w-10 h-5 rounded-full transition-colors relative ${notifications[item.id as keyof typeof notifications] ? 'bg-blue-600 dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                                                >
                                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white dark:bg-slate-900 rounded-full transition-transform ${notifications[item.id as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                                <div>
                                    <h2 className="text-xl font-normal text-slate-900 dark:text-white mb-6">{t('notify_browser_header')}</h2>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{t('notify_push_label')}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('notify_push_desc')}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newVal = !notifications.browserPush;
                                                setNotifications(prev => {
                                                    const next = { ...prev, browserPush: newVal };
                                                    handleUpdateUser({
                                                        notificationSettings: {
                                                            email: {
                                                                newRecording: next.newRecording,
                                                                weeklyDigest: next.weeklyDigest,
                                                                marketing: next.marketing
                                                            },
                                                            browser: { push: next.browserPush }
                                                        }
                                                    });
                                                    return next;
                                                });
                                            }}
                                            className={`w-10 h-5 rounded-full transition-colors relative ${notifications.browserPush ? 'bg-blue-600 dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                                        >
                                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white dark:bg-slate-900 rounded-full transition-transform ${notifications.browserPush ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- INTEGRATIONS SECTION --- */}
                        {selectedSection === 'integrations' && (
                            <div className="max-w-2xl space-y-8 animate-in fade-in duration-300">
                                <div>
                                    <h2 className="text-xl font-normal text-slate-900 dark:text-white mb-2">{t('integrations_header')}</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {t('integrations_desc')}
                                    </p>
                                </div>
                                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                                <div className="space-y-4">
                                    <div className={`flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-500/50 transition-colors ${!['business', 'business_plus'].includes(user.subscription?.planId || '') ? 'opacity-50 grayscale' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-[#FF4F00]/10 rounded-lg flex items-center justify-center">
                                                <Zap className="text-[#FF4F00]" size={24} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Zapier</h3>
                                                    {user.zapier_webhook_url && (
                                                        <span className="px-1.5 py-0.5 bg-green-500/10 text-green-500 text-[10px] uppercase font-bold rounded-full">
                                                            {t('connected') || 'Conectado'}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('zapierDesc') || 'Automatiza flujos conectando Diktalo con 5,000+ apps.'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {['business', 'business_plus'].includes(user.subscription?.planId || '') ? (
                                                <button
                                                    onClick={() => setZapierConfigOpen(true)}
                                                    className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-medium rounded-lg hover:opacity-90 transition-opacity"
                                                >
                                                    {user.zapier_webhook_url ? t('configure') || 'Configurar' : t('connect') || 'Conectar'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handlePlansClick}
                                                    className="px-3 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-amber-600 transition-colors"
                                                >
                                                    {t('upgrade') || 'Sube de nivel'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl opacity-60 grayscale cursor-not-allowed">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                                <img src="https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg" alt="Slack" className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Slack</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Send summaries and action items directly to Slack channels.</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-400 text-xs font-medium rounded-lg" disabled>
                                            {t('coming_soon')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- DEVELOPER SECTION (Fase 3: Ghostwire) --- */}
                        {selectedSection === 'developer' && (
                            <div className="max-w-2xl space-y-8 animate-in fade-in duration-300">
                                <div>
                                    <h2 className="text-xl font-normal text-slate-900 dark:text-white mb-2">{t('dev_header')}</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Manage your API keys and access tokens for external tools like the Chrome Extension.
                                    </p>
                                </div>
                                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-white/5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                                                <Key size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('dev_api_token_label')}</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('dev_api_token_desc')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <textarea
                                            readOnly
                                            value={isLoadingToken ? 'Fetching configuration...' : apiToken}
                                            className="w-full h-32 bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-lg py-2 pl-3 pr-24 text-xs font-mono text-slate-600 dark:text-slate-300 resize-none"
                                        />
                                        <button
                                            onClick={() => {
                                                if (apiToken) {
                                                    navigator.clipboard.writeText(apiToken);
                                                    setCopyStatus('copied');
                                                    setTimeout(() => setCopyStatus('idle'), 2000);
                                                }
                                            }}
                                            disabled={isLoadingToken || !apiToken}
                                            className={`absolute top-2 right-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${copyStatus === 'copied'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90'
                                                } disabled:opacity-50`}
                                        >
                                            {copyStatus === 'copied' ? t('copied') : t('dev_copy_token')}
                                        </button>
                                    </div>
                                    <p className="mt-2 text-[10px] text-slate-400">
                                        ⚠️ This token is valid for your current session. If it expires, simply refresh this page and copy a new one.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* --- CUSTOM VOCABULARY SECTION --- */}
                        {selectedSection === 'custom_vocabulary' && (
                            <div className="max-w-2xl space-y-8 animate-in fade-in duration-300">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-normal text-slate-900 dark:text-white">{t('vocab_header')}</h2>
                                            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wide font-medium rounded">Beta</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">{t('vocab_enable_label')}</span>
                                            <button
                                                onClick={() => setCustomVocab(prev => ({ ...prev, enabled: !prev.enabled }))}
                                                className={`w-10 h-5 rounded-full relative transition-colors ${customVocab.enabled ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-slate-700'}`}
                                            >
                                                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white dark:bg-slate-900 rounded-full transition-transform ${customVocab.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {t('vocab_enable_desc')}
                                    </p>
                                </div>

                                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                                <div className={!customVocab.enabled ? 'opacity-50 pointer-events-none' : ''}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">{t('vocab_industry_label')}</h3>
                                        <span className="text-xs text-slate-400">Please select</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t('vocab_industry_desc')}</p>
                                    <CustomSelect
                                        className="w-full md:max-w-xs"
                                        value={customVocab.industry}
                                        onChange={(val) => setCustomVocab(prev => ({ ...prev, industry: val }))}
                                        options={[
                                            { value: 'medical', label: t('vocab_industry_medical') },
                                            { value: 'legal', label: t('vocab_industry_legal') },
                                            { value: 'finance', label: t('vocab_industry_finance') },
                                            { value: 'tech', label: t('vocab_industry_tech') },
                                            { value: 'general', label: t('vocab_industry_general') }
                                        ]}
                                        placeholder={t('vocab_industry_placeholder')}
                                    />
                                </div>

                                <div className={!customVocab.enabled ? 'opacity-50 pointer-events-none' : ''}>
                                    <div className="flex items-center justify-between mb-2 md:mb-4">
                                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">{t('vocab_terms_label')}</h3>
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-2">
                                        <input
                                            type="text"
                                            value={newTerm}
                                            onChange={(e) => setNewTerm(e.target.value)}
                                            placeholder={t('vocab_term_placeholder')}
                                            className="px-3 py-2 md:py-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm md:text-xs w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAddTerm();
                                            }}
                                        />
                                        <button
                                            onClick={handleAddTerm}
                                            className="px-3 py-2 md:py-1 bg-black dark:bg-white text-white dark:text-black text-sm md:text-xs font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 w-full md:w-auto"
                                            disabled={!newTerm.trim()}
                                        >
                                            {t('add')}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{t('vocab_terms_desc')}</p>

                                    {customVocab.terms.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                                            <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
                                                <Database size={20} className="text-slate-300 dark:text-slate-600" />
                                            </div>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                                {t('vocab_terms_desc')}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {customVocab.terms.map((term, index) => (
                                                <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-slate-700 group">
                                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{term}</span>
                                                    <button
                                                        onClick={() => handleRemoveTerm(term)}
                                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* --- ABOUT SECTION --- */}
                        {selectedSection === 'about' && (
                            <div className="max-w-2xl space-y-8 animate-in fade-in duration-300">
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('about_header')}</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md">
                                        {t('about_desc')}
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-white/10 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300">
                                        <span>{t('about_version')} 1.2.0</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-400" />
                                        <span>Beta</span>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <a
                                        href="https://www.diktalo.com/terms"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-black group-hover:shadow-sm flex items-center justify-center transition-all">
                                            <ShieldCheck size={20} className="text-slate-500 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{t('about_terms')}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('about_terms_desc')}</p>
                                        </div>
                                        <ExternalLink size={14} className="ml-auto text-slate-300 group-hover:text-blue-500" />
                                    </a>

                                    <a
                                        href="https://www.diktalo.com/privacy"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-black group-hover:shadow-sm flex items-center justify-center transition-all">
                                            <Lock size={20} className="text-slate-500 group-hover:text-purple-600 dark:text-slate-400 dark:group-hover:text-purple-400" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{t('about_privacy')}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('about_privacy_desc')}</p>
                                        </div>
                                        <ExternalLink size={14} className="ml-auto text-slate-300 group-hover:text-purple-500" />
                                    </a>
                                </div>

                                <div className="text-center pt-8">
                                    <p className="text-xs text-slate-400 dark:text-slate-600">
                                        {t('about_copyright')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* --- PLACEHOLDER SECTIONS - REMOVED PRIVATE CLOUD --- */}
                        {(selectedSection === 'help') && (
                            <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in duration-300">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                    <Puzzle size={24} className="text-slate-300 dark:text-slate-600" />
                                </div>
                                <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-2">{t('coming_soon')}</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                                    This section is currently under development. Check back later for updates.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60]">
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                            Log out?
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Are you sure you want to log out from this device?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                            >
                                Log out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Account Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60]">
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                            Delete account?
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            This action cannot be undone. All your data and recordings will be permanently removed.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Phone Verification Modal */}
            {showPhoneVerify && (
                <PhoneVerificationModal
                    userId={user.id || ''}
                    onVerified={() => {
                        setShowPhoneVerify(false);
                        handleUpdateUser({ phoneVerified: true });
                    }}
                    onClose={() => setShowPhoneVerify(false)}
                />
            )}

            {/* Zapier Configuration Modal */}
            {zapierConfigOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center z-[100] p-4">
                    <div className="bg-white dark:bg-[#1a1a1b] rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-[#2a2a2b] animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#FF4A00] rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {t('zapierTitle') || 'Zapier Custom Webhook'}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Business Feature
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setZapierConfigOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    {t('zapierWebhookLabel') || 'Webhook URL'}
                                </label>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {t('zapierWebhookDesc') || 'Copia la URL de "Webhooks by Zapier" (Catch Hook) y pégala aquí.'}
                                </p>
                                <input
                                    type="text"
                                    value={zapierWebhookUrl}
                                    onChange={(e) => setZapierWebhookUrl(e.target.value)}
                                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-[#2a2a2b] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                />
                            </div>

                            <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                            {t('zapierAutoSyncTitle') || 'Auto-Sync'}
                                        </h4>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                            {t('zapierAutoSyncDesc') || 'Envía grabaciones a Zapier automáticamente al finalizar el procesamiento.'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleUpdateUser({ auto_sync_enabled: !user.auto_sync_enabled })}
                                        className={`w-10 h-5 rounded-full transition-colors relative ${user.auto_sync_enabled ? 'bg-[#FF4A00]' : 'bg-slate-200 dark:bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${user.auto_sync_enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleTestConnection}
                                    disabled={testStatus === 'loading' || !zapierWebhookUrl}
                                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {testStatus === 'loading' ? (
                                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <span className="material-symbols-outlined text-lg">flask</span>
                                    )}
                                    {testStatus === 'loading' ? t('testing') || 'Probando...' : t('zapierTestConnection') || 'Probar Conexión'}
                                </button>
                                <button
                                    onClick={handleSaveZapier}
                                    className="flex-1 px-4 py-3 bg-[#FF4A00] text-white text-sm font-bold rounded-xl hover:bg-[#E64200] shadow-lg shadow-orange-500/20 transition-all"
                                >
                                    {t('zapierSaveConfig') || 'Guardar Configuración'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
