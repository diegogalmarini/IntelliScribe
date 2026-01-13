import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { LegalLayout } from '../../layouts/LegalLayout';

export const Privacy: React.FC = () => {
    const { t, language } = useLanguage();

    const lastUpdated = language === 'es' ? '05 de Enero de 2026' : 'January 5, 2026';

    return (
        <LegalLayout title={t('privacy_title')} lastUpdated={lastUpdated}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12 text-slate-600 dark:text-slate-300 leading-relaxed font-medium"
            >
                <section>
                    <p dangerouslySetInnerHTML={{ __html: t('privacy_intro_1') }} />
                    <p className="mt-4" dangerouslySetInnerHTML={{ __html: t('privacy_intro_2') }} />
                </section>

                <section>
                    <h2>{t('privacy_s1_title')}</h2>
                    <p className="mb-3" dangerouslySetInnerHTML={{ __html: t('privacy_s1_desc') }} />

                    <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">{t('privacy_s1_sub1_title')}</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_s1_sub1_li1') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_s1_sub1_li2') + '<ul class="list-disc list-inside ml-8 mt-2 space-y-1 text-sm">' + '<li>' + t('privacy_s1_sub1_li2_sub1') + '</li>' + '<li>' + t('privacy_s1_sub1_li2_sub2') + '</li>' + '<li>' + t('privacy_s1_sub1_li2_sub3') + '</li>' + '<li>' + t('privacy_s1_sub1_li2_sub4') + '</li>' + '</ul>' }} />
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_s1_sub1_li3') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_s1_sub1_li4') }} />
                    </ul>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">{t('privacy_s1_sub2_title')}</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_s1_sub2_li1') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_s1_sub2_li2') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_s1_sub2_li3') }} />
                    </ul>
                </section>

                <section>
                    <h2>{t('privacy_s2_title')}</h2>
                    <p className="mb-3" dangerouslySetInnerHTML={{ __html: t('privacy_s2_desc') }} />
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_s2_li1') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_s2_li2') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_s2_li3') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_s2_li4') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_s2_li5') }} />
                    </ul>
                </section>

                <section className="p-8 bg-brand-violet/5 dark:bg-brand-violet/10 rounded-[2rem] border border-primary/20">
                    <h2 className="text-xl font-display font-black text-primary mb-4 uppercase tracking-wider italic !mt-0">{t('privacy_ai_clause_title')}</h2>
                    <p className="text-slate-900 dark:text-slate-100 font-bold" dangerouslySetInnerHTML={{ __html: t('privacy_ai_clause_text') }} />
                </section>

                <section>
                    <h2>{t('privacy_s3_title')}</h2>
                    <p className="mb-4" dangerouslySetInnerHTML={{ __html: t('privacy_s3_desc') }} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 not-prose">
                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase mb-2">{t('privacy_s3_card1_title')}</h4>
                            <p className="text-xs" dangerouslySetInnerHTML={{ __html: t('privacy_s3_card1_desc') }} />
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase mb-2">{t('privacy_s3_card2_title')}</h4>
                            <p className="text-xs" dangerouslySetInnerHTML={{ __html: t('privacy_s3_card2_desc') }} />
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase mb-2">{t('privacy_s3_card3_title')}</h4>
                            <p className="text-xs" dangerouslySetInnerHTML={{ __html: t('privacy_s3_card3_desc') }} />
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase mb-2">{t('privacy_s3_card4_title')}</h4>
                            <p className="text-xs" dangerouslySetInnerHTML={{ __html: t('privacy_s3_card4_desc') }} />
                        </div>
                    </div>

                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_s3_li1') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_s3_li2') }} />
                    </ul>
                </section>

                <section>
                    <h2>{t('privacy_s4_title')}</h2>
                    <p className="mb-3" dangerouslySetInnerHTML={{ __html: t('privacy_s4_desc') }} />
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_s4_li1') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_s4_li2') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_s4_li3') }} />
                    </ul>
                    <p className="mt-4 text-sm italic" dangerouslySetInnerHTML={{ __html: t('privacy_s4_note') }} />
                </section>

                <section>
                    <h2>{t('privacy_s5_title')}</h2>
                    <p className="mb-3" dangerouslySetInnerHTML={{ __html: t('privacy_s5_desc') }} />
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_s5_li1') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_s5_li2') }} />
                    </ul>
                </section>

                <section>
                    <h2>{t('privacy_s6_title')}</h2>
                    <p className="mb-3" dangerouslySetInnerHTML={{ __html: t('privacy_s6_desc') }} />
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_s6_li1') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_s6_li2') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_s6_li3') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('privacy_s6_li4') }} />
                    </ul>
                    <p className="mt-4 text-sm font-bold">
                        {t('privacy_s6_contact')} <a href="mailto:privacy@diktalo.com" className="text-primary hover:underline">privacy@diktalo.com</a>
                    </p>
                </section>

                <section>
                    <h2>{t('privacy_s7_title')}</h2>
                    <p dangerouslySetInnerHTML={{ __html: t('privacy_s7_text') }} />
                </section>

                <section>
                    <h2>{t('privacy_s8_title')}</h2>
                    <p dangerouslySetInnerHTML={{ __html: t('privacy_s8_text') + '<a href="/cookies" class="text-primary hover:underline">' + t('privacy_s8_link') + '</a>.' }} />
                </section>

                <section>
                    <h2>{t('privacy_s9_title')}</h2>
                    <p dangerouslySetInnerHTML={{ __html: t('privacy_s9_text') }} />
                </section>

                <section>
                    <h2>{t('privacy_s10_title')}</h2>
                    <p dangerouslySetInnerHTML={{ __html: t('privacy_s10_text') + '<br /><br /><strong>Diktalo Legal Team</strong><br />Email: <a href="mailto:legal@diktalo.com" class="text-primary hover:underline">legal@diktalo.com</a>' }} />
                </section>
            </motion.div>
        </LegalLayout>
    );
};

export default Privacy;
