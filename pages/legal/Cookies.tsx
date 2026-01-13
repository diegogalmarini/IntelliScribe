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
                    <p dangerouslySetInnerHTML={{ __html: t('cookies_intro') }} />
                </section>

                <section>
                    <h2>{t('cookies_s1_title')}</h2>
                    <p dangerouslySetInnerHTML={{ __html: t('cookies_s1_desc') }} />
                    <p className="mt-4" dangerouslySetInnerHTML={{ __html: t('cookies_s1_note') }} />
                </section>

                <section>
                    <h2>{t('cookies_s2_title')}</h2>
                    <p className="mb-3" dangerouslySetInnerHTML={{ __html: t('cookies_s2_desc') }} />
                    <ol className="list-decimal list-inside space-y-2 ml-4">
                        <li dangerouslySetInnerHTML={{ __html: t('cookies_s2_li1') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('cookies_s2_li2') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('cookies_s2_li3') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('cookies_s2_li4') }} />
                    </ol>
                </section>

                <section>
                    <h2>{t('cookies_s3_title')}</h2>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">{t('cookies_s3_sub1_title')}</h3>
                    <p className="mb-3" dangerouslySetInnerHTML={{ __html: t('cookies_s3_sub1_desc') }} />
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li dangerouslySetInnerHTML={{ __html: t('cookies_s3_sub1_li1') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('cookies_s3_sub1_li2') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('cookies_s3_sub1_li3') }} />
                    </ul>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">{t('cookies_s3_sub2_title')}</h3>
                    <p className="mb-3" dangerouslySetInnerHTML={{ __html: t('cookies_s3_sub2_desc') }} />
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li dangerouslySetInnerHTML={{ __html: t('cookies_s3_sub2_li1') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('cookies_s3_sub2_li2') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('cookies_s3_sub2_li3') }} />
                    </ul>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">{t('cookies_s3_sub3_title')}</h3>
                    <p className="mb-3" dangerouslySetInnerHTML={{ __html: t('cookies_s3_sub3_desc') }} />
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li dangerouslySetInnerHTML={{ __html: t('cookies_s3_sub3_li1') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('cookies_s3_sub3_li2') }} />
                    </ul>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">{t('cookies_s3_sub4_title')}</h3>
                    <p className="mb-3" dangerouslySetInnerHTML={{ __html: t('cookies_s3_sub4_desc') }} />
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li dangerouslySetInnerHTML={{ __html: t('cookies_s3_sub4_li1') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('cookies_s3_sub4_li2') }} />
                    </ul>
                </section>

                <section>
                    <h2>{t('cookies_s4_title')}</h2>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">{t('cookies_s4_sub1_title')}</h3>
                    <p dangerouslySetInnerHTML={{ __html: t('cookies_s4_sub1_desc') }} />

                    <h3 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">{t('cookies_s4_sub2_title')}</h3>
                    <p className="mb-3" dangerouslySetInnerHTML={{ __html: t('cookies_s4_sub2_desc') }} />
                    <p className="mb-2" dangerouslySetInnerHTML={{ __html: t('cookies_s4_sub2_note') }} />
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
                        <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
                        <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Apple Safari</a></li>
                        <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
                    </ul>
                </section>

                <section>
                    <h2>{t('cookies_s5_title')}</h2>
                    <p dangerouslySetInnerHTML={{ __html: t('cookies_s5_desc') }} />
                </section>

                <section>
                    <h2>{t('cookies_s6_title')}</h2>
                    <p dangerouslySetInnerHTML={{ __html: t('cookies_s6_desc') + '<br /><br /><strong>Diktalo Legal Team</strong><br />Email: <a href="mailto:legal@diktalo.com" class="text-primary hover:underline">legal@diktalo.com</a>' }} />
                </section>
            </motion.div>
        </LegalLayout>
    );
};

export default Cookies;
