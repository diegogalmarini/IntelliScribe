
import React, { useState } from 'react';
import { AppRoute } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { ThemeToggle } from '../components/ThemeToggle';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
    onNavigate: (route: AppRoute) => void;
    // onSocialLogin removed, handled internally
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
    const { t } = useLanguage();
    const { session } = useAuth(); // Use auth context if needed

    // State for toggling between Login and Sign Up
    const [isSignUp, setIsSignUp] = useState(false);

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Clear fields when toggling mode
    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        setError('');
        if (!isSignUp) {
            // Switching to Sign Up: clear fields for better UX
            setEmail('');
            setPassword('');
            setFirstName('');
            setLastName('');
        } else {
            // Switching back to Login
            setEmail('');
            setPassword('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setError('');

        try {
            if (isSignUp) {
                // REGISTER LOGIC
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            first_name: firstName,
                            last_name: lastName,
                        }
                    }
                });

                if (signUpError) throw signUpError;

                // Success
                alert("Check your email for the confirmation link!");
                // In a real flow, we might wait or show a message.
                // For now, if auto-confirm is on in Supabase, user might be logged in.
            } else {
                // LOGIN LOGIC
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (signInError) throw signInError;
                // AuthContext in App.tsx will detect session change and redirect
            }
        } catch (err: any) {
            console.error("Auth error:", err);
            setError(err.message || "Authentication failed");
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleSocialClick = async (provider: 'google' | 'azure') => {
        // Azure is usually 'azure' or 'workos' in Supabase, Google is 'google'
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex flex-1 w-full min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-200">
            {/* Left Side: Auth Form */}
            <div className="flex flex-col flex-1 w-full lg:max-w-[45%] xl:max-w-[40%] bg-white dark:bg-background-dark relative overflow-y-auto border-r dark:border-border-dark border-slate-200 transition-colors duration-200">
                <div className="px-8 py-6 lg:px-12 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl">graphic_eq</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Diktalo</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <LanguageSelector />
                    </div>
                </div>
                <div className="flex flex-col justify-center flex-1 px-8 lg:px-12 py-8 max-w-[560px] mx-auto w-full">
                    <div className="mb-10">
                        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
                            {isSignUp ? t('createAccount') : t('welcomeBack')}
                        </h1>
                        <p className="text-slate-500 dark:text-text-secondary text-base">
                            {isSignUp ? t('startJourney') : t('secureAccess')}
                        </p>
                    </div>


                    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                        {/* Registration Fields */}
                        {isSignUp && (
                            <div className="flex flex-col md:flex-row gap-4">
                                <label className="flex flex-col gap-2 flex-1">
                                    <span className="text-sm font-semibold text-slate-700 dark:text-white">{t('firstName')}</span>
                                    <input
                                        className="w-full rounded-lg border border-slate-300 dark:border-border-dark bg-slate-50 dark:bg-surface-dark px-4 h-12 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-text-secondary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                        placeholder="John"
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        disabled={isLoggingIn}
                                    />
                                </label>
                                <label className="flex flex-col gap-2 flex-1">
                                    <span className="text-sm font-semibold text-slate-700 dark:text-white">{t('lastName')}</span>
                                    <input
                                        className="w-full rounded-lg border border-slate-300 dark:border-border-dark bg-slate-50 dark:bg-surface-dark px-4 h-12 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-text-secondary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                        placeholder="Doe"
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        disabled={isLoggingIn}
                                    />
                                </label>
                            </div>
                        )}

                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-semibold text-slate-700 dark:text-white">{t('emailLabel')}</span>
                            <input
                                className="w-full rounded-lg border border-slate-300 dark:border-border-dark bg-slate-50 dark:bg-surface-dark px-4 h-12 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-text-secondary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                placeholder="name@company.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoggingIn}
                            />
                        </label>
                        <label className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-slate-700 dark:text-white">{t('passwordLabel')}</span>
                                {!isSignUp && <a className="text-sm font-medium text-primary hover:text-primary-hover transition-colors" href="#">{t('forgotPass')}</a>}
                            </div>
                            <div className="relative flex items-center">
                                <input
                                    className="w-full rounded-lg border border-slate-300 dark:border-border-dark bg-slate-50 dark:bg-surface-dark px-4 h-12 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-text-secondary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors pr-12"
                                    placeholder="••••••••"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoggingIn}
                                />
                                <button className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:text-text-secondary dark:hover:text-white transition-colors" type="button">
                                    <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                                </button>
                            </div>
                        </label>

                        {error && <p className="text-red-500 text-sm font-medium animate-pulse">{error}</p>}

                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="mt-2 w-full h-12 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait">
                            {isLoggingIn ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    <span>{isSignUp ? t('signingUp') : t('loginBtn')}...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[20px]">{isSignUp ? 'person_add' : 'lock'}</span>
                                    {isSignUp ? t('signUpBtn') : t('loginBtn')}
                                </>
                            )}
                        </button>
                    </form>
                    <div className="relative my-8">
                        <div aria-hidden="true" className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-border-dark"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white dark:bg-background-dark px-3 text-sm font-medium text-slate-500 dark:text-text-secondary">{t('continueWith')}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <button
                            onClick={() => handleSocialClick('google')}
                            disabled={isLoggingIn}
                            className="flex items-center justify-center gap-2 h-11 px-4 rounded-lg border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-[#25324a] transition-colors relative">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                            <span className="text-sm font-medium text-slate-700 dark:text-white">Google</span>
                        </button>
                    </div>

                    <div className="mt-8 text-center text-sm text-slate-500 dark:text-text-secondary flex items-center justify-center gap-1">
                        {isSignUp ? t('alreadyHaveAccount') : t('noAccount')}
                        <button
                            type="button"
                            onClick={toggleMode}
                            className="font-bold text-primary hover:text-primary-hover transition-colors ml-1 focus:outline-none"
                        >
                            {isSignUp ? t('loginBtn') : t('signUp')}
                        </button>
                    </div>
                </div>
            </div>
            {/* Right Side */}
            <div className="hidden lg:flex flex-1 relative bg-surface-dark overflow-hidden flex-col justify-center items-center p-12">
                <div className="relative z-10 max-w-xl w-full flex flex-col gap-8">
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
                            {t('heroTitle1')}<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{t('heroTitle2')}</span><br />
                            {t('heroTitle3')}
                        </h2>
                        <p className="text-lg text-slate-300 font-light max-w-md leading-relaxed">
                            {t('heroDesc')}
                        </p>
                    </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-background-dark via-transparent to-primary/30 z-0"></div>
            </div>
        </div>
    );
};
