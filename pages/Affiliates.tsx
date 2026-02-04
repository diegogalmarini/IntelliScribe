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
            icon: <DollarSign className="w-6 h-6 text-green-500" />,
            title: t('affiliates_benefit_recurring_title'),
            desc: t('affiliates_benefit_recurring_desc')
        },
        {
            icon: <Timer className="w-6 h-6 text-blue-500" />,
            title: t('affiliates_benefit_cookie_title'),
            desc: t('affiliates_benefit_cookie_desc')
        },
        {
            icon: <Globe className="w-6 h-6 text-purple-500" />,
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
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans transition-colors duration-300">
            <Navbar user={user} onUpdateUser={onUpdateUser} />

            <main className="pt-24 pb-16">
                {/* Hero Section */}
                <section className="relative px-6 py-20 lg:py-32 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent pointer-events-none" />

                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 rounded-full uppercase">
                                {t('affiliates_title')}
                            </span>
                            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight mb-8 tracking-tight">
                                {t('affiliates_hero_title')}
                            </h1>
                            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
                                {t('affiliates_hero_subtitle')}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <a
                                    href="https://billing.diktalo.com/affiliates"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-8 py-4 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95"
                                >
                                    {t('affiliates_cta_join')}
                                </a>
                                <a
                                    href="https://billing.diktalo.com/affiliates/login"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    {t('affiliates_cta_login')}
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Benefits Grid */}
                <section className="py-20 px-6 bg-white dark:bg-slate-900/40 relative border-y border-slate-100 dark:border-white/5">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                        {benefits.map((benefit, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors border border-slate-200/50 dark:border-white/5"
                            >
                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl inline-block shadow-sm mb-6">
                                    {benefit.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                    {benefit.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {benefit.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* How it Works */}
                <section className="py-24 px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                                {t('affiliates_steps_title')}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                            {/* Connector Line (Desktop) */}
                            <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-0.5 bg-slate-200 dark:bg-slate-800 z-0" />

                            {steps.map((step, idx) => (
                                <div key={idx} className="relative z-10 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 border-4 border-blue-50 dark:border-blue-900/30 flex items-center justify-center text-xl font-black text-slate-300 dark:text-slate-600 mb-6 shadow-sm">
                                        {step.step}
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                        {step.title}
                                    </h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[200px]">
                                        {step.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-20 px-6">
                    <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-2xl">
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold mb-8">
                                Ready to start earning?
                            </h2>
                            <a
                                href="https://billing.diktalo.com/affiliates"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-10 py-4 bg-white text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-all shadow-lg active:scale-95"
                            >
                                {t('affiliates_cta_join')}
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};
