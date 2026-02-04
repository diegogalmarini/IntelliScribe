import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Landing/Navbar';
import { Footer } from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfile } from '../types';
import { Sparkles, Link as LinkIcon, DollarSign, Calendar, Wallet, UserPlus } from 'lucide-react';

interface AffiliatesProps {
    user?: UserProfile;
    onUpdateUser?: (updates: Partial<UserProfile>) => void;
}

export const Affiliates: React.FC<AffiliatesProps> = ({ user, onUpdateUser }) => {
    const { t } = useLanguage();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const faqItems = [
        {
            icon: <Sparkles className="w-6 h-6" />,
            title: t('affiliates_faq_promote_title'),
            desc: t('affiliates_faq_promote_desc')
        },
        {
            icon: <LinkIcon className="w-6 h-6" />,
            title: t('affiliates_faq_how_title'),
            desc: t('affiliates_faq_how_desc')
        },
        {
            icon: <DollarSign className="w-6 h-6" />,
            title: t('affiliates_faq_earn_title'),
            desc: t('affiliates_faq_earn_desc')
        },
        {
            icon: <Wallet className="w-6 h-6" />,
            title: t('affiliates_faq_minimum_title'),
            desc: t('affiliates_faq_minimum_desc')
        },
        {
            icon: <Calendar className="w-6 h-6" />,
            title: t('affiliates_faq_payout_title'),
            desc: t('affiliates_faq_payout_desc')
        },
        {
            icon: <UserPlus className="w-6 h-6" />,
            title: t('affiliates_faq_signup_title'),
            desc: t('affiliates_faq_signup_desc')
        }
    ];

    return (
        <div className="landing-page bg-white dark:bg-[#0b0f17] min-h-screen font-sans transition-colors duration-300 overflow-x-hidden">
            <Navbar user={user} onUpdateUser={onUpdateUser} />

            <main className="pt-32 pb-40">
                {/* 1. Hero Section - Centered & Punchy (Lemon Squeezy Style) */}
                <section className="max-w-6xl mx-auto px-6 mb-32 text-center relative">
                    {/* Background Blur */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="mb-12"
                    >


                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-[1.1] max-w-4xl mx-auto">
                            {t('affiliates_hero_title')} & <br className="hidden md:block" />
                            <span className="text-primary">{t('affiliates_hero_subtitle')}</span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium mb-12 max-w-2xl mx-auto">
                            {t('affiliates_benefit_recurring_desc')}
                        </p>

                        <a
                            href="https://billing.diktalo.com/affiliates"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-10 py-4 bg-primary text-white text-[0.9rem] font-bold rounded-lg hover:bg-blue-600 transition-all shadow-lg shadow-primary/30 transform hover:-translate-y-1"
                        >
                            {t('affiliates_cta_join')}
                        </a>

                        <div className="mt-6">
                            <a href="https://app.lemonsqueezy.com/login" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-slate-400 hover:text-primary transition-colors">
                                {t('affiliates_cta_login')} &rarr;
                            </a>
                        </div>
                    </motion.div>

                    {/* Influencer Image - Centered and High Impact */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="max-w-4xl mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-white/10"
                    >
                        <img
                            src="/influencer.webp"
                            alt="Diktalo Partner"
                            className="w-full h-auto object-cover"
                        />
                    </motion.div>
                </section>

                {/* 2. Q&A Grid (The core of the "Lemon Squeezy Look") */}
                <section className="max-w-6xl mx-auto px-6 mb-32">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20">
                        {faqItems.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex gap-6"
                            >
                                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10">
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                        {item.title}
                                    </h3>
                                    <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                        {item.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 3. Final Bottom CTA */}
                <section className="max-w-6xl mx-auto px-6 text-center border-t border-slate-100 dark:border-white/5 pt-32 mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative rounded-[3rem] overflow-hidden bg-slate-900 p-8 md:p-16 mb-20"
                    >
                        <div className="absolute inset-0 z-0">
                            <img
                                src="/influencer-panel.webp"
                                alt="Influencers making money"
                                className="w-full h-full object-cover opacity-40"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                        </div>

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tighter leading-tight italic">
                                Ya hay influencers haciendo dinero con Diktalo
                            </h2>
                            <div className="flex flex-col items-center gap-6">
                                <a
                                    href="https://billing.diktalo.com/affiliates"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center px-12 py-5 bg-primary text-white text-xl font-black rounded-xl hover:bg-blue-600 transition-all shadow-2xl shadow-primary/20 transform hover:-translate-y-1"
                                >
                                    {t('affiliates_cta_join')}
                                </a>
                                <a href="https://app.lemonsqueezy.com/login" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-white/50 hover:text-white transition-colors">
                                    {t('affiliates_cta_login')} &rarr;
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </section>
            </main>
            <Footer />
        </div>
    );
};
