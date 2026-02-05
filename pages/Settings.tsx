
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { ThemeToggle } from '../components/ThemeToggle';
import { uploadAvatar, checkStorageLimit } from '../services/storageService';
import { supabase } from '../lib/supabase';

type SettingsTab = 'profile' | 'security' | 'notifications' | 'developer' | 'credits';

interface SettingsProps {
    user: UserProfile;
    onUpdateUser: (updatedUser: Partial<UserProfile>) => void;
    onLogout: () => void;
    initialTab?: SettingsTab; // Add initialTab prop
}

export const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser, onLogout, initialTab = 'profile' }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

    // Update tab if initialTab prop changes
    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    // Handle deep links via query params (e.g. /settings?tab=credits)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab === 'credits') {
            setActiveTab('credits');
        }
    }, []);

    // Expose tab navigation to window (for Dialer usage)
    useEffect(() => {
        (window as any).navigateToSettings = (tab: SettingsTab) => {
            setActiveTab(tab);
        };
        return () => {
            delete (window as any).navigateToSettings;
        };
    }, []);

    // Local state form for Profile
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [email, setEmail] = useState(user.email);
    const [phone, setPhone] = useState(user.phone || '');
    const [phoneVerified, setPhoneVerified] = useState(user.phoneVerified || false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl);

    // Notification State
    const [notifyNewRecording, setNotifyNewRecording] = useState(true);
    const [notifyWeeklyDigest, setNotifyWeeklyDigest] = useState(true);
    const [notifyMarketing, setNotifyMarketing] = useState(false);
    const [notifyBrowserPush, setNotifyBrowserPush] = useState(true);



    // Feedback state
    const [feedback, setFeedback] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Ref for the hidden file input
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Storage Usage State
    const [storageUsed, setStorageUsed] = useState<number>(0);
    const [storageLimit, setStorageLimit] = useState<number>(0);
    const [isLoadingStorage, setIsLoadingStorage] = useState(true);

    // API Token State (for Developer tab)
    const [apiToken, setApiToken] = useState<string>('');
    const [tokenCopied, setTokenCopied] = useState(false);
    const [loadingToken, setLoadingToken] = useState(false);

    // Fetch storage usage on mount
    useEffect(() => {
        const fetchStorageUsage = async () => {
            if (user.subscription?.planId === 'free') {
                setIsLoadingStorage(false);
                return;
            }

            try {
                const result = await checkStorageLimit(user.id, 0);
                setStorageUsed(result.currentUsage);
                setStorageLimit(result.limit);
            } catch (error) {
                console.error('Failed to fetch storage usage:', error);
            } finally {
                setIsLoadingStorage(false);
            }
        };

        fetchStorageUsage();
    }, [user.id, user.subscription?.planId]);

    // Load API token for Developer tab
    useEffect(() => {
        const loadApiToken = async () => {
            setLoadingToken(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.access_token) {
                    setApiToken(session.access_token);
                }
            } catch (error) {
                console.error('Failed to load API token:', error);
            } finally {
                setLoadingToken(false);
            }
        };

        loadApiToken();
    }, []);

    // Sync local state if user prop changes (e.g. initial load or external update)
    useEffect(() => {
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setEmail(user.email);
        setPhone(user.phone || '');
        setPhoneVerified(user.phoneVerified || false);
        setAvatarUrl(user.avatarUrl);
    }, [user]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarUrl(reader.result as string); // Preview
            };
            reader.readAsDataURL(file);
        }
    };



    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        // Validate inputs
        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
            setFeedback({ message: "Please fill in all required fields.", type: 'error' });
            setTimeout(() => setFeedback(null), 3000);
            return;
        }

        setIsSaving(true);
        let finalAvatarUrl = avatarUrl;

        // Upload avatar if a new file is selected
        if (selectedFile) {
            try {
                const uploadedUrl = await uploadAvatar(selectedFile, user.id);
                if (uploadedUrl) {
                    finalAvatarUrl = uploadedUrl;
                }
            } catch (err) {
                console.error("Avatar upload failed", err);
                setFeedback({ message: "Failed to upload avatar image.", type: 'error' });
            }
        }

        // Update global state
        onUpdateUser({
            firstName,
            lastName,
            email,
            phone,
            avatarUrl: finalAvatarUrl
        });

        setIsSaving(false);
        setFeedback({ message: "Changes saved successfully.", type: 'success' });
        setTimeout(() => setFeedback(null), 3000);
    };

    const handleCancel = () => {
        // Reset to props
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setEmail(user.email);
        setPhone(user.phone || '');
        setPhoneVerified(user.phoneVerified || false);
        setAvatarUrl(user.avatarUrl);

        setFeedback({ message: "Changes discarded.", type: 'success' });
        setTimeout(() => setFeedback(null), 3000);
    };

    const handleCopyToken = () => {
        navigator.clipboard.writeText(apiToken);
        setTokenCopied(true);
        setTimeout(() => setTokenCopied(false), 2000);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
                        <section>
                            <h4 className="text-slate-900 dark:text-white text-lg font-bold mb-6">{t('personalInfo')}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-700 dark:text-white text-sm font-medium">{t('firstName')}</label>
                                    <input
                                        className="bg-white dark:bg-surface-dark text-slate-900 dark:text-white border border-slate-300 dark:border-border-dark rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-700 dark:text-white text-sm font-medium">{t('lastName')}</label>
                                    <input
                                        className="bg-white dark:bg-surface-dark text-slate-900 dark:text-white border border-slate-300 dark:border-border-dark rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-2 md:col-span-2">
                                    <label className="text-slate-700 dark:text-white text-sm font-medium">{t('emailLabel')}</label>
                                    <input
                                        className="bg-white dark:bg-surface-dark text-slate-900 dark:text-white border border-slate-300 dark:border-border-dark rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>


                                {/* Phone Verification Section - Only for Business Plus */}
                                {user.subscription?.planId === 'business_plus' && (
                                    <div className="flex flex-col gap-2 md:col-span-2 border-t border-slate-200 dark:border-border-dark pt-6 mt-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-slate-700 dark:text-white text-sm font-medium">{t('phoneLabel')}</label>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${phoneVerified ? 'bg-brand-green/10 text-brand-green' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                {phoneVerified ? t('verified') : t('unverified')}
                                            </span>
                                        </div>

                                        <input
                                            className="flex-1 bg-slate-50 dark:bg-surface-dark/50 text-slate-900 dark:text-white border border-slate-300 dark:border-border-dark rounded-lg px-4 py-2.5 outline-none cursor-not-allowed opacity-70 w-full"
                                            value={phone}
                                            disabled={true}
                                            placeholder="+1 555 123 4567"
                                        />
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                            {t('verifyDescPart1')}
                                            <span className="inline-flex items-center justify-center w-5 h-5 bg-orange-500 text-white rounded-full align-middle mx-1 shadow-sm transform hover:scale-110 transition-transform cursor-pointer">
                                                <span className="material-symbols-outlined text-[12px] leading-none">call</span>
                                            </span>
                                            {t('verifyDescPart2')}
                                        </p>
                                    </div>
                                )}


                                {/* Upgrade Teaser for Non-Business Plus */}
                                {user.subscription?.planId !== 'business_plus' && (
                                    <div className="flex flex-col gap-2 md:col-span-2 border-t border-slate-200 dark:border-border-dark pt-6 mt-2 opacity-60">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-slate-700 dark:text-white text-sm font-medium">{t('phoneLabel')}</label>
                                            <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase bg-slate-100 text-slate-500">
                                                {t('businessPlusOnly')}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                className="flex-1 bg-slate-50 dark:bg-surface-dark/50 text-slate-500 border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2.5 outline-none cursor-not-allowed"
                                                value={phone}
                                                disabled={true}
                                                placeholder="+1 555 123 4567"
                                            />
                                        </div>
                                        <p className="text-xs text-brand-blue mt-1">
                                            {t('upgradeTeaser')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Storage Usage Section */}
                        <section>
                            <h4 className="text-slate-900 dark:text-white text-lg font-bold mb-6">{t('storageUsage')}</h4>
                            {user.subscription?.planId === 'free' ? (
                                <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">info</span>
                                        <div>
                                            <p className="text-blue-900 dark:text-blue-200 text-sm font-medium mb-1">
                                                {t('storageNoLimit')}
                                            </p>
                                            <p className="text-blue-700 dark:text-blue-300 text-xs">
                                                {t('storageRetention')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : isLoadingStorage ? (
                                <div className="flex items-center justify-center p-8">
                                    <span className="material-symbols-outlined animate-spin text-primary text-2xl">progress_activity</span>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                                {(storageUsed / 1073741824).toFixed(2)} GB
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {t('storageUsed')} {(storageLimit / 1073741824).toFixed(0)} GB
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {((storageUsed / storageLimit) * 100).toFixed(1)}% used
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${(storageUsed / storageLimit) > 0.9
                                                ? 'bg-gradient-to-r from-red-500 to-red-600'
                                                : (storageUsed / storageLimit) > 0.75
                                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                                    : 'bg-gradient-to-r from-primary to-blue-600'
                                                }`}
                                            style={{ width: `${Math.min((storageUsed / storageLimit) * 100, 100)}%` }}
                                        />
                                    </div>

                                    {/* Warning if close to limit */}
                                    {(storageUsed / storageLimit) > 0.9 && (
                                        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                                            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-lg">warning</span>
                                            <p className="text-red-700 dark:text-red-300 text-xs">
                                                Storage almost full. Please delete old recordings or upgrade your plan.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
                        <section>
                            <h4 className="text-slate-900 dark:text-white text-lg font-bold mb-6">{t('notifyEmailGroup')}</h4>
                            <div className="flex flex-col gap-4">
                                {/* Toggle 1 */}
                                <div className="flex items-center justify-between p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl">
                                    <div>
                                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">{t('notifyNewRecording')}</h5>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('notifyNewRecordingDesc')}</p>
                                    </div>
                                    <div className="form-control">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={notifyNewRecording} onChange={() => setNotifyNewRecording(!notifyNewRecording)} />
                                            <div className="w-11 h-6 bg-slate-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                                        </label>
                                    </div>
                                </div>

                                {/* Toggle 2 */}
                                <div className="flex items-center justify-between p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl">
                                    <div>
                                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">{t('notifyWeeklyDigest')}</h5>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('notifyWeeklyDigestDesc')}</p>
                                    </div>
                                    <div className="form-control">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={notifyWeeklyDigest} onChange={() => setNotifyWeeklyDigest(!notifyWeeklyDigest)} />
                                            <div className="w-11 h-6 bg-slate-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                                        </label>
                                    </div>
                                </div>

                                {/* Toggle 3 */}
                                <div className="flex items-center justify-between p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl">
                                    <div>
                                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">{t('notifyMarketing')}</h5>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('notifyMarketingDesc')}</p>
                                    </div>
                                    <div className="form-control">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={notifyMarketing} onChange={() => setNotifyMarketing(!notifyMarketing)} />
                                            <div className="w-11 h-6 bg-slate-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h4 className="text-slate-900 dark:text-white text-lg font-bold mb-6">{t('notifyBrowserGroup')}</h4>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl">
                                    <div>
                                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">{t('notifyBrowserPush')}</h5>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('notifyBrowserPushDesc')}</p>
                                    </div>
                                    <div className="form-control">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={notifyBrowserPush} onChange={() => setNotifyBrowserPush(!notifyBrowserPush)} />
                                            <div className="w-11 h-6 bg-slate-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                );
            case 'security':
                return (
                    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
                        <section>
                            <h4 className="text-slate-900 dark:text-white text-lg font-bold mb-6">{t('securityTitle')}</h4>
                            <div className="flex flex-col gap-6 max-w-xl">
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-700 dark:text-white text-sm font-medium">{t('currentPassword')}</label>
                                    <input type="password" className="bg-white dark:bg-surface-dark text-slate-900 dark:text-white border border-slate-300 dark:border-border-dark rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none" placeholder="••••••••" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-700 dark:text-white text-sm font-medium">{t('newPasswordLabel')}</label>
                                    <input type="password" className="bg-white dark:bg-surface-dark text-slate-900 dark:text-white border border-slate-300 dark:border-border-dark rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none" placeholder="••••••••" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-700 dark:text-white text-sm font-medium">{t('confirmPasswordLabel')}</label>
                                    <input type="password" className="bg-white dark:bg-surface-dark text-slate-900 dark:text-white border border-slate-300 dark:border-border-dark rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none" placeholder="••••••••" />
                                </div>
                                <button type="button" className="self-start px-4 py-2 bg-slate-100 dark:bg-surface-dark hover:bg-slate-200 dark:hover:bg-[#2f3e5c] border border-slate-300 dark:border-border-dark rounded-lg text-slate-700 dark:text-white text-sm font-medium transition-colors">
                                    {t('updatePassword')}
                                </button>
                            </div>
                        </section>
                    </div>
                );
            case 'developer':
                return (
                    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
                        <section>
                            <h4 className="text-slate-900 dark:text-white text-lg font-bold mb-6">🔑 API Token</h4>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                                Usa este token para autenticar la extensión de Chrome de Diktalo. Copia el token y pégalo en la extensión.
                            </p>

                            {loadingToken ? (
                                <div className="flex items-center justify-center p-8">
                                    <span className="material-symbols-outlined animate-spin text-primary text-2xl">progress_activity</span>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <div className="p-4 bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl font-mono text-xs break-all">
                                        {apiToken || 'No token available'}
                                    </div>

                                    <button
                                        onClick={handleCopyToken}
                                        className="self-start flex items-center gap-2 px-4 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-lg font-medium transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">
                                            {tokenCopied ? 'check_circle' : 'content_copy'}
                                        </span>
                                        {tokenCopied ? 'Copiado!' : 'Copiar Token'}
                                    </button>
                                </div>
                            )}

                            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl">
                                <h5 className="text-blue-900 dark:text-blue-200 text-sm font-bold mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">info</span>
                                    Cómo usar
                                </h5>
                                <ol className="text-blue-700 dark:text-blue-300 text-xs space-y-1 ml-4 list-decimal">
                                    <li>Copia el token de arriba</li>
                                    <li>Abre la extensión de Chrome de Diktalo</li>
                                    <li>Pega el token en el campo de configuración</li>
                                    <li>Haz clic en "Guardar Token"</li>
                                </ol>
                            </div>

                            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
                                <p className="text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
                                    <span className="material-symbols-outlined text-[16px] mt-0.5">warning</span>
                                    <span><strong>Importante:</strong> No compartas este token con nadie. Da acceso completo a tu cuenta de Diktalo.</span>
                                </p>
                            </div>
                        </section>

                        <section>
                            <h4 className="text-slate-900 dark:text-white text-lg font-bold mb-6">🧩 Chrome Extension</h4>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                                Graba audio de pestañas del navegador (Google Meet, Zoom, YouTube) directamente desde Chrome.
                            </p>
                            <a
                                href="https://github.com/diegogalmarini/IntelliScribe/tree/main/chrome-extension"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-surface-dark hover:bg-slate-200 dark:hover:bg-[#2f3e5c] border border-slate-300 dark:border-border-dark rounded-lg text-slate-700 dark:text-white text-sm font-medium transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">download</span>
                                Instrucciones de Instalación
                            </a>
                        </section>
                        <section>
                            <h4 className="text-slate-900 dark:text-white text-lg font-bold mb-6">Trust Center</h4>
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-between">
                                <div>
                                    <h5 className="text-slate-900 dark:text-white font-bold mb-1">Centro de Seguridad y Confianza</h5>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md">
                                        Conoce cómo protegemos tus datos, nuestros estándares de encriptación y privacidad de IA.
                                    </p>
                                </div>
                                <a
                                    href="/trust"
                                    className="px-4 py-2 bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-white text-sm font-bold transition-colors shadow-sm"
                                >
                                    Ver Trust Center
                                </a>
                            </div>
                        </section>
                    </div>
                );
            case 'credits':
                return (
                    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
                        {/* Balance Header */}
                        <section className="bg-brand-blue/5 border border-brand-blue/20 p-6 rounded-2xl flex items-center justify-between">
                            <div>
                                <h4 className="text-brand-blue text-sm font-bold uppercase tracking-wider mb-1">{t('creditsBalance')}</h4>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-slate-900 dark:text-white">{user.voiceCredits || 0}</span>
                                    <span className="text-slate-500 font-medium">créditos</span>
                                </div>
                            </div>
                            <div className="size-16 rounded-full bg-brand-blue/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-brand-blue text-3xl">payments</span>
                            </div>
                        </section>

                        {/* Rate Table */}
                        <section>
                            <h4 className="text-slate-900 dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-brand-green">language</span>
                                {t('comparison_title')}
                            </h4>
                            <div className="overflow-hidden border border-slate-200 dark:border-border-dark rounded-xl">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-surface-dark/50 text-slate-500 uppercase text-[10px] font-bold">
                                        <tr>
                                            <th className="px-4 py-3">{t('rateTableCountry')}</th>
                                            <th className="px-4 py-3 text-center">{t('rateTableFixed')}</th>
                                            <th className="px-4 py-3 text-center">{t('rateTableMobile')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                                        {[
                                            { name: 'USA / Canada / Mexico', flag: '🇺🇸', fixed: '1x', mobile: '1x' },
                                            { name: 'Spain', flag: '🇪🇸', fixed: '1x', mobile: '10x' },
                                            { name: 'United Kingdom', flag: '🇬🇧', fixed: '1x', mobile: '5x' },
                                            { name: 'France / Portugal', flag: '🇫🇷', fixed: '1x', mobile: '5x' },
                                            { name: 'Germany / Italy / Norway', flag: '🇩🇪', fixed: '1x', mobile: '10x' },
                                            { name: 'Switzerland / Ireland', flag: '🇨🇭', fixed: '1x', mobile: '10x' },
                                            { name: 'Japan / Turkey / Israel', flag: '🇯🇵', fixed: '5x', mobile: '5x' },
                                            { name: 'South Africa', flag: '🇿🇦', fixed: '1x', mobile: '10x' },
                                            { name: 'Singapore / Hong Kong', flag: '🇸🇬', fixed: '1x', mobile: '1x' },
                                        ].map((row, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                                    <span>{row.flag}</span> {row.name}
                                                </td>
                                                <td className="px-4 py-3 text-center text-slate-500 uppercase font-bold text-[10px]">{row.fixed}</td>
                                                <td className="px-4 py-3 text-center text-slate-500 uppercase font-bold text-[10px]">{row.mobile}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Purchase Packs */}
                        <section>
                            <div className="mb-6">
                                <h4 className="text-slate-900 dark:text-white text-lg font-bold">{t('buyCreditsTitle')}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{t('buyCreditsDesc')}</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {[10, 30, 50, 100, 1000].map(amount => (
                                    <button
                                        key={amount}
                                        onClick={() => window.open(`https://diktalo.lemonsqueezy.com/checkout/buy/credits-${amount}`, '_blank')}
                                        className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl hover:border-brand-blue hover:shadow-lg hover:shadow-brand-blue/10 transition-all group"
                                    >
                                        <span className="text-xl font-black text-slate-900 dark:text-white group-hover:text-brand-blue">{amount}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">créds</span>
                                        <div className="mt-2 text-xs font-bold text-brand-blue">
                                            {t('minutes_buy')}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>
                );
        }
        return null;
    };

    return (
        <div className="flex-1 flex flex-col h-screen bg-background-light dark:bg-background-dark overflow-hidden transition-colors duration-200">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-border-dark bg-white dark:bg-[#111722] px-4 md:px-10 py-3 transition-colors duration-200">
                <h2 className="text-slate-900 dark:text-white text-lg font-bold">{t('settings')}</h2>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <LanguageSelector />
                    <button
                        type="button"
                        onClick={onLogout}
                        className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-slate-100 dark:bg-surface-dark hover:bg-slate-200 dark:hover:bg-[#2f3e5c] text-slate-700 dark:text-white text-sm font-bold leading-normal transition-colors border border-slate-300 dark:border-border-dark">
                        <span className="truncate">{t('logout')}</span>
                    </button>
                </div>

                {/* Feedback Toast */}
                {feedback && (
                    <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-xl text-sm font-medium animate-in fade-in zoom-in slide-in-from-top-4 flex items-center gap-2 z-50 ${feedback.type === 'success' ? 'bg-brand-green/10 text-brand-green border border-brand-green/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        <span className="material-symbols-outlined text-lg">{feedback.type === 'success' ? 'check_circle' : 'error'}</span>
                        {feedback.message}
                    </div>
                )}
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-10">
                <div className="max-w-5xl mx-auto flex flex-col gap-8">
                    {/* Page Heading */}
                    <div className="flex flex-col gap-2">
                        <h1 className="text-slate-900 dark:text-white text-3xl font-black">{t('accountSettings')}</h1>
                        <p className="text-slate-500 dark:text-text-secondary">{t('managePersonal')}</p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Nav */}
                        <aside className="w-full lg:w-64 flex-shrink-0">
                            <div className="flex flex-col gap-1">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('profile')}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors font-medium text-sm w-full text-left ${activeTab === 'profile' ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/20 font-bold' : 'text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 border-transparent'}`}
                                >
                                    <span className={`material-symbols-outlined text-[20px] ${activeTab === 'profile' ? 'material-symbols-filled' : ''}`}>person</span>
                                    {t('myProfile')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('security')}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors font-medium text-sm w-full text-left ${activeTab === 'security' ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/20 font-bold' : 'text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 border-transparent'}`}
                                >
                                    <span className={`material-symbols-outlined text-[20px] ${activeTab === 'security' ? 'material-symbols-filled' : ''}`}>shield</span>
                                    {t('security')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('notifications')}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors font-medium text-sm w-full text-left ${activeTab === 'notifications' ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/20 font-bold' : 'text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 border-transparent'}`}
                                >
                                    <span className={`material-symbols-outlined text-[20px] ${activeTab === 'notifications' ? 'material-symbols-filled' : ''}`}>notifications</span>
                                    {t('notifications')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('developer')}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors font-medium text-sm w-full text-left ${activeTab === 'developer' ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/20 font-bold' : 'text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 border-transparent'}`}
                                >
                                    <span className={`material-symbols-outlined text-[20px] ${activeTab === 'developer' ? 'material-symbols-filled' : ''}`}>code</span>
                                    Developer
                                </button>
                                {user.subscription?.planId === 'business_plus' && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('credits')}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors font-medium text-sm w-full text-left ${activeTab === 'credits' ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/20 font-bold' : 'text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 border-transparent'}`}
                                    >
                                        <span className={`material-symbols-outlined text-[20px] ${activeTab === 'credits' ? 'material-symbols-filled' : ''}`}>payments</span>
                                        {t('voiceCredits')}
                                    </button>
                                )}
                            </div>
                        </aside>

                        {/* Main Content */}
                        <main className="flex-1 bg-white dark:bg-[#161d2a] rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm">
                            <div className="p-8 border-b border-slate-200 dark:border-border-dark">
                                <div className="flex items-center gap-6">
                                    {/* Hidden Input */}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />

                                    {/* Avatar Click Area */}
                                    <div
                                        className="relative group cursor-pointer shrink-0"
                                        onClick={handleAvatarClick}
                                        title="Click to change photo"
                                    >
                                        <div className="size-24 rounded-full bg-gradient-brand flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-surface-dark shadow-xl overflow-hidden relative">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{firstName[0]}{lastName[0]}</span>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="material-symbols-outlined text-white">photo_camera</span>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-slate-900 dark:text-white text-2xl font-bold">{firstName} {lastName}</h3>
                                        <p className="text-slate-500 dark:text-text-secondary">{user.role === 'Member' ? t('member') : user.role === 'Administrator' ? t('admin') : user.role}</p>
                                        <button
                                            type="button"
                                            onClick={handleAvatarClick}
                                            className="mt-2 text-brand-blue text-sm font-medium hover:underline md:hidden">
                                            {t('changePhoto')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8">
                                {renderContent()}

                                {/* Footer Actions (Only for profile for now, or could be shared) */}
                                {(activeTab === 'profile' || activeTab === 'notifications') && (
                                    <div className="flex justify-end gap-4 pt-8 mt-8 border-t border-slate-200 dark:border-border-dark">
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors">
                                            {t('cancel')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="px-6 py-2.5 rounded-lg bg-brand-blue hover:bg-brand-blue/90 text-white text-sm font-bold shadow-lg shadow-brand-blue/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-wait">
                                            {isSaving ? 'Saving...' : t('saveChanges')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
};
