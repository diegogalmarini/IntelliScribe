import React from 'react';
import { motion } from 'framer-motion';
import { Mic, FileText, Search, Zap, LayoutTemplate } from 'lucide-react';

export const Features: React.FC = () => {
    return (
        <section className="py-24 bg-gray-50 dark:bg-[#0b0f17] transition-colors duration-300">
            <div className="container mx-auto px-4">

                {/* Header de Sección */}
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight"
                    >
                        Más que transcripción. <br />
                        <span className="text-primary">Inteligencia Operativa.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-600 dark:text-slate-400"
                    >
                        Diktalo cubre todo el ciclo de vida de tu información. Desde la captura de voz hasta la ejecución en tu CRM.
                    </motion.p>
                </div>

                {/* EL BENTO GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">

                    {/* CAJA 1: CAPTURA OMNICANAL (Vertical Grande) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="md:col-span-1 md:row-span-2 bg-white dark:bg-[#161b22] rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden relative group"
                    >
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                                <Mic className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Captura Omnicanal</h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                Tu oficina en el bolsillo. Graba reuniones presenciales, sube archivos o usa el <strong className="text-slate-900 dark:text-white">Dialer Telefónico</strong> integrado para llamar a clientes.
                            </p>
                        </div>

                        {/* Visual: Abstract Phone UI */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-slate-100 dark:bg-[#0b0f17] rounded-t-3xl border-t border-x border-slate-200 dark:border-white/10 p-4 shadow-inner group-hover:h-[45%] transition-all duration-500">
                            <div className="flex justify-center mb-4">
                                <div className="w-12 h-1 bg-slate-300 dark:bg-white/20 rounded-full" />
                            </div>
                            <div className="flex justify-center items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-red-500 animate-pulse flex items-center justify-center text-white">
                                    <Mic className="w-5 h-5" />
                                </div>
                                <div className="space-y-2">
                                    <div className="w-20 h-2 bg-slate-300 dark:bg-white/20 rounded text-xs" />
                                    <div className="w-12 h-2 bg-slate-200 dark:bg-white/10 rounded" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* CAJA 2: INTELIGENCIA VERTICAL (Horizontal Ancha) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-2 bg-white dark:bg-[#161b22] rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden relative group"
                    >
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400">
                                    <LayoutTemplate className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Habla tu Idioma</h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                    No es lo mismo una consulta médica que una venta. Diktalo usa <strong className="text-slate-900 dark:text-white">Modelos Verticales</strong> para estructurar tu resumen (SOAP, BANT, Acta Legal).
                                </p>
                            </div>

                            {/* Visual: Template Cards */}
                            <div className="relative h-40">
                                <div className="absolute right-0 top-0 space-y-3 w-full max-w-xs">
                                    {['Resumen Clínico (SOAP)', 'Cualificación de Ventas (MEDDIC)', 'Acta Legal & Acuerdos'].map((item, i) => (
                                        <div key={i} className={`p-3 rounded-xl border border-slate-100 dark:border-white/5 flex items-center gap-3 shadow-sm transform transition-transform group-hover:translate-x-2 ${i === 1 ? 'bg-primary/5 border-primary/20 translate-x-4' : 'bg-slate-50 dark:bg-white/5'}`}>
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 1 ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-500'}`}>
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* CAJA 3: ASK DIKTALO (Cuadrado Pequeño) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="md:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 shadow-xl overflow-hidden relative"
                    >
                        <div className="relative z-10">
                            <Search className="w-10 h-10 mb-4 text-blue-400" />
                            <h3 className="text-xl font-bold mb-2">Memoria Eterna</h3>
                            <p className="text-slate-400 text-sm">
                                "¿Qué presupuesto le dimos a Acme?" Encuentra respuestas en segundos, no en horas.
                            </p>
                        </div>
                        {/* Visual: Chat Bubble */}
                        <div className="absolute bottom-4 right-4 w-32 bg-white/10 backdrop-blur-md rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl p-3 border border-white/10">
                            <div className="w-full h-2 bg-white/20 rounded mb-2"></div>
                            <div className="w-2/3 h-2 bg-white/20 rounded"></div>
                        </div>
                    </motion.div>

                    {/* CAJA 4: INTEGRACIONES (Cuadrado Pequeño) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="md:col-span-1 bg-white dark:bg-[#161b22] rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden relative group"
                    >
                        <div className="relative z-10">
                            <Zap className="w-10 h-10 mb-4 text-amber-500" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Workflow Real</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Conecta con tu CRM. Lo que no está en Salesforce, no existe. Nosotros lo ponemos ahí.
                            </p>
                        </div>

                        {/* Visual: Connecting Dots */}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-50 grayscale group-hover:grayscale-0 transition-all">
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">H</div>
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">S</div>
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">N</div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};
