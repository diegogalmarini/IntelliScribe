import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Landing/Navbar';
import { Footer } from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { PlanConfig, MinutePack, UserProfile } from '../types';
import { Check, Plus, Minus, Zap, Shield, Users, Globe } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { VoiceRatesTable } from '../components/VoiceRatesTable';

interface PricingComparisonProps {
    user?: UserProfile;
}

export const PricingComparison: React.FC<PricingComparisonProps> = ({ user }) => {
    const { t } = useLanguage();
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');
    const [plans, setPlans] = useState<PlanConfig[]>([]);
    const [minutePacks, setMinutePacks] = useState<MinutePack[]>([]);
    const [loading, setLoading] = useState(true);
    const [openFaqId, setOpenFaqId] = useState<number | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0); // Ensure top on load
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

        const fetchMinutePacks = async () => {
            try {
                const { data, error } = await supabase
                    .from('minute_packs')
                    .select('*')
                    .eq('is_active', true)
                    .order('order', { ascending: true });

                if (error) throw error;
                if (data) setMinutePacks(data);
            } catch (err) {
                console.error('Error loading minute packs:', err);
            }
        };

        fetchPlans();
        fetchMinutePacks();
    }, []);

    const toggleFaq = (index: number) => setOpenFaqId(openFaqId === index ? null : index);

    // Reuse FAQS
    const FAQS = [
        { q: t('faq_1_q'), a: t('faq_1_a') },
        { q: t('faq_2_q'), a: t('faq_2_a') },
        { q: t('faq_3_q'), a: t('faq_3_a') },
        { q: t('faq_4_q'), a: t('faq_4_a') }
    ];

    const getPlanDetails = (planId: string) => {
        switch (planId) {
            case 'free': return {
                name: t('planFree') || 'Free',
                description: "Para individuos que empiezan a descubrir el poder de la voz."
            };
            case 'pro': return {
                name: t('planPro') || 'Pro',
                description: "Para profesionales que necesitan transcripción ilimitada y IA avanzada."
            };
            case 'business': return {
                name: t('planBiz') || 'Business',
                description: "Para equipos en crecimiento que requieren automatización y flujos de trabajo."
            };
            case 'business_plus': return {
                name: t('planBizPlus') || 'Business +',
                description: "Máxima potencia, soporte prioritario y seguridad de grado empresarial."
            };
            default: return { name: planId, description: "" };
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col transition-colors duration-300">
            <Navbar />

            <main className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                            Elige el plan que se adapte a tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">ambición</span>
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Desde freelancers hasta grandes corporaciones. Diktalo escala contigo con precios transparentes y sin sorpresas.
                        </p>

                        {/* Billing Interval Toggle */}
                        <div className="inline-flex items-center gap-4 bg-white dark:bg-slate-900/50 p-2 rounded-full shadow-sm border border-slate-200 dark:border-white/10 mb-8 backdrop-blur-sm">
                            <span className={`text-sm font-bold px-4 transition-colors ${billingInterval === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Mensual</span>
                            <button
                                onClick={() => setBillingInterval(prev => prev === 'monthly' ? 'annual' : 'monthly')}
                                className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${billingInterval === 'annual' ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <motion.div
                                    className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                                    animate={{ x: billingInterval === 'annual' ? 24 : 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            </button>
                            <span className={`text-sm font-bold px-4 transition-colors ${billingInterval === 'annual' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                Anual <span className="text-green-600 dark:text-green-400 font-black ml-1 text-xs uppercase tracking-wide bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">-30%</span>
                            </span>
                        </div>
                    </motion.div>
                </section>

                {/* Pricing Cards Grid */}
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
                        <p className="mt-4 text-slate-500 text-sm">Cargando planes...</p>
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
                        {plans.map((p, idx) => {
                            const details = getPlanDetails(p.id);
                            const price = billingInterval === 'annual' && p.price_annual > 0
                                ? Math.round(p.price_annual / 12)
                                : p.price_monthly;

                            const isRecommended = p.highlight;

                            return (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                                    className={`relative flex flex-col p-8 rounded-3xl transition-all duration-300 ${isRecommended
                                        ? 'bg-white dark:bg-slate-900 border-2 border-blue-500 shadow-xl shadow-blue-500/10 scale-105 z-10'
                                        : 'bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-700/50 hover:shadow-lg backdrop-blur-xl'
                                        }`}
                                >
                                    {isRecommended && (
                                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                                Recomendado
                                            </span>
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{details.name}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 min-h-[40px] leading-snug">
                                            {details.description}
                                        </p>
                                    </div>

                                    <div className="mb-8">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                                {price === 0 ? 'Gratis' : `${price}€`}
                                            </span>
                                            {price > 0 && <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">/mes</span>}
                                        </div>
                                        {billingInterval === 'annual' && p.price_annual > 0 && (
                                            <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                                                Ahorras {((p.price_monthly * 12) - p.price_annual)}€ al año
                                            </p>
                                        )}
                                    </div>

                                    <a
                                        href="/login"
                                        className={`w-full py-3.5 rounded-xl text-sm font-bold text-center transition-all duration-200 mb-8 ${isRecommended
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transform hover:-translate-y-0.5'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {p.id === 'free' ? 'Empezar Gratis' : 'Comenzar Ahora'}
                                    </a>

                                    <div className="mt-auto space-y-4">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Incluye:</p>
                                        {/* Dynamic Features List based on Plan ID */}
                                        <ul className="space-y-3">
                                            <PlanFeature text={`${p.limits?.transcription_minutes === -1 ? 'Ilimitados' : p.limits?.transcription_minutes} min/mes`} />
                                            <PlanFeature text="Identificación de hablantes" />
                                            {p.id !== 'free' && <PlanFeature text="Chat con tus audios (ASK)" icon="ask" />}
                                            {p.id !== 'free' && <PlanFeature text="Resúmenes Avanzados" />}
                                            {(p.id === 'business' || p.id === 'business_plus') && <PlanFeature text="Zapier & Webhooks" icon="zap" />}
                                            {p.id === 'business_plus' && <PlanFeature text="Soporte Prioritario VIP" icon="star" />}
                                        </ul>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Minute Packs Section */}
                {minutePacks.length > 0 && (
                    <section className="max-w-7xl mx-auto mb-24 px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">¿Necesitas más minutos?</h2>
                            <p className="text-slate-500 dark:text-slate-400">Packs de minutos adicionales para cualquier plan. Sin caducidad.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {minutePacks.map((pack) => (
                                <motion.div
                                    key={pack.id}
                                    whileHover={{ y: -5 }}
                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center transition-shadow hover:shadow-xl"
                                >
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                                        <Zap className="text-blue-600 dark:text-blue-400" size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{pack.name}</h3>
                                    <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-2">
                                        {pack.minutes} <span className="text-sm font-medium text-slate-400 uppercase">min</span>
                                    </div>
                                    <div className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                                        {pack.price}€
                                    </div>
                                    <a
                                        href={pack.checkout_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                                    >
                                        Comprar Pack
                                    </a>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* VOICE RATES TABLE (Public) */}
                <VoiceRatesTable />

                {/* Comparison Table */}
                <section className="max-w-7xl mx-auto mb-24 overflow-hidden">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-10 text-center">Comparativa Detallada</h2>
                    <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/50 backdrop-blur-sm shadow-xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-white/5">
                                    <th className="p-6 border-b border-slate-100 dark:border-white/5 w-1/4 text-xs font-bold uppercase tracking-widest text-slate-400">Característica</th>
                                    {plans.map(p => (
                                        <th key={p.id} className="p-6 border-b border-slate-100 dark:border-white/5 text-center min-w-[140px]">
                                            <div className="text-lg font-bold text-slate-900 dark:text-white">{getPlanDetails(p.id).name}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {/* TRANSCRIPCIÓN Group */}
                                <tr className="bg-blue-50/30 dark:bg-blue-900/10">
                                    <td colSpan={plans.length + 1} className="px-6 py-4 text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                        Transcripción y Voz
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-6 text-sm font-medium text-slate-700 dark:text-slate-300">Minutos Mensuales</td>
                                    {plans.map(p => (
                                        <td key={p.id} className="p-6 text-center text-sm font-black text-slate-900 dark:text-white">
                                            {p.limits?.transcription_minutes === -1 ? 'Ilimitados' : p.limits?.transcription_minutes}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-6 text-sm text-slate-600 dark:text-slate-400 font-medium">Identificación de Hablantes</td>
                                    {plans.map(p => (
                                        <td key={p.id} className="p-6 text-center">
                                            <Check size={20} className="mx-auto text-emerald-500" />
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-6 text-sm text-slate-600 dark:text-slate-400 font-medium">Grabación Multi-dispositivo</td>
                                    {plans.map(p => (
                                        <td key={p.id} className="p-6 text-center">
                                            <Check size={20} className="mx-auto text-emerald-500" />
                                        </td>
                                    ))}
                                </tr>

                                {/* INTELIGENCIA ARTIFICIAL Group */}
                                <tr className="bg-purple-50/30 dark:bg-purple-900/10">
                                    <td colSpan={plans.length + 1} className="px-6 py-4 text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                                        Inteligencia Artificial
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-6 text-sm font-medium text-slate-700 dark:text-slate-300">Ask Diktalo (Chat con audio)</td>
                                    {plans.map(p => (
                                        <td key={p.id} className="p-6 text-center">
                                            {p.id !== 'free' ? <Check size={20} className="mx-auto text-purple-500" /> : <span className="text-slate-300">-</span>}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-6 text-sm font-medium text-slate-700 dark:text-slate-300">Resúmenes Estructurados</td>
                                    {plans.map(p => (
                                        <td key={p.id} className="p-6 text-center">
                                            {p.id !== 'free' ? <Check size={20} className="mx-auto text-purple-500" /> : <span className="text-slate-300">-</span>}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-6 text-sm font-medium text-slate-700 dark:text-slate-300">Detección de Action Items</td>
                                    {plans.map(p => (
                                        <td key={p.id} className="p-6 text-center">
                                            {p.id === 'pro' || p.id.startsWith('business') ? <Check size={20} className="mx-auto text-purple-500" /> : <span className="text-slate-300">-</span>}
                                        </td>
                                    ))}
                                </tr>

                                {/* INTEGRACIONES Group */}
                                <tr className="bg-orange-50/30 dark:bg-orange-900/10">
                                    <td colSpan={plans.length + 1} className="px-6 py-4 text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">
                                        Ecosistema y Seguridad
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-6 text-sm font-medium text-slate-700 dark:text-slate-300">Integración con Zapier</td>
                                    {plans.map(p => (
                                        <td key={p.id} className="p-6 text-center">
                                            {p.id.startsWith('business') ? <Check size={20} className="mx-auto text-orange-500" /> : <span className="text-slate-300">-</span>}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-6 text-sm font-medium text-slate-700 dark:text-slate-300">Soporte Prioritario</td>
                                    {plans.map(p => (
                                        <td key={p.id} className="p-6 text-center">
                                            {p.id.startsWith('business') ? <Check size={20} className="mx-auto text-orange-500" /> : <span className="text-slate-300">-</span>}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* SEO/AEO Content Section */}
                <section className="max-w-4xl mx-auto mb-20 px-6">
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 text-center">¿Cuál es el mejor plan de Diktalo para mis necesidades?</h2>

                        <div className="grid gap-10">
                            <div>
                                <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4 text-left flex items-center gap-2">
                                    <span className="material-symbols-outlined">help</span>
                                    ¿Qué incluye la transcripción ilimitada en el plan Pro?
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    El plan Pro está diseñado para creadores de contenido, periodistas y estudiantes que necesitan transcribir grandes volúmenes de audio sin preocuparse por los límites. Incluye acceso total a <strong>Ask Diktalo</strong>, permitiéndote chatear con tus grabaciones para extraer datos específicos en segundos, además de resúmenes ejecutivos que ahorran horas de revisión manual.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-4 text-left flex items-center gap-2">
                                    <span className="material-symbols-outlined">hub</span>
                                    ¿Cómo funciona la integración con Zapier en Diktalo?
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Los planes Business permiten conectar Diktalo con más de 5,000 aplicaciones. Puedes configurar flujos de trabajo automáticos: por ejemplo, enviar cada nueva transcripción directamente a una página de <strong>Notion</strong>, crear una tarea en <strong>Trello</strong> basada en los Action Items detectados por la IA, o mandar un resumen instantáneo a un canal de <strong>Slack</strong> para que tu equipo esté siempre al tanto.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-4 text-left flex items-center gap-2">
                                    <span className="material-symbols-outlined">verified_user</span>
                                    ¿Es seguro usar Diktalo para información sensible?
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Absolutamente. La seguridad es nuestra prioridad. Utilizamos encriptación de grado bancario (AES-256) para todos los datos en reposo y conexiones protegidas mediante TLS. Además, cumplimos con normativas de privacidad estrictas, garantizando que tus grabaciones sean solo tuyas. En el plan <strong>Business Plus</strong>, ofrecemos capas adicionales de auditoría y retención de datos personalizada.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto mt-20">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">Preguntas Frecuentes</h2>
                    <div className="grid gap-4">
                        {FAQS.map((faq, i) => (
                            <div key={i} onClick={() => toggleFaq(i)} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-5 cursor-pointer hover:border-blue-500/50 transition-all shadow-sm">
                                <div className="flex justify-between items-center text-left">
                                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm pr-8">{faq.q}</h3>
                                    {openFaqId === i ? <Minus size={18} className="text-blue-500 flex-shrink-0" /> : <Plus size={18} className="text-slate-400 flex-shrink-0" />}
                                </div>
                                <AnimatePresence>
                                    {openFaqId === i && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                            <p className="pt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/5 mt-4">{faq.a}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
};

// Helper for feature list items
const PlanFeature = ({ text, icon }: { text: string; icon?: 'check' | 'zap' | 'ask' | 'star' }) => (
    <li className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0 text-blue-500">
            {icon === 'zap' ? <Zap size={16} className="fill-blue-500/20" /> :
                icon === 'ask' ? <span className="text-xs font-black border border-blue-500 rounded px-1">AI</span> :
                    icon === 'star' ? <span className="material-symbols-outlined text-[16px]">star</span> :
                        <Check size={16} strokeWidth={3} />}
        </div>
        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{text}</span>
    </li>
);
