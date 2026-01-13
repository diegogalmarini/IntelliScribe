import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { LegalLayout } from '../../layouts/LegalLayout';

export const Cookies: React.FC = () => {
    const { t, language } = useLanguage();
    const lastUpdated = language === 'es' ? '05 de Enero de 2026' : 'January 5, 2026';

    return (
        <LegalLayout title={t('cookies_title')} lastUpdated={lastUpdated}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12 text-slate-600 dark:text-slate-300 leading-relaxed font-medium"
            >
                <section>
                    <p>{t('cookies_intro')}</p>
                </section>

                <section>
                    <h2>{t('cookies_s1_title')}</h2>
                    <p>{t('cookies_s1_desc')}</p>
                    <p className="mt-4">{t('cookies_s1_note')}</p>
                </section>

                <section>
                    <h2>{t('cookies_s2_title')}</h2>
                    <p className="mb-3">{t('cookies_s2_desc')}</p>
                    <ol className="list-decimal list-inside space-y-2 ml-4">
                        <li><strong>{t('cookies_s2_li1').split(':')[0]}:</strong> {t('cookies_s2_li1').split(':')[1]}</li>
                        <li><strong>{t('cookies_s2_li2').split(':')[0]}:</strong> {t('cookies_s2_li2').split(':')[1]}</li>
                        <li><strong>{t('cookies_s2_li3').split(':')[0]}:</strong> {t('cookies_s2_li3').split(':')[1]}</li>
                        <li><strong>{t('cookies_s2_li4').split(':')[0]}:</strong> {t('cookies_s2_li4').split(':')[1]}</li>
                    </ol>
                </section>

                <section>
                    <h2>{t('cookies_s3_title')}</h2>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">{t('cookies_s3_sub1_title')}</h3>
                    <p className="mb-3">{t('cookies_s3_sub1_desc')}</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>{t('cookies_s3_sub1_li1').split(':')[0]}:</strong> {t('cookies_s3_sub1_li1').split(':')[1]}</li>
                        <li><strong>{t('cookies_s3_sub1_li2').split(':')[0]}:</strong> {t('cookies_s3_sub1_li2').split(':')[1]}</li>
                        <li><strong>{t('cookies_s3_sub1_li3').split(':')[0]}:</strong> {t('cookies_s3_sub1_li3').split(':')[1]}</li>
                    </ul>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">{t('cookies_s3_sub2_title')}</h3>
                    <p className="mb-3">
                        {t('cookies_s3_sub2_desc')}
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>{t('cookies_s3_sub2_li1').split(':')[0]}:</strong> {t('cookies_s3_sub2_li1').split(':')[1]}</li>
                        <li><strong>{t('cookies_s3_sub2_li2').split(':')[0]}:</strong> {t('cookies_s3_sub2_li2').split(':')[1]}</li>
                        <li><strong>{t('cookies_s3_sub2_li3').split(':')[0]}:</strong> {t('cookies_s3_sub2_li3').split(':')[1]}</li>
                    </ul>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">{t('cookies_s3_sub3_title')}</h3>
                    <p className="mb-3">
                        {t('cookies_s3_sub3_desc')}
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>{t('cookies_s3_sub3_li1').split(':')[0]}:</strong> {t('cookies_s3_sub3_li1').split(':')[1]}</li>
                        <li><strong>{t('cookies_s3_sub3_li2').split(':')[0]}:</strong> {t('cookies_s3_sub3_li2').split(':')[1]}</li>
                    </ul>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">{t('cookies_s3_sub4_title')}</h3>
                    <p className="mb-3">
                        {t('cookies_s3_sub4_desc')}
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>{t('cookies_s3_sub4_li1').split(':')[0]}:</strong> {t('cookies_s3_sub4_li1').split(':')[1]}</li>
                        <li><strong>{t('cookies_s3_sub4_li2').split(':')[0]}:</strong> {t('cookies_s3_sub4_li2').split(':')[1]}</li>
                    </ul>
                </section>

                <section>
                    <h2>{t('cookies_s4_title')}</h2>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">{t('cookies_s4_sub1_title')}</h3>
                    <p>
                        {t('cookies_s4_sub1_desc')}
                    </p>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">{t('cookies_s4_sub2_title')}</h3>
                    <p className="mb-3">
                        {t('cookies_s4_sub2_desc')}
                    </p>
                    <p className="mb-2">{t('cookies_s4_sub2_note')}</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
                        <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
                        <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Apple Safari</a></li>
                        <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
                    </ul>
                </section>

                <section>
                    <h2>{t('cookies_s5_title')}</h2>
                    <p>
                        {t('cookies_s5_desc')}
                    </p>
                </section>

                <section>
                    <h2>{t('cookies_s6_title')}</h2>
                    <p>
                        {t('cookies_s6_desc')}<br /><br />
                        <strong>Diktalo Legal Team</strong><br />
                        Email: <a href="mailto:legal@diktalo.com" className="text-primary hover:underline">legal@diktalo.com</a>
                    </p>
                </section>
            </motion.div>
        </LegalLayout>
    );
};

export default Cookies;
