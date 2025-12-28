import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import {
    Stethoscope,
    Briefcase,
    Scale,
    Users,
    Code2,
    GraduationCap,
    CheckCircle2
} from 'lucide-react';

const workflows = [
    {
        id: 'sales',
        label: 'Ventas (BANT)',
        icon: Briefcase,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        title: 'Cerrar tratos, no transcribir audios.',
        desc: 'Antes pasaba horas pasando las notas de mis llamadas a Salesforce. Ahora Diktalo extrae el presupuesto y las objeciones por mí mientras hablo.',
        features: ['Sincronización con CRM', 'Detección de Objeciones', 'Análisis BANT'],
        image: '/images/features-sales-real.png'
    },
    {
        id: 'medical',
        label: 'Médico (Nota SOAP)',
        icon: Stethoscope,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        title: 'Más tiempo con el paciente.',
        desc: 'Antes pasaba 2 horas transcribiendo notas SOAP. Con Diktalo, grabo la consulta (con permiso) y tengo el reporte en el EHR en segundos. Es magia pura.',
        features: ['SOAP Notes', 'Patient Privacy', 'EHR Ready'],
        image: '/images/features-medical-real.png'
    },
    {
        id: 'legal',
        label: 'Legal & Jurídico',
        icon: Scale,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        title: 'Precisión absoluta en cada acta.',
        desc: 'En mi despacho, cada detalle cuenta. Diktalo me permite grabar las deposiciones y obtener un acta estructurada con marcas de tiempo críticas al instante.',
        features: ['Actas Verbatim', 'Marcas de Tiempo', 'Búsqueda Semántica'],
        image: '/images/features-legal-real.png'
    },
    {
        id: 'hr',
        label: 'Recursos Humanos',
        icon: Users,
        color: 'text-pink-500',
        bg: 'bg-pink-500/10',
        title: 'Entrevistas que revelan talento.',
        desc: 'Me permite centrarme al 100% en el lenguaje no verbal del candidato. La IA resume las fortalezas y debilidades de la entrevista automáticamente.',
        features: ['Resumen de Candidato', 'Culture Fit Insight', 'Extracción de Skills'],
        image: '/images/features-hr-real.png'
    },
    {
        id: 'product',
        label: 'Producto & UX',
        icon: Code2,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        title: 'Del feedback al roadmap.',
        desc: 'Grabo las sesiones de testing y Diktalo agrupa los dolores de los usuarios. Es como tener un investigador de UX trabajando 24/7.',
        features: ['User Pain Points', 'Clustering de Feedback', 'Export a Jira/Linear'],
        image: '/images/features-product-real.png'
    },
    {
        id: 'edu',
        label: 'Educación & Research',
        icon: GraduationCap,
        color: 'text-indigo-500',
        bg: 'bg-indigo-500/10',
        title: 'Captura el conocimiento real.',
        desc: 'Para mis investigaciones de campo, Diktalo es vital. Convierte horas de entrevistas y clases en apuntes perfectos y citas citables en un clic.',
        features: ['Resumen por Temas', 'Extracción de Citas', 'Soporte Multilingüe'],
        image: '/images/features-edu-real.png'
    }
];

export const Solutions: React.FC = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('medical');
    const activeContent = workflows.find(w => w.id === activeTab) || workflows[1];

    return (
        <section id="solutions" className="py-24 bg-white dark:bg-[#0b0f17] transition-colors duration-300">
            <div className="container mx-auto px-4">

                {/* Header de Sección */}
                <div className="text-center mb-16">
                    <p className="text-xs font-bold tracking-[0.1em] text-slate-500 mb-3">Soluciones</p>
                    <h2 className="text-3xl md:text-5xl h2-section text-slate-900 dark:text-white">
                        {t('solSectionTitle')}
                    </h2>
                </div>

                {/* Tabs Horizontales (Cápsulas) */}
                <div className="flex justify-center gap-3 mb-16 flex-wrap">
                    {workflows.map((workflow) => (
                        <button
                            key={workflow.id}
                            onClick={() => setActiveTab(workflow.id)}
                            className={`px-6 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === workflow.id
                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl scale-105'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'
                                }`}
                        >
                            <workflow.icon className="w-4 h-4" />
                            {workflow.label}
                        </button>
                    ))}
                </div>

                {/* Área de Contenido: Split Layout */}
                <div className="max-w-7xl mx-auto relative min-h-[500px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
                        >
                            {/* Lado L: Texto Humanizado */}
                            <div className="order-2 lg:order-1">
                                <h3 className="text-3xl md:text-4xl h2-section text-slate-900 dark:text-white mb-6">
                                    {activeContent.title}
                                </h3>

                                <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-medium">
                                    "{activeContent.desc}"
                                </p>

                                <div className="space-y-4">
                                    {activeContent.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-bold">
                                            <div className={`p-1 rounded-full ${activeContent.bg}`}>
                                                <CheckCircle2 className={`w-4 h-4 ${activeContent.color}`} />
                                            </div>
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Lado R: Imagen Situacional con Overlay */}
                            <div className="order-1 lg:order-2 relative">
                                <div className={`absolute -inset-10 ${activeContent.bg.replace('/10', '/30')} blur-[100px] rounded-full opacity-50`}></div>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10"
                                >
                                    <img
                                        src={activeContent.image}
                                        alt={activeContent.label}
                                        className="w-full aspect-[4/3] object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = "/images/features-medical-real.png"; // Fallback to a valid image
                                        }}
                                    />

                                    {/* Recording Simulation Overlay (Simplified) */}
                                    <div className="absolute bottom-6 left-6 right-6 bg-slate-900/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 flex items-center justify-between z-20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                                            <span className="text-white text-[11px] font-bold">Grabando...</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

            </div>
        </section>
    );
};
