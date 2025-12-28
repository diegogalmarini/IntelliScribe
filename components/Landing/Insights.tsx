import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

export const Insights: React.FC = () => {
    const { t } = useLanguage();

    return (
        <section id="insights" className="py-24 bg-white dark:bg-background-dark transition-colors duration-200 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Left Column: Text (Minimalist) */}
                    <div className="flex-1 text-left">
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-4xl font-display font-black text-slate-900 dark:text-white mb-8 tracking-tight leading-tight"
                        >
                            {t('insightsTitlePre')} <span className="text-brand-green">{t('insightsTitleHighlight')}</span> {t('insightsTitlePost')}
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-base md:text-lg text-slate-500 dark:text-slate-400 mb-8 leading-relaxed font-medium"
                        >
                            {t('insightsSubtitle')}
                        </motion.p>

                        <div className="space-y-6">
                            {[
                                { key: 'insightsFeature1', icon: 'lyrics' },
                                { key: 'insightsFeature2', icon: 'history_edu' },
                                { key: 'insightsFeature3', icon: 'inventory_2' }
                            ].map((feature, idx) => (
                                <motion.div
                                    key={feature.key}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + idx * 0.1 }}
                                    className="flex items-center gap-4 text-slate-700 dark:text-slate-200 font-bold italic"
                                >
                                    <span className="material-symbols-outlined text-brand-green">{feature.icon}</span>
                                    {t(feature.key as any)}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Visual Component (Literal to user HTML but dynamic) */}
                    <div className="flex-1 w-full relative">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="relative bg-slate-900 rounded-[2rem] p-4 shadow-2xl border border-white/10"
                        >
                            <div className="bg-background-dark rounded-2xl overflow-hidden border border-white/5 aspect-video flex flex-col p-6">
                                {/* Recording Header */}
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                    </div>
                                    <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] text-white/50 font-mono">
                                        REC-50239-X
                                    </div>
                                </div>

                                {/* Waveform Area */}
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="flex items-center justify-center gap-1.5 h-16 mb-8">
                                        {[...Array(15)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-2 rounded-full bg-gradient-to-t from-primary to-brand-green opacity-80 wave-bar"
                                                style={{
                                                    height: `${15 + Math.random() * 85}%`
                                                }}
                                            />
                                        ))}
                                    </div>

                                    {/* Progress Simulation */}
                                    <div className="space-y-3">
                                        <div className="w-3/4 h-2 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: "85%" }}
                                                transition={{ duration: 1.5 }}
                                                className="h-full bg-primary"
                                            />
                                        </div>
                                        <div className="w-full h-2 bg-white/5 rounded-full"></div>
                                        <div className="w-1/2 h-2 bg-white/5 rounded-full"></div>
                                    </div>
                                </div>

                                {/* Controls (As in original HTML) */}
                                <div className="mt-auto flex justify-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary cursor-pointer">
                                        <span className="material-symbols-outlined">pause</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white cursor-pointer">
                                        <span className="material-symbols-outlined">stop</span>
                                    </div>
                                </div>
                            </div>

                            {/* AI Status Badge */}
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute -top-6 -right-6 bg-brand-violet p-4 rounded-2xl shadow-xl text-white font-bold text-xs"
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
