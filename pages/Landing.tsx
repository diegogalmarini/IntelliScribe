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

export const Landing: React.FC<{ user?: UserProfile }> = ({ user }) => {
    const { t } = useLanguage();
    const { scrollYProgress } = useScroll();
    // const [isMenuOpen, setIsMenuOpen] = React.useState(false); // Unused, moved to Navbar
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Helper still needed for internal links if we keep the logic inside Landing to handle hash on load? 
    // Navbar now handles it via URL hash. Landing just needs sections with IDs.
    // scrollToSection was used by internal menu but Navbar handles it now.
    // We can remove scrollToSection unless it's used elsewhere. 
    // It was only used in the nav we removed.


    return (
        <div className="landing-page bg-background-light dark:bg-background-dark min-h-screen font-sans transition-colors duration-300">
            {/* SEO metadata would typically go in Header or via Helmet, assuming main index.html handles base SEO */}

            {/* Reading Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-brand z-[100] origin-left"
                style={{ scaleX }}
            />

            {/* Navbar imported from component */}
            <div className="z-50 relative">
                <Navbar user={user} />
            </div>

            {/* Sections with semantic IDs */}
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

                {/* FAQ Section */}
                <section id="faq" className="py-24 bg-white dark:bg-background-dark relative overflow-hidden">
                    <div className="max-w-4xl mx-auto px-4 relative z-10">
                        <div className="text-center mb-16">
                            <p className="text-xs font-bold text-slate-500 mb-3">{t('landing_faq_title')}</p>
                            <h3 className="h2 text-slate-900 dark:text-white">{t('landing_faq_title')}</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                { q: t('faqPrivQ'), a: t('faqPrivA') },
                                { q: t('faqHardwareQ'), a: t('faqHardwareA') },
                                { q: t('faqPlansQ'), a: t('faqPlansA') },
                                { q: t('faqExportQ'), a: t('faqExportA') },
                                { q: t('faqTeamQ'), a: t('faqTeamA') }
                            ].map((item, idx) => (
                                <div key={idx} className="p-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl transition-all hover:bg-white dark:hover:bg-white/10">
                                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">{item.q}</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Latest Insights (Blog) */}
                <section id="blog" className="py-24 bg-slate-50 dark:bg-slate-950/50">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                            <div>
                                <p className="text-xs font-bold text-slate-500 mb-3">{t('landing_blog_tag')}</p>
                                <h3 className="h2 text-slate-900 dark:text-white">{t('landing_blog_latest')}</h3>
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

                {/* Final CTA */}
                <section className="py-32 bg-primary overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-white blur-[100px] rounded-full"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
                        <h2 className="h2 text-white mb-8">
                            {t('ctaTitle')}
                        </h2>
                        <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium text-center">
                            {t('ctaDesc')}
                        </p>
                        <a
                            href="/login"
                            className="inline-block px-12 py-5 bg-white text-slate-900 text-sm font-bold rounded-full hover:bg-slate-50 transition-all shadow-2xl active:scale-95"
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
