import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

export const Pricing: React.FC = () => {
    const { t } = useLanguage();

    const planVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <section id="pricing" className="py-24 bg-background-light dark:bg-background-dark/50 transition-colors duration-200 overflow-hidden relative">
            {/* Background Decorative */}
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white mb-6 tracking-tight uppercase"
                    >
                        {t('pricingTitle')}
                    </motion.h2>
                    <p className="text-slate-500 dark:text-text-secondary max-w-2xl mx-auto text-lg font-medium">
                        {t('pricingSubtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {/* Free Plan */}
                    <motion.div
                        variants={planVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-slate-200 dark:border-border-dark flex flex-col"
                    >
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{t('freeTitle')}</h3>
                        <p className="text-sm text-slate-500 mb-6">{t('freeDesc')}</p>
                        <div className="mb-8">
                            <span className="text-5xl font-black text-slate-900 dark:text-white">$0</span>
                            <span className="text-slate-400 font-bold ml-2">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-grow">
                            {[t('freeF1'), t('freeF2'), t('freeF3')].map(f => (
                                <li key={f} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                    <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <a href="/login" className="block w-full py-4 text-center rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-black hover:bg-slate-200 dark:hover:bg-white/10 transition-all uppercase tracking-wide text-xs">
                            {t('navGetStarted')}
                        </a>
                    </motion.div>

                    {/* Pro Plan -> Business+ (The Star) */}
                    <motion.div
                        variants={planVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="bg-white dark:bg-slate-900 p-8 rounded-3xl border-2 border-primary shadow-2xl shadow-primary/20 relative flex flex-col transform scale-105 z-10"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary text-white text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg">
                            Enterprise Ready
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{t('bizPlusTitle')}</h3>
                        <p className="text-sm text-primary font-bold mb-6">{t('bizPlusBadge')}</p>
                        <div className="mb-8">
                            <span className="text-5xl font-black text-slate-900 dark:text-white">$49</span>
                            <span className="text-slate-400 font-bold ml-2">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-grow">
                            {[t('bizPlusF1'), t('bizPlusF2'), t('bizPlusF3'), t('bizPlusF4')].map(f => (
                                <li key={f} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200 font-bold">
                                    <span className="material-symbols-outlined text-primary text-lg">verified</span>
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <a href="/login" className="block w-full py-5 text-center rounded-2xl bg-primary text-white font-black hover:bg-primary-hover shadow-xl shadow-primary/30 transition-all uppercase tracking-widest text-sm active:scale-95">
                            {t('subscribe')}
                        </a>
                    </motion.div>

                    {/* Business Plan */}
                    <motion.div
                        variants={planVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-slate-200 dark:border-border-dark flex flex-col"
                    >
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{t('bizTitle')}</h3>
                        <p className="text-sm text-slate-500 mb-6">{t('bizBadge')}</p>
                        <div className="mb-8">
                            <span className="text-5xl font-black text-slate-900 dark:text-white">$29</span>
                            <span className="text-slate-400 font-bold ml-2">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-grow">
                            {[t('bizF1'), t('bizF2'), t('bizF3'), t('bizF4')].map(f => (
                                <li key={f} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <a href="/login" className="block w-full py-4 text-center rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-black hover:bg-slate-200 dark:hover:bg-white/10 transition-all uppercase tracking-wide text-xs">
                            {t('navGetStarted')}
                        </a>
                    </motion.div>
                </div>

                {/* Zone 1 Disclaimer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-16 p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 text-center"
                >
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed max-w-4xl mx-auto">
                        {t('zone1Disclaimer')}
                    </p>
                </motion.div>
            </div>
        </section>
    );
};
