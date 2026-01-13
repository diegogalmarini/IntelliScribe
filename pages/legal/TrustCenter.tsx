import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Server, FileText, CheckCircle, Cpu } from 'lucide-react';
import { LegalLayout } from '../../layouts/LegalLayout';
import { useLanguage } from '../../contexts/LanguageContext';

export const TrustCenter: React.FC = () => {
    const { t, language } = useLanguage();
    const statusText = language === 'es' ? 'Estado: Activo' : 'Live Status: Active';

    return (
        <LegalLayout title={t('trust_title')} lastUpdated={statusText}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-16"
            >
                {/* Intro */}
                <div className="not-prose">
                    <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                        {t('trust_intro')}
                    </p>
                </div>

                {/* 4 Pillars of Security */}
                <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pillar 1 */}
                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                            <Lock className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('trust_pillar1_title')}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: t('trust_pillar1_desc') }} />
                    </div>

                    {/* Pillar 2 */}
                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                            <Database className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('trust_pillar2_title')}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            {t('trust_pillar2_desc')}
                        </p>
                    </div>

                    {/* Pillar 3 */}
                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                            <Server className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('trust_pillar3_title')}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: t('trust_pillar3_desc') }} />
                    </div>

                    {/* Pillar 4 */}
                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4">
                            <Eye className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('trust_pillar4_title')}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: t('trust_pillar4_desc') }} />
                    </div>
                </div>

                {/* AI Privacy Section */}
                <div className="not-prose p-8 bg-slate-900 text-white rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Cpu className="w-48 h-48" />
                    </div>

                    <h2 className="text-2xl font-bold mb-6 relative z-10">{t('trust_ai_title')}</h2>

                    <div className="space-y-6 relative z-10">
                        <div className="flex gap-4 items-start">
                            <div className="p-1 bg-red-500/20 rounded text-red-400 mt-1">
                                <span className="material-symbols-outlined">close</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-1">{t('trust_ai_q')}</h4>
                                <p className="text-red-300 font-bold tracking-wide">{t('trust_ai_a')}</p>
                            </div>
                        </div>
                        <p className="text-slate-300 leading-relaxed pl-12">
                            {t('trust_ai_desc')}
                        </p>
                    </div>
                </div>

                {/* Transparency & Compliance Grid */}
                <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Transparency */}
                    <div className="p-8 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <FileText className="w-5 h-5 text-primary" />
                            {t('trust_transparency_title')}
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                <div>
                                    <strong className="block text-slate-900 dark:text-white text-sm">{t('trust_transparency_li1_title')}</strong>
                                    <span className="text-slate-500 text-xs">{t('trust_transparency_li1_desc')}</span>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                <div>
                                    <strong className="block text-slate-900 dark:text-white text-sm">{t('trust_transparency_li2_title')}</strong>
                                    <span className="text-slate-500 text-xs">{t('trust_transparency_li2_desc')}</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Compliance */}
                    <div className="p-8 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <Shield className="w-5 h-5 text-primary" />
                            {t('trust_compliance_title')}
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-transparent">
                                <div className="font-bold text-sm">{t('trust_compliance_gdpr')}</div>
                                <span className="text-slate-500 text-xs ml-auto">{t('trust_compliance_gdpr_region')}</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-transparent">
                                <div className="font-bold text-sm">{t('trust_compliance_ccpa')}</div>
                                <span className="text-slate-500 text-xs ml-auto">{t('trust_compliance_ccpa_region')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="not-prose border-t border-slate-200 dark:border-white/10 pt-12">
                    <h4 className="text-slate-900 dark:text-white font-bold mb-2">{t('trust_report_title')}</h4>
                    <p className="text-slate-500 text-sm mb-4">{t('trust_report_desc')}</p>
                    <a href="mailto:security@diktalo.com" className="text-primary font-medium hover:underline">security@diktalo.com</a>
                </div>

            </motion.div>
        </LegalLayout>
    );
};

export default TrustCenter;
