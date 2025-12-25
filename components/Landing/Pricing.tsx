import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

export const Pricing: React.FC = () => {
    const { t } = useLanguage();
    const [billingInterval, setBillingInterval] = React.useState<'monthly' | 'annual'>('annual');

    const planVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <section id="pricing" className="py-32 bg-background-light dark:bg-background-dark/50 transition-colors duration-200 overflow-hidden relative">
            {/* Background Decorative */}
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-display font-black text-slate-900 dark:text-white mb-6 tracking-tight uppercase"
                    >
                        {t('pricingTitle')}
                    </motion.h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-base md:text-lg font-medium leading-relaxed mb-10">
                        {t('pricingSubtitle')}
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-12">
                        <span className={`text-xs font-black uppercase tracking-widest ${billingInterval === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Monthly</span>
                        <button
                            onClick={() => setBillingInterval(prev => prev === 'monthly' ? 'annual' : 'monthly')}
                            className="relative w-14 h-7 bg-slate-200 dark:bg-slate-800 rounded-full p-1 transition-colors duration-300"
                        >
                            <motion.div
                                animate={{ x: billingInterval === 'annual' ? 28 : 0 }}
                                className="w-5 h-5 bg-primary rounded-full shadow-lg"
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-black uppercase tracking-widest ${billingInterval === 'annual' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Annual</span>
                            <span className="bg-brand-green/20 text-brand-green text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter animate-pulse">Save 20%</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                    {/* Free Plan */}
                    <motion.div
                        variants={planVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/50 dark:border-white/10 flex flex-col hover:border-primary/30 transition-colors"
                    >
                        <h3 className="text-base font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{t('freeTitle')}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{t('freeDesc')}</p>
                        <div className="mb-8">
                            <span className="text-4xl font-black text-slate-900 dark:text-white">$0</span>
                            <span className="text-slate-400 font-bold ml-2">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-grow">
                            {[t('freeF1'), t('freeF2'), t('freeF3'), t('freeF4')].map(f => (
                                <li key={f} className="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
                                    <span className="material-symbols-outlined text-slate-400 text-lg">check_circle</span>
                                    <span className="leading-tight">{f}</span>
                                </li>
                            ))}
                        </ul>
                        <a href="/login" className="block w-full py-4 text-center rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-black hover:bg-slate-200 dark:hover:bg-white/10 transition-all uppercase tracking-wide text-[10px]">
                            {t('navGetStarted')}
                        </a>
                    </motion.div>

                    {/* Pro Plan */}
                    <motion.div
                        variants={planVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/50 dark:border-white/10 flex flex-col hover:border-brand-violet/30 transition-colors"
                    >
                        <h3 className="text-base font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{t('proTitle')}</h3>
                        <p className="text-xs text-brand-violet font-bold mb-6">{t('proBadge')}</p>
                        <div className="mb-8">
                            <span className="text-4xl font-black text-slate-900 dark:text-white">${billingInterval === 'annual' ? '12' : '15'}</span>
                            <span className="text-slate-400 font-bold ml-2">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-grow">
                            {[t('proF1'), t('proF2'), t('proF3'), t('proF4')].map(f => (
                                <li key={f} className="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium font-bold">
                                    <span className="material-symbols-outlined text-brand-violet text-lg">verified</span>
                                    <span className="leading-tight">{f}</span>
                                </li>
                            ))}
                        </ul>
                        <a href="/login" className="block w-full py-4 text-center rounded-2xl bg-brand-violet text-white font-black hover:bg-brand-violet/90 shadow-lg shadow-brand-violet/20 transition-all uppercase tracking-widest text-[10px]">
                            {t('subscribe')}
                        </a>
                    </motion.div>

                    {/* Business Plan */}
                    <motion.div
                        variants={planVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/50 dark:border-white/10 flex flex-col hover:border-brand-blue/30 transition-colors"
                    >
                        <h3 className="text-base font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{t('bizTitle')}</h3>
                        <p className="text-xs text-brand-blue font-bold mb-6">{t('bizBadge')}</p>
                        <div className="mb-8">
                            <span className="text-4xl font-black text-slate-900 dark:text-white">${billingInterval === 'annual' ? '19' : '25'}</span>
                            <span className="text-slate-400 font-bold ml-2">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-grow">
                            {[t('bizF1'), t('bizF2'), t('bizF3'), t('bizF4')].map(f => (
                                <li key={f} className="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium font-bold">
                                    <span className="material-symbols-outlined text-brand-blue text-lg">verified</span>
                                    <span className="leading-tight">{f}</span>
                                </li>
                            ))}
                        </ul>
                        <a href="/login" className="block w-full py-4 text-center rounded-2xl bg-brand-blue text-white font-black hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/20 transition-all uppercase tracking-widest text-[10px]">
                            {t('subscribe')}
                        </a>
                    </motion.div>

                    {/* Business Plus */}
                    <motion.div
                        variants={planVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="bg-white dark:bg-slate-900 p-8 rounded-3xl border-2 border-primary shadow-2xl shadow-primary/20 relative flex flex-col transform lg:scale-105 z-10"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary text-white text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg">
                            Enterprise
                        </div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{t('bizPlusTitle')}</h3>
                        <p className="text-xs text-primary font-bold mb-6">{t('bizPlusBadge')}</p>
                        <div className="mb-8">
                            <span className="text-4xl font-black text-slate-900 dark:text-white">${billingInterval === 'annual' ? '35' : '45'}</span>
                            <span className="text-slate-400 font-bold ml-2">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-grow">
                            {[t('bizPlusF1'), t('bizPlusF2'), t('bizPlusF3'), t('bizPlusF4')].map(f => (
                                <li key={f} className="flex items-start gap-3 text-xs text-slate-700 dark:text-slate-200 font-black">
                                    <span className="material-symbols-outlined text-primary text-lg">stars</span>
                                    <span className="leading-tight">{f}</span>
                                </li>
                            ))}
                        </ul>
                        <a href="/login" className="block w-full py-5 text-center rounded-2xl bg-primary text-white font-black hover:bg-primary-hover shadow-xl shadow-primary/30 transition-all uppercase tracking-widest text-xs active:scale-95">
                            {t('subscribe')}
                        </a>
                    </motion.div>
                </div>

                {/* Zone 1 Disclaimer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-20 p-8 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 text-center"
                >
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed max-w-4xl mx-auto uppercase tracking-wide">
                        {t('zone1Disclaimer')}
                    </p>
                </motion.div>
            </div>
        </section>
    );
};
