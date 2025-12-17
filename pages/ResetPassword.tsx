
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AppRoute } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageSelector } from '../components/LanguageSelector';

interface ResetPasswordProps {
    onNavigate: (route: AppRoute) => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ onNavigate }) => {
    const { t } = useLanguage();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check for specific error in URL (e.g. from a bad link)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorDescription = hashParams.get('error_description');
        const errorCode = hashParams.get('error_code');

        if (errorDescription) {
            // Decoding the +, etc
            setError(decodeURIComponent(errorDescription.replace(/\+/g, ' ')));
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) throw updateError;

            setSuccess("Password updated successfully! Redirecting...");

            // Wait 2 seconds then go to dashboard
            setTimeout(() => {
                onNavigate(AppRoute.DASHBOARD);
            }, 2000);

        } catch (err: any) {
            console.error("Update password error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // ... (keep useEffect and handleSubmit)

    // Helper for toggle button
    const toggleButton = (show: boolean, setShow: (s: boolean) => void) => (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                setShow(!show);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
            title={show ? "Hide password" : "Show password"}
        >
            <span className="material-symbols-outlined text-xl">
                {show ? 'visibility' : 'visibility_off'}
            </span>
        </button>
    );

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto mt-20 p-8 bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-slate-100 dark:border-border-dark animate-fade-in-up">
            <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                    <span className="material-symbols-outlined text-4xl">lock_reset</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {t('resetPassword') || 'Reset Password'}
                </h1>
                <p className="text-slate-500 dark:text-text-secondary">
                    {t('enterNewPassword') || 'Enter your new password below.'}
                </p>
            </div>

            <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
                <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-white">
                        {t('newPasswordLabel') || 'New Password'}
                    </span>
                    <div className="relative">
                        <input
                            className="w-full rounded-lg border border-slate-300 dark:border-border-dark bg-slate-50 dark:bg-surface-dark px-4 h-12 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-text-secondary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors pr-12"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                        {toggleButton(showPassword, setShowPassword)}
                    </div>
                </label>
                <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-white">
                        {t('confirmPasswordLabel') || 'Confirm Password'}
                    </span>
                    <div className="relative">
                        <input
                            className="w-full rounded-lg border border-slate-300 dark:border-border-dark bg-slate-50 dark:bg-surface-dark px-4 h-12 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-text-secondary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors pr-12"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                        {toggleButton(showConfirmPassword, setShowConfirmPassword)}
                    </div>
                </label>

                {success && (
                    <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 text-green-700 dark:text-green-400 px-4 py-3 rounded relative text-center">
                        <span className="block sm:inline font-medium">{success}</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded relative text-center">
                        <span className="block sm:inline font-medium">{error}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !!success}
                    className="mt-4 w-full h-12 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait">
                    {loading ? (
                        <>
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                            <span>Updating...</span>
                        </>
                    ) : (
                        <>
                            <span>Update Password</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

