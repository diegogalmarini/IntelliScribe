import React from 'react';
import { motion } from 'framer-motion';

export const Privacy: React.FC = () => {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-20 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto bg-white dark:bg-surface-dark p-8 md:p-12 rounded-2xl shadow-xl border border-slate-200 dark:border-border-dark"
            >
                <h1 className="text-4xl font-bold mb-8 text-slate-900 dark:text-white">Privacy Policy</h1>

                <div className="space-y-6 text-slate-600 dark:text-slate-300 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">1. Information We Collect</h2>
                        <p>We collect audio recordings, transcripts, and basic profile information (email, name) provided during signup.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">2. How We Use Your Data</h2>
                        <p>Your data is used solely to provide and improve the Diktalo experience, including AI processing and storage.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">3. Data Processors</h2>
                        <p>We work with the following trusted third-party providers to ensure a high-quality service:</p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li><strong>Google Gemini & OpenAI:</strong> AI processing for transcriptions and summaries.</li>
                            <li><strong>Twilio:</strong> Voice and communication services.</li>
                            <li><strong>Stripe:</strong> Secure payment processing and subscription management.</li>
                            <li><strong>Supabase:</strong> Secure database and file storage.</li>
                            <li><strong>Google Analytics:</strong> Monitoring platform usage data to improve user experience.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">4. Data Security</h2>
                        <p>We use industry-standard encryption and security practices to protect your data stored on Supabase.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">5. Your Rights</h2>
                        <p>You have the right to access, export, or delete your data at any time through the dashboard settings.</p>
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
