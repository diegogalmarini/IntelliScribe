import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

export const Terms: React.FC = () => {
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
                        Terms of Service
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Last updated: January 2025</p>
                </div>

                <div className="space-y-12 text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">1. Ownership & Intellectual Property</h2>
                        <p>
                            You retain 100% ownership of any audio, transcripts, and summaries generated through Diktalo.
                            Diktalo does not claim any rights to your content. We only process this data to provide the service as requested by you.
                        </p>
                    </section>

                    <section className="p-8 bg-primary/5 dark:bg-primary/10 rounded-[2rem] border border-primary/20">
                        <h2 className="text-xl font-display font-black text-primary mb-4 uppercase tracking-wider italic">2. "No AI Training" Guarantee</h2>
                        <p className="text-slate-900 dark:text-slate-100 font-bold">
                            Your data IS NEVER used to train our AI models, Google Gemini, OpenAI, or any other LLM.
                            We utilize API-based processing where data is used solely for inference and is not retained for model improvement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">3. Telephony & Recording Consent</h2>
                        <p>
                            Diktalo provides tools for recording calls and meetings. It is your absolute responsibility to ensure
                            compliance with local and international wiretapping and recording laws. You must obtain explicit
                            consent from all parties involved where required by law.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">4. Technical Ghost Mode</h2>
                        <p>
                            Authorized Diktalo engineers may only access session metadata for troubleshooting. Audio content is strictly
                            off-limits unless a user provides written authorization during a specific support ticket.
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
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Diktalo AI Intelligence Corp.</p>
                </div>
            </motion.div>
        </div>
    );
};
