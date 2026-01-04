import React, { useState, useEffect } from 'react';
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

    // Rotating Hero Text Logic REMOVED

    return (
        <div className="flex flex-1 w-full min-h-screen transition-colors duration-200 overflow-hidden relative font-sans">

            {/* Custom Animations for Smooth Waves */}
            <style>{`
                @keyframes drift-1 {
                    0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.8; }
                    50% { transform: translate(10%, 15%) scale(1.1) rotate(10deg); opacity: 0.6; }
                    100% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.8; }
                }
                @keyframes drift-2 {
                    0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.7; }
                    50% { transform: translate(-10%, -5%) scale(1.2) rotate(-5deg); opacity: 0.9; }
                    100% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.7; }
                }
                @keyframes aurora {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>

            {/* Global Ethereal Wave Background */}
            <div className="absolute inset-0 z-0 bg-[#F8FAFC] dark:bg-[#02040a]">

                {/* Wave 1: Fresh Teal/Cyan (Top Right drift) */}
                <div
                    className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-[drift-1_25s_infinite_ease-in-out] dark:mix-blend-screen dark:opacity-30"
                    style={{ background: 'radial-gradient(circle, rgba(56, 189, 248, 0.8) 0%, rgba(56, 189, 248, 0) 70%)' }} // Sky Blue
                />

                {/* Wave 2: Soft Green/Mint (Bottom Left drift) */}
                <div
                    className="absolute bottom-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-[drift-2_30s_infinite_ease-in-out] animation-delay-2000 dark:mix-blend-screen dark:opacity-20"
                    style={{ background: 'radial-gradient(circle, rgba(74, 222, 128, 0.6) 0%, rgba(74, 222, 128, 0) 70%)' }} // Green-400
                />

                {/* Wave 3: Deep Indigo/Purple (Center Floating) */}
                <div
                    className="absolute top-[20%] left-[30%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-[120px] opacity-60 animate-[drift-1_35s_infinite_ease-in-out_reverse] dark:mix-blend-screen dark:opacity-30"
                    style={{ background: 'radial-gradient(circle, rgba(129, 140, 248, 0.8) 0%, rgba(129, 140, 248, 0) 70%)' }} // Indigo-400
                />

                {/* Noise Texture for Texture/Realism */}
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
            </div>

            {/* Left Side: Auth Form - LIQUID GLASS EFFECT */}
            <div className="flex flex-col flex-1 w-full lg:max-w-[48%] xl:max-w-[42%] relative overflow-y-auto lg:px-16 px-8 py-8 justify-center z-20 
                          bg-white/40 dark:bg-black/40 backdrop-blur-3xl border-r border-white/40 dark:border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.05)]">

                {/* Header (Logo + Language + Theme) */}
                <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <img
                            src="/logo-diktalo.svg"
                            alt="Diktalo"
                            className="h-8 w-auto dark:invert opacity-90"
                        />
                    </div>
                    <div className="flex items-center gap-2 scale-90 opacity-80 hover:opacity-100 transition-opacity">
                        <ThemeToggle />
                        <LanguageSelector />
                    </div>
                </div>

                <div className="max-w-[400px] w-full mx-auto mt-20 lg:mt-0">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl lg:text-3xl font-medium text-[#1f1f1f] dark:text-white mb-2 tracking-tight">
                            {isSignUp ? t('signUpForDiktalo') : t('letsGetStarted')}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {isSignUp ? t('startJourney') : t('welcomeBack')}
                        </p>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-1 gap-3 mb-6">
                        <button
                            onClick={() => handleSocialClick('google')}
                            disabled={isLoggingIn}
                            className="flex items-center justify-center gap-2 h-10 px-4 rounded-md border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all active:scale-[0.99] backdrop-blur-md shadow-sm"
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
                            <div className="w-full border-t border-gray-300/50 dark:border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-transparent px-3 text-[11px] text-gray-500 dark:text-[#888] uppercase tracking-wide font-medium">Or</span>
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
                                        className="w-full rounded-md border border-white/40 dark:border-white/10 bg-white/50 dark:bg-white/5 px-3 h-10 text-[#1f1f1f] dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500/50 dark:focus:border-blue-400/50 focus:bg-white/80 dark:focus:bg-black/40 focus:ring-0 outline-none transition-all text-sm backdrop-blur-sm"
                                        placeholder={t('firstName')}
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        disabled={isLoggingIn}
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        className="w-full rounded-md border border-white/40 dark:border-white/10 bg-white/50 dark:bg-white/5 px-3 h-10 text-[#1f1f1f] dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500/50 dark:focus:border-blue-400/50 focus:bg-white/80 dark:focus:bg-black/40 focus:ring-0 outline-none transition-all text-sm backdrop-blur-sm"
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
                                className="w-full rounded-md border border-white/40 dark:border-white/10 bg-white/50 dark:bg-white/5 px-3 h-10 text-[#1f1f1f] dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500/50 dark:focus:border-blue-400/50 focus:bg-white/80 dark:focus:bg-black/40 focus:ring-0 outline-none transition-all text-sm backdrop-blur-sm"
                                placeholder={t('emailAddressPlaceholder')}
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoggingIn}
                            />
                        </div>

                        <div className="relative">
                            <input
                                className="w-full rounded-md border border-white/40 dark:border-white/10 bg-white/50 dark:bg-white/5 px-3 h-10 text-[#1f1f1f] dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500/50 dark:focus:border-blue-400/50 focus:bg-white/80 dark:focus:bg-black/40 focus:ring-0 outline-none transition-all text-sm pr-10 backdrop-blur-sm"
                                placeholder={t('passwordPlaceholder')}
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoggingIn}
                            />
                            <button
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors focus:outline-none"
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
                                    className="text-xs font-medium text-gray-600 hover:text-black dark:text-white transition-colors focus:outline-none"
                                >
                                    {t('forgotPass')}
                                </button>
                            </div>
                        )}

                        {successMessage && (
                            <div className="bg-green-50/80 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-3 py-2 rounded text-xs relative animate-in fade-in slide-in-from-top-1 backdrop-blur-sm" role="alert">
                                {successMessage}
                            </div>
                        )}

                        {error && <p className="text-red-500 text-xs font-medium animate-pulse">{error}</p>}

                        <button
                            type="submit"
                            disabled={isLoggingIn || (!email || !password)}
                            className="mt-2 w-full h-10 bg-[#1A73E8] hover:bg-[#1557B0] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-md transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-500/30 backdrop-blur-md"
                        >
                            {isLoggingIn ? (
                                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                            ) : (
                                <span>{isSignUp ? t('signUpForDiktalo') : t('loginBtn')}</span>
                            )}
                        </button>

                        <div className="mt-4 text-center text-xs text-gray-600 dark:text-gray-400">
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
                            <div className="mt-2 space-y-2 pt-2 border-t border-gray-200/50 dark:border-white/10">
                                <label className="flex items-start gap-2 cursor-pointer group">
                                    <div className="relative flex items-center pt-0.5">
                                        <input type="checkbox" className="peer w-3 h-3 appearance-none border border-gray-400 dark:border-gray-500 rounded-sm checked:bg-black checked:border-black dark:checked:bg-white dark:checked:border-white transition-all" />
                                        <span className="absolute text-white dark:text-black opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-[8px] material-symbols-outlined font-bold">check</span>
                                    </div>
                                    <span className="text-[11px] text-gray-600 dark:text-gray-400 leading-snug">
                                        {t('agreeTerms')?.replace('{country}', 'España')} <a href="#" className="underline decoration-1 underline-offset-2 text-black dark:text-white hover:text-gray-800">{t('userAgreement')}</a> & <a href="#" className="underline decoration-1 underline-offset-2 text-black dark:text-white hover:text-gray-800">{t('privacyPolicy')}</a>.
                                    </span>
                                </label>

                                <label className="flex items-start gap-2 cursor-pointer group hidden md:flex">
                                    <div className="relative flex items-center pt-0.5">
                                        <input type="checkbox" className="peer w-3 h-3 appearance-none border border-gray-400 dark:border-gray-500 rounded-sm checked:bg-black checked:border-black dark:checked:bg-white dark:checked:border-white transition-all" />
                                        <span className="absolute text-white dark:text-black opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-[8px] material-symbols-outlined font-bold">check</span>
                                    </div>
                                    <span className="text-[11px] text-gray-600 dark:text-gray-400 leading-snug">
                                        {t('keepUpdated')}
                                    </span>
                                </label>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* Right Side - Transparent to show Global BG */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden flex-col justify-center items-center p-12 z-10">
                        />
            </div>
        </div>
            </div >
        </div >
    );
};
