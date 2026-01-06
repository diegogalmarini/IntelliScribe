import React, { useState, useEffect } from 'react';
import {
    X, User, Shield, Bell, Puzzle, Settings as SettingsIcon,
    Database, HelpCircle, LogOut, ChevronRight, ExternalLink,
    Camera, Mail, Phone, Globe, Lock, Key, Smartphone,
    Monitor, Download, Trash2, Save, Mic, Cloud, Info, Check,
    Moon, Sun, Laptop, ChevronDown, Zap, Code // Added Code icon
} from 'lucide-react';
import { UserProfile, AppRoute } from '../../../types';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { databaseService } from '../../../services/databaseService';
import { uploadAvatar } from '../../../services/storageService';
import { PhoneVerificationModal } from '../../../components/PhoneVerificationModal';
import { supabase } from '../../../lib/supabase'; // Import Supabase client

interface SettingsModalProps {
    user: UserProfile;
    isOpen: boolean;
    onClose: () => void;
    onUpdateUser?: (updates: Partial<UserProfile>) => void;
    onNavigate: (route: AppRoute) => void;
    onLogout: () => void;
}

type Section = 'account' | 'preferences' | 'notifications' | 'integrations' | 'custom_vocabulary' | 'private_cloud' | 'developer' | 'help' | 'about';

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
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-2 truncate">
                                    {option.icon}
                                    <span>{option.label}</span>
                                </div>
                                {option.value === value && <Check size={14} className="text-primary" />}
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
    onLogout
}) => {
    const [selectedSection, setSelectedSection] = useState<Section>('account');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const { theme, setTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();

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

    // EFFECT: Sync local state with User prop updates involves
    useEffect(() => {
        setPersonalInfo(prev => ({
            ...prev,
            phone: user.phone || prev.phone,
            timezone: user.timezone || prev.timezone
        }));
    }, [user.phone, user.timezone]);

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

    // Preferences State
    const [preferences, setPreferences] = useState({
        autoLabelSpeakers: false,
        syncSpeakerLabels: false,
        helpImprove: false,
        transcriptionLanguage: 'Español'
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
        { id: 'account' as Section, icon: User, label: 'Account' },
        { id: 'preferences' as Section, icon: SettingsIcon, label: 'Preferences' },
        { id: 'notifications' as Section, icon: Bell, label: 'Notifications' },
        { id: 'integrations' as Section, icon: Zap, label: 'Integrations' },
        { id: 'custom_vocabulary' as Section, icon: Database, label: 'Custom vocabulary' },
        { id: 'private_cloud' as Section, icon: Cloud, label: 'Private Cloud Sync' },
        { id: 'developer' as Section, icon: Code, label: 'Developer' },
        { id: 'help' as Section, icon: HelpCircle, label: 'Help Center' },
        { id: 'about' as Section, icon: Info, label: 'About Diktalo' },
    ];

    const handleHelpClick = () => {
        window.open('https://support.diktalo.com', '_blank');
    };

    const confirmLogout = () => {
        onLogout();
        onClose();
    };

    const handleDeleteAccount = () => {
        console.log('Deleting account for:', user.id);
        alert('Account deleted successfully (Mock)');
        onLogout();
        onClose();
    };

    const handlePlansClick = () => {
        onClose();
        onNavigate(AppRoute.SUBSCRIPTION);
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#0f1115] rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex overflow-hidden border border-slate-200 dark:border-white/10 font-sans">

                {/* Sidebar */}
                <div className="w-64 flex flex-col border-r border-slate-100 dark:border-white/5 bg-[#fbfbfb] dark:bg-transparent">
                    <div className="p-6 pb-2">
                        <h2 className="text-xl font-medium text-slate-800 dark:text-white">Settings</h2>
                    </div>

                    <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.id === 'help') {
                                        handleHelpClick();
                                    } else {
                                        setSelectedSection(item.id);
                                    }
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors text-[13px] font-medium ${selectedSection === item.id && item.id !== 'help'
                                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
                                    }`}
                            >
                                <item.icon size={18} strokeWidth={1.5} />
                                <span>{item.label}</span>
                                {item.id === 'help' && <ExternalLink size={14} className="ml-auto opacity-50" />}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col bg-white dark:bg-[#1a1a1a] relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex-1 overflow-y-auto px-12 py-10">
                        {/* --- ACCOUNT SECTION --- */}
                        {selectedSection === 'account' && (
                            <div className="max-w-2xl space-y-12 animate-in fade-in duration-300">
                                <h1 className="text-2xl font-normal text-slate-900 dark:text-white">Account</h1>

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
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Name</div>
                                        {isEditingName ? (
                                            <div className="flex items-center gap-2 animate-in fade-in duration-200">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={editName.firstName}
                                                        onChange={(e) => setEditName({ ...editName, firstName: e.target.value })}
                                                        className="w-24 px-2 py-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                        placeholder="First"
                                                        autoFocus
                                                    />
                                                    <input
                                                        type="text"
                                                        value={editName.lastName}
                                                        onChange={(e) => setEditName({ ...editName, lastName: e.target.value })}
                                                        className="w-24 px-2 py-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1 p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded transition-colors"
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
                                    <h2 className="text-xl font-normal text-slate-900 dark:text-white mb-6">Personal Information</h2>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">Phone number</p>
                                                    {user.phoneVerified && (
                                                        <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase rounded-sm">Verified</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Used for Caller ID in outbound calls.</p>
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
                                                            Verify
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 text-xs font-medium rounded-lg cursor-not-allowed" title="Requires Business+ Plan">
                                                            <Lock size={12} />
                                                            <span>Plan Required</span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">Time zone</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your local time for meetings and recordings.</p>
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
                                    <h2 className="text-xl font-normal text-slate-900 dark:text-white mb-6">Plan & billing</h2>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Current Plan</p>
                                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-medium rounded">
                                                {formatPlanName(user.subscription?.planId || 'free')}
                                            </span>
                                        </div>
                                        <button
                                            onClick={handlePlansClick}
                                            className="px-4 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                        >
                                            Manage
                                        </button>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                                {/* Login Methods */}
                                <div>
                                    <h2 className="text-xl font-normal text-slate-900 dark:text-white mb-6">Login methods</h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">Google</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                                                </div>
                                            </div>
                                            <button className="px-4 py-1.5 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500 text-xs rounded-lg cursor-not-allowed">
                                                Remove
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
                                                Coming Soon
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                                {/* Account Actions */}
                                <div>
                                    <h2 className="text-xl font-normal text-slate-900 dark:text-white mb-6">Account actions</h2>
                                    <div className="space-y-3">
                                        <div>
                                            <button
                                                onClick={() => setShowLogoutConfirm(true)}
                                                className="px-4 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                            >
                                                Log out
                                            </button>
                                        </div>
                                        <div>
                                            <button
                                                onClick={() => setShowDeleteConfirm(true)}
                                                className="px-4 py-1.5 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                            >
                                                Delete account
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
                                    <h2 className="text-xl font-normal text-slate-900 dark:text-white mb-6">Appearance</h2>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">Theme</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Choose how Diktalo looks to you.</p>
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
                                    <h2 className="text-xl font-normal text-slate-900 dark:text-white mb-6">Language</h2>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">Display language</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select your preferred language for using Diktalo.</p>
                                            </div>
                                            <CustomSelect
                                                className="w-40"
                                                value={language}
                                                onChange={(val) => setLanguage(val as 'en' | 'es')}
                                                options={[
                                                    { value: 'en', label: 'English' },
                                                    { value: 'es', label: 'Español' }
                                                ]}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">Transcription language</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Default language for analysis and transcription.</p>
                                            </div>
                                            <CustomSelect
                                                className="w-40"
                                                value={preferences.transcriptionLanguage || 'Español'}
                                                onChange={(val) => setPreferences({ ...preferences, transcriptionLanguage: val })}
                                                options={[
                                                    { value: 'Español', label: 'Español' },
                                                    { value: 'English', label: 'English' },
                                                    { value: 'Français', label: 'Français' },
                                                ]}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- NOTIFICATIONS SECTION --- */}
                        {selectedSection === 'notifications' && (
                            <div className="max-w-2xl space-y-12 animate-in fade-in duration-300">
                                <div>
                                    <h2 className="text-xl font-normal text-slate-900 dark:text-white mb-6">Email notifications</h2>
                                    <div className="space-y-6">
                                        {[
                                            { id: 'newRecording', label: 'New recording', desc: 'Get notified when a new recording is finished.' },
                                            { id: 'weeklyDigest', label: 'Weekly digest', desc: 'Get a weekly summary of your recording activity.' },
                                            { id: 'marketing', label: 'Product updates', desc: 'Receive news about new features and updates.' },
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
                                    <h2 className="text-xl font-normal text-slate-900 dark:text-white mb-6">Browser notifications</h2>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">Push notifications</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Receive notifications in your browser when Diktalo is open.</p>
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
                                    <h2 className="text-xl font-normal text-slate-900 dark:text-white mb-2">Integrations</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Connect Diktalo with your favorite tools to automate your workflow.
                                    </p>
                                </div>
                                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-500/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-[#FF4F00]/10 rounded-lg flex items-center justify-center">
                                                <img src="https://cdn.worldvectorlogo.com/logos/zapier.svg" alt="Zapier" className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Zapier</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Automate workflows by connecting Diktalo to 5,000+ apps.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => window.open('https://zapier.com/apps/diktalo', '_blank')}
                                            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-medium rounded-lg hover:opacity-90 transition-opacity"
                                        >
                                            Connect
                                        </button>
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
                                            Soon
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- DEVELOPER SECTION (Fase 3: Ghostwire) --- */}
                        {selectedSection === 'developer' && (
                            <div className="max-w-2xl space-y-8 animate-in fade-in duration-300">
                                <div>
                                    <h2 className="text-xl font-normal text-slate-900 dark:text-white mb-2">Developer Settings</h2>
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
                                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Extension Configuration</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Copy this JSON configuration to the Chrome Extension to enable persistent authentication.</p>
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
                                            {copyStatus === 'copied' ? t('copied') : t('copy')}
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
                                            <h2 className="text-xl font-normal text-slate-900 dark:text-white">Custom vocabulary</h2>
                                            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wide font-medium rounded">Beta</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">Enable custom vocabulary</span>
                                            <button
                                                onClick={() => setCustomVocab(prev => ({ ...prev, enabled: !prev.enabled }))}
                                                className={`w-10 h-5 rounded-full relative transition-colors ${customVocab.enabled ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-slate-700'}`}
                                            >
                                                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white dark:bg-slate-900 rounded-full transition-transform ${customVocab.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        AI prioritizes terminology from your selected field and custom terms to improve transcription accuracy.
                                    </p>
                                </div>

                                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                                <div className={!customVocab.enabled ? 'opacity-50 pointer-events-none' : ''}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">Industry</h3>
                                        <span className="text-xs text-slate-400">Please select</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Select your industry to help AI learn your field's context.</p>
                                    <CustomSelect
                                        className="w-full max-w-xs"
                                        value={customVocab.industry}
                                        onChange={(val) => setCustomVocab(prev => ({ ...prev, industry: val }))}
                                        options={[
                                            { value: 'medical', label: 'Medical / Healthcare' },
                                            { value: 'legal', label: 'Legal' },
                                            { value: 'finance', label: 'Finance / Banking' },
                                            { value: 'tech', label: 'Technology / Engineering' },
                                            { value: 'general', label: 'General Business' }
                                        ]}
                                        placeholder="Select industry..."
                                    />
                                </div>

                                <div className={!customVocab.enabled ? 'opacity-50 pointer-events-none' : ''}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">Vocabulary</h3>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newTerm}
                                                onChange={(e) => setNewTerm(e.target.value)}
                                                placeholder="Enter term..."
                                                className="px-3 py-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs w-48 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleAddTerm();
                                                }}
                                            />
                                            <button
                                                onClick={handleAddTerm}
                                                className="px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-xs font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                                disabled={!newTerm.trim()}
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Add names, companies or industry-specific terms you use often.</p>

                                    {customVocab.terms.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                                            <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
                                                <Database size={20} className="text-slate-300 dark:text-slate-600" />
                                            </div>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                                Add custom terms to improve transcription accuracy.
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

                        {/* --- PLACEHOLDER SECTIONS --- */}
                        {(selectedSection === 'private_cloud' || selectedSection === 'help' || selectedSection === 'about') && (
                            <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in duration-300">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                    <Puzzle size={24} className="text-slate-300 dark:text-slate-600" />
                                </div>
                                <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Coming Soon</h2>
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
        </div>
    );
};
