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


export const Solutions: React.FC = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('medical');

    // Workflows array with translated labels
    const workflows = [
        {
            id: 'sales',
            label: t('sol_sales_bant'),
            icon: Briefcase,
            color: 'text-primary',
            bg: 'bg-primary/10',
            title: 'Cerrar tratos, no transcribir audios.',
            desc: 'Antes pasaba horas pasando las notas de mis llamadas a Salesforce. Ahora Diktalo extrae el presupuesto y las objeciones por mí mientras hablo.',
            features: ['Sincronización con CRM', 'Detección de Objeciones', 'Análisis BANT'],
            image: '/images/features-sales-real.png'
        },
        {
            id: 'medical',
            label: t('sol_medical_soap'),
            icon: Stethoscope,
            color: 'text-primary',
            bg: 'bg-primary/10',
            title: t('sol_medical_title'),
            desc: t('sol_medical_desc'),
            features: ['SOAP Notes', 'Patient Privacy', 'EHR Ready'],
            image: '/images/features-medical-real.png'
        },
        {
            id: 'legal',
            label: t('sol_legal'),
            icon: Scale,
            color: 'text-primary',
            bg: 'bg-primary/10',
            title: 'Precisión absoluta en cada acta.',
            desc: 'En mi despacho, cada detalle cuenta. Diktalo me permite grabar las deposiciones y obtener un acta estructurada con marcas de tiempo críticas al instante.',
            features: ['Actas Verbatim', 'Marcas de Tiempo', 'Búsqueda Semántica'],
            image: '/images/features-legal-real.png'
        },
        {
            id: 'hr',
            label: t('sol_hr'),
            icon: Users,
            color: 'text-primary',
            bg: 'bg-primary/10',
            title: 'Entrevistas que revelan talento.',
            desc: 'Me permite centrarme al 100% en el lenguaje no verbal del candidato. La IA resume las fortalezas y debilidades de la entrevista automáticamente.',
            features: ['Resumen de Candidato', 'Culture Fit Insight', 'Extracción de Skills'],
            image: '/images/features-hr-real.png'
        },
        {
            id: 'product',
            label: t('sol_product_ux'),
            icon: Code2,
            color: 'text-primary',
            bg: 'bg-primary/10',
            title: 'Del feedback al roadmap.',
            desc: 'Grabo las sesiones de testing y Diktalo agrupa los dolores de los usuarios. Es como tener un investigador de UX trabajando 24/7.',
            features: ['User Pain Points', 'Clustering de Feedback', 'Export a Jira/Linear'],
            image: '/images/features-product-real.png'
        },
        {
            id: 'edu',
            label: t('sol_education'),
            icon: GraduationCap,
            color: 'text-primary',
            bg: 'bg-primary/10',
            title: 'Captura el conocimiento real.',
            desc: 'Para mis investigaciones de campo, Diktalo es vital. Convierte horas de entrevistas y clases en apuntes perfectos y citas citables en un clic.',
            features: ['Resumen por Temas', 'Extracción de Citas', 'Soporte Multilingüe'],
            image: '/images/features-edu-real.png'
        }
    ];

    const activeContent = workflows.find(w => w.id === activeTab) || workflows[1];

    return (
    return (
        <section id="solutions" className="py-16 md:py-24 bg-white dark:bg-[#0b0f17] transition-colors duration-300">
            <div className="container mx-auto px-6 max-w-6xl">

                {/* Header de Sección */}
                <div className="text-center mb-12">
                    <p className="text-xs font-bold tracking-[0.1em] text-slate-500 mb-3 uppercase">{t('solSectionTag')}</p>
                    <h2 className="h2 text-slate-900 dark:text-white">
                        {t('solSectionTitle')}
                    </h2>
                </div>

                {/* Tabs Horizontales (Cápsulas) */}
                <div className="flex justify-center gap-2 md:gap-3 mb-12 md:mb-16 flex-wrap">
                    {workflows.map((workflow) => (
                        <button
                            key={workflow.id}
                            onClick={() => setActiveTab(workflow.id)}
                            className={`px-5 py-2.5 rounded-full text-[13px] md:text-sm font-bold transition-all flex items-center gap-2 border ${activeTab === workflow.id
                                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25 scale-100'
                                : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-500 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5'
                                }`}
                        >
                            <workflow.icon className="w-3.5 h-3.5" />
                            {workflow.label}
                        </button>
                    ))}
                </div>

                {/* Área de Contenido: Split Layout */}
                <div className="max-w-5xl mx-auto relative min-h-[450px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
                        >
                            {/* Lado L: Texto Humanizado */}
                            <div className="order-2 lg:order-1 lg:py-4">
                                <h3 className="h2 text-slate-900 dark:text-white mb-6">
                                    {activeContent.title}
                                </h3>

                                <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 font-medium leading-loose line-height-relaxed">
                                    "{activeContent.desc}"
                                </p>

                                <div className="space-y-4">
                                    {activeContent.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-bold text-sm md:text-base">
                                            <div className={`p-1.5 rounded-full ${activeContent.bg}`}>
                                                <CheckCircle2 className={`w-4 h-4 ${activeContent.color}`} />
                                            </div>
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Lado R: Imagen Situacional con Overlay */}
                            <div className="order-1 lg:order-2 relative">
                                <div className={`absolute -inset-8 ${activeContent.bg.replace('/10', '/30')} blur-[80px] rounded-full opacity-40 pointers-events-none`}></div>
                                <motion.div
                                    className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900"
                                >
                                    <img
                                        src={activeContent.image}
                                        alt={activeContent.label}
                                        className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700"
                                        onError={(e) => {
                                            e.currentTarget.src = "/images/features-medical-real.png";
                                        }}
                                    />

                                    {/* Overlay Gradient for Text Contrast just in case, though design uses bottom card */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

                                    {/* Recording Simulation Overlay (Refined) */}
                                    <div className="absolute bottom-5 left-5 right-5 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-xl border border-white/20 flex items-center justify-between z-20 shadow-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse ring-4 ring-red-500/20"></div>
                                            <span className="text-white text-[10px] md:text-xs font-bold tracking-wide uppercase">Rec</span>
                                        </div>
                                        <div className="h-1 w-12 bg-white/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-white w-2/3 animate-[shimmer_2s_infinite]"></div>
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
