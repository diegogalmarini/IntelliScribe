import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { PlanConfig } from '../../types';

// Hook para obtener escasez REAL desde el backend
const useRealScarcity = (code: string) => {
    const [data, setData] = useState<any>(null);
    useEffect(() => {
        const fetchScarcity = async () => {
            try {
                if (!code) return;
                const res = await fetch(`/api/coupon-status?code=${code}`);
                const json = await res.json();
                if (json.active) setData(json);
            } catch (e) {
                console.error("Error fetching scarcity:", e);
            }
        };
        fetchScarcity();
    }, [code]);
    return data;
};

export const Pricing: React.FC = () => {
    const { t } = useLanguage();
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');

    // Estados Dinámicos
    const [plans, setPlans] = useState<PlanConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [legalFooter, setLegalFooter] = useState<string>('');

    // Conectar al cupón EARLY100
    const scarcity = useRealScarcity('EARLY100');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch plans
                const { data: plansData, error: plansError } = await supabase
                    .from('plans_configuration')
                    .select('*')
                    .eq('is_active', true)
                    .order('price_monthly', { ascending: true });

                if (plansError) throw plansError;
                if (plansData) setPlans(plansData);

                // Fetch legal footer
                const { data: settingsData, error: settingsError } = await supabase
                    .from('app_settings')
                    .select('value')
                    .eq('key', 'legal_footer_text')
                    .single();

                console.log('[Pricing] Legal footer fetch:', { settingsData, settingsError });

                if (!settingsError && settingsData) {
                    console.log('[Pricing] Setting legal footer:', settingsData.value);
                    setLegalFooter(settingsData.value);
                } else {
                    console.warn('[Pricing] No legal footer found or error:', settingsError);
                }
            } catch (err) {
                console.error('Error loading landing data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="py-24 text-center">Cargando ofertas...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-24 relative" id="pricing">
            <div className="text-center mb-16">
                <h2 className="h2 text-slate-900 dark:text-white mb-4">
                    Planes flexibles y trasparentes
                </h2>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">
                    Sin costes ocultos. Cancela cuando quieras.
                </p>

                {/* Toggle Anual */}
                <div className="mt-8 flex justify-center items-center gap-4">
                    <span className={`text-sm ${billingInterval === 'monthly' ? 'font-bold text-slate-900' : 'text-slate-500'}`}>Mensual</span>
                    <button
                        onClick={() => setBillingInterval(prev => prev === 'monthly' ? 'annual' : 'monthly')}
                        className={`relative w-14 h-8 rounded-full transition-colors ${billingInterval === 'annual' ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                        <motion.div
                            className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow"
                            animate={{ x: billingInterval === 'annual' ? 24 : 0 }}
                        />
                    </button>
                    <span className={`text-sm ${billingInterval === 'annual' ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                        Anual <span className="text-green-600 font-bold ml-1">-25%</span>
                    </span>
                </div>
            </div>

            {/* Grid de Planes - Con Features del Backend */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {plans.map((plan) => {
                    const monthlyPrice = plan.price_monthly;
                    const annualPrice = plan.price_annual;
                    const annualMonthlyEquiv = annualPrice > 0 ? Math.round(annualPrice / 12) : 0;
                    const isHighlight = plan.highlight;

                    return (
                        <div key={plan.id} className={`relative p-6 bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-sm border transition-all hover:shadow-md flex flex-col ${isHighlight ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-slate-200 dark:border-slate-800'
                            }`}>


                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                                {/* Subtitle Description */}
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 h-8">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="mb-6">
                                {plan.id === 'free' ? (
                                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">Gratis</span>
                                ) : (
                                    <>
                                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                                            {billingInterval === 'annual' && annualPrice > 0
                                                ? `${annualMonthlyEquiv}€`
                                                : `${monthlyPrice}€`
                                            }
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-500 font-medium">/mes</span>
                                        {billingInterval === 'annual' && annualPrice > 0 && (
                                            <p className="text-[10px] text-green-600 mt-1 font-bold">
                                                Facturado {annualPrice}€ anualmente
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>

                            <a
                                href="/login"
                                className={`mt-auto block w-full py-2.5 px-4 rounded-lg text-center text-sm font-bold transition-all ${isHighlight
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/20'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {plan.id === 'free' ? 'Empezar Gratis' : 'Elegir Plan'}
                            </a>

                            {/* Features from Backend - No Icons */}
                            <div className="mt-6 space-y-2">
                                {plan.features?.slice(0, 4).map((feature, i) => (
                                    <div key={i} className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                                        • {feature}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>



            {/* Comparison Table */}
            <div className="mb-16">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse bg-white dark:bg-[#1a1a1a] rounded-xl overflow-hidden">
                        <thead>
                            <tr>
                                <th className="p-4 border-b border-slate-200 dark:border-slate-800 w-1/5"></th>
                                {plans.map(p => (
                                    <th key={p.id} className="p-4 border-b border-slate-200 dark:border-slate-800 text-center min-w-[120px]">
                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{p.name}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* TRANSCRIPCIÓN Group */}
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <td colSpan={plans.length + 1} className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    TRANSCRIPCIÓN
                                </td>
                            </tr>
                            <tr>
                                <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                                    Minutos Mensuales
                                </td>
                                {plans.map(p => (
                                    <td key={p.id} className="p-4 border-b border-slate-100 dark:border-slate-800 text-center text-sm font-medium text-slate-900 dark:text-white">
                                        {p.limits?.transcription_minutes === -1 ? '∞' : p.limits?.transcription_minutes}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                                    Etiquetas de Orador
                                </td>
                                {plans.map(p => (
                                    <td key={p.id} className="p-4 border-b border-slate-100 dark:border-slate-800 text-center">
                                        <Check size={18} className="mx-auto text-blue-600 dark:text-blue-400" />
                                    </td>
                                ))}
                            </tr>

                            {/* FUNCIONES IA Group */}
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <td colSpan={plans.length + 1} className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    FUNCIONES IA
                                </td>
                            </tr>
                            <tr>
                                <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                                    Preguntar a Diktalo (Chat)
                                </td>
                                {plans.map(p => (
                                    <td key={p.id} className="p-4 border-b border-slate-100 dark:border-slate-800 text-center">
                                        {p.id !== 'free' ? <Check size={18} className="mx-auto text-blue-600 dark:text-blue-400" /> : <span className="text-slate-400">-</span>}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                                    Resúmenes Avanzados
                                </td>
                                {plans.map(p => (
                                    <td key={p.id} className="p-4 border-b border-slate-100 dark:border-slate-800 text-center">
                                        {p.id !== 'free' ? <Check size={18} className="mx-auto text-blue-600 dark:text-blue-400" /> : <span className="text-slate-400">-</span>}
                                    </td>
                                ))}
                            </tr>

                            {/* INTEGRACIÓN Group */}
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <td colSpan={plans.length + 1} className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    INTEGRACIÓN
                                </td>
                            </tr>
                            <tr>
                                <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                                    Integración Zapier
                                </td>
                                {plans.map(p => (
                                    <td key={p.id} className="p-4 border-b border-slate-100 dark:border-slate-800 text-center">
                                        {p.id === 'business' || p.id === 'business_plus' ? <Check size={18} className="mx-auto text-blue-600 dark:text-blue-400" /> : <span className="text-slate-400">-</span>}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                                    Llamadas
                                </td>
                                {plans.map(p => (
                                    <td key={p.id} className="p-4 border-b border-slate-100 dark:border-slate-800 text-center">
                                        {p.id === 'business_plus' ? <Check size={18} className="mx-auto text-blue-600 dark:text-blue-400" /> : <span className="text-slate-400">-</span>}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legal Footer from Admin */}
            {legalFooter && (
                <div className="text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-8 max-w-3xl mx-auto">
                    {legalFooter}
                </div>
            )}
        </div>
    );
};