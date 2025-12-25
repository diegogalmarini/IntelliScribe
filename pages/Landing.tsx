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
                        <img src="/logo-diktalo.svg" alt="Diktalo Logo" className="h-10 w-auto" />
                        <span className="text-2xl font-display font-black text-slate-900 dark:text-white tracking-tight hidden sm:block">
                            Diktalo
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <button
                            onClick={() => scrollToSection('features')}
                            className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                        >
                            {t('navFeatures')}
                        </button>
                        <button
                            onClick={() => scrollToSection('pricing')}
                            className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                        >
                            {t('navPricing')}
                        </button>
                        <div className="h-6 w-px bg-slate-200 dark:bg-white/10"></div>
                        <LanguageSelector />
                        <ThemeToggle />
                        <a href="/login" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                            {t('navLogin')}
                        </a>
                        <a href="/login" className="px-6 py-2.5 bg-primary text-white text-sm font-black rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95">
                            {t('navGetStarted')}
                        </a>
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
                <section className="py-24 bg-primary overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-white blur-[100px] rounded-full"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
                        <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-8 tracking-tight">
                            {t('ctaTitle')}
                        </h2>
                        <p className="text-white/80 text-xl max-w-2xl mx-auto mb-12">
                            {t('ctaDesc')}
                        </p>
                        <a
                            href="/login"
                            className="inline-block px-12 py-5 bg-white text-primary text-xl font-black rounded-[2rem] hover:bg-slate-50 hover:scale-105 transition-all shadow-2xl active:scale-95"
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
