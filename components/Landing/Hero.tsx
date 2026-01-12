import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, ShieldCheck, Smartphone, Monitor } from 'lucide-react';

export const Hero: React.FC = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { t } = useLanguage();

    return (
        <div className="relative overflow-hidden bg-white dark:bg-background-dark pt-32 pb-20 lg:pt-48 lg:pb-32 transition-colors duration-300">

            {/* 1. Fondo Técnico (Grid Sutil) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full z-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center">


                {/* 3. Titular de Alto Impacto */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="h1 text-slate-900 dark:text-white mb-6"
                >
                    {t('hero_main_title')} <br className="hidden md:block" />
                </motion.h1>

                {/* 4. Subtítulo Aspiracional */}
                <div className="flex justify-center w-full mt-4 mb-14">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-center text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed px-4"
                    >
                        {t('hero_subtitle')}
                    </motion.p>
                </div>

                {/* 5. CTAs de Conversión */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
                >
                    <Link
                        to="/login"
                        className="w-full sm:w-auto px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-semibold text-lg transition-all shadow-xl hover:shadow-2xl dark:hover:bg-slate-200 flex items-center justify-center gap-2 group rounded-xl"
                    >
                        {t('hero_cta_start')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <button
                        onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                        className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-white/5 text-slate-900 dark:text-white font-bold text-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 btn-owner"
                    >
                        <Play className="w-5 h-5 fill-current" />
                        {t('hero_cta_demo')}
                    </button>
                </motion.div>

                {/* 6. Social Proof (Trust Battery) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-slate-500 dark:text-slate-500 mb-20"
                >
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        <span>{t('hero_badge_compliance')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        <span>{t('hero_badge_mobile')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        <span>{t('hero_badge_desktop')}</span>
                    </div>
                </motion.div>

                {/* 7. VISUAL HERO (Ecosistema Dual - Estilo Owner.com) */}
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1, delay: 0.6, type: "spring" }}
                    className="relative mx-auto max-w-6xl px-4"
                >
                    {/* Sombra Glow detrás */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 via-blue-500/5 to-transparent blur-3xl -z-10 transform translate-y-20"></div>

                    <div className="relative">
                        {/* A. Imagen de Escritorio (Desktop) - CENTRADA */}
                        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161b22] shadow-2xl overflow-hidden">
                            <img
                                src="/images/hero-desktop.png"
                                alt="Diktalo Desktop Dashboard"
                                className="w-full h-auto"
                                onError={(e) => {
                                    // Fallback temporal si no existe la imagen aún
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.style.height = '500px';
                                    e.currentTarget.parentElement!.style.display = 'flex';
                                    e.currentTarget.parentElement!.style.alignItems = 'center';
                                    e.currentTarget.parentElement!.style.justifyContent = 'center';
                                    e.currentTarget.parentElement!.innerHTML = '<span class="text-slate-400">Desktop Mockup Placeholder</span>';
                                }}
                            />
                        </div>

                        {/* B. Imagen de Móvil (Mobile) - FLOTANTE SOBREPUESTA */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1, duration: 0.8 }}
                            className="hidden md:block absolute -bottom-10 -right-4 md:-bottom-16 md:-right-12 w-[25%] md:w-[20%] min-w-[140px] rounded-[2.5rem] border-[8px] border-slate-900 bg-slate-900 shadow-2xl overflow-hidden z-20"
                        >
                            <img
                                src="/images/hero-mobile.png"
                                alt="Diktalo Mobile App"
                                className="w-full h-auto rounded-[2rem]"
                                onError={(e) => {
                                    // Fallback temporal
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.style.height = '300px';
                                    e.currentTarget.parentElement!.innerHTML = '<div class="flex items-center justify-center h-full text-white text-xs">Mobile</div>';
                                }}
                            />
                        </motion.div>
                    </div>

                </motion.div>

            </div>
        </div>
    );
};
