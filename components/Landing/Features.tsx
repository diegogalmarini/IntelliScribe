import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

export const Features: React.FC = () => {
    const { t } = useLanguage();

    const textVariants = {
        hidden: { opacity: 0, x: -30 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.8 }
        }
    };

    const imageVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 1 }
        }
    };

    return (
        <section className="py-32 bg-white dark:bg-background-dark/50 transition-colors duration-200 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-24">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-slate-900 dark:text-white mb-6 tracking-tight uppercase"
                    >
                        The <span className="text-primary">Unfair Advantage</span> for Professionals
                    </motion.h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-base md:text-lg font-medium leading-relaxed">
                        {t('demoDesc')}
                    </p>
                </div>

                {/* Feature 1: 112+ Languages (Left Text, Right Image) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
                    <motion.div
                        variants={textVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-violet/10 text-brand-violet rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-brand-violet/20">
                            <span className="material-symbols-outlined text-sm">language</span>
                            Global Coverage
                        </div>
                        <h3 className="text-3xl md:text-4xl font-display font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                            {t('feat1Title')}
                        </h3>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                            {t('feat1Desc')}
                        </p>
                        <div className="flex flex-wrap gap-4">
                            {['English', 'Español', 'Français', 'Deutsch', '日本語', 'Português', 'Italiano', '+100'].map(lang => (
                                <span key={lang} className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                                    {lang}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        variants={imageVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="relative group"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-tr from-brand-violet/20 to-primary/20 blur-2xl rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <img
                            src="/images/features-meeting.png"
                            alt="Global Meeting Setup"
                            className="relative z-10 w-full rounded-[2rem] shadow-2xl border border-slate-200 dark:border-white/10"
                        />
                    </motion.div>
                </div>

                {/* Feature 2: Dialer (Right Image, Left Text - inverted for grid flow) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32 lg:flex-row-reverse">
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="lg:order-2"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-brand-blue/20">
                            <span className="material-symbols-outlined text-sm">call</span>
                            Integrated Telephony
                        </div>
                        <h3 className="text-3xl md:text-4xl font-display font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                            {t('feat2Title')}
                        </h3>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                            {t('feat2Desc')}
                        </p>
                        <ul className="space-y-4">
                            {[t('bizPlusF3'), 'Crystal clear VoIP', 'No sim card needed'].map((f, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-bold">
                                    <span className="material-symbols-outlined text-brand-blue">verified</span>
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        variants={imageVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="lg:order-1"
                    >
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 shadow-2xl border border-white/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>
                            {/* Mock UI for Dialer */}
                            <div className="relative z-10 flex flex-col gap-6">
                                <div className="flex items-center gap-4 border-b border-white/10 pb-6 text-white">
                                    <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-3xl">add_call</span>
                                    </div>
                                    <div>
                                        <div className="text-sm opacity-50 uppercase tracking-widest font-black">Ready to Call</div>
                                        <div className="text-xl font-black">+1 (800) DIKTALO</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map(n => (
                                        <div key={n} className="h-12 flex items-center justify-center bg-white/5 rounded-xl text-white font-bold hover:bg-white/10 cursor-pointer transition-colors">
                                            {n}
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20">
                                    DIAL NOW
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Feature 3: Analysis (Staggered Grid) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-green/10 text-brand-green rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-brand-green/20">
                            <span className="material-symbols-outlined text-sm">auto_awesome</span>
                            AI Intelligence
                        </div>
                        <h3 className="text-3xl md:text-4xl font-display font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                            {t('feat3Title')}
                        </h3>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                            {t('feat3Desc')}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            {[t('templateSales'), t('templateMedical'), t('templateLegal'), 'Custom Prompt'].map(t => (
                                <div key={t} className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    {t}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="p-1 group bg-gradient-to-br from-brand-green/30 to-brand-blue/30 rounded-[2rem] shadow-2xl">
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 overflow-hidden relative">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-2 text-primary">
                                        <span className="material-symbols-outlined">description</span>
                                        <span className="font-bold">Summary.pdf</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-slate-100 dark:bg-white/5 rounded w-3/4"></div>
                                        <div className="h-4 bg-slate-100 dark:bg-white/5 rounded w-full"></div>
                                        <div className="h-4 bg-slate-100 dark:bg-white/5 rounded w-5/6"></div>
                                    </div>
                                    <motion.div
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="mt-4 p-4 bg-primary/5 border border-primary/10 rounded-xl"
                                    >
                                        <p className="text-xs text-primary font-bold">Action Item: Client approved the budget for Q1 rollout.</p>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
