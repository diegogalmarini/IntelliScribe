import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

export const Hero: React.FC = () => {
    const { t } = useLanguage();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        }
    };

    return (
        <section className="relative min-h-[90vh] flex items-center pt-24 pb-20 overflow-hidden bg-background-light dark:bg-background-dark transition-colors duration-200">
            {/* Background Image / Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/hero-executive.png"
                    alt="Executive using Diktalo"
                    className="w-full h-full object-cover opacity-20 dark:opacity-40 grayscale-[50%] blur-[2px]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background-light/80 via-transparent to-background-light dark:from-background-dark/80 dark:via-transparent dark:to-background-dark"></div>
            </div>

            {/* Decorative blobs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-brand-violet/20 blur-[120px] rounded-full"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-4xl"
                >
                    <motion.div variants={itemVariants}>
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6 tracking-wide uppercase border border-primary/20 border-opacity-50 backdrop-blur-sm">
                            {t('heroReview')} ⭐️
                        </span>
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className="text-5xl md:text-7xl lg:text-8xl font-display font-black mb-8 leading-[1.1] text-slate-900 dark:text-white tracking-widest uppercase"
                    >
                        {t('heroTitle').split(':').map((part, i) => (
                            <React.Fragment key={i}>
                                {i === 0 ? part : <span className="text-gradient-brand block">{part}</span>}
                            </React.Fragment>
                        ))}
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 leading-relaxed max-w-2xl font-medium"
                    >
                        {t('heroSubtitle')}
                    </motion.p>

                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row items-center gap-6"
                    >
                        <a
                            href="/login"
                            className="group relative px-10 py-5 bg-primary text-white font-black rounded-2xl shadow-2xl shadow-primary/40 flex items-center gap-3 overflow-hidden transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <span className="relative z-10 text-lg uppercase tracking-wider">{t('heroCTA')}</span>
                            <span className="material-symbols-outlined relative z-10 transition-transform group-hover:translate-x-1">arrow_forward</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </a>

                        <button
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-5 text-slate-600 dark:text-white font-bold hover:text-primary dark:hover:text-primary transition-all flex items-center gap-2 group"
                        >
                            {t('navFeatures')}
                            <span className="material-symbols-outlined text-2xl transition-transform group-hover:translate-y-1">expand_more</span>
                        </button>
                    </motion.div>

                    {/* Trust Badges */}
                    <motion.div
                        variants={itemVariants}
                        className="mt-20 pt-12 border-t border-slate-200 dark:border-white/5 flex flex-wrap items-center gap-8 md:gap-12 opacity-40 grayscale transition-all hover:grayscale-0 hover:opacity-100"
                    >
                        <div className="flex items-center gap-2 font-black text-xs tracking-widest text-slate-500 dark:text-slate-400">POWERED BY</div>
                        <div className="flex items-center gap-2 font-black text-xl italic tracking-tighter text-slate-900 dark:text-white">TWILIO</div>
                        <div className="flex items-center gap-2 font-black text-xl italic tracking-tighter text-slate-900 dark:text-white">SUPABASE</div>
                        <div className="flex items-center gap-2 font-black text-xl italic tracking-tighter text-slate-900 dark:text-white">GEMINI AI</div>
                        <div className="flex items-center gap-2 font-black text-xl italic tracking-tighter text-slate-900 dark:text-white">STRIPE</div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};
