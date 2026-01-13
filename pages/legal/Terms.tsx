import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { LegalLayout } from '../../layouts/LegalLayout';

export const Terms: React.FC = () => {
    const { t, language } = useLanguage();
    const lastUpdated = language === 'es' ? '05 de Enero de 2026' : 'January 5, 2026';

    return (
        <LegalLayout title={t('terms_title')} lastUpdated={lastUpdated}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12 text-slate-600 dark:text-slate-300 leading-relaxed font-medium"
            >
                <section>
                    <p>{t('terms_intro_1')}</p>
                    <p className="mt-4">{t('terms_intro_2')}</p>
                </section>

                <section>
                    <h2>{t('terms_s1_title')}</h2>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">{t('terms_s1_sub1_title')}</h3>
                    <p className="mb-3">
                        {t('terms_s1_sub1_desc').replace('Diktalo', '<strong>Diktalo</strong>').replace('Usted', '<strong>Usted</strong>')}
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>{t('terms_s1_sub1_li1')}</li>
                        <li>{t('terms_s1_sub1_li2')}</li>
                        <li><strong>Diktalo</strong> {t('terms_s1_sub1_li3').replace('Diktalo', '').trim()}</li>
                    </ul>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">{t('terms_s1_sub2_title')}</h3>
                    <p>{t('terms_s1_sub2_desc')}</p>
                </section>

                <section>
                    <h2>{t('terms_s2_title')}</h2>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>{t('terms_s2_li1').split(':')[0]}:</strong> {t('terms_s2_li1').split(':')[1]}</li>
                        <li><strong>{t('terms_s2_li2').split(':')[0]}:</strong> {t('terms_s2_li2').split(':')[1]}</li>
                        <li><strong>{t('terms_s2_li3').split(':')[0]}:</strong> {t('terms_s2_li3').split(':')[1]}</li>
                    </ul>
                </section>

                <section>
                    <h2>{t('terms_s3_title')}</h2>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">{t('terms_s3_sub1_title')}</h3>
                    <p>
                        {t('terms_s3_sub1_desc')}
                    </p>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">{t('terms_s3_sub2_title')}</h3>
                    <p>
                        {t('terms_s3_sub2_desc')}
                    </p>
                </section>

                <section>
                    <h2>{t('terms_s4_title')}</h2>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>{t('terms_s4_li1').split(':')[0]}:</strong> {t('terms_s4_li1').split(':')[1]}</li>
                        <li><strong>{t('terms_s4_li2').split(':')[0]}:</strong> {t('terms_s4_li2').split(':')[1]}</li>
                        <li><strong>{t('terms_s4_li3').split(':')[0]}:</strong> {t('terms_s4_li3').split(':')[1]}</li>
                        <li><strong>{t('terms_s4_li4').split(':')[0]}:</strong> {t('terms_s4_li4').split(':')[1]}</li>
                    </ul>
                </section>

                <section className="p-8 bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-200 dark:border-amber-700/30">
                    <h2 className="text-xl font-display font-black text-amber-600 dark:text-amber-400 mb-4 uppercase tracking-wider italic !mt-0">{t('terms_s5_title')}</h2>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-2 mb-2">{t('terms_s5_sub1_title')}</h3>
                    <p>
                        {t('terms_s5_sub1_desc')}
                    </p>
                    <p className="mt-2 text-sm italic">
                        {t('terms_s5_sub1_note')}
                    </p>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-4 mb-2">{t('terms_s5_sub2_title')}</h3>
                    <p>
                        {t('terms_s5_sub2_desc')}
                    </p>
                </section>

                <section>
                    <h2>{t('terms_s6_title')}</h2>
                    <p className="mb-3">{t('terms_s6_desc')}</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>{t('terms_s6_li1')}</li>
                        <li>{t('terms_s6_li2')}</li>
                        <li>{t('terms_s6_li3')}</li>
                        <li>{t('terms_s6_li4')}</li>
                        <li>{t('terms_s6_li5')}</li>
                    </ul>
                </section>

                <section>
                    <h2>{t('terms_s7_title')}</h2>
                    <p>
                        {t('terms_s7_desc')}
                    </p>
                </section>

                <section>
                    <h2>{t('terms_s8_title')}</h2>
                    <p>
                        {t('terms_s8_desc')}
                    </p>
                </section>

                <section>
                    <h2>{t('terms_s9_title')}</h2>
                    <p>
                        {t('terms_s9_desc')}
                    </p>
                </section>

                <section>
                    <h2>{t('terms_s10_title')}</h2>
                    <p>
                        {t('terms_s10_desc')}
                    </p>
                </section>

                <section>
                    <h2>{t('terms_s11_title')}</h2>
                    <p>
                        {t('terms_s11_desc')}<br /><br />
                        <strong>Diktalo Legal Team</strong><br />
                        Email: <a href="mailto:legal@diktalo.com" className="text-primary hover:underline">legal@diktalo.com</a>
                    </p>
                </section>
            </motion.div>
        </LegalLayout>
    );
};

export default Terms;
