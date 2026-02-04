import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Landing/Navbar';
import { Footer } from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfile } from '../types';
import { CheckCircle2, DollarSign, Globe, Timer } from 'lucide-react';

interface AffiliatesProps {
    user?: UserProfile;
    onUpdateUser?: (updates: Partial<UserProfile>) => void;
}

export const Affiliates: React.FC<AffiliatesProps> = ({ user, onUpdateUser }) => {
    const { t } = useLanguage();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const benefits = [
        {
            icon: <DollarSign className="w-8 h-8 text-primary" />,
            title: t('affiliates_benefit_recurring_title'),
            desc: t('affiliates_benefit_recurring_desc')
        },
        {
            icon: <Timer className="w-8 h-8 text-primary" />,
            title: t('affiliates_benefit_cookie_title'),
            desc: t('affiliates_benefit_cookie_desc')
        },
        {
            icon: <Globe className="w-8 h-8 text-primary" />,
            title: t('affiliates_benefit_global_title'),
            desc: t('affiliates_benefit_global_desc')
        }
    ];

    const steps = [
        {
            step: "01",
            title: t('affiliates_step_1_title'),
            desc: t('affiliates_step_1_desc')
        },
        {
            step: "02",
            title: t('affiliates_step_2_title'),
            desc: t('affiliates_step_2_desc')
        },
        {
            step: "03",
            title: t('affiliates_step_3_title'),
            desc: t('affiliates_step_3_desc')
        }
    ];

    return (
        <div className="landing-page bg-white dark:bg-[#0b0f17] min-h-screen font-sans transition-colors duration-300 overflow-x-hidden">
            <Navbar user={user} onUpdateUser={onUpdateUser} />

            <main className="pt-32 pb-40">
                {/* 1. Hero Section - Clean & Minimal */}
                <section className="max-w-4xl mx-auto px-6 mb-32 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-primary font-black text-[0.7rem] uppercase tracking-[0.4em] block mb-8">
                            {t('affiliates_title')}
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-12 tracking-tighter leading-[0.9]">
                            {t('affiliates_hero_title')}
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-16 max-w-3xl mx-auto">
                            {t('affiliates_hero_subtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <a
                                href="https://billing.diktalo.com/affiliates"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[0.8rem] font-black uppercase tracking-[0.3em] rounded-[2rem] hover:scale-105 transition-transform active:scale-95 shadow-2xl"
                            >
                                {t('affiliates_cta_join')}
                            </a>
                            <a
                                href="https://billing.diktalo.com/affiliates/login"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-10 py-5 bg-transparent border-2 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-[0.8rem] font-black uppercase tracking-[0.3em] rounded-[2rem] hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                            >
                                {t('affiliates_cta_login')}
                            </a>
                        </div>
                    </motion.div>
                </section>

                {/* 2. Benefits Grid - About Style Cards */}
                <section className="max-w-7xl mx-auto px-6 mb-32">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {benefits.map((benefit, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="group"
                            >
                                <div className="bg-slate-50 dark:bg-white/[0.02] p-10 md:p-14 rounded-[2.5rem] border border-slate-100 dark:border-white/5 h-full transition-all duration-500 hover:bg-white dark:hover:bg-[#161b26] hover:shadow-2xl">
                                    <div className="mb-10 p-4 bg-white dark:bg-white/5 rounded-2xl inline-block shadow-sm">
                                        {benefit.icon}
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">
                                        {benefit.title}
                                    </h3>
                                    <div className="h-px w-full bg-slate-200 dark:bg-white/5 mb-6"></div>
                                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                        {benefit.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 3. How it Works - Timeline Style */}
                <section className="max-w-5xl mx-auto px-6 mb-32">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-6 italic">
                            {t('affiliates_steps_title')}<span className="text-primary">.</span>
                        </h2>
                    </div>

                    <div className="relative">
                        {/* Central Line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-white/10 hidden md:block" />

                        <div className="space-y-16">
                            {steps.map((step, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className={`relative flex flex-col md:flex-row items-center gap-12 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                                >
                                    <div className={`w-full md:w-1/2 ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                                        <div className="bg-white dark:bg-[#0b0f17] p-8 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl relative z-10">
                                            <span className="text-6xl font-black text-slate-100 dark:text-white/5 absolute -top-4 -left-4 z-0 pointer-events-none">
                                                {step.step}
                                            </span>
                                            <div className="relative z-10">
                                                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                                                    {step.title}
                                                </h4>
                                                <p className="text-slate-500 dark:text-slate-400 font-medium">
                                                    {step.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Center Node */}
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center z-10 bg-white dark:bg-[#0b0f17] p-2">
                                        <div className="w-4 h-4 rounded-full bg-primary" />
                                    </div>

                                    <div className="hidden md:block md:w-1/2" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. Final CTA - Minimalist */}
                <section className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-slate-900 dark:bg-white/[0.03] rounded-[3rem] p-16 md:p-20 relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-10 tracking-tighter leading-tight">
                                Ready to start earning?
                            </h2>
                            <a
                                href="https://billing.diktalo.com/affiliates"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-12 py-5 bg-white text-slate-900 font-black uppercase tracking-[0.2em] text-sm rounded-full hover:scale-105 transition-transform shadow-2xl"
                            >
                                {t('affiliates_cta_join')}
                            </a>
                        </div>
                    </motion.div>
                </section>
            </main>

            <Footer />
        </div>
    );
};
