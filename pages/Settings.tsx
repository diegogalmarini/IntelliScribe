
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { ThemeToggle } from '../components/ThemeToggle';
import { uploadAvatar } from '../services/storageService';

type SettingsTab = 'profile' | 'security' | 'notifications';

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
                                        <p className="text-xs text-slate-500 mt-1">{t('verifyDesc')}</p>
                                    </div>
                                )}


                                {/* Upgrade Teaser for Non-Business Plus */}
                                {user.subscription?.planId !== 'business_plus' && (
                                    <div className="flex flex-col gap-2 md:col-span-2 border-t border-slate-200 dark:border-border-dark pt-6 mt-2 opacity-60">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-slate-700 dark:text-white text-sm font-medium">{t('phoneLabel')}</label>
                                            <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase bg-slate-100 text-slate-500">
                                                Business+ Only
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
                                            Upgrade to Business+ to enable Caller ID verification and VoIP calling.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section >
                    </div >
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
                            <h4 className="text-slate-900 dark:text-white text-lg font-bold mb-6">Password & Authentication</h4>
                            <div className="flex flex-col gap-6 max-w-xl">
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-700 dark:text-white text-sm font-medium">Current Password</label>
                                    <input type="password" className="bg-white dark:bg-surface-dark text-slate-900 dark:text-white border border-slate-300 dark:border-border-dark rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none" placeholder="••••••••" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-700 dark:text-white text-sm font-medium">New Password</label>
                                    <input type="password" className="bg-white dark:bg-surface-dark text-slate-900 dark:text-white border border-slate-300 dark:border-border-dark rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none" placeholder="••••••••" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-700 dark:text-white text-sm font-medium">Confirm New Password</label>
                                    <input type="password" className="bg-white dark:bg-surface-dark text-slate-900 dark:text-white border border-slate-300 dark:border-border-dark rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none" placeholder="••••••••" />
                                </div>
                                <button type="button" className="self-start px-4 py-2 bg-slate-100 dark:bg-surface-dark hover:bg-slate-200 dark:hover:bg-[#2f3e5c] border border-slate-300 dark:border-border-dark rounded-lg text-slate-700 dark:text-white text-sm font-medium transition-colors">
                                    Update Password
                                </button>
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
                                        <p className="text-slate-500 dark:text-text-secondary">{user.role}</p>
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
