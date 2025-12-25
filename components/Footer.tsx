import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const Footer: React.FC = () => {
    const { t } = useLanguage();

    return (
        <footer className="bg-white dark:bg-background-dark border-t border-slate-200 dark:border-white/5 py-16 px-4 transition-colors duration-200">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                <div className="lg:col-span-2">
                    <div className="flex items-center gap-3 mb-6 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img src="/logo-diktalo.svg" alt="Diktalo Logo" className="h-8 w-auto" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-8 leading-relaxed">
                        {t('footerTagline')}
                    </p>
                    <div className="flex items-center gap-4">
                        <a href="https://x.com/diktalo" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                            <span className="material-symbols-outlined text-xl">share</span>
                        </a>
                        <a href="mailto:hello@diktalo.com" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                            <span className="material-symbols-outlined text-xl">mail</span>
                        </a>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <h4 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-[0.2em] mb-2">{t('navFeatures')}</h4>
                    <a href="#features" className="text-slate-500 hover:text-primary transition-colors text-sm font-medium">{t('feat1Title')}</a>
                    <a href="#features" className="text-slate-500 hover:text-primary transition-colors text-sm font-medium">{t('feat2Title')}</a>
                    <a href="#pricing" className="text-slate-500 hover:text-primary transition-colors text-sm font-medium">{t('navPricing')}</a>
                </div>

                <div className="flex flex-col gap-4">
                    <h4 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-[0.2em] mb-2">Legal</h4>
                    <a href="/terms" className="text-slate-500 hover:text-primary transition-colors text-sm font-medium">{t('footerTerms')}</a>
                    <a href="/privacy" className="text-slate-500 hover:text-primary transition-colors text-sm font-medium">{t('footerPrivacy')}</a>
                    <a href="mailto:hello@diktalo.com" className="text-slate-500 hover:text-primary transition-colors text-sm font-medium">{t('footerSupport')}</a>
                    <a href="mailto:hello@diktalo.com" className="text-slate-500 hover:text-primary transition-colors text-sm font-medium">{t('footerContact')}</a>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                <p>&copy; {new Date().getFullYear()} DIKTALO AI. TRANSCRIPTION & TELEPHONY SUITE.</p>
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                        {t('statusOk')}
                    </span>
                    <span className="px-2 py-0.5 border border-slate-200 dark:border-white/10 rounded">v2.1.0-BOUTIQUE</span>
                </div>
            </div>
        </footer>
    );
};
