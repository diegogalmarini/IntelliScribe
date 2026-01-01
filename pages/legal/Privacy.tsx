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
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">1. Introduction</h2>
                        <p>
                            Diktalo ("we", "us", "our") respects your privacy and is committed to protecting your personal data.
                            This Privacy Policy explains how we collect, use, and protect your information when you use our AI-powered
                            transcription and analysis service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">2. Data We Collect</h2>
                        <p className="mb-3">We only collect data necessary to provide our services:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Account Information:</strong> Email, name, profile picture (optional)</li>
                            <li><strong>Content Data:</strong> Audio recordings, transcripts, notes, and summaries you create</li>
                            <li><strong>Usage Data:</strong> Session metadata, feature usage, timestamps</li>
                            <li><strong>Payment Data:</strong> Processed securely by Stripe (we never store full card details)</li>
                            <li><strong>Telephony Data:</strong> Phone number (Business+ plan only, for VoIP services)</li>
                        </ul>
                    </section>

                    <section className="p-8 bg-brand-violet/5 dark:bg-brand-violet/10 rounded-[2rem] border border-primary/20">
                        <h2 className="text-xl font-display font-black text-primary mb-4 uppercase tracking-wider italic">3. AI Processing Guarantee</h2>
                        <p className="text-slate-900 dark:text-slate-100 font-bold">
                            Our AI processing (via Google Gemini) is conducted through secure, enterprise-grade APIs.
                            Google is contractually prohibited from using your data to train their models.
                            Data is processed, returned to Diktalo, and then immediately discarded by the AI provider.
                            <span className="block mt-2 text-primary">Your data IS NEVER used for AI training.</span>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">4. Legal Basis for Processing (GDPR)</h2>
                        <p className="mb-3">We process your personal data under the following legal bases:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Contract Performance:</strong> Processing audio, generating transcripts (Art. 6(1)(b) GDPR)</li>
                            <li><strong>Legitimate Interest:</strong> Service improvement, fraud prevention (Art. 6(1)(f) GDPR)</li>
                            <li><strong>Consent:</strong> Marketing communications, optional features (Art. 6(1)(a) GDPR)</li>
                            <li><strong>Legal Obligation:</strong> Tax records, compliance requirements (Art. 6(1)(c) GDPR)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">5. Data Processors & Sub-processors</h2>
                        <p className="mb-4">We work with trusted third-party processors who are GDPR-compliant and bound by data processing agreements:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase mb-2">Supabase (EU)</h4>
                                <p className="text-xs">Database & encrypted file storage (AES-256). Servers located in EU.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase mb-2">Google Gemini AI</h4>
                                <p className="text-xs">AI transcription & analysis. API-only, no training on your data.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase mb-2">Stripe</h4>
                                <p className="text-xs">PCI-DSS compliant payment processing. EU data residency available.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase mb-2">Twilio</h4>
                                <p className="text-xs">Secure VoIP routing (Business+ plan only). SOC 2 Type II certified.</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">6. Data Retention</h2>
                        <p>
                            <strong>Content Data:</strong> Recordings and transcripts are retained as long as your account is active.
                            Free plan users: 7 days. Paid plans: Until account deletion.<br /><br />
                            <strong>Account Data:</strong> Retained for the duration of your account plus 30 days for legal compliance.<br /><br />
                            <strong>Backup Data:</strong> Deleted data is purged from backups within 90 days.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">7. Your Rights (GDPR)</h2>
                        <p className="mb-3">Under GDPR, you have the following rights:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                            <li><strong>Right to Rectification:</strong> Correct inaccurate data via Settings</li>
                            <li><strong>Right to Erasure:</strong> Delete your account and all associated data</li>
                            <li><strong>Right to Portability:</strong> Export your data in JSON format</li>
                            <li><strong>Right to Object:</strong> Object to processing for marketing purposes</li>
                            <li><strong>Right to Restrict:</strong> Request limitation of processing in certain circumstances</li>
                        </ul>
                        <p className="mt-4 text-sm font-bold">
                            To exercise these rights, email us at <a href="mailto:privacy@diktalo.com" className="text-primary hover:underline">privacy@diktalo.com</a>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">8. Data Security</h2>
                        <p>
                            We implement industry-standard security measures including AES-256 encryption for data at rest,
                            TLS 1.3 for data in transit, role-based access controls, and regular security audits.
                            However, no system is 100% secure. We recommend using strong passwords and enabling two-factor authentication.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">9. International Transfers</h2>
                        <p>
                            Your data is primarily stored in EU data centers (via Supabase). If data is transferred outside the EU,
                            we ensure adequate safeguards through Standard Contractual Clauses (SCCs) approved by the European Commission.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">10. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. Material changes will be communicated via email
                            with 30 days' notice. Continued use of the Service after changes constitutes acceptance.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider italic">11. Contact Us</h2>
                        <p>
                            For privacy concerns, data requests, or GDPR-related inquiries, contact us at:<br /><br />
                            <strong>Email:</strong> <a href="mailto:privacy@diktalo.com" className="text-primary hover:underline">privacy@diktalo.com</a><br />
                            <strong>Data Protection Officer:</strong> <a href="mailto:dpo@diktalo.com" className="text-primary hover:underline">dpo@diktalo.com</a><br />
                            <strong>Address:</strong> Diktalo AI Intelligence Corp., [Your Business Address]
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
