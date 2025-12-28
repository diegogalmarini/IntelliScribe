import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Cpu, Share2, Search } from 'lucide-react';

const features = [
    {
        id: 0,
        number: '01',
        title: 'Captura Omnicanal',
        description: 'Graba desde el navegador, sube archivos o usa el Dialer integrado. Todo centralizado en un solo lugar.',
        image: '/images/hero-mobile.png'
    },
    {
        id: 1,
        number: '02',
        title: 'Inteligencia Artificial',
        description: 'Detecta hablantes, fechas y tareas críticas automáticamente. Tu secretaria virtual perfecta que nunca duerme.',
        image: '/images/hero-desktop.png'
    },
    {
        id: 2,
        number: '03',
        title: 'Sync Automático',
        description: 'Envía resúmenes y tareas a tu CRM (Salesforce, HubSpot) o Notion con un solo clic. Adiós al copy-paste.',
        image: '/images/features-sales-real.png'
    },
    {
        id: 3,
        number: '04',
        title: 'Memoria Eterna',
        description: 'Pregunta a Diktalo: "¿Qué precio pactamos?" y obtén la respuesta exacta en segundos buscando en todo tu historial.',
        image: '/images/hero-desktop.png'
    }
];

const AUTOPLAY_DURATION = 6000; // 6 segundos

export const Features: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveTab((prev) => (prev + 1) % features.length);
        }, AUTOPLAY_DURATION);
        return () => clearInterval(timer);
    }, [activeTab]);

    return (
        <section className="py-24 bg-white dark:bg-[#0b0f17] transition-colors duration-300 overflow-hidden">
            <div className="container mx-auto px-4">

                {/* Header Section */}
                <div className="max-w-3xl mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                        Automatiza tu éxito <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            en 4 pasos simples.
                        </span>
                    </h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

                    {/* COLUMNA IZQUIERDA: Lista Interactiva */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-4">
                        {features.map((feature, index) => (
                            <div
                                key={feature.id}
                                onClick={() => setActiveTab(index)}
                                className={`cursor-pointer relative rounded-xl transition-all duration-300 overflow-hidden ${activeTab === index
                                        ? 'bg-slate-50 dark:bg-white/5 opacity-100'
                                        : 'opacity-40 hover:opacity-70 hover:bg-slate-50/50 dark:hover:bg-white/5'
                                    }`}
                            >
                                <div className="p-5">
                                    <div className="flex items-center gap-4">
                                        <span className={`text-lg font-bold font-mono ${activeTab === index ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                                            }`}>
                                            {feature.number}
                                        </span>
                                        <h3 className={`text-xl font-bold ${activeTab === index ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                                            }`}>
                                            {feature.title}
                                        </h3>
                                    </div>

                                    {/* Acordeón con Framer Motion layout para evitar saltos */}
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            height: activeTab === index ? 'auto' : 0,
                                            opacity: activeTab === index ? 1 : 0
                                        }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <p className="pt-3 pl-10 text-sm text-slate-600 dark:text-slate-400 leading-relaxed pb-2">
                                            {feature.description}
                                        </p>
                                    </motion.div>
                                </div>

                                {/* Barra de Progreso (Solo visible si activo) */}
                                {activeTab === index && (
                                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-200 dark:bg-white/10">
                                        <motion.div
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: AUTOPLAY_DURATION / 1000, ease: "linear" }}
                                            className="h-full bg-blue-600 dark:bg-blue-500"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* COLUMNA DERECHA: Imagen con Transición */}
                    <div className="w-full lg:w-2/3">
                        <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[600px] bg-slate-100 dark:bg-[#161b22] rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-2xl">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute inset-0 flex items-center justify-center p-8 md:p-12"
                                >
                                    <img
                                        src={features[activeTab].image}
                                        alt={features[activeTab].title}
                                        className="w-full h-full object-contain drop-shadow-2xl rounded-lg"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            // Fallback si no hay imagen
                                            e.currentTarget.parentElement!.innerHTML = `
                         <div class='text-center p-10'>
                            <div class='text-6xl mb-4 font-black text-slate-200 dark:text-slate-800'>${features[activeTab].number}</div>
                            <div class='text-slate-400 font-medium'>${features[activeTab].title} Preview</div>
                         </div>`;
                                        }}
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Gradiente decorativo inferior */}
                            <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-slate-100 dark:from-[#161b22] to-transparent pointer-events-none" />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
