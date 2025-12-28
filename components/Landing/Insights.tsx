import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

export const Insights: React.FC = () => {
    const { t } = useLanguage();

    return (
        <section id="insights" className="py-32 bg-[#fafafa] dark:bg-background-dark transition-colors duration-200 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-20">
                    {/* Left Column: Owner-style Typography */}
                    <div className="flex-1 text-left">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-6xl font-display font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-[1.05]"
                        >
                            {t('insightsTitlePre')} <span className="text-brand-green">{t('insightsTitleHighlight')}</span> {t('insightsTitlePost')}
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-medium max-w-xl"
                        >
                            {t('insightsSubtitle')}
                        </motion.p>

                        <div className="space-y-6">
                            {[
                                { key: 'insightsFeature1', icon: 'check_circle' },
                                { key: 'insightsFeature2', icon: 'check_circle' },
                                { key: 'insightsFeature3', icon: 'check_circle' }
                            ].map((feature, idx) => (
                                <motion.div
                                    key={feature.key}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + idx * 0.1 }}
                                    className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-bold"
                                >
                                    <span className="material-symbols-outlined text-brand-green text-xl">{feature.icon}</span>
                                    {t(feature.key as any)}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Clean Product Showcase */}
                    <div className="flex-1 w-full relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-3 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-200 dark:border-white/10"
                        >
                            <div className="bg-slate-950 rounded-2xl overflow-hidden aspect-video flex flex-col p-8">
                                {/* Minimalist Header */}
                                <div className="flex justify-between items-center mb-10">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                                    </div>
                                    <div className="px-3 py-1 bg-white/5 rounded text-[9px] text-white/40 font-mono tracking-widest uppercase">
                                        Analytics Active
                                    </div>
                                </div>

                                {/* Waveform Visualization (Technical/Minimal) */}
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="flex items-center justify-center gap-1.5 h-12 mb-10">
                                        {[...Array(24)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{
                                                    height: [
                                                        `${20 + Math.random() * 60}%`,
                                                        `${40 + Math.random() * 40}%`,
                                                        `${20 + Math.random() * 60}%`
                                                    ]
                                                }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 1 + Math.random(),
                                                    ease: "easeInOut"
                                                }}
                                                className={`w-1 rounded-full ${i % 3 === 0 ? 'bg-brand-green' : 'bg-slate-700'}`}
                                            />
                                        ))}
                                    </div>

                                    {/* Clean Status Indicators */}
                                    <div className="space-y-4 max-w-xs mx-auto w-full">
                                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: "90%" }}
                                                transition={{ duration: 2 }}
                                                className="h-full bg-brand-green"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="h-1 bg-slate-800 rounded-full flex-[2]"></div>
                                            <div className="h-1 bg-slate-800 rounded-full flex-1"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Minimalist Controls */}
                                <div className="mt-8 flex justify-center gap-6">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 cursor-pointer hover:bg-white/10 transition-colors">
                                        <span className="material-symbols-outlined text-sm">pause</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-red-500/80 flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-all">
                                        <span className="material-symbols-outlined text-sm">stop</span>
                                    </div>
                                </div>
                            </div>

                            {/* Minimalist AI Badge */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="absolute -top-4 -right-4 bg-brand-violet px-4 py-2 rounded-xl shadow-xl text-white font-bold text-[10px] uppercase tracking-widest"
                            >
                                {t('insightsAiAnalysis')}
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
