import React from 'react';
import { motion } from 'framer-motion';

export const Terms: React.FC = () => {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-20 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto bg-white dark:bg-surface-dark p-8 md:p-12 rounded-2xl shadow-xl border border-slate-200 dark:border-border-dark"
            >
                <h1 className="text-4xl font-bold mb-8 text-slate-900 dark:text-white">Terms of Service</h1>

                <div className="space-y-6 text-slate-600 dark:text-slate-300 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">1. Acceptance of Terms</h2>
                        <p>By accessing and using Diktalo, you agree to be bound by these Terms of Service.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">2. Service Description</h2>
                        <p>Diktalo provides AI-powered transcription, summarization, and communication tools.</p>
                    </section>

                    <section className="bg-primary/5 p-6 rounded-xl border border-primary/20">
                        <h2 className="text-2xl font-semibold mb-4 text-primary">3. Technical Support & Ghost Mode</h2>
                        <p className="font-medium">
                            Authorized administrators may access recording data strictly for technical support purposes.
                            This access is limited to cases where a user requests assistance or when troubleshooting critical system errors.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">4. User Responsibilities</h2>
                        <p>Users are responsible for obtaining consent from all participants before recording calls or meetings, in accordance with applicable local and international laws.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">5. Limitation of Liability</h2>
                        <p>Diktalo is provided "as is". We are not liable for any damages resulting from the use or inability to use our services.</p>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-border-dark flex justify-between items-center">
                    <p className="text-sm text-slate-500">Last updated: December 25, 2025</p>
                    <button
                        onClick={() => window.history.back()}
                        className="text-primary hover:underline font-medium"
                    >
                        Go Back
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
