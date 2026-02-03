import React, { useState, useEffect } from 'react';
import { AppRoute } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { ThemeToggle } from '../components/ThemeToggle';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import * as Analytics from '../utils/analytics';

interface LoginProps {
    onNavigate: (route: AppRoute) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
    const { t } = useLanguage();
    const { session } = useAuth();
    const { showToast } = useToast();

    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);

    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        setError('');
        setAgreedToTerms(false); // Reset terms on toggle
        setSuccessMessage('');
        if (!isSignUp) {
            setEmail('');
            setPassword('');
            setFirstName('');
            setLastName('');
        } else {
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
                // VALIDATION: Strict Terms Check
                if (!agreedToTerms) {
                    throw new Error(t('mustAgreeToTerms') || 'Debes aceptar los términos y condiciones para continuar.');
                }

                if (Analytics && typeof Analytics.trackEvent === 'function') {
                    Analytics.trackEvent('signup_attempt', { email_domain: email.split('@')[1] });
                }
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

                // SUCCESS STATE: Show message instead of toast
                setIsRegistrationSuccess(true);
            } else {
                if (Analytics && typeof Analytics.trackEvent === 'function') {
                    Analytics.trackEvent('login_attempt');
                }
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (signInError) throw signInError;
                onNavigate(AppRoute.DASHBOARD);
            }
        } catch (err: any) {
            console.error("Auth error:", err);
            setError(err.message || "Authentication failed");
        } finally {
            setIsLoggingIn(false);
        }
    };


    const handleSocialClick = async (provider: 'google' | 'azure') => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/dashboard`
                }
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
            setError('');
        } catch (err: any) {
            console.error("Reset pwd error:", err);
            setError(err.message);
        } finally {
            setIsLoggingIn(false);
        }
    };

    const ALL_FEATURES = [
        { key: 'feature_dialer', icon: 'call', color: 'text-slate-500 dark:text-slate-400' },
        { key: 'feature_ghostwire', icon: 'graphic_eq', color: 'text-slate-500 dark:text-slate-400' },
        { key: 'feature_insights', icon: 'auto_awesome', color: 'text-slate-500 dark:text-slate-400' },
        { key: 'feature_security', icon: 'shield', color: 'text-slate-500 dark:text-slate-400' },
        { key: 'feature_sync', icon: 'cloud_sync', color: 'text-slate-500 dark:text-slate-400' },
        { key: 'feature_teams', icon: 'group', color: 'text-slate-500 dark:text-slate-400' },
    ];

    const [features, setFeatures] = useState<{ key: string, icon: string, color: string }[]>([]);

    useEffect(() => {
        const shuffled = [...ALL_FEATURES].sort(() => 0.5 - Math.random());
        setFeatures(shuffled.slice(0, 3));
    }, []);

    // RENDER LOGIC
    if (isRegistrationSuccess) {
        return (
            <div className="flex flex-1 w-full min-h-screen transition-colors duration-200 overflow-hidden relative font-sans">
                <div className="absolute inset-0 z-0 bg-white dark:bg-[#02040a]">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                </div>

                <div className="flex flex-col flex-1 w-full lg:max-w-[48%] xl:max-w-[42%] relative overflow-y-auto lg:px-16 px-8 py-8 justify-center z-20
                              bg-white/40 dark:bg-transparent backdrop-blur-3xl border-r border-white/40 dark:border-none shadow-[0_0_40px_rgba(0,0,0,0.05)] dark:shadow-none">

                    <div className="max-w-[400px] w-full mx-auto text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl text-green-600 dark:text-green-400">mark_email_read</span>
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-[#1f1f1f] dark:text-white mb-4">
                            {t('checkEmailTitle') || '¡Revisa tu correo!'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                            {t('checkEmailDesc') || `Hemos enviado un enlace de confirmación a ${email}. Por favor, haz clic en el enlace para activar tu cuenta.`}
                        </p>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50 mb-8">
                            <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2 text-left">
                                <span className="material-symbols-outlined text-sm mt-0.5 shrink-0">info</span>
                                <span>Si no lo ves en tu bandeja de entrada, revisa la carpeta de <strong>SPAM</strong> o "Promociones".</span>
                            </p>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl transition-all shadow-md hover:scale-[1.02]"
                        >
                            {t('backToLogin') || 'Volver al inicio'}
                        </button>
                    </div>
                </div>

                <div className="hidden lg:flex flex-1 relative overflow-hidden flex-col justify-center items-center p-12 z-10">
                    {/* Keep Hero Side */}
                    <div className="relative z-10 max-w-4xl text-center">
                        <h2 className="text-4xl lg:text-6xl font-bold text-[#0B0F19] dark:text-white mb-6 tracking-tight leading-tight">
                            {t('loginHeroTitle')}
                        </h2>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 w-full min-h-screen transition-colors duration-200 overflow-hidden relative font-sans">
            <div className="absolute inset-0 z-0 bg-white dark:bg-[#02040a]">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                <div className="absolute left-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen dark:opacity-20 pointer-events-none" />
                <div className="absolute right-0 bottom-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen dark:opacity-20 pointer-events-none" />
            </div>

            <div className="flex flex-col flex-1 w-full lg:max-w-[48%] xl:max-w-[42%] relative overflow-y-auto lg:px-16 px-8 py-8 justify-center z-20
                          bg-white/40 dark:bg-transparent backdrop-blur-3xl border-r border-white/40 dark:border-none shadow-[0_0_40px_rgba(0,0,0,0.05)] dark:shadow-none">
                <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate(AppRoute.LANDING)}>
                        <img src="/logo-diktalo.svg" alt="Diktalo" className="h-8 w-auto dark:invert opacity-90" />
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

                    <div className="grid grid-cols-1 gap-3 mb-6">
                        <button
                            onClick={() => handleSocialClick('google')}
                            disabled={isLoggingIn}
                            className="flex items-center justify-center gap-2 h-10 px-4 rounded-md border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all active:scale-[0.99] backdrop-blur-md shadow-sm"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
                            <span className="text-sm font-medium text-[#1f1f1f] dark:text-white">{t('continueWithGoogle')}</span>
                        </button>
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
                                    className="text-xs font-medium text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors focus:outline-none"
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
                            className="mt-2 w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-[15px] shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoggingIn ? (
                                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                            ) : (
                                <span>{isSignUp ? t('signUpForDiktalo') : (isSignUp ? t('signUpBtn') : t('loginBtn'))}</span>
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

                        {isSignUp && (
                            <div className="mt-2 space-y-2 pt-2 border-t border-gray-200/50 dark:border-white/10">
                                <label className="flex items-start gap-2 cursor-pointer group">
                                    <div className="relative flex items-center pt-0.5">
                                        <input
                                            type="checkbox"
                                            className="peer w-3 h-3 appearance-none border border-gray-400 dark:border-gray-500 rounded-sm checked:bg-black checked:border-black dark:checked:bg-white dark:checked:border-white transition-all"
                                            checked={agreedToTerms}
                                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                                        />
                                        <span className="absolute text-white dark:text-black opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-y-1/2 pointer-events-none text-[8px] material-symbols-outlined font-bold">check</span>
                                    </div>
                                    <span className="text-[11px] text-gray-600 dark:text-gray-400 leading-snug select-none">
                                        {t('agreeTerms')?.replace('{country}', 'España')} <a href="#" className="underline decoration-1 underline-offset-2 text-black dark:text-white hover:text-gray-800">{t('userAgreement')}</a> & <a href="#" className="underline decoration-1 underline-offset-2 text-black dark:text-white hover:text-gray-800">{t('privacyPolicy')}</a>.
                                    </span>
                                </label>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            <div className="hidden lg:flex flex-1 relative overflow-hidden flex-col justify-center items-center p-12 z-10">
                <div className="relative z-10 max-w-4xl text-center">
                    <h2 className="text-4xl lg:text-6xl font-bold text-[#0B0F19] dark:text-white mb-6 tracking-tight leading-tight drop-shadow-sm">
                        {t('loginHeroTitle')}
                    </h2>
                    <p className="text-lg lg:text-xl leading-relaxed text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto font-normal">
                        {t('loginHeroDesc')}
                    </p>

                    <div className="flex flex-wrap justify-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                        {features.map((feature) => (
                            <div key={feature.key} className="flex items-center gap-2 px-2 py-1 transition-opacity opacity-80 hover:opacity-100 cursor-default">
                                <span className={`material-symbols-outlined text-[20px] text-slate-500 dark:text-slate-400`}>{feature.icon}</span>
                                <span className="text-[14px] font-medium text-slate-600 dark:text-slate-300">{t(feature.key as any)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
