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
import { faqPool, FAQItemData } from '../utils/faqData';
import { blogPosts } from '../utils/blogData';
import { Link } from 'react-router-dom';

const FAQItem: React.FC<{ question: string; answer: string; isOpen: boolean; onToggle: () => void }> = ({ question, answer, isOpen, onToggle }) => {
    return (
        <div
            className={`group border-b border-slate-100 dark:border-white/5 transition-all duration-300 ${isOpen ? 'pb-6' : 'pb-0'}`}
        >
            <button
                onClick={onToggle}
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
    const { t, language } = useLanguage();
    const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(null);
    const [selectedFaqs, setSelectedFaqs] = React.useState<FAQItemData[]>([]);
    const { scrollYProgress } = useScroll();

    // Intelligent FAQ Selection Logic
    useEffect(() => {
        // 1. Sort by priority
        const sorted = [...faqPool].sort((a, b) => b.priority - a.priority);

        // 2. Separate into tiers
        const essentials = sorted.slice(0, 10); // Top 10 by priority
        const rest = sorted.slice(10);

        const finalSelection: FAQItemData[] = [];

        // Pick 6 from top priority (Essentials/Trending)
        const essentialSample = [...essentials].sort(() => 0.5 - Math.random()).slice(0, 6);
        finalSelection.push(...essentialSample);

        // Pick 8 from the rest (Discovery)
        const discoverySample = [...rest].sort(() => 0.5 - Math.random()).slice(0, 8);
        finalSelection.push(...discoverySample);

        // Shuffle the final 14 for true variety
        setSelectedFaqs(finalSelection.sort(() => 0.5 - Math.random()));
    }, []);

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
                        <div className="flex flex-col items-center justify-center text-center mb-16 px-4">
                            <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest">{t('faqHeader')}</p>
                            <h3 className="h2 home text-slate-900 dark:text-white w-full text-center">{t('landing_faq_title')}</h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4 items-start">
                            {selectedFaqs.map((item, idx) => (
                                <FAQItem
                                    key={item.id}
                                    question={language === 'es' ? item.es.question : item.en.question}
                                    answer={language === 'es' ? item.es.answer : item.en.answer}
                                    isOpen={openFaqIndex === idx}
                                    onToggle={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                <section id="blog" className="py-24 bg-slate-50 dark:bg-slate-950/50">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                            <div>
                                <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest">{t('landing_blog_tag')}</p>
                                <h3 className="h2 home text-slate-900 dark:text-white">{t('landing_blog_latest')}</h3>
                            </div>
                            <Link
                                to="/blog"
                                className="text-[11px] font-bold px-8 py-3 border border-slate-200 dark:border-white/10 rounded-full hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-slate-900 dark:text-white"
                            >
                                {t('landing_blog_view_all')}
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {blogPosts.slice(0, 3).map((post) => (
                                <Link
                                    key={post.id}
                                    to={`/blog/${post.slug}`}
                                    className="group cursor-pointer flex flex-col"
                                    style={{ transform: 'translateZ(0)' }}
                                >
                                    <div className="aspect-[16/9] bg-slate-200 dark:bg-white/5 rounded-3xl mb-6 overflow-hidden transition-transform duration-500 group-hover:scale-[1.02] relative shadow-lg ring-1 ring-slate-200/50 dark:ring-white/5" style={{ backfaceVisibility: 'hidden' }}>
                                        <img
                                            src={post.image}
                                            alt={post.imageAlt}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
                                            onError={(e) => {
                                                // Fallback if image fails to load
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement?.classList.add('bg-gradient-to-br', 'from-primary/20', 'to-brand-violet/20', 'flex', 'items-center', 'justify-center');
                                                const icon = document.createElement('span');
                                                icon.className = 'material-symbols-outlined text-4xl text-white/20';
                                                icon.innerText = 'newspaper';
                                                e.currentTarget.parentElement?.appendChild(icon);
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <span className="text-[10px] font-bold text-primary mb-3 block uppercase tracking-wider">{post.category}</span>
                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                                        {post.title}
                                    </h4>
                                    <p className="text-xs font-bold text-slate-400 mt-auto">
                                        {new Date(post.date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </Link>
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
