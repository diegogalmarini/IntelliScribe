import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Cpu, Share2, Search } from 'lucide-react';

const features = [
    {
        id: 0,
        number: '01',
        title: 'Captura Omnicanal',
        description: 'No importa dónde ocurra la conversación. Graba desde el navegador, sube archivos de audio o utiliza el Dialer integrado para llamadas telefónicas.',
        icon: Mic,
        color: 'bg-blue-600',
        image: '/images/hero-mobile.png'
    },
    {
        id: 1,
        number: '02',
        title: 'Inteligencia Artificial',
        description: 'Diktalo no solo transcribe. Identifica quién habla, detecta fechas de entrega y extrae las tareas críticas automáticamente.',
        icon: Cpu,
        color: 'bg-purple-600',
        image: '/images/hero-desktop.png'
    },
    {
        id: 2,
        number: '03',
        title: 'Sync Automático',
        description: 'Olvídate de copiar y pegar. Tu resumen y tareas se envían directamente a tu CRM (Salesforce, HubSpot) o herramientas de gestión.',
        icon: Share2,
        color: 'bg-emerald-600',
        image: '/images/features-sales-real.png'
    },
    {
        id: 3,
        number: '04',
        title: 'Memoria Eterna',
        description: '¿Qué acordamos el mes pasado? Usa "Ask Diktalo" para chatear con tu base de conocimiento y recuperar datos en segundos.',
        icon: Search,
        color: 'bg-amber-600',
        image: '/images/hero-desktop.png'
    }
];

const AUTOPLAY_DURATION = 5000; // 5 segundos por slide

export const Features: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);

    // Lógica de Auto-Play
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveTab((prev) => (prev + 1) % features.length);
        }, AUTOPLAY_DURATION);
        return () => clearInterval(timer);
    }, [activeTab]); // Reinicia el timer si el usuario hace clic manualmente

    return (
        <section className="py-24 bg-white dark:bg-[#0b0f17] transition-colors duration-300">
            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="max-w-3xl mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                        Todo tu flujo de trabajo, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            automatizado en 4 pasos.
                        </span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                        Desde que presionas grabar hasta que la tarea aparece en tu CRM. Diktalo se encarga del trabajo pesado.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

                    {/* COLUMNA IZQUIERDA: Tabs de Navegación */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={feature.id}
                                onClick={() => setActiveTab(index)}
                                className={`cursor-pointer group relative pl-6 border-l-2 transition-all duration-300 ${activeTab === index
                                        ? 'border-blue-600 opacity-100'
                                        : 'border-slate-200 dark:border-white/10 opacity-50 hover:opacity-80'
                                    }`}
                            >
                                {/* Número Grande */}
                                <div className="text-sm font-bold tracking-widest mb-1 text-slate-400 dark:text-slate-500">
                                    PASO {feature.number}
                                </div>

                                {/* Título */}
                                <h3 className={`text-xl md:text-2xl font-bold transition-colors ${activeTab === index ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                                    }`}>
                                    {feature.title}
                                </h3>

                                {/* Contenido Expandible (Solo visible en Móvil para ahorrar espacio) */}
                                <div className="lg:hidden mt-2 text-sm text-slate-500 dark:text-slate-400">
                                    {activeTab === index && feature.description}
                                </div>

                                {/* Barra de Progreso (Solo visible si está activo) */}
                                {activeTab === index && (
                                    <div className="absolute left-[-2px] top-0 h-full w-[2px] bg-slate-200 dark:bg-white/10 overflow-hidden">
                                        <motion.div
                                            initial={{ height: "0%" }}
                                            animate={{ height: "100%" }}
                                            transition={{ duration: AUTOPLAY_DURATION / 1000, ease: "linear" }}
                                            className="w-full bg-blue-600 absolute top-0 left-0"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* COLUMNA DERECHA: Visualización (Imagen + Texto Descriptivo) */}
                    <div className="w-full lg:w-2/3 relative min-h-[400px] md:min-h-[500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                className="relative h-full"
                            >
                                {/* Tarjeta Visual */}
                                <div className="bg-slate-100 dark:bg-[#161b22] rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-2xl h-full flex flex-col">

                                    {/* Header de la Tarjeta (Icono + Texto) */}
                                    <div className="p-8 md:p-10 pb-0">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-white shadow-lg ${features[activeTab].color}`}>
                                            {React.createElement(features[activeTab].icon, { className: "w-6 h-6" })}
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                            {features[activeTab].title}
                                        </h3>
                                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
                                            {features[activeTab].description}
                                        </p>
                                    </div>

                                    {/* Imagen / Mockup (Parte inferior) */}
                                    <div className="mt-8 flex-1 relative overflow-hidden bg-slate-200 dark:bg-[#0f1219]">
                                        <img
                                            src={features[activeTab].image}
                                            alt={features[activeTab].title}
                                            className="absolute top-8 left-8 w-[90%] h-auto rounded-tl-2xl shadow-2xl border border-slate-300 dark:border-white/10 transition-transform duration-700 hover:-translate-y-2 z-10"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                        {/* Fallback visual decorativo */}
                                        <div className="absolute top-8 left-8 right-0 bottom-0 bg-white dark:bg-[#1e2736] rounded-tl-2xl border-t border-l border-slate-200 dark:border-white/10 p-6 shadow-2xl">
                                            <div className="flex gap-4 mb-6">
                                                <div className="w-1/3 h-4 bg-slate-100 dark:bg-white/5 rounded-full" />
                                                <div className="w-1/4 h-4 bg-slate-100 dark:bg-white/5 rounded-full" />
                                            </div>
                                            <div className="space-y-3">
                                                <div className="w-full h-24 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5" />
                                                <div className="w-full h-24 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 opacity-50" />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </section>
    );
};
