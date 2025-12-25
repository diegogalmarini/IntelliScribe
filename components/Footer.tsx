import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-white dark:bg-background-dark border-t border-slate-200 dark:border-border-dark py-12 px-4 transition-colors duration-200">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex flex-col items-center md:items-start">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-primary text-3xl">waves</span>
                        <span className="text-2xl font-display font-black text-slate-900 dark:text-white tracking-tight">
                            Diktalo
                        </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs text-center md:text-left">
                        Your AI Executive Secretary. Automate your meetings, calls, and summaries with state-of-the-art intelligence.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-8">
                    <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider">Product</h4>
                        <a href="/login" className="text-slate-500 hover:text-primary transition-colors text-sm">Features</a>
                        <a href="/login" className="text-slate-500 hover:text-primary transition-colors text-sm">Pricing</a>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider">Legal</h4>
                        <a href="/terms" className="text-slate-500 hover:text-primary transition-colors text-sm">Terms of Service</a>
                        <a href="/privacy" className="text-slate-500 hover:text-primary transition-colors text-sm">Privacy Policy</a>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider">Connect</h4>
                        <a href="mailto:support@diktalo.com" className="text-slate-500 hover:text-primary transition-colors text-sm">Support</a>
                        <a href="#" className="text-slate-500 hover:text-primary transition-colors text-sm">Twitter</a>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
                <p>&copy; 2025 Diktalo AI. All rights reserved.</p>
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
                        System Operative
                    </span>
                    <span>v1.0.0</span>
                </div>
            </div>
        </footer>
    );
};
