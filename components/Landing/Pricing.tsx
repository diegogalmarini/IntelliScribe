import React from 'react';
import { motion } from 'framer-motion';

export const Pricing: React.FC = () => {
    return (
        <section className="py-24 bg-background-light dark:bg-background-dark/50 transition-colors duration-200 overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                        Choose Your <span className="text-brand-violet">Plan</span>
                    </h2>
                    <p className="text-slate-500 dark:text-text-secondary max-w-2xl mx-auto text-lg">
                        Simple, transparent pricing for every professional. Start small, scale as you grow.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                    {/* Free Plan */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-slate-200 dark:border-border-dark"
                    >
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Free</h3>
                        <div className="mb-6">
                            <span className="text-4xl font-black text-slate-900 dark:text-white">$0</span>
                            <span className="text-slate-400">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <span className="material-symbols-outlined text-green-500">check_circle</span>
                                24 minutes / month
                            </li>
                            <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <span className="material-symbols-outlined text-green-500">check_circle</span>
                                7 days storage
                            </li>
                            <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <span className="material-symbols-outlined text-green-500">check_circle</span>
                                Auto-Summaries
                            </li>
                        </ul>
                        <a href="/login" className="block w-full py-3 text-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                            Get Started
                        </a>
                    </motion.div>

                    {/* Pro Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white dark:bg-surface-dark p-8 rounded-3xl border-2 border-primary shadow-2xl shadow-primary/20 relative"
                    >
                        <div className="absolute top-0 right-8 -translate-y-1/2 px-4 py-1 bg-primary text-white text-xs font-black rounded-full uppercase tracking-widest">
                            Most Popular
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Business+</h3>
                        <div className="mb-6">
                            <span className="text-4xl font-black text-slate-900 dark:text-white">$49</span>
                            <span className="text-slate-400">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                                1,200 minutes / month
                            </li>
                            <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                                VoIP Cloud Calling
                            </li>
                            <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                                ID Verification
                            </li>
                            <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <span className="material-symbols-outlined text-primary">check_circle</span>
                                Priority AI Processing
                            </li>
                        </ul>
                        <a href="/login" className="block w-full py-4 text-center rounded-xl bg-primary text-white font-bold hover:bg-primary-hover shadow-lg shadow-primary/25 transition-all">
                            Upgrade Now
                        </a>
                    </motion.div>

                    {/* Enterprise / Business Plan */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-slate-200 dark:border-border-dark"
                    >
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Business</h3>
                        <div className="mb-6">
                            <span className="text-4xl font-black text-slate-900 dark:text-white">$29</span>
                            <span className="text-slate-400">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <span className="material-symbols-outlined text-brand-violet">check_circle</span>
                                600 minutes / month
                            </li>
                            <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <span className="material-symbols-outlined text-brand-violet">check_circle</span>
                                Unlimited Storage
                            </li>
                            <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <span className="material-symbols-outlined text-brand-violet">check_circle</span>
                                Dedicated Support
                            </li>
                        </ul>
                        <a href="/login" className="block w-full py-3 text-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                            Contact Sales
                        </a>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
