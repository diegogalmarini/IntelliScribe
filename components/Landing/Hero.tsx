import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { AnimatedCounter } from '../AnimatedCounter';

export const Hero: React.FC = () => {
    const { t } = useLanguage();
    const [transcribedMinutes, setTranscribedMinutes] = useState(14200);

    // Live counter simulation: Increment minutes every 3-7 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setTranscribedMinutes(prev => prev + 1);
        }, Math.random() * (7000 - 3000) + 3000);

        return () => clearInterval(interval);
    }, []);

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
            transition: { duration: 0.8 }
        }
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20 overflow-hidden bg-slate-950 transition-colors duration-200">
            {/* Ambient Background Structure */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {/* Moving Blobs */}
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[150px] rounded-full"
                ></motion.div>
                <motion.div
                    animate={{
                        x: [0, -80, 0],
                        y: [0, -40, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-violet/10 blur-[150px] rounded-full"
                ></motion.div>

                {/* Subtle Grid Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 w-full text-center">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center"
                >
                    <motion.div variants={itemVariants} className="mb-8">
                        <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            {t('heroReview')}
                        </span>
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl md:text-6xl font-display font-bold mb-8 leading-tight text-white tracking-tight max-w-4xl"
                    >
                        {t('heroTitle')}
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-lg md:text-xl text-slate-400 mb-12 leading-relaxed max-w-2xl font-medium"
                    >
                        {t('heroSubtitle')}
                    </motion.p>

                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row items-center gap-4 mb-20"
                    >
                        <a
                            href="/login"
                            className="px-12 py-5 bg-white text-slate-950 font-bold rounded-full shadow-[0_0_50px_rgba(255,255,255,0.15)] flex items-center gap-3 transition-all hover:scale-105 active:scale-95 text-xs uppercase tracking-[0.2em] group"
                        >
                            {t('heroCTA')}
                            <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                        </a>

                        <button
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-10 py-5 text-white/60 font-bold hover:text-white transition-all flex items-center gap-2 text-xs uppercase tracking-[0.2em]"
                        >
                            {t('navFeatures')}
                            <span className="material-symbols-outlined text-base">expand_more</span>
                        </button>
                    </motion.div>

                    {/* Live Metrics Row */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl"
                    >
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <div className="text-3xl font-display font-bold text-white mb-1">
                                <AnimatedCounter value={transcribedMinutes} duration={3} />+
                            </div>
                            <div className="text-xs uppercase tracking-widest text-white/40 font-bold">{t('metricMins')}</div>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <div className="text-3xl font-display font-bold text-white mb-1">
                                <AnimatedCounter value={1200} duration={2.5} />+
                            </div>
                            <div className="text-xs uppercase tracking-widest text-white/40 font-bold">{t('metricPros')}</div>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <div className="text-3xl font-display font-bold text-white mb-1">
                                <AnimatedCounter value={240} duration={2} />h+
                            </div>
                            <div className="text-xs uppercase tracking-widest text-white/40 font-bold">{t('metricSaved')}</div>
                        </div>
                    </motion.div>

                    {/* Trust Badges */}
                    <motion.div
                        variants={itemVariants}
                        className="mt-24 pt-10 border-t border-white/5 w-full max-w-4xl"
                    >
                        <p className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase mb-8">Powered by Industry Leaders</p>
                        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                            <span className="font-black text-xl italic tracking-tighter text-white">TWILIO</span>
                            <span className="font-black text-xl italic tracking-tighter text-white">SUPABASE</span>
                            <span className="font-black text-xl italic tracking-tighter text-white">GEMINI AI</span>
                            <span className="font-black text-xl italic tracking-tighter text-white">STRIPE</span>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};
