import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Stethoscope,
    Briefcase,
    Scale,
    Users,
    Code2,
    GraduationCap,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';

// Definición de los 6 Workflows
const workflows = [
    {
        id: 'sales',
        label: 'Equipos de Ventas',
        icon: Briefcase,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        title: 'Cierra más tratos, escribe menos.',
        description: 'Diktalo detecta automáticamente objeciones, presupuesto y competidores mencionados. Tu CRM se actualiza solo.',
        features: ['Detección de Metodología BANT', 'Análisis de Sentimiento del Cliente', 'Sincronización con Salesforce/HubSpot']
    },
    {
        id: 'medical',
        label: 'Médico & Salud',
        icon: Stethoscope,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        title: 'Más tiempo con el paciente.',
        description: 'Genera notas SOAP y resúmenes clínicos precisos sin tocar el teclado. Privacidad total y cumplimiento HIPAA/GDPR.',
        features: ['Formato SOAP Automático', 'Redacción de Datos Sensibles (PII)', 'Terminología Médica Precisa']
    },
    {
        id: 'legal',
        label: 'Legal & Compliance',
        icon: Scale,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        title: 'Evidencia y precisión jurídica.',
        description: 'Convierte horas de deposiciones y reuniones con clientes en actas estructuradas. Encuentra cualquier cláusula en segundos.',
        features: ['Transcripción Verbatim', 'Marcado de Tiempos Críticos', 'Búsqueda Semántica de Cláusulas']
    },
    {
        id: 'hr',
        label: 'Recursos Humanos',
        icon: Users,
        color: 'text-pink-500',
        bg: 'bg-pink-500/10',
        title: 'Entrevistas que revelan talento.',
        description: 'Captura las respuestas clave y evalúa el "culture fit" sin perder el contacto visual con el candidato.',
        features: ['Resumen de Fortalezas/Debilidades', 'Comparativa de Candidatos', 'Extracción de Skills Técnicas']
    },
    {
        id: 'product',
        label: 'Producto & UX',
        icon: Code2,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        title: 'Del feedback al feature.',
        description: 'Transforma entrevistas de usuarios en insights accionables. Detecta patrones de dolor y feature requests automáticamente.',
        features: ['Detección de Bugs y Dolores', 'Clustering de Feedback', 'Exportación a Linear/Jira']
    },
    {
        id: 'edu',
        label: 'Educación & Research',
        icon: GraduationCap,
        color: 'text-indigo-500',
        bg: 'bg-indigo-500/10',
        title: 'Captura el conocimiento.',
        description: 'Ideal para tesis, conferencias y clases. Convierte horas de audio en apuntes estructurados y mapas mentales.',
        features: ['Resumen por Temáticas', 'Extracción de Citas Clave', 'Soporte Multilingüe']
    }
];

export const Features: React.FC = () => {
    const [activeTab, setActiveTab] = useState('sales');
    const activeContent = workflows.find(w => w.id === activeTab) || workflows[0];

    return (
        <section className="py-24 bg-white dark:bg-[#0b0f17] transition-colors duration-300 relative overflow-hidden">

            {/* Fondo Decorativo Sutil */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />

            <div className="container mx-auto px-4 relative z-10">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                        Built for Every <span className="text-primary">Workflow</span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Diktalo no es una talla única. Nuestros modelos de IA se adaptan al vocabulario y estructura de tu profesión.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">

                    {/* COLUMNA IZQUIERDA: Selector (Tabs) */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-2">
                        {workflows.map((workflow) => (
                            <button
                                key={workflow.id}
                                onClick={() => setActiveTab(workflow.id)}
                                className={`flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 group ${activeTab === workflow.id
                                        ? 'bg-slate-100 dark:bg-white/10 shadow-sm ring-1 ring-slate-200 dark:ring-white/10'
                                        : 'hover:bg-slate-50 dark:hover:bg-white/5'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg transition-colors ${activeTab === workflow.id ? 'bg-white dark:bg-[#0b0f17] shadow-sm' : 'bg-slate-100 dark:bg-white/5'
                                    }`}>
                                    <workflow.icon className={`w-5 h-5 ${activeTab === workflow.id ? workflow.color : 'text-slate-500 dark:text-slate-400'
                                        }`} />
                                </div>
                                <div>
                                    <span className={`block font-bold text-sm transition-colors ${activeTab === workflow.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                                        }`}>
                                        {workflow.label}
                                    </span>
                                </div>
                                {activeTab === workflow.id && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="ml-auto"
                                    >
                                        <ArrowRight className="w-4 h-4 text-slate-400" />
                                    </motion.div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* COLUMNA DERECHA: Contenido Dinámico */}
                    <div className="w-full lg:w-2/3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="h-full"
                            >
                                <div className="relative bg-slate-50 dark:bg-[#161b22] rounded-3xl p-8 md:p-12 border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden min-h-[500px] flex flex-col justify-center">

                                    {/* Decorative Gradient Background based on active tab */}
                                    <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none ${activeContent.bg.replace('/10', '/30')}`} />

                                    <div className="relative z-10">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 ${activeContent.bg} ${activeContent.color}`}>
                                            <activeContent.icon className="w-4 h-4" />
                                            {activeContent.label} Mode
                                        </div>

                                        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                                            {activeContent.title}
                                        </h3>

                                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-xl">
                                            {activeContent.description}
                                        </p>

                                        <div className="space-y-4 mb-10">
                                            {activeContent.features.map((feature, i) => (
                                                <motion.div
                                                    key={feature}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="flex items-center gap-3"
                                                >
                                                    <div className={`p-1 rounded-full ${activeContent.bg}`}>
                                                        <CheckCircle2 className={`w-4 h-4 ${activeContent.color}`} />
                                                    </div>
                                                    <span className="text-slate-700 dark:text-slate-300 font-medium">{feature}</span>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Placeholder for "Result UI" - Simulated Interface Element */}
                                        <div className="mt-8 bg-white dark:bg-[#0b0f17] rounded-xl border border-slate-200 dark:border-white/10 p-4 shadow-lg max-w-md transform rotate-1 hover:rotate-0 transition-transform duration-500">
                                            <div className="flex items-center gap-3 mb-3 border-b border-slate-100 dark:border-white/5 pb-3">
                                                <div className={`w-8 h-8 rounded-lg ${activeContent.bg} flex items-center justify-center`}>
                                                    <activeContent.icon className={`w-4 h-4 ${activeContent.color}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="h-2 w-24 bg-slate-200 dark:bg-white/10 rounded mb-1" />
                                                    <div className="h-1.5 w-16 bg-slate-100 dark:bg-white/5 rounded" />
                                                </div>
                                                <div className="text-xs font-mono text-slate-400">AI DETECTED</div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded" />
                                                <div className="h-2 w-[90%] bg-slate-100 dark:bg-white/5 rounded" />
                                                <div className="h-2 w-[95%] bg-slate-100 dark:bg-white/5 rounded" />
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
