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
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using Diktalo ("the Service"), you accept and agree to be bound by these Terms of Service.
                            If you do not agree to these terms, you may not use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">2. Service Description</h2>
                        <p>
                            Diktalo provides AI-powered transcription, summarization, and intelligent search capabilities for audio recordings.
                            The Service includes voice recording, real-time transcription, AI chat for content analysis, and export functionality.
                        </p>
                    </section>

                    <section className="p-8 bg-primary/5 dark:bg-primary/10 rounded-[2rem] border border-primary/20">
                        <h2 className="text-xl font-display font-black text-primary mb-4 uppercase tracking-wider italic">3. "No AI Training" Guarantee</h2>
                        <p className="text-slate-900 dark:text-slate-100 font-bold">
                            Your data IS NEVER used to train our AI models, Google Gemini, or any other LLM.
                            We utilize API-based processing where data is used solely for inference and is not retained for model improvement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">4. Ownership & Intellectual Property</h2>
                        <p>
                            You retain 100% ownership of any audio, transcripts, and summaries generated through Diktalo.
                            Diktalo does not claim any rights to your content. We only process this data to provide the service as requested by you.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">5. Data Processors</h2>
                        <p className="mb-3">
                            To provide our services, we work with the following trusted third-party processors:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Supabase</strong> - Database and authentication services (EU servers)</li>
                            <li><strong>Google Gemini AI</strong> - AI transcription and analysis (API-only, no training)</li>
                            <li><strong>Stripe</strong> - Payment processing and subscription management</li>
                            <li><strong>Twilio</strong> - VoIP telephony services (Business+ plan only)</li>
                        </ul>
                        <p className="mt-3 text-sm">
                            All processors are GDPR-compliant and process data solely on our behalf under strict data processing agreements.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">6. Subscription & Payments</h2>
                        <p>
                            Paid plans are billed monthly or annually via Stripe. You may cancel your subscription at any time.
                            Refunds are provided on a case-by-case basis within 14 days of initial purchase.
                            Usage limits reset monthly on your subscription anniversary date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">7. Telephony & Recording Consent</h2>
                        <p>
                            Diktalo provides tools for recording calls and meetings. It is your absolute responsibility to ensure
                            compliance with local and international wiretapping and recording laws. You must obtain explicit
                            consent from all parties involved where required by law. Diktalo is not liable for your misuse of recording features.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">8. Privacy & Data Access</h2>
                        <p>
                            Authorized Diktalo engineers may access session metadata for troubleshooting. Audio content is strictly
                            off-limits unless you provide written authorization during a specific support ticket.
                            See our <a href="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</a> for full details.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">9. Termination</h2>
                        <p>
                            We reserve the right to suspend or terminate accounts that violate these terms, engage in abusive behavior,
                            or use the service for illegal purposes. You may delete your account at any time from Settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">10. Limitation of Liability</h2>
                        <p>
                            Diktalo is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental,
                            or consequential damages arising from your use of the Service. Maximum liability is limited to the amount
                            you paid in the past 12 months.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">11. Changes to Terms</h2>
                        <p>
                            We may update these Terms from time to time. Continued use of the Service after changes constitutes
                            acceptance of the new terms. Material changes will be communicated via email.
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
