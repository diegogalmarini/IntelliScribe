import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

export const Privacy: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background-dark py-24 px-4 transition-colors duration-200">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-16 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/5"
            >
                <div className="mb-12 border-b border-slate-100 dark:border-white/5 pb-8">
                    <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase">
                        Privacy Policy
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Last updated: January 2025</p>
                </div>

                <div className="space-y-12 text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">1. Data Minimization</h2>
                        <p>
                            Diktalo only collects the data necessary to provide your transcription and telephony services.
                            This includes your email, profile name, and the audio recording/transcription data you explicitly generate.
                        </p>
                    </section>

                    <section className="p-8 bg-brand-violet/5 dark:bg-brand-violet/10 rounded-[2rem] border border-brand-violet/20">
                        <h2 className="text-xl font-display font-black text-brand-violet mb-4 uppercase tracking-wider italic">2. API-Only AI Processing</h2>
                        <p className="text-slate-900 dark:text-slate-100 font-bold">
                            Our AI processing (via Google Gemini and OpenAI) is conducted through secure, enterprise-grade APIs.
                            These providers are contractually prohibited from using your data to train their models.
                            Data is processed, returned to Diktalo, and then immediately discarded by the AI provider.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">3. Infrastructure & Processors</h2>
                        <p className="mb-6">We utilize the following industry leaders to ensure your data remains secure and private:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase mb-2">Supabase</h4>
                                <p className="text-xs">Database & Encrypted File Storage (AES-256).</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase mb-2">Twilio</h4>
                                <p className="text-xs">Secure VoIP Routing and Communication Protocol.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase mb-2">Google Gemini</h4>
                                <p className="text-xs">Advanced AI Intelligence & Large Language Model inference.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase mb-2">Stripe</h4>
                                <p className="text-xs">PCI-DSS Compliant Payment Processing.</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">4. Your Right to Erasure</h2>
                        <p>
                            Diktalo respects your right to be forgotten. You may delete any recording or your entire account
                            at any time through your dashboard. Upon deletion, all associated audio files and transcripts
                            are permanently purged from our primary production databases.
                        </p>
                    </section>
                </div>

                <div className="mt-16 pt-8 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs hover:gap-3 transition-all"
                    >
                        <span className="material-symbols-outlined">west</span>
                        Return
                    </button>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Privacy First. Diktalo AI.</p>
                </div>
            </motion.div>
        </div>
    );
};
