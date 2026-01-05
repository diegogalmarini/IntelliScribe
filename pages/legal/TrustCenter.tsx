import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Server, FileText, CheckCircle, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TrustCenter: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background-dark py-12 md:py-24 px-4 transition-colors duration-200">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto text-center mb-20"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-violet/10 dark:bg-brand-violet/20 border border-brand-violet/20 rounded-full text-brand-violet dark:text-brand-violet mb-6">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Trust Center</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-display font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                    Tu privacidad es nuestra <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-brand">prioridad absoluta.</span>
                </h1>
                <p className="max-w-2xl mx-auto text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
                    En Diktalo, creemos que tus conversaciones son tus activos más valiosos.
                    Hemos construido una infraestructura de grado empresarial para asegurar que tus datos de voz permanezcan privados, seguros y bajo tu control total.
                </p>
            </motion.div>

            {/* 4 Pillars of Security */}
            <div className="max-w-7xl mx-auto mb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Pillar 1 */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none"
                    >
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Encriptación Total</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Todos tus archivos de audio y transcripciones se encriptan en tránsito mediante <strong>TLS 1.2+</strong> y en reposo utilizando el estándar <strong>AES-256</strong>.
                        </p>
                    </motion.div>

                    {/* Pillar 2 */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none"
                    >
                        <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                            <Database className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Propiedad Total</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Tus grabaciones te pertenecen. Diktalo no reclama ningún derecho. Puedes descargar o eliminar tus datos permanentemente en cualquier momento.
                        </p>
                    </motion.div>

                    {/* Pillar 3 */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none"
                    >
                        <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
                            <Server className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Infraestructura</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Alojado en <strong>Supabase + Vercel</strong>, utilizando centros de datos con certificaciones SOC2 Type II y cumplimiento ISO 27001 para máxima fiabilidad.
                        </p>
                    </motion.div>

                    {/* Pillar 4 */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none"
                    >
                        <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6">
                            <Eye className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Acceso Aislado</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Implementamos <strong>Row Level Security (RLS)</strong> estricto. Nadie, ni siquiera nuestro equipo técnico, puede acceder a tus archivos sin tu permiso.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* AI Privacy Section */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto rounded-[2.5rem] bg-slate-900 text-white overflow-hidden relative mb-20 border border-white/10"
            >
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                    <Cpu className="w-64 h-64" />
                </div>

                <div className="relative p-8 md:p-16 z-10">
                    <h2 className="text-3xl font-display font-black mb-6">Privacidad de la Inteligencia Artificial</h2>

                    <div className="flex flex-col gap-6">
                        <div className="flex gap-4 items-start">
                            <div className="p-1 bg-red-500/20 rounded text-red-400 mt-1">
                                <span className="material-symbols-outlined">close</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-1">¿Diktalo entrena su IA con mis datos?</h4>
                                <p className="text-red-300 font-bold tracking-wide">ROTUNDAMENTE NO.</p>
                            </div>
                        </div>

                        <p className="text-slate-400 leading-relaxed pl-12">
                            No utilizamos tus grabaciones personales, llamadas del Dialer o transcripciones para entrenar los modelos públicos de IA (como Gemini o AssemblyAI).
                            Tus datos se procesan de forma efímera a través de APIs cifradas y se devuelven exclusivamente a tu cuenta privada.
                        </p>

                        <div className="pl-12 pt-4 border-t border-white/10 mt-2">
                            <p className="text-sm text-slate-500 italic">
                                * El "Vocabulario Personalizado" que añades es una capa lógica privada que solo se aplica a tus propias transcripciones.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Transparency & Compliance Grid */}
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
                {/* Transparency */}
                <div className="p-8 md:p-10 rounded-[2rem] bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                        <FileText className="w-6 h-6 text-primary" />
                        Transparencia
                    </h3>
                    <ul className="space-y-4">
                        <li className="flex gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                            <div>
                                <strong className="block text-slate-900 dark:text-white text-sm">Sin Venta de Datos</strong>
                                <span className="text-slate-500 text-xs">Nunca vendemos tus datos a terceros. Nuestro modelo es 100% suscripción.</span>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                            <div>
                                <strong className="block text-slate-900 dark:text-white text-sm">Acceso Controlado</strong>
                                <span className="text-slate-500 text-xs">Solo tú decides quién ve tus grabaciones mediante compartición controlada.</span>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Compliance */}
                <div className="p-8 md:p-10 rounded-[2rem] bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                        <Shield className="w-6 h-6 text-primary" />
                        Cumplimiento
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/GDPR_logo.svg" alt="GDPR" className="h-6 w-auto opacity-70" />
                            <div>
                                <strong className="block text-slate-900 dark:text-white text-xs">GDPR Ready</strong>
                                <span className="text-slate-500 text-[10px]">Unión Europea</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                            <Shield className="w-6 h-6 text-slate-400" />
                            <div>
                                <strong className="block text-slate-900 dark:text-white text-xs">CCPA Compliant</strong>
                                <span className="text-slate-500 text-[10px]">California Privacy Rights</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer / Feedback CTA */}
            <div className="max-w-2xl mx-auto text-center border-t border-slate-200 dark:border-white/10 pt-16">
                <h4 className="text-slate-900 dark:text-white font-bold mb-4">¿Tienes sugerencias de seguridad?</h4>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => window.location.href = 'mailto:security@diktalo.com'}
                        className="text-sm font-bold text-primary hover:underline"
                    >
                        Reportar Vulnerabilidad
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                        onClick={() => navigate('/feedback')} /* Future Feature Request Page */
                        disabled
                        className="text-sm font-bold text-slate-500 cursor-not-allowed"
                        title="Coming Soon"
                    >
                        Feature Requests (Próximamente)
                    </button>
                </div>
                <div className="mt-12">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 mx-auto text-slate-400 hover:text-primary font-black uppercase tracking-widest text-xs transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">west</span>
                        Volver
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrustCenter;
