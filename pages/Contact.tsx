import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { X, Send, CheckCircle2, MessageSquare, HelpCircle, Mail, AlertCircle, Loader2 } from 'lucide-react';

export const Contact: React.FC = () => {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        topic: 'support',
        subject: '',
        message: ''
    });

    const topics = [
        { value: 'support', label: t('contactTopicSupport') },
        { value: 'sales', label: t('contactTopicSales') },
        { value: 'partnership', label: t('contactTopicPartnership') },
        { value: 'feedback', label: t('contactTopicFeedback') },
        { value: 'other', label: t('contactTopicOther') }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            console.log('✉️ [Contact] Submitting form...', {
                topic: formData.topic,
                subject: formData.subject,
                email: formData.email
            });

            // Construct the HTML email content
            const htmlContent = `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; line-height: 1.6;">
                    <h2 style="color: #2563eb;">New Contact Form Submission</h2>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                        <p><strong>Topic:</strong> ${formData.topic.toUpperCase()}</p>
                        <p><strong>Name:</strong> ${formData.name}</p>
                        <p><strong>Email:</strong> ${formData.email}</p>
                        <p><strong>Subject:</strong> ${formData.subject}</p>
                    </div>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <h3>Message:</h3>
                    <div style="white-space: pre-wrap; background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        ${formData.message}
                    </div>
                    <p style="font-size: 12px; color: #64748b; margin-top: 30px;">
                        Sent via Diktalo Contact Form. IP Diagnostics logged.
                    </p>
                </div>
            `;

            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    to: 'support@diktalo.com',
                    subject: `[Contact Form] ${formData.topic.toUpperCase()}: ${formData.subject}`,
                    html: htmlContent,
                    channel: 'support',
                    replyTo: formData.email
                })
            });

            // Handle non-JSON or problematic responses
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('❌ [Contact] Non-JSON response:', text);
                throw new Error(`Server returned non-JSON response (${response.status})`);
            }

            const data = await response.json();

            if (!response.ok) {
                console.error('❌ [Contact] Request failed:', data);
                throw new Error(data.error || `Error ${response.status}: Failed to send message`);
            }

            console.log('✅ [Contact] Success:', data);
            setIsSuccess(true);
            setFormData({ name: '', email: '', topic: 'support', subject: '', message: '' });

        } catch (err: any) {
            console.error('🔥 [Contact] CRITICAL ERROR:', {
                name: err.name,
                message: err.message,
                stack: err.stack
            });

            // Helpful message for the "pattern" issue or other common failures
            if (err.message?.includes('pattern') || err.name === 'SyntaxError') {
                setError('Diagnostic: A browser error occurred during transmission. Please try disabling extensions like translators or password managers, or use a different browser.');
            } else {
                setError(err.message || 'Something went wrong. Please try again later.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#050505] pt-24 pb-12 px-4 transition-colors duration-300 font-sans">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-medium text-slate-900 dark:text-white mb-4 tracking-tight">
                        {t('contactTitle')}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 font-normal">
                        {t('contactSubtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Sidebar / Info */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                            <h3 className="font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Mail className="w-5 h-5 text-blue-600" />
                                Email
                            </h3>
                            <a href="mailto:support@diktalo.com" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                support@diktalo.com
                            </a>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white">
                            <h3 className="font-medium text-lg mb-2">{t('contactSidebarTitle')}</h3>
                            <p className="text-white/80 text-sm mb-4">
                                {t('contactSidebarDesc')}
                            </p>
                            <a href="/manual" className="inline-flex items-center text-sm font-medium hover:underline text-white">
                                {t('contactSidebarManual')} <HelpCircle className="w-4 h-4 ml-1" />
                            </a>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="md:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-[#0f172a] p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl relative overflow-hidden"
                        >
                            <AnimatePresence mode="wait">
                                {isSuccess ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex flex-col items-center justify-center text-center py-12"
                                    >
                                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 text-green-600 dark:text-green-400">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-medium text-slate-900 dark:text-white mb-2">
                                            {t('contactSuccessTitle')}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                                            {t('contactSuccessDesc')}
                                        </p>
                                        <button
                                            onClick={() => setIsSuccess(false)}
                                            className="px-6 py-2.5 bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white rounded-full font-medium hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                                        >
                                            Send another message
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                                                    {t('contactFormName')}
                                                </label>
                                                <input required type="text" name="name" value={formData.name} onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0a0f18] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                                                    {t('contactFormEmail')}
                                                </label>
                                                <input required type="email" name="email" value={formData.email} onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0a0f18] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                                                {t('contactFormTopic')}
                                            </label>
                                            <div className="relative">
                                                <select name="topic" value={formData.topic} onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0a0f18] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none dark:text-white"
                                                >
                                                    {topics.map(t => (
                                                        <option key={t.value} value={t.value}>{t.label}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                                                {t('contactFormSubject')}
                                            </label>
                                            <input required type="text" name="subject" value={formData.subject} onChange={handleChange}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0a0f18] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                                                placeholder="..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                                                {t('contactFormMessage')}
                                            </label>
                                            <textarea required name="message" value={formData.message} onChange={handleChange} rows={5}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0a0f18] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none dark:text-white"
                                                placeholder="..."
                                            />
                                        </div>

                                        {error && (
                                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4" />
                                                {error}
                                            </div>
                                        )}

                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        {t('contactSending')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="w-5 h-5" />
                                                        {t('contactSendBtn')}
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};
