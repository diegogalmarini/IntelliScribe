import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Cpu, FileText, Search } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const AUTOPLAY_DURATION = 6000;

export const Features: React.FC = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState(0);

    const features = [
        {
            id: 0,
            number: '01',
            title: t('step1_capture'),
            description: t('flow1Desc'),
            icon: Mic,
            image: '/images/feature-step1-capture.png'
        },
        {
            id: 1,
            number: '02',
            title: t('step2_ai'),
            description: t('flow2Desc'),
            icon: Cpu,
            image: '/images/feature-step2-ai.png'
        },
        {
            id: 2,
            number: '03',
            title: t('feat3Title'),
            description: t('flow3Desc'),
            icon: FileText,
            image: '/images/feature-step3-analysis.png'
        },
        {
            id: 3,
            number: '04',
            title: t('step4_memory'),
            description: t('flow4Desc'),
            icon: Search,
            image: '/images/feature-step4-chat.png'
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveTab((prev) => (prev + 1) % features.length);
        }, AUTOPLAY_DURATION);
        return () => clearInterval(timer);
    }, [activeTab, features.length]);

    return (
        <section className="py-24 bg-gray-50 dark:bg-[#0b0f17] transition-colors duration-300">
            <div className="container mx-auto px-4 max-w-6xl">

                <div className="text-center mb-16">
                    <h2 className="h2 home text-slate-900 dark:text-white mb-6">
                        {t('hero_automate_title')} <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            {t('hero_automate_subtitle')}
                        </span>
                    </h2>
                </div>

                {/* Pestañas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {features.map((feature, index) => (
                        <button
                            key={feature.id}
                            type="button"
                            onClick={() => setActiveTab(index)}
                            aria-current={activeTab === index}
                            className="cursor-pointer relative flex flex-col items-center md:items-start text-left group"
                        >
                            <div className={`flex flex-col items-center md:items-start p-4 transition-opacity duration-300 w-full ${activeTab === index ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                                }`}>
                                <span className="text-[10px] font-semibold tracking-widest text-slate-400 mb-2 uppercase">{t('step_label')} {feature.number}</span>
                                <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white text-center md:text-left leading-snug">
                                    {feature.title}
                                </h3>
                            </div>

                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                {activeTab === index && (
                                    <motion.div
                                        initial={{ width: '0%' }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: AUTOPLAY_DURATION / 1000, ease: 'linear' }}
                                        className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                                    />
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Contenido: texto a la izquierda, imagen a la derecha */}
                <div className="bg-white dark:bg-[#161b22] rounded-3xl p-2 shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden">
                    <div className="relative min-h-[500px] md:aspect-[21/9] w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-[#0f1219]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                className="absolute inset-0 flex flex-col md:flex-row md:items-stretch"
                            >
                                {/* El texto NO puede ir en posicion absoluta: al sacarlo del
                                    flujo, la imagen empezaba en el borde izquierdo y el texto
                                    quedaba pintado encima, ilegible, dejando vacio el tercio
                                    derecho de la tarjeta. Con flex, 1/3 y 2/3 se reparten. */}
                                <div className="w-full md:w-1/3 shrink-0 p-8 md:p-12 flex flex-col justify-center">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                                        {React.createElement(features[activeTab].icon, { className: 'w-6 h-6' })}
                                    </div>
                                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                        {features[activeTab].title}
                                    </h4>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {features[activeTab].description}
                                    </p>
                                </div>

                                <div className="w-full md:w-2/3 min-w-0 h-64 md:h-auto flex items-center justify-center p-4 md:p-8 bg-slate-50 dark:bg-[#0f1219] overflow-hidden">
                                    <img
                                        src={features[activeTab].image}
                                        alt={features[activeTab].title}
                                        className="w-full h-full object-contain max-h-[400px] drop-shadow-xl"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement!.innerHTML = `<div class='text-slate-300 dark:text-slate-700 text-6xl font-black'>${features[activeTab].number}</div>`;
                                        }}
                                    />
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        </section>
    );
};
