import React, { useEffect } from 'react';
import { Hero } from '../components/Landing/Hero';
import { Features } from '../components/Landing/Features';
import { Pricing } from '../components/Landing/Pricing';
import { Demo } from '../components/Landing/Demo';
import { Footer } from '../components/Footer';
import { motion, useScroll, useSpring } from 'framer-motion';

export const Landing: React.FC = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        // Force scroll to top on mount
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen font-sans">
            {/* Reading Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-brand z-[100] origin-left"
                style={{ scaleX }}
            />

            {/* Navbar (Static for now) */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-3xl">waves</span>
                        <span className="text-2xl font-display font-black text-slate-900 dark:text-white tracking-tight">
                            Diktalo
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Features</a>
                        <a href="/login" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Pricing</a>
                        <a href="/login" className="px-6 py-2.5 bg-primary text-white text-sm font-black rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95">
                            Get Started
                        </a>
                    </div>

                    <button className="md:hidden text-slate-900 dark:text-white">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>
            </nav>

            {/* Sections */}
            <Hero />

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ margin: "-100px" }}
            >
                <Features />
            </motion.div>

            <Demo />

            <Pricing />

            {/* Final CTA */}
            <section className="py-24 bg-primary overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-white blur-[100px] rounded-full"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-8 tracking-tight">
                        Ready to <span className="italic">upgrade</span> your workflow?
                    </h2>
                    <p className="text-white/80 text-xl max-w-2xl mx-auto mb-12">
                        Join hundreds of professionals who are already using Diktalo to master their meetings and focus on growth.
                    </p>
                    <a
                        href="/login"
                        className="inline-block px-12 py-5 bg-white text-primary text-xl font-black rounded-[2rem] hover:bg-slate-50 hover:scale-105 transition-all shadow-2xl active:scale-95"
                    >
                        Create My Account
                    </a>
                </div>
            </section>

            <Footer />
        </div>
    );
};
