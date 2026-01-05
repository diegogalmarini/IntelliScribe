import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Server, FileText, CheckCircle, Cpu } from 'lucide-react';
import { LegalLayout } from '../../layouts/LegalLayout';

export const TrustCenter: React.FC = () => {
    return (
        <LegalLayout title="Trust Center" lastUpdated="Live Status: Active">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-16"
            >
                {/* Intro */}
                <div className="not-prose">
                    <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                        En Diktalo, creemos que tus conversaciones son tus activos más valiosos.
                        Hemos construido una infraestructura de grado empresarial para asegurar que tus datos de voz permanezcan privados, seguros y bajo tu control total.
                    </p>
                </div>

                {/* 4 Pillars of Security */}
                <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pillar 1 */}
                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                            <Lock className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Encriptación Total</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Todos tus archivos de audio y transcripciones se encriptan en tránsito mediante <strong>TLS 1.2+</strong> y en reposo utilizando el estándar <strong>AES-256</strong>.
                        </p>
                    </div>

                    {/* Pillar 2 */}
                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                            <Database className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Propiedad Total</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Tus grabaciones te pertenecen. Diktalo no reclama ningún derecho. Puedes descargar o eliminar tus datos permanentemente en cualquier momento.
                        </p>
                    </div>

                    {/* Pillar 3 */}
                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                            <Server className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Infraestructura</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Alojado en <strong>Supabase + Vercel</strong>, utilizando centros de datos con certificaciones SOC2 Type II y cumplimiento ISO 27001 para máxima fiabilidad.
                        </p>
                    </div>

                    {/* Pillar 4 */}
                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4">
                            <Eye className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Acceso Aislado</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Implementamos <strong>Row Level Security (RLS)</strong> estricto. Nadie, ni siquiera nuestro equipo técnico, puede acceder a tus archivos sin tu permiso.
                        </p>
                    </div>
                </div>

                {/* AI Privacy Section */}
                <div className="not-prose p-8 bg-slate-900 text-white rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Cpu className="w-48 h-48" />
                    </div>

                    <h2 className="text-2xl font-bold mb-6 relative z-10">Privacidad de la Inteligencia Artificial</h2>

                    <div className="space-y-6 relative z-10">
                        <div className="flex gap-4 items-start">
                            <div className="p-1 bg-red-500/20 rounded text-red-400 mt-1">
                                <span className="material-symbols-outlined">close</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-1">¿Diktalo entrena su IA con mis datos?</h4>
                                <p className="text-red-300 font-bold tracking-wide">ROTUNDAMENTE NO.</p>
                            </div>
                        </div>
                        <p className="text-slate-300 leading-relaxed pl-12">
                            No utilizamos tus grabaciones personales, llamadas del Dialer o transcripciones para entrenar los modelos públicos de IA (como Gemini o AssemblyAI).
                        </p>
                    </div>
                </div>

                {/* Transparency & Compliance Grid */}
                <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Transparency */}
                    <div className="p-8 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <FileText className="w-5 h-5 text-primary" />
                            Transparencia
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                <div>
                                    <strong className="block text-slate-900 dark:text-white text-sm">Sin Venta de Datos</strong>
                                    <span className="text-slate-500 text-xs">Nunca vendemos tus datos a terceros.</span>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                <div>
                                    <strong className="block text-slate-900 dark:text-white text-sm">Acceso Controlado</strong>
                                    <span className="text-slate-500 text-xs">Solo tú decides quién ve tus grabaciones.</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Compliance */}
                    <div className="p-8 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <Shield className="w-5 h-5 text-primary" />
                            Cumplimiento
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-transparent">
                                <div className="font-bold text-sm">GDPR Ready</div>
                                <span className="text-slate-500 text-xs ml-auto">Unión Europea</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-transparent">
                                <div className="font-bold text-sm">CCPA Compliant</div>
                                <span className="text-slate-500 text-xs ml-auto">California</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="not-prose border-t border-slate-200 dark:border-white/10 pt-12">
                    <h4 className="text-slate-900 dark:text-white font-bold mb-2">Reportar Vulnerabilidad</h4>
                    <p className="text-slate-500 text-sm mb-4">Si has encontrado un problema de seguridad, por favor contáctanos.</p>
                    <a href="mailto:security@diktalo.com" className="text-primary font-medium hover:underline">security@diktalo.com</a>
                </div>

            </motion.div>
        </LegalLayout>
    );
};

export default TrustCenter;
