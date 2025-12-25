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
                        <img src="/logo-diktalo.svg" alt="Diktalo Logo" className="h-8 w-auto dark:brightness-0 dark:invert transition-all" />
                    </div>

                    <div className="hidden lg:flex items-center gap-10">
                        <nav className="flex items-center gap-8">
                            <button onClick={() => scrollToSection('features')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">{t('navFeatures')}</button>
                            <button onClick={() => scrollToSection('pricing')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">Planes</button>
                            <button onClick={() => scrollToSection('faq')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">FAQ</button>
                            <button onClick={() => scrollToSection('blog')} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">Blog</button>
                            <a href="mailto:hello@diktalo.com" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">Contacto</a>
                        </nav>

                        <div className="flex items-center gap-6 border-l border-slate-200 dark:border-white/10 pl-10">
                            <a href="/login" className="px-5 py-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 rounded-full hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                                Login
                            </a>
                            <a href="/login" className="px-6 py-2.5 bg-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95">
                                {t('navGetStarted')}
                            </a>
                            <div className="flex items-center gap-2">
                                <LanguageSelector />
                                <ThemeToggle />
                            </div>
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

                {/* FAQ Section */}
                <section id="faq" className="py-32 bg-white dark:bg-background-dark relative overflow-hidden">
                    <div className="max-w-4xl mx-auto px-4 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary mb-4">FAQ</h2>
                            <h3 className="text-3xl md:text-5xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight">Preguntas Frecuentes</h3>
                        </div>
                        <div className="space-y-6">
                            {[
                                { q: "¿Qué tan precisa es la transcripción?", a: "Diktalo alcanza una precisión del 98% en ambientes controlados gracias a nuestra integración con los modelos de IA más avanzados de Google y OpenAI." },
                                { q: "¿Mis datos están seguros?", a: "Absolutamente. Utilizamos cifrado AES-256 de nivel bancario y cumplimos con estándares internacionales de privacidad. Tus grabaciones son tuyas y solo tuyas." },
                                { q: "¿Cómo funciona el marcador VoIP?", a: "El marcador integrado te permite realizar llamadas directamente desde el navegador. Estas se graban y transcriben automáticamente en tiempo real sin hardware adicional." }
                            ].map((item, idx) => (
                                <div key={idx} className="p-8 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{item.q}</h4>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Latest Insights (Blog) */}
                <section id="blog" className="py-32 bg-slate-50 dark:bg-slate-950/50">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                            <div>
                                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary mb-4">Blog</h2>
                                <h3 className="text-3xl md:text-5xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight">Últimas Noticias</h3>
                            </div>
                            <button className="text-[10px] font-black uppercase tracking-[0.2em] px-8 py-3 border border-slate-200 dark:border-white/10 rounded-full hover:bg-white dark:hover:bg-white/5 transition-all uppercase">Ver todas</button>
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
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3 block">{post.cat}</span>
                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-primary transition-colors">{post.title}</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{post.date}</p>
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
                        <h2 className="text-3xl md:text-5xl font-display font-black text-white mb-8 tracking-tight uppercase">
                            {t('ctaTitle')}
                        </h2>
                        <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto mb-12 font-medium">
                            {t('ctaDesc')}
                        </p>
                        <a
                            href="/login"
                            className="inline-block px-12 py-5 bg-white text-primary text-xs font-bold rounded-full hover:bg-slate-50 hover:scale-105 transition-all shadow-2xl active:scale-95 uppercase tracking-[0.2em]"
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
