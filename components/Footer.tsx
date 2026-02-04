import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import * as Analytics from '../utils/analytics';


export const Footer: React.FC = () => {
    const { t } = useLanguage();

    return (
        <footer className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-t border-slate-200/50 dark:border-white/10 py-16 px-4 transition-colors duration-200">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
                {/* Logo & Tagline Area */}
                <div className="lg:col-span-1">
                    <div className="flex items-center gap-3 mb-6 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img src="/logo-diktalo.svg" alt="Diktalo Logo" className="h-8 w-auto dark:hidden transition-all" />
                        <img src="/logo-diktalo-b.svg" alt="Diktalo Logo" className="h-8 w-auto hidden dark:block transition-all" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium max-w-xs mb-8 leading-relaxed">
                        {t('footerTagline')}
                    </p>
                </div>

                {/* Column 2: Product */}
                <div className="flex flex-col gap-4">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-2 opacity-50">{t('navFeatures')}</h4>
                    <a href="/#features" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-xs font-semibold">{t('feat1Title')}</a>
                    <a href="/manual?id=dialer" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-xs font-semibold">{t('feat2Title')}</a>
                    <a href="/roadmap" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-xs font-semibold">{t('roadmap_title')}</a>
                    <a href="/blog" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-xs font-semibold">Blog</a>
                    <a href="/comparar-planes" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-xs font-semibold">{t('navPricing')}</a>
                </div>

                {/* Column 3: Recording Methods */}
                <div className="flex flex-col gap-4">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-2 opacity-50">{t('footer_recording_methods')}</h4>
                    <a href="/manual?id=grabadora-audio" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-xs font-semibold">{t('footer_audio_recorder')}</a>
                    <a
                        href="/manual?id=grabadora-web"
                        onClick={() => {
                            if (Analytics && typeof Analytics.trackEvent === 'function') {
                                Analytics.trackEvent('click_chrome_ext', { location: 'footer' });
                            }
                        }}

                        className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-xs font-semibold"
                    >
                        {t('footer_chrome_ext')}
                    </a>
                    <a href="/manual?id=subir-archivos" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-xs font-semibold">{t('footer_upload')}</a>
                    <a href="/manual?id=multi-audio" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-xs font-semibold">Multi-Audio</a>
                    <a href="/manual?id=grabadora-llamada" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-xs font-semibold">{t('footer_call_recorder')}</a>
                </div>

                {/* Column 4: Legal */}
                <div className="flex flex-col gap-4">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-2 opacity-50">Legal</h4>
                    <a href="/terms" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-xs font-semibold">{t('footerTerms')}</a>
                    <a href="/privacy" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-xs font-semibold">{t('footerPrivacy')}</a>
                    <a href="/trust" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-xs font-semibold">Trust Center</a>
                </div>

                {/* Column 5: Contact */}
                <div className="flex flex-col gap-4">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-2 opacity-50">{t('footer_contact')}</h4>
                    <a href="/about" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-xs font-semibold">About Us</a>
                    <a href="/affiliates" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-xs font-semibold">{t('affiliates_title')}</a>
                    <a href="/contact" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-xs font-semibold">Contactanos</a>
                    <div className="flex items-center gap-3 mt-2">
                        <a href="https://x.com/diktalo" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                            <span className="material-symbols-outlined text-base">share</span>
                        </a>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-200/30 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-400/60">
                <p>&copy; {new Date().getFullYear()} Diktalo AI. Todos los derechos reservados.</p>
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Sistema activo
                    </span>
                    <span className="px-2 py-0.5 border border-slate-200 dark:border-white/10 rounded-md">v2.1.2</span>
                </div>
            </div>
            {/* Version bump to force refresh */}
        </footer >
    );
};
