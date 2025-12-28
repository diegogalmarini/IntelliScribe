import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

export const Insights: React.FC = () => {
    const { t } = useLanguage();

    return (
        <section id="insights" className="py-32 bg-white dark:bg-[#0b0f17] transition-colors duration-200 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-24">
                    {/* Left Column: Extreme Minimalism Typography */}
                    <div className="flex-1 text-left">
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-6xl font-display font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-[1.05]"
                        >
                            {t('insightsTitlePre')} {t('insightsTitleHighlight')} {t('insightsTitlePost')}
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-medium max-w-lg"
                        >
                            {t('insightsSubtitle')}
                        </motion.p>

                        <div className="space-y-5">
                            {[
                                { key: 'insightsFeature1' },
                                { key: 'insightsFeature2' },
                                { key: 'insightsFeature3' }
                            ].map((feature, idx) => (
                                <motion.div
                                    key={feature.key}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + idx * 0.1 }}
                                    className="flex items-center gap-3 text-slate-900 dark:text-slate-200 font-bold"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white"></div>
                                    {t(feature.key as any)}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Monochromatic Wireframe Showcase */}
                    <div className="flex-1 w-full relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative bg-[#f8f9fa] dark:bg-slate-900 rounded-[2rem] p-4 border border-slate-200 dark:border-white/5"
                        >
                            <div className="bg-white dark:bg-background-dark rounded-xl overflow-hidden aspect-video flex flex-col p-8 border border-slate-100 dark:border-white/5">
                                {/* Monochromatic Header */}
                                <div className="flex justify-between items-center mb-10">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                                        <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                                        <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                                    </div>
                                    <div className="text-[10px] text-slate-300 font-mono tracking-widest uppercase">
                                        Processing...
                                    </div>
                                </div>

                                {/* Simplified Wave (Pure Gray) */}
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="flex items-center justify-center gap-2 h-10 mb-10">
                                        {[...Array(18)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{
                                                    height: [
                                                        `${20 + Math.random() * 50}%`,
                                                        `${30 + Math.random() * 40}%`,
                                                        `${20 + Math.random() * 50}%`
                                                    ]
                                                }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 2,
                                                    ease: "linear"
                                                }}
                                                className="w-0.5 bg-slate-200 dark:bg-slate-700"
                                            />
                                        ))}
                                    </div>

                                    {/* Minimalist Progress */}
                                    <div className="space-y-4 max-w-xs mx-auto w-full">
                                        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: "70%" }}
                                                transition={{ duration: 3 }}
                                                className="h-full bg-slate-900 dark:bg-white"
                                            />
                                        </div>
                                        <div className="h-1 bg-slate-50 dark:bg-slate-800/50 rounded-full w-2/3"></div>
                                    </div>
                                </div>

                                {/* Ghost Controls */}
                                <div className="mt-8 flex justify-center gap-10">
                                    <div className="text-slate-200">
                                        <span className="material-symbols-outlined text-base">pause</span>
                                    </div>
                                    <div className="text-slate-900 dark:text-white">
                                        <span className="material-symbols-outlined text-base">stop</span>
                                    </div>
                                </div>
                            </div>

                            {/* Minimal Tag (No Purple) */}
                            <div className="absolute top-8 right-8 bg-slate-900 dark:bg-white px-3 py-1.5 rounded text-white dark:text-slate-900 font-bold text-[9px] uppercase tracking-widest">
                                {t('insightsAiAnalysis')}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
