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

export const Landing: React.FC = () => {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const { scrollYProgress } = useScroll();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="landing-page bg-background-light dark:bg-background-dark min-h-screen font-sans transition-colors duration-300">
            {/* SEO metadata would typically go in Header or via Helmet, assuming main index.html handles base SEO */}

            {/* Reading Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-brand z-[100] origin-left"
                style={{ scaleX }}
            />

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 h-20 transition-all">
                <div className="max-w-[1400px] mx-auto px-6 h-full flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img src="/logo-diktalo.svg" alt="Diktalo Logo" className="h-10 w-auto dark:hidden transition-all" />
                        <img src="/logo-diktalo-b.svg" alt="Diktalo Logo" className="h-10 w-auto hidden dark:block transition-all" />
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-12">
                        <nav className="flex items-center gap-10">
                            <button onClick={() => scrollToSection('solutions')} className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Soluciones</button>
                            <button onClick={() => scrollToSection('pricing')} className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Planes</button>
                            <button onClick={() => scrollToSection('faq')} className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">FAQ</button>
                            <button onClick={() => scrollToSection('blog')} className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Blog</button>
                            <a href="mailto:hello@diktalo.com" className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Contacto</a>
                        </nav>

                        <div className="flex items-center gap-6 border-l border-slate-200 dark:border-white/10 pl-10">
                            <a href="/login" className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                                Login
                            </a>
                            <a href="/login" className="px-5 py-2.5 bg-slate-950 text-white text-[13px] font-semibold rounded-lg hover:shadow-lg transition-all active:scale-95 btn-owner">
                                {t('navCtaFree')}
                            </a>
                            <div className="flex items-center gap-3 pl-2">
                                <LanguageSelector />
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="lg:hidden flex items-center gap-4">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-white dark:bg-background-dark pt-24 px-6 lg:hidden"
                    >
                        <div className="flex flex-col gap-6 text-center">
                            <button onClick={() => { scrollToSection('solutions'); setIsMenuOpen(false); }} className="text-xl font-bold text-slate-900 dark:text-white py-2">{t('solSectionTag')}</button>
                            <button onClick={() => { scrollToSection('pricing'); setIsMenuOpen(false); }} className="text-xl font-bold text-slate-900 dark:text-white py-2">Planes</button>
                            <button onClick={() => { scrollToSection('faq'); setIsMenuOpen(false); }} className="text-xl font-bold text-slate-900 dark:text-white py-2">FAQ</button>
                            <a href="/login" className="text-xl font-bold text-slate-900 dark:text-white py-2">Login</a>
                            <a href="/login" className="px-6 py-4 bg-primary text-white text-sm font-semibold rounded-xl mt-4">
                                {t('navCtaFree')}
                            </a>
                            <div className="flex justify-center gap-6 mt-8">
                                <LanguageSelector />
                                <ThemeToggle />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                            <p className="text-xs font-bold text-slate-500 mb-3">Preguntas frecuentes</p>
                            <h3 className="h2 text-slate-900 dark:text-white">Preguntas frecuentes</h3>
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
                                <p className="text-xs font-bold text-slate-500 mb-3">Blog</p>
                                <h3 className="h2 text-slate-900 dark:text-white">Últimas noticias</h3>
                            </div>
                            <button className="text-[11px] font-bold px-8 py-3 border border-slate-200 dark:border-white/10 rounded-full hover:bg-slate-50 dark:hover:bg-white/5 transition-all">Ver todas</button>
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
                        <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
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
