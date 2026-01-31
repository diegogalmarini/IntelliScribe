import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Navbar } from '../components/Landing/Navbar';
import { Footer } from '../components/Footer';
import { UserProfile } from '../types';
import { CheckCircle2, CircleDashed, Timer, Rocket, Shield, Code, Share2 } from 'lucide-react';

export const Roadmap: React.FC<{ user?: UserProfile }> = ({ user }) => {
    const { t } = useLanguage();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const roadmapData = [
        {
            quarter: t('roadmap_q1_date'),
            title: t('roadmap_q1_title'),
            desc: t('roadmap_q1_desc'),
            status: 'done',
            icon: Rocket,
            color: 'text-green-500',
            bgColor: 'bg-green-100 dark:bg-green-900/30'
        },
        {
            quarter: t('roadmap_q2_date'),
            title: t('roadmap_q2_title'),
            desc: t('roadmap_q2_desc'),
            status: 'progress',
            icon: Shield,
            color: 'text-blue-500',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30'
        },
        {
            quarter: t('roadmap_q3_date'),
            title: t('roadmap_q3_title'),
            desc: t('roadmap_q3_desc'),
            status: 'upcoming',
            icon: Code,
            color: 'text-purple-500',
            bgColor: 'bg-purple-100 dark:bg-purple-900/30'
        },
        {
            quarter: t('roadmap_q4_date'),
            title: t('roadmap_q4_title'),
            desc: t('roadmap_q4_desc'),
            status: 'upcoming',
            icon: Share2,
            color: 'text-amber-500',
            bgColor: 'bg-amber-100 dark:bg-amber-900/30'
        }
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'done':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wider">
                        <CheckCircle2 size={14} />
                        {t('roadmap_status_done')}
                    </span>
                );
            case 'progress':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider animate-pulse">
                        <CircleDashed size={14} className="animate-spin-slow" />
                        {t('roadmap_status_progress')}
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <Timer size={14} />
                        {t('roadmap_status_upcoming')}
                    </span>
                );
        }
    };

    return (
        <div className="landing-page bg-white dark:bg-[#0b0f17] min-h-screen font-sans transition-colors duration-300">
            <Navbar user={user} />

            <main className="pt-32 pb-24">
                <section className="max-w-7xl mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6"
                        >
                            <Rocket size={16} />
                            2026 Vision
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="h1 home text-slate-900 dark:text-white mb-6"
                        >
                            {t('roadmap_title')}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
                        >
                            {t('roadmap_subtitle')}
                        </motion.p>
                    </div>

                    {/* Timeline */}
                    <div className="max-w-4xl mx-auto relative">
                        {/* Central Line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-white/10 hidden md:block" />

                        <div className="space-y-12 md:space-y-24">
                            {roadmapData.map((item, idx) => (
                                <motion.div
                                    key={item.quarter}
                                    initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6 }}
                                    className={`relative flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                                        }`}
                                >
                                    {/* Content Card */}
                                    <div className={`w-full md:w-1/2 ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                                        <div className="bg-slate-50 dark:bg-[#161b22] border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all group">
                                            <div className={`flex items-center gap-4 mb-4 ${idx % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                                                <div className={`w-12 h-12 rounded-2xl ${item.bgColor} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                                                    <item.icon size={24} />
                                                </div>
                                                <div className="text-xl font-black text-primary tracking-tight">
                                                    {item.quarter}
                                                </div>
                                            </div>

                                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                                {item.title}
                                            </h3>

                                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                                {item.desc}
                                            </p>

                                            <div className={`mt-8 flex ${idx % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                                                {getStatusBadge(item.status)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Center Dot */}
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center">
                                        <div className="w-4 h-4 rounded-full bg-white dark:bg-[#0b0f17] border-4 border-primary z-10" />
                                        <div className="absolute w-12 h-12 bg-primary/20 rounded-full blur-md animate-pulse" />
                                    </div>

                                    {/* Spacer for empty side */}
                                    <div className="hidden md:block md:w-1/2" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Bottom CTA or Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="max-w-4xl mx-auto px-4 mt-32 text-center"
                >
                    <div className="p-12 rounded-[3rem] bg-gradient-brand text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black mb-6">{t('roadmap_suggest_title')}</h2>
                            <p className="text-blue-100 mb-10 max-w-md mx-auto font-medium">
                                {t('roadmap_suggest_desc')}
                            </p>
                            <button className="px-8 py-4 bg-white text-primary font-black rounded-2xl hover:bg-blue-50 transition-colors shadow-lg">
                                {t('roadmap_suggest_cta')}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
};
