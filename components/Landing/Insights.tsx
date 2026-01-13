import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

export const Insights: React.FC = () => {
    const { t } = useLanguage();

    return (
        <section id="insights" className="py-24 bg-white dark:bg-background-dark transition-colors duration-200 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    {/* Left Column: Text & Features */}
                    <div className="flex-1 text-left">
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="h2 text-slate-900 dark:text-white mb-6"
                        >
                            {t('insightsTitlePre')}{t('insightsTitleHighlight')}{t('insightsTitlePost')}
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 font-medium max-w-xl line-height-relaxed"
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
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + idx * 0.1 }}
                                    className="flex items-center gap-4 text-slate-700 dark:text-slate-200 font-bold"
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-primary text-xl">{feature.icon}</span>
                                    </div>
                                    <span className="text-lg">{t(feature.key as any)}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: High-Fidelity App Mockup */}
                    <div className="flex-1 w-full relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative bg-slate-900 rounded-[2.5rem] p-4 shadow-2xl border border-white/10"
                        >
                            <div className="bg-background-dark rounded-2xl overflow-hidden border border-white/5 aspect-video flex flex-col p-8">
                                {/* Header Minimalista */}
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                    </div>
                                    <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] text-white/50 font-mono tracking-widest uppercase">
                                        REC-50239-X
                                    </div>
                                </div>

                                {/* Area de Visualización de Ondas */}
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="flex items-center justify-center gap-1.5 h-16 mb-10">
                                        {[...Array(15)].map((_, i) => (
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
                                                    duration: 1.5 + Math.random(),
                                                    ease: "easeInOut"
                                                }}
                                                className="w-2 rounded-full bg-gradient-to-t from-primary/80 to-brand-green opacity-90"
                                            />
                                        ))}
                                    </div>

                                    {/* Barra de Progreso y Estados */}
                                    <div className="space-y-4 max-w-sm mx-auto w-full">
                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: "85%" }}
                                                transition={{ duration: 2, ease: "easeOut" }}
                                                className="h-full bg-primary"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="h-1.5 bg-white/5 rounded-full flex-[3]"></div>
                                            <div className="h-1.5 bg-white/5 rounded-full flex-1"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Controles (Literalmente como en el original) */}
                                <div className="mt-8 flex justify-center gap-6">
                                    <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center text-primary cursor-pointer hover:bg-primary/30 transition-all shadow-lg active:scale-95">
                                        <span className="material-symbols-outlined text-lg">pause</span>
                                    </div>
                                    <div className="w-11 h-11 rounded-full bg-red-500 flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-all shadow-xl active:scale-95">
                                        <span className="material-symbols-outlined text-lg">stop</span>
                                    </div>
                                </div>
                            </div>

                            {/* Badge de IA Badge */}
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-6 -right-6 bg-brand-violet px-5 py-2.5 rounded-2xl shadow-2xl text-white font-bold text-[10px] tracking-widest border border-white/20"
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
