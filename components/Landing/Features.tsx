import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Cpu, Share2, Search } from 'lucide-react';

const features = [
    {
        id: 0,
        number: '01',
        title: 'Captura',
        fullTitle: 'Captura Omnicanal',
        description: 'Graba desde el navegador, sube archivos o usa el Dialer. Todo tu audio centralizado.',
        icon: Mic,
        image: '/images/hero-mobile.png'
    },
    {
        id: 1,
        number: '02',
        title: 'Procesamiento',
        fullTitle: 'Inteligencia Artificial',
        description: 'Detecta hablantes y extrae tareas críticas automáticamente. Tu secretaria virtual perfecta.',
        icon: Cpu,
        image: '/images/hero-desktop.png'
    },
    {
        id: 2,
        number: '03',
        title: 'Sincronización',
        fullTitle: 'Sync Automático',
        description: 'Envía resúmenes a tu CRM (Salesforce, HubSpot) o Notion con un solo clic.',
        icon: Share2,
        image: '/images/features-sales-real.png'
    },
    {
        id: 3,
        number: '04',
        title: 'Consultas',
        fullTitle: 'Memoria Eterna',
        description: 'Pregunta a Diktalo: "¿Qué precio pactamos?" y obtén la respuesta exacta en segundos.',
        icon: Search,
        image: '/images/hero-desktop.png'
    }
];

const AUTOPLAY_DURATION = 6000;

export const Features: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveTab((prev) => (prev + 1) % features.length);
        }, AUTOPLAY_DURATION);
        return () => clearInterval(timer);
    }, [activeTab]);

    return (
        <section className="py-24 bg-gray-50 dark:bg-[#0b0f17] transition-colors duration-300">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                        Automatiza tu éxito <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            en 4 pasos simples.
                        </span>
                    </h2>
                </div>

                {/* 1. NAVEGACIÓN HORIZONTAL (TABS) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 border-b border-slate-200 dark:border-white/10 pb-4 md:pb-0 border-none">
                    {features.map((feature, index) => (
                        <div
                            key={feature.id}
                            onClick={() => setActiveTab(index)}
                            className="cursor-pointer relative flex flex-col items-center md:items-start group"
                        >
                            {/* Contenido del Tab */}
                            <div className={`flex flex-col items-center md:items-start p-4 transition-opacity duration-300 w-full ${activeTab === index ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                                }`}>
                                <span className="text-xs font-bold tracking-widest text-slate-400 mb-2">PASO {feature.number}</span>
                                <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white text-center md:text-left">
                                    {feature.fullTitle}
                                </h3>
                            </div>

                            {/* Barra de Progreso (Solo activa) */}
                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                {activeTab === index && (
                                    <motion.div
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: AUTOPLAY_DURATION / 1000, ease: "linear" }}
                                        className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 2. ÁREA DE CONTENIDO (IMAGEN + TEXTO) */}
                <div className="bg-white dark:bg-[#161b22] rounded-3xl p-2 shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden">
                    <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-[#0f1219]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                className="absolute inset-0 flex flex-col md:flex-row items-center"
                            >
                                {/* Texto Descriptivo (Izquierda en desktop) */}
                                <div className="w-full md:w-1/3 p-8 md:p-12 flex flex-col justify-center z-10 bg-white/90 dark:bg-[#161b22]/90 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none h-full md:h-auto absolute bottom-0 md:relative">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                                        {React.createElement(features[activeTab].icon, { className: "w-6 h-6" })}
                                    </div>
                                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                        {features[activeTab].title}
                                    </h4>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {features[activeTab].description}
                                    </p>
                                </div>

                                {/* Imagen (Derecha en desktop, Fondo en móvil) */}
                                <div className="w-full md:w-2/3 h-full flex items-center justify-center p-4 md:p-8 bg-slate-50 dark:bg-[#0f1219]">
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
