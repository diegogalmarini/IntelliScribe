import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Navbar } from '../components/Landing/Navbar';
import { Footer } from '../components/Footer';

export const SubscriptionConfirm: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const confirmSub = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Token de confirmación no encontrado.');
                return;
            }

            try {
                const response = await fetch(`/api/newsletter-confirm?token=${token}`);
                const data = await response.json();

                if (data.success) {
                    setStatus('success');
                } else {
                    setStatus('error');
                    setMessage(data.error || 'No pudimos confirmar tu suscripción.');
                }
            } catch (err) {
                setStatus('error');
                setMessage('Error de conexión con el servidor.');
            }
        };

        confirmSub();
    }, [token]);

    return (
        <div className="min-h-screen bg-white dark:bg-[#0b0f17] transition-colors duration-300">
            <Navbar user={null} onNavigate={(path) => navigate(path)} />

            <main className="pt-40 pb-24 px-6">
                <div className="max-w-xl mx-auto text-center">
                    {status === 'loading' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <Loader2 size={64} className="text-primary animate-spin" />
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Confirmando tu suscripción...</h2>
                        </motion.div>
                    )}

                    {status === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card p-12 rounded-[3rem] border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 shadow-2xl shadow-emerald-500/10"
                        >
                            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                                <CheckCircle2 size={40} className="text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">¡Suscripción Confirmada!</h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
                                Gracias por unirte a Diktalo. A partir de ahora recibirás nuestras mejores estrategias e insights directamente en tu bandeja de entrada.
                            </p>
                            <button
                                onClick={() => navigate('/blog')}
                                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-emerald-600/20 group"
                            >
                                Volver al Blog
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card p-12 rounded-[3rem] border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/5 shadow-2xl shadow-rose-500/10"
                        >
                            <div className="w-20 h-20 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                                <XCircle size={40} className="text-rose-600 dark:text-rose-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Ups, algo salió mal</h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
                                {message}
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold py-4 px-8 rounded-2xl transition-all"
                            >
                                Ir al Inicio
                            </button>
                        </motion.div>
                    )}

                    <div className="mt-16 flex items-center justify-center gap-2 text-slate-400 text-xs uppercase tracking-widest font-bold">
                        <ShieldCheck size={16} />
                        Suscripción Segura & Encriptada
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
