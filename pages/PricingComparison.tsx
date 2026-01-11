import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Landing/Navbar';
import { Footer } from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { PlanConfig } from '../types';
import { Check, Plus, Minus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const PricingComparison: React.FC = () => {
    const { t } = useLanguage();
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');
    const [plans, setPlans] = useState<PlanConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [openFaqId, setOpenFaqId] = useState<number | null>(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const { data, error } = await supabase
                    .from('plans_configuration')
                    .select('*')
                    .eq('is_active', true)
                    .order('price_monthly', { ascending: true });

                if (error) throw error;
                if (data) setPlans(data);
            } catch (err) {
                console.error('Error loading plans:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const getPlanDetails = (planId: string) => {
        // Shared logic with SubscriptionView - ideal refactor would be a shared helper hook
        switch (planId) {
            case 'free': return { name: t('planFree') || 'Free', features: [t('freeF1'), t('freeF2'), t('freeF3'), t('freeF4')] };
            case 'pro': return { name: t('planPro') || 'Pro', features: [t('proF1'), t('proF2'), t('proF3'), t('proF4')] };
            case 'business': return { name: t('planBiz') || 'Business', features: [t('bizF1'), t('bizF2'), t('bizF3'), t('bizF4')] };
            case 'business_plus': return { name: t('planBizPlus') || 'Business +', features: [t('bizPlusF1'), t('bizPlusF2'), t('bizPlusF3'), t('bizPlusF4')] };
            default: return { name: planId, features: [] };
        }
    };

    const toggleFaq = (index: number) => setOpenFaqId(openFaqId === index ? null : index);

    // Reuse FAQS
    const FAQS = [
        { q: t('faq_1_q'), a: t('faq_1_a') },
        { q: t('faq_2_q'), a: t('faq_2_a') },
        { q: t('faq_3_q'), a: t('faq_3_a') },
        { q: t('faq_4_q'), a: t('faq_4_a') }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 font-sans flex flex-col">
            <Navbar />

            <main className="flex-grow pt-32 pb-24 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
                            Comparativa de Planes
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
                            Encuentra el plan perfecto para ti o tu equipo. Sin costes ocultos.
                        </p>

                        {/* Billing Toggle */}
                        <div className="flex justify-center items-center gap-4">
                            <span className={`text-sm font-medium ${billingInterval === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Mensual</span>
                            <button
                                onClick={() => setBillingInterval(prev => prev === 'monthly' ? 'annual' : 'monthly')}
                                className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${billingInterval === 'annual' ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                            >
                                <motion.div
                                    className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                                    animate={{ x: billingInterval === 'annual' ? 24 : 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            </button>
                            <span className={`text-sm font-medium ${billingInterval === 'annual' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                Anual <span className="text-green-500 font-bold ml-1">-30%</span>
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-20 text-center text-slate-400 animate-pulse">Cargando datos...</div>
                    ) : (
                        <div className="overflow-x-auto pb-12">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr>
                                        <th className="p-6 border-b border-transparent w-1/4"></th>
                                        {plans.map(p => {
                                            const translated = getPlanDetails(p.id);
                                            const price = billingInterval === 'annual' && p.price_annual > 0
                                                ? Math.round(p.price_annual / 12)
                                                : p.price_monthly;

                                            return (
                                                <th key={p.id} className={`p-6 border-b border-slate-100 dark:border-slate-800 text-center align-bottom rounded-t-2xl ${p.highlight ? 'bg-slate-50 dark:bg-slate-900/50 relative' : ''
                                                    }`}>
                                                    {p.highlight && (
                                                        <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full">
                                                            Recomendado
                                                        </span>
                                                    )}
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{translated.name}</h3>
                                                    <div className="flex items-baseline justify-center gap-0.5 mb-4">
                                                        <span className="text-3xl font-bold text-slate-900 dark:text-white">{price === 0 ? '0€' : `${price}€`}</span>
                                                        <span className="text-xs text-slate-500 font-normal">/mes</span>
                                                    </div>
                                                    <a
                                                        href="/login"
                                                        className={`block w-full py-2.5 rounded-lg text-sm font-bold transition-all ${p.highlight
                                                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/25'
                                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                                                            }`}
                                                    >
                                                        {p.id === 'free' ? 'Empezar Gratis' : 'Elegir Plan'}
                                                    </a>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Features Group 1 */}
                                    <tr><td colSpan={plans.length + 1} className="py-6 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Transcripción</td></tr>
                                    <tr className="border-b border-slate-100 dark:border-slate-800/50">
                                        <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">Minutos incluidos</td>
                                        {plans.map(p => (
                                            <td key={p.id} className={`p-4 text-center text-sm font-bold text-slate-900 dark:text-white ${p.highlight ? 'bg-slate-50 dark:bg-slate-900/50' : ''}`}>
                                                {p.limits?.transcription_minutes == -1 ? 'Ilimitados' : p.limits?.transcription_minutes}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="border-b border-slate-100 dark:border-slate-800/50">
                                        <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">Identificación de hablantes</td>
                                        {plans.map(p => (
                                            <td key={p.id} className={`p-4 text-center ${p.highlight ? 'bg-slate-50 dark:bg-slate-900/50' : ''}`}>
                                                <div className="flex justify-center"><Check size={20} className="text-blue-500" /></div>
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Features Group 2 */}
                                    <tr><td colSpan={plans.length + 1} className="py-6 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Inteligencia Artificial</td></tr>
                                    <tr className="border-b border-slate-100 dark:border-slate-800/50">
                                        <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">Chat con tus audios (ASK)</td>
                                        {plans.map(p => (
                                            <td key={p.id} className={`p-4 text-center ${p.highlight ? 'bg-slate-50 dark:bg-slate-900/50' : ''}`}>
                                                <div className="flex justify-center">{p.id !== 'free' ? <Check size={20} className="text-blue-500" /> : <span className="text-slate-300">-</span>}</div>
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="border-b border-slate-100 dark:border-slate-800/50">
                                        <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">Resúmenes Avanzados</td>
                                        {plans.map(p => (
                                            <td key={p.id} className={`p-4 text-center ${p.highlight ? 'bg-slate-50 dark:bg-slate-900/50' : ''}`}>
                                                <div className="flex justify-center"><Check size={20} className="text-blue-500" /></div>
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Features Group 3 */}
                                    <tr><td colSpan={plans.length + 1} className="py-6 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Integraciones</td></tr>
                                    <tr className="border-b border-slate-100 dark:border-slate-800/50">
                                        <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">Zapier & Webhooks</td>
                                        {plans.map(p => (
                                            <td key={p.id} className={`p-4 text-center ${p.highlight ? 'bg-slate-50 dark:bg-slate-900/50' : ''}`}>
                                                <div className="flex justify-center">
                                                    {p.id === 'business' || p.id === 'business_plus' ? <Check size={20} className="text-blue-500" /> : <span className="text-slate-300">-</span>}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Footer Row */}
                                    <tr>
                                        <td></td>
                                        {plans.map(p => (
                                            <td key={p.id} className={`p-6 text-center rounded-b-2xl ${p.highlight ? 'bg-slate-50 dark:bg-slate-900/50' : ''}`}>
                                                <a
                                                    href="/login"
                                                    className={`block w-full py-2.5 rounded-lg text-sm font-bold transition-all ${p.highlight
                                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200'
                                                        }`}
                                                >
                                                    Seleccionar
                                                </a>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* FAQ Section */}
                    <div className="max-w-3xl mx-auto mt-20">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">Preguntas Frecuentes</h2>
                        <div className="grid gap-4">
                            {FAQS.map((faq, i) => (
                                <div key={i} onClick={() => toggleFaq(i)} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-5 cursor-pointer hover:border-blue-500/50 transition-all">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{faq.q}</h3>
                                        {openFaqId === i ? <Minus size={18} className="text-blue-500" /> : <Plus size={18} className="text-slate-400" />}
                                    </div>
                                    <AnimatePresence>
                                        {openFaqId === i && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                <p className="pt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};
