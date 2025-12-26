import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

// Scarcity Hook (Melting Stock)
const useScarcity = () => {
    const [stock, setStock] = useState(89);

    useEffect(() => {
        // Initialize from localStorage or random
        const stored = localStorage.getItem('diktalo_early_bird_stock');
        const lastUpdate = localStorage.getItem('diktalo_early_bird_update');
        const now = Date.now();

        // Default range 85-95 if new
        let currentStock = stored ? parseInt(stored) : Math.floor(Math.random() * (95 - 85) + 85);

        if (lastUpdate) {
            // Decay based on time elapsed if valid
            const elapsed = now - parseInt(lastUpdate);
            const drops = Math.floor(elapsed / (45 * 1000)); // approx 1 drop per 45s
            if (drops > 0) {
                currentStock = Math.max(3, currentStock - drops);
            }
        }

        setStock(currentStock);

        // Decay Interval
        const interval = setInterval(() => {
            setStock(prev => {
                const next = Math.max(3, prev - 1);
                localStorage.setItem('diktalo_early_bird_stock', next.toString());
                localStorage.setItem('diktalo_early_bird_update', Date.now().toString());
                return next;
            });
        }, Math.random() * (90000 - 45000) + 45000); // Random decay 45-90s

        return () => clearInterval(interval);
    }, []);

    return stock;
};

export const Pricing: React.FC = () => {
    const { t } = useLanguage();
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');
    const remainingStock = useScarcity();

    const planVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-24 relative">
            {/* Background Gradients */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-gradient-to-r from-primary/10 to-brand-violet/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="text-center mb-16 relative z-10">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Pricing</h2>
                <h3 className="text-3xl md:text-5xl font-display font-bold text-slate-900 dark:text-white tracking-tight mb-8">
                    Simple, transparent pricing
                </h3>

                {/* Toggle */}
                <div className="inline-flex bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-slate-200 dark:border-white/10 relative">
                    <button
                        onClick={() => setBillingInterval('monthly')}
                        className={`px-6 py-2 rounded-full text-xs font-bold transition-all z-10 ${billingInterval === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingInterval('annual')}
                        className={`px-6 py-2 rounded-full text-xs font-bold transition-all z-10 ${billingInterval === 'annual' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}
                    >
                        Annual <span className="text-green-500 ml-1">-20%</span>
                    </button>

                    {/* Animated Pill */}
                    <motion.div
                        layout
                        className="absolute top-1 bottom-1 bg-white dark:bg-white/10 rounded-full shadow-sm"
                        initial={false}
                        animate={{
                            left: billingInterval === 'monthly' ? '4px' : '50%',
                            right: billingInterval === 'monthly' ? '50%' : '4px',
                            x: billingInterval === 'annual' ? 0 : 0
                        }}
                    />
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

                {/* Pro Plan (Early Bird) */}
                <motion.div
                    variants={planVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="relative bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-brand-violet/50 dark:border-brand-violet/50 flex flex-col hover:border-brand-violet transition-colors overflow-hidden ring-4 ring-brand-violet/10 transform md:-translate-y-4"
                >
                    {/* Early Bird Badge */}
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl animate-pulse z-20">
                        🔥 Early Bird Offer
                    </div>

                    <h3 className="text-base font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{t('proTitle')}</h3>
                    <p className="text-xs text-brand-violet font-bold mb-4">{t('proBadge')}</p>

                    {/* Scarcity Bar */}
                    <div className="mb-6 bg-slate-100 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Coupon: <span className="text-slate-900 dark:text-white font-black select-all cursor-pointer" onClick={() => navigator.clipboard.writeText('EARLY50')}>EARLY50</span></span>
                            <span className="text-[10px] uppercase font-bold text-red-500">{remainingStock} spots left</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: '100%' }}
                                animate={{ width: `${remainingStock}%` }}
                                className={`h-full rounded-full ${remainingStock < 10 ? 'bg-red-500' : 'bg-green-500'}`}
                            />
                        </div>
                    </div>

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
                    <a href="https://buy.stripe.com/test_eVaeV07Qd2C85S828a?prefilled_promo_code=EARLY50" className="block w-full py-4 text-center rounded-2xl bg-brand-violet text-white font-black hover:bg-brand-violet/90 shadow-lg shadow-brand-violet/20 transition-all uppercase tracking-wide text-[10px] active:scale-95">
                        {t('navGetStarted')}
                    </a>
                </motion.div>

                {/* Business Plan */}
                <motion.div
                    variants={planVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/50 dark:border-white/10 flex flex-col hover:border-blue-500/30 transition-colors"
                >
                    <h3 className="text-base font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{t('bizTitle')}</h3>
                    <p className="text-xs text-blue-500 font-bold mb-6">{t('bizBadge')}</p>
                    <div className="mb-8">
                        <span className="text-4xl font-black text-slate-900 dark:text-white">${billingInterval === 'annual' ? '29' : '39'}</span>
                        <span className="text-slate-400 font-bold ml-2">/mo</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-grow">
                        {[t('bizF1'), t('bizF2'), t('bizF3')].map(f => (
                            <li key={f} className="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
                                <span className="material-symbols-outlined text-blue-500 text-lg">verified</span>
                                <span className="leading-tight">{f}</span>
                            </li>
                        ))}
                    </ul>
                    <button className="block w-full py-4 text-center rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-black hover:bg-slate-200 dark:hover:bg-white/10 transition-all uppercase tracking-wide text-[10px]">
                        Contact Sales
                    </button>
                </motion.div>

                {/* Business Plus Plan */}
                <motion.div
                    variants={planVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/50 dark:border-white/10 flex flex-col hover:border-orange-500/30 transition-colors"
                >
                    <h3 className="text-base font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{t('bizPlusTitle')}</h3>
                    <p className="text-xs text-orange-500 font-bold mb-6">{t('bizPlusBadge')}</p>
                    <div className="mb-8">
                        <span className="text-4xl font-black text-slate-900 dark:text-white">Custom</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-grow">
                        <li className="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
                            <span className="material-symbols-outlined text-orange-500 text-lg">verified</span>
                            <span className="leading-tight">{t('bizPlusDesc')}</span>
                        </li>
                    </ul>
                    <button className="block w-full py-4 text-center rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-black hover:bg-slate-200 dark:hover:bg-white/10 transition-all uppercase tracking-wide text-[10px]">
                        Contact Sales
                    </button>
                </motion.div>
            </div>
        </div>
    );
};
