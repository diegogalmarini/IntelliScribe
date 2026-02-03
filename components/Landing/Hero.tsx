import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, ShieldCheck, Smartphone, Monitor } from 'lucide-react';
import * as Analytics from '../../utils/analytics';

// Video Player Component with lazy YouTube embedding
const VideoPlayer: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlay = () => {
        setIsPlaying(true);
        if (Analytics && typeof Analytics.trackEvent === 'function') {
            Analytics.trackEvent('play_hero_video');
        }
    };

    return (
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161b22] shadow-2xl overflow-hidden relative">
            {!isPlaying ? (
                <>
                    {/* Preview Image with Play Button */}
                    <img
                        src="/play-diktalo.webp"
                        alt="Diktalo Platform Demo - Click to play"
                        className="w-full h-auto cursor-pointer"
                    />
                    <button
                        onClick={handlePlay}
                        className="absolute inset-0 flex items-center justify-center group"
                        aria-label="Play video demo"
                    >
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                            <Play className="w-10 h-10 md:w-12 md:h-12 text-white fill-white ml-1" />
                        </div>
                    </button>
                </>
            ) : (
                /* YouTube Embed - only loads when user clicks */
                <div className="relative w-full pb-[56.25%]">
                    <iframe
                        className="absolute inset-0 w-full h-full"
                        src="https://www.youtube.com/embed/OQ_t8KYak78?autoplay=1&rel=0"
                        title="Diktalo Platform Demo"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            )}
        </div>
    );
};


export const Hero: React.FC = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { t } = useLanguage();

    return (
        <div className="relative overflow-hidden bg-white dark:bg-background-dark pt-32 pb-20 lg:pt-48 lg:pb-32 transition-colors duration-300">

            {/* 1. Fondo Técnico (Grid Sutil) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full z-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-brand-violet/20 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center">


                {/* 3. Titular de Alto Impacto */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="h1 home text-slate-900 dark:text-white mb-6"
                >
                    {t('hero_main_title')} <br className="hidden md:block" />
                </motion.h1>

                {/* 4. Subtítulo Aspiracional */}
                <div className="flex justify-center w-full mt-4 mb-14">
                    <motion.h5
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="h5 home text-center text-slate-600 dark:text-slate-400 max-w-2xl font-medium px-4"
                    >
                        {t('hero_subtitle')}
                    </motion.h5>
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
                        onClick={() => {
                            if (Analytics && typeof Analytics.trackEvent === 'function') {
                                Analytics.trackEvent('click_hero_cta_start');
                            }
                        }}
                        className="w-full sm:w-auto px-10 py-5 bg-primary text-white font-semibold text-lg transition-all shadow-xl hover:shadow-2xl hover:bg-primary-hover flex items-center justify-center gap-2 group rounded-xl"
                    >

                        {t('hero_cta_start')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <button
                        onClick={() => {
                            if (Analytics && typeof Analytics.trackEvent === 'function') {
                                Analytics.trackEvent('click_hero_cta_demo');
                            }
                            document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
                        }}

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
                        <VideoPlayer />

                    </div>

                </motion.div>

            </div>
        </div>
    );
};
