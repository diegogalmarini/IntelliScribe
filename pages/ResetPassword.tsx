
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

    return (
        <div className="flex flex-1 w-full min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-200">
            <div className="flex flex-col flex-1 w-full bg-white dark:bg-background-dark relative overflow-y-auto items-center justify-center">

                {/* Header */}
                <div className="absolute top-0 left-0 right-0 px-8 py-6 flex items-center justify-between">
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

                <div className="w-full max-w-md px-8 py-8">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            Reset Password
                        </h1>
                        <p className="text-slate-500 dark:text-text-secondary">
                            Enter your new password below.
                        </p>
                    </div>

                    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-semibold text-slate-700 dark:text-white">New Password</span>
                            <input
                                className="w-full rounded-lg border border-slate-300 dark:border-border-dark bg-slate-50 dark:bg-surface-dark px-4 h-12 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-text-secondary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </label>
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-semibold text-slate-700 dark:text-white">Confirm Password</span>
                            <input
                                className="w-full rounded-lg border border-slate-300 dark:border-border-dark bg-slate-50 dark:bg-surface-dark px-4 h-12 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-text-secondary focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </label>

                        {success && (
                            <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 text-green-700 dark:text-green-400 px-4 py-3 rounded relative">
                                <span className="block sm:inline">{success}</span>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded relative">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !!success}
                            className="mt-2 w-full h-12 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait">
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">lock_reset</span>
                                    <span>Update Password</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
