import React from 'react';
import { motion } from 'framer-motion';

export const Hero: React.FC = () => {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-background-light dark:bg-background-dark transition-colors duration-200">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-violet/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6 tracking-wide uppercase border border-primary/20">
                        Meet Diktalo v1.0
                    </span>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black mb-8 leading-[1.1] text-slate-900 dark:text-white tracking-tighter">
                        Your <span className="text-gradient-brand">AI Executive</span> <br /> Secretary
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 dark:text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed">
                        Effortlessly record, transcribe, and summarize your meetings and calls with state-of-the-art AI. Stay focused on the conversation, we'll handle the notes.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <motion.a
                            href="/login"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/30 flex items-center gap-2 overflow-hidden"
                        >
                            <span className="relative z-10">Start for Free</span>
                            <span className="material-symbols-outlined relative z-10 transition-transform group-hover:translate-x-1">arrow_forward</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            {/* Pulse effect */}
                            <div className="absolute inset-0 rounded-2xl ring-4 ring-primary/50 animate-ping opacity-20"></div>
                        </motion.a>

                        <a
                            href="#features"
                            className="px-8 py-4 text-slate-600 dark:text-slate-300 font-bold hover:text-primary transition-colors flex items-center gap-2"
                        >
                            Explore Features
                            <span className="material-symbols-outlined text-xl">expand_more</span>
                        </a>
                    </div>
                </motion.div>

                {/* Trust Badges / Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="mt-20 pt-12 border-t border-slate-200 dark:border-white/5 flex flex-wrap justify-center items-center gap-8 md:gap-16 grayscale opacity-50 contrast-125"
                >
                    <div className="flex items-center gap-2 font-black text-xl italic tracking-tighter">TWILIO</div>
                    <div className="flex items-center gap-2 font-black text-xl italic tracking-tighter italic">SUPABASE</div>
                    <div className="flex items-center gap-2 font-black text-xl italic tracking-tighter">GEMINI AI</div>
                    <div className="flex items-center gap-2 font-black text-xl italic tracking-tighter">STRIPE</div>
                </motion.div>
            </div>
        </section>
    );
};
