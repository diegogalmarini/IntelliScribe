import React, { useEffect } from 'react';
import { Hero } from '../components/Landing/Hero';
import { Features } from '../components/Landing/Features';
import { Pricing } from '../components/Landing/Pricing';
import { Demo } from '../components/Landing/Demo';
import { Footer } from '../components/Footer';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { ThemeToggle } from '../components/ThemeToggle';

export const Landing: React.FC = () => {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const { scrollYProgress } = useScroll();
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
        <div className="bg-background-light dark:bg-background-dark min-h-screen font-sans transition-colors duration-300">
            {/* SEO metadata would typically go in Header or via Helmet, assuming main index.html handles base SEO */}

            {/* Reading Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-brand z-[100] origin-left"
                style={{ scaleX }}
            />

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-white/5 h-20 transition-all">
                <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img src="/logo-diktalo.svg" alt="Diktalo Logo" className="h-8 w-auto" />
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <nav className="flex items-center gap-8 mr-4">
                            <button
                                onClick={() => scrollToSection('features')}
                                className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                            >
                                {t('navFeatures')}
                            </button>
                            <button
                                onClick={() => scrollToSection('pricing')}
                                className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                            >
                                {t('navPricing')}
                            </button>
                        </nav>
                        <div className="flex items-center gap-4">
                            <LanguageSelector />
                            <ThemeToggle />
                            <a href="/login" className="px-5 py-2 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                {t('navLogin')}
                            </a>
                            <a href="/login" className="px-5 py-2.5 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95">
                                {t('navGetStarted')}
                            </a>
                        </div>
                    </div>

                    {/* Mobile Menu Toggle (Simplified) */}
                    <div className="md:hidden flex items-center gap-4">
                        <ThemeToggle />
                        <button className="text-slate-900 dark:text-white">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Sections with semantic IDs */}
            <main>
                <Hero />

                <section id="features">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ margin: "-100px", once: true }}
                    >
                        <Features />
                    </motion.div>
                </section>

                <Demo />

                <section id="pricing">
                    <Pricing />
                </section>

                {/* Final CTA */}
                <section className="py-32 bg-primary overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-white blur-[100px] rounded-full"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
                        <h2 className="text-3xl md:text-5xl font-display font-black text-white mb-8 tracking-tight uppercase">
                            {t('ctaTitle')}
                        </h2>
                        <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto mb-12 font-medium">
                            {t('ctaDesc')}
                        </p>
                        <a
                            href="/login"
                            className="inline-block px-10 py-5 bg-white text-primary text-sm font-black rounded-2xl hover:bg-slate-50 hover:scale-105 transition-all shadow-2xl active:scale-95 uppercase tracking-widest"
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
