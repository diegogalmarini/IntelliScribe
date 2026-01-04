
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
    const [showPassword, setShowPassword] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
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


    const handleForgotPassword = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!email) {
            setError(t('enterEmailFirst') || 'Please enter your email address first.');
            return;
        }

        try {
            setIsLoggingIn(true);
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setSuccessMessage(t('passwordResetSent'));
            setError(''); // Clear any previous errors
        } catch (err: any) {
            console.error("Reset pwd error:", err);
            setError(err.message);
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="flex flex-1 w-full min-h-screen bg-white dark:bg-[#1a1a1a] transition-colors duration-200">
            {/* Left Side: Auth Form */}
            <div className="flex flex-col flex-1 w-full lg:max-w-[50%] xl:max-w-[45%] bg-white dark:bg-[#1a1a1a] relative overflow-y-auto lg:px-20 px-8 py-8 justify-center">

                {/* Header (Logo + Language/Theme) */}
                <div className="absolute top-6 left-8 right-8 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold tracking-tight text-[#1f1f1f] dark:text-white uppercase font-display">Diktalo</span>
                    </div>
                    <div className="flex items-center gap-2 scale-90">
                        <ThemeToggle />
                        <LanguageSelector />
                    </div>
                </div>

                <div className="max-w-[420px] w-full mx-auto mt-16 lg:mt-0">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl lg:text-3xl font-medium text-[#1f1f1f] dark:text-white mb-2">
                            {isSignUp ? t('signUpForDiktalo') : t('letsGetStarted')}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isSignUp ? t('startJourney') : t('welcomeBack')}
                        </p>
                    </div>

                    {/* Social Login Buttons - COMPACT */}
                    <div className="grid grid-cols-1 gap-3 mb-6">
                        <button
                            onClick={() => handleSocialClick('google')}
                            disabled={isLoggingIn}
                            className="flex items-center justify-center gap-2 h-10 px-4 rounded-md border border-gray-200 dark:border-[#333] bg-white dark:bg-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#333]/80 transition-all active:scale-[0.99]"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
                            <span className="text-sm font-medium text-[#1f1f1f] dark:text-white">{t('continueWithGoogle')}</span>
                        </button>

                        {/* Apple Button Placeholders - Disabled/Hidden as per user request */}
                        {/* 
                        <button disabled className="flex items-center justify-center gap-3 h-12 ... opacity-50 cursor-not-allowed">
                             <img src="..." />
                             <span>Continue with Apple</span>
                        </button> 
                        */}
                    </div>

                    <div className="relative mb-6">
                        <div aria-hidden="true" className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-[#333]"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white dark:bg-[#1a1a1a] px-3 text-[11px] text-[#8e8e8e] dark:text-[#888] uppercase tracking-wide">Or</span>
                        </div>
                    </div>

                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        {/* Registration Fields - First/Last Name (Hidden in 'Simply' aesthetics? 
                           User screenshot shows ONLY Email/Pass. 
                           However, Diktalo logic uses First/Last. 
                           I will KEEP First/Last for Signup but maybe style them less intrusively or group them if needed. 
                           Actually, "Continue with Email" implies Email is standard. 
                           Let's keep them but use the new clean input style.
                        */}
                        {isSignUp && (
                            <div className="flex flex-col md:flex-row gap-3">
                                <div className="flex-1">
                                    <input
                                        className="w-full rounded-md border border-gray-200 dark:border-[#333] bg-transparent px-3 h-10 text-[#1f1f1f] dark:text-white placeholder-gray-400 focus:border-black dark:focus:border-white focus:ring-0 outline-none transition-all text-sm"
                                        placeholder={t('firstName')}
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        disabled={isLoggingIn}
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        className="w-full rounded-md border border-gray-200 dark:border-[#333] bg-transparent px-3 h-10 text-[#1f1f1f] dark:text-white placeholder-gray-400 focus:border-black dark:focus:border-white focus:ring-0 outline-none transition-all text-sm"
                                        placeholder={t('lastName')}
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        disabled={isLoggingIn}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <input
                                className="w-full rounded-md border border-gray-200 dark:border-[#333] bg-transparent px-3 h-10 text-[#1f1f1f] dark:text-white placeholder-gray-400 focus:border-black dark:focus:border-white focus:ring-0 outline-none transition-all text-sm"
                                placeholder={t('emailAddressPlaceholder')}
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoggingIn}
                            />
                        </div>

                        <div className="relative">
                            <input
                                className="w-full rounded-md border border-gray-200 dark:border-[#333] bg-transparent px-3 h-10 text-[#1f1f1f] dark:text-white placeholder-gray-400 focus:border-black dark:focus:border-white focus:ring-0 outline-none transition-all text-sm pr-10"
                                placeholder={t('passwordPlaceholder')}
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoggingIn}
                            />
                            <button
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors focus:outline-none"
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowPassword(!showPassword);
                                }}
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    {showPassword ? 'visibility' : 'visibility_off'}
                                </span>
                            </button>
                        </div>

                        {!isSignUp && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-xs font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors focus:outline-none"
                                >
                                    {t('forgotPass')}
                                </button>
                            </div>
                        )}

                        {successMessage && (
                            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-2 rounded text-xs relative animate-in fade-in slide-in-from-top-1" role="alert">
                                {successMessage}
                            </div>
                        )}

                        {error && <p className="text-red-500 text-xs font-medium animate-pulse">{error}</p>}

                        <button
                            type="submit"
                            disabled={isLoggingIn || (!email || !password)}
                            className="mt-2 w-full h-10 bg-[#1f1f1f] hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 font-medium rounded-md transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                        >
                            {isLoggingIn ? (
                                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                            ) : (
                                <span>{isSignUp ? t('signUpForDiktalo') : t('loginBtn')}</span>
                            )}
                        </button>

                        <div className="mt-4 text-center text-xs text-gray-500">
                            {isSignUp ? t('alreadyHaveAccount') : t('noAccount')}
                            <button
                                type="button"
                                onClick={toggleMode}
                                className="font-semibold text-black dark:text-white hover:underline ml-1 focus:outline-none"
                            >
                                {isSignUp ? t('loginBtn') : t('signUpBtn')}
                            </button>
                        </div>

                        {/* LEGAL CHECKBOXES - SIGNUP ONLY */}
                        {isSignUp && (
                            <div className="mt-2 space-y-2 pt-2 border-t border-gray-100 dark:border-[#333]">
                                <label className="flex items-start gap-2 cursor-pointer group">
                                    <div className="relative flex items-center pt-0.5">
                                        <input type="checkbox" className="peer w-3 h-3 appearance-none border border-gray-300 dark:border-gray-600 rounded-sm checked:bg-black checked:border-black dark:checked:bg-white dark:checked:border-white transition-all" />
                                        <span className="absolute text-white dark:text-black opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-[8px] material-symbols-outlined font-bold">check</span>
                                    </div>
                                    <span className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                                        {t('agreeTerms')?.replace('{country}', 'España')} <a href="#" className="underline decoration-1 underline-offset-2 text-black dark:text-white hover:text-gray-700">{t('userAgreement')}</a> & <a href="#" className="underline decoration-1 underline-offset-2 text-black dark:text-white hover:text-gray-700">{t('privacyPolicy')}</a>.
                                    </span>
                                </label>

                                <label className="flex items-start gap-2 cursor-pointer group hidden md:flex"> {/* Keep updated optional/hidden on mobile if tight? No keep it */}
                                    <div className="relative flex items-center pt-0.5">
                                        <input type="checkbox" className="peer w-3 h-3 appearance-none border border-gray-300 dark:border-gray-600 rounded-sm checked:bg-black checked:border-black dark:checked:bg-white dark:checked:border-white transition-all" />
                                        <span className="absolute text-white dark:text-black opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-[8px] material-symbols-outlined font-bold">check</span>
                                    </div>
                                    <span className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                                        {t('keepUpdated')}
                                    </span>
                                </label>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* Right Side - Keeping the Promo/Image side but cleaner */}
            <div className="hidden lg:flex flex-1 relative bg-[#f9fafb] dark:bg-[#111] overflow-hidden flex-col justify-center items-center p-12">
                <div className="relative z-10 max-w-xl text-center">
                    <h2 className="text-2xl font-medium text-[#1f1f1f] dark:text-white mb-3">
                        Diktalo, the world's No.1 AI note taker
                    </h2>
                    <p className="text-sm text-[#64748b] dark:text-[#888] mb-8 max-w-md mx-auto">
                        Diktalo capture, extract, and utilize intelligence from what you say, hear, see, and think.
                    </p>
                    <img
                        src="/images/hero-executive.png"
                        alt="Diktalo App Interface"
                        className="rounded-lg shadow-xl border border-black/5 dark:border-white/10 w-full object-cover max-h-[500px]"
                    />
                </div>
            </div>
        </div>
    );
};
