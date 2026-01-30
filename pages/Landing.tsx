import React, { useEffect } from 'react';
import { Hero } from '../components/Landing/Hero';
import { Insights } from '../components/Landing/Insights';
import { Solutions } from '../components/Landing/Solutions';
import { Pricing } from '../components/Landing/Pricing';
import { Footer } from '../components/Footer';
import { Testimonials } from '../components/Landing/Testimonials';
import { Features } from '../components/Landing/Features';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { ThemeToggle } from '../components/ThemeToggle';
import { Navbar } from '../components/Landing/Navbar';
import { UserProfile } from '../types';
import * as Analytics from '../utils/analytics';

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div
            className={`group border-b border-slate-100 dark:border-white/5 transition-all duration-300 ${isOpen ? 'pb-6' : 'pb-0'}`}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left focus:outline-none"
            >
                <h4 className={`text-base md:text-lg font-bold transition-colors duration-300 ${isOpen ? 'text-primary' : 'text-slate-900 dark:text-white group-hover:text-primary'}`}>
                    {question}
                </h4>
                <div className={`size-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-primary text-white rotate-45' : 'bg-slate-50 dark:bg-white/5 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                    <span className="material-symbols-outlined text-[20px]">add</span>
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <p className="text-sm md:text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium pr-12">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const Landing: React.FC<{ user?: UserProfile }> = ({ user }) => {
    const { t } = useLanguage();
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="landing-page bg-background-light dark:bg-background-dark min-h-screen font-sans transition-colors duration-300">
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-brand z-[100] origin-left"
                style={{ scaleX }}
            />

            <div className="z-50 relative">
                <Navbar user={user} />
            </div>

            <main>
                <Hero />

                <section id="solutions">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ margin: "-100px", once: true }}
                    >
                        <Solutions />
                    </motion.div>
                </section>

                <Features />

                <Insights />

                <section id="pricing">
                    <Pricing />
                </section>

                <Testimonials />

                <section id="faq" className="py-24 bg-white dark:bg-background-dark relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 relative z-10">
                        <div className="text-center mb-16 px-4">
                            <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest text-center">{t('faqHeader')}</p>
                            <h3 className="h2 home text-slate-900 dark:text-white max-w-2xl mx-auto text-center">{t('landing_faq_title')}</h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4 items-start">
                            {[
                                { q: t('faqPrivQ'), a: t('faqPrivA') },
                                { q: t('faqHardwareQ'), a: t('faqHardwareA') },
                                { q: t('faqPlansQ'), a: t('faqPlansA') },
                                { q: t('faqExportQ'), a: t('faqExportA') },
                                { q: t('faqTeamQ'), a: t('faqTeamA') },
                                { q: t('faqLanguagesQ'), a: t('faqLanguagesA') },
                                { q: t('faqExtensionQ'), a: t('faqExtensionA') },
                                { q: t('faqIntegrationsQ'), a: t('faqIntegrationsA') },
                                { q: t('faqDiarizationQ'), a: t('faqDiarizationA') },
                                { q: t('faqMobileQ'), a: t('faqMobileA') },
                                { q: t('faqTrainingQ'), a: t('faqTrainingA') },
                                { q: t('faqUploadLimitQ'), a: t('faqUploadLimitA') },
                                { q: t('faqSupportQ'), a: t('faqSupportA') },
                                { q: t('faqBillingChangeQ'), a: t('faqBillingChangeA') }
                            ].map((item, idx) => (
                                <FAQItem key={idx} question={item.q} answer={item.a} />
                            ))}
                        </div>
                    </div>
                </section>

                <section id="blog" className="py-24 bg-slate-50 dark:bg-slate-950/50">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                            <div>
                                <p className="text-xs font-bold text-slate-500 mb-3">{t('landing_blog_tag')}</p>
                                <h3 className="h2 home text-slate-900 dark:text-white">{t('landing_blog_latest')}</h3>
                            </div>
                            <button className="text-[11px] font-bold px-8 py-3 border border-slate-200 dark:border-white/10 rounded-full hover:bg-slate-50 dark:hover:bg-white/5 transition-all">{t('landing_blog_view_all')}</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { title: "Diktalo v2.1: El futuro de la telefonía con IA", date: "25 Dic 2025", cat: "Actualizaciones" },
                                { title: "Cómo optimizar tus reuniones de ventas con BANT", date: "20 Dic 2025", cat: "Estrategia" },
                                { title: "Seguridad y Privacidad en la IA Conversacional", date: "15 Dic 2025", cat: "Seguridad" }
                            ].map((post, idx) => (
                                <div key={idx} className="group cursor-pointer">
                                    <div className="aspect-[16/9] bg-slate-200 dark:bg-white/5 rounded-3xl mb-6 overflow-hidden transition-transform group-hover:scale-[1.02]">
                                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-brand-violet/20 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-4xl text-white/20">newspaper</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-primary mb-3 block">{post.cat}</span>
                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-primary transition-colors">{post.title}</h4>
                                    <p className="text-xs font-bold text-slate-400">{post.date}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-24 md:py-32 bg-primary overflow-hidden relative flex flex-col items-center justify-center text-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 pointer-events-none"></div>
                    <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center">
                        <h2 className="h2 home text-white mb-8 w-full text-center mx-auto">
                            {t('ctaTitle')}
                        </h2>
                        <h5 className="h5 home text-white/90 max-w-2xl mx-auto mb-12 font-medium text-center">
                            {t('ctaDesc')}
                        </h5>
                        <a
                            href="/login"
                            onClick={() => {
                                if (Analytics && typeof Analytics.trackEvent === 'function') {
                                    Analytics.trackEvent('click_final_cta_start');
                                }
                            }}
                            className="inline-block px-12 py-5 bg-white text-primary text-sm rounded-full hover:bg-slate-50 transition-all shadow-xl hover:shadow-2xl active:scale-95 mx-auto"
                            style={{ fontWeight: 500, marginTop: '1rem', fontSize: '.9rem' }}
                        >
                            {t('ctaButton')}
                        </a>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};
