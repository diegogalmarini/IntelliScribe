import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Cpu, Share2, Search } from 'lucide-react';

const features = [
    {
        id: 0,
        number: '01',
        title: 'Captura Omnicanal',
        description: 'Graba desde el navegador, sube archivos o usa el Dialer integrado. Todo centralizado.',
        icon: Mic,
        color: 'bg-blue-600',
        image: '/images/hero-mobile.png'
    },
    {
        id: 1,
        number: '02',
        title: 'Inteligencia Artificial',
        description: 'Detecta hablantes, fechas y tareas críticas automáticamente. Tu secretaria virtual perfecta.',
        icon: Cpu,
        color: 'bg-purple-600',
        image: '/images/hero-desktop.png'
    },
    {
        id: 2,
        number: '03',
        title: 'Sync Automático',
        description: 'Envía resúmenes y tareas a tu CRM (Salesforce, HubSpot) o Notion con un solo clic.',
        icon: Share2,
        color: 'bg-emerald-600',
        image: '/images/features-sales-real.png'
    },
    {
        id: 3,
        number: '04',
        title: 'Memoria Eterna',
        description: 'Pregunta a Diktalo: "¿Qué precio pactamos?" y obtén la respuesta exacta en segundos.',
        icon: Search,
        color: 'bg-amber-600',
        image: '/images/hero-desktop.png'
    }
];

const AUTOPLAY_DURATION = 6000; // 6 segundos para leer cómodamente

export const Features: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveTab((prev) => (prev + 1) % features.length);
        }, AUTOPLAY_DURATION);
        return () => clearInterval(timer);
    }, [activeTab]);

    return (
        <section className="py-24 bg-white dark:bg-[#0b0f17] transition-colors duration-300">
            <div className="container mx-auto px-4">

                {/* Titular */}
                <div className="max-w-3xl mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                        Automatiza tu éxito <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            en 4 pasos simples.
                        </span>
                    </h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 h-auto lg:h-[600px]">

                    {/* COLUMNA IZQUIERDA: La Lista Interactiva */}
                    <div className="w-full lg:w-1/3 flex flex-col justify-between h-full py-4">
                        {features.map((feature, index) => (
                            <div
                                key={feature.id}
                                onClick={() => setActiveTab(index)}
                                className={`cursor-pointer group relative flex flex-col justify-center transition-all duration-300 px-4 py-4 rounded-xl ${activeTab === index
                                        ? 'opacity-100 bg-slate-50 dark:bg-white/5'
                                        : 'opacity-40 hover:opacity-70'
                                    }`}
                            >
                                <div className="flex items-center gap-4 mb-2">
                                    <div className={`text-lg font-bold ${activeTab === index ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                                        {feature.number}
                                    </div>
                                    <h3 className={`text-xl md:text-2xl font-bold ${activeTab === index ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                                        }`}>
                                        {feature.title}
                                    </h3>
                                </div>

                                {/* Descripción (Solo visible si activo para efecto acordeón sutil) */}
                                <div className={`overflow-hidden transition-all duration-500 ${activeTab === index ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 pl-10 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>

                                {/* LA BARRA DE PROGRESO HORIZONTAL (Estilo Owner.com) */}
                                {activeTab === index && (
                                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-200 dark:bg-white/10 overflow-hidden rounded-b-xl">
                                        <motion.div
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: AUTOPLAY_DURATION / 1000, ease: "linear" }}
                                            className="h-full bg-blue-600"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* COLUMNA DERECHA: Imagen (Fija) */}
                    <div className="w-full lg:w-2/3 relative h-[400px] lg:h-full bg-slate-100 dark:bg-[#161b22] rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-2xl">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className="absolute inset-0 flex items-center justify-center p-8 md:p-12"
                            >
                                {/* Aquí cargamos la imagen correspondiente */}
                                <img
                                    src={features[activeTab].image}
                                    alt={features[activeTab].title}
                                    className="w-full h-auto max-h-full object-contain drop-shadow-2xl rounded-lg"
                                    onError={(e) => {
                                        // Fallback elegante
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement!.innerHTML = `<div class='text-center p-10'><div class='text-6xl mb-4'>${features[activeTab].number}</div><div class='text-slate-400'>${features[activeTab].title} Image</div></div>`;
                                    }}
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Gradiente sutil inferior para integración */}
                        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-100 dark:from-[#161b22] to-transparent pointer-events-none" />
                    </div>

                </div>
            </div>
        </section>
    );
};
