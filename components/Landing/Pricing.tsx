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

    // Conectar al cupón EARLY100
    const scarcity = useRealScarcity('EARLY100');

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
                console.error('Error loading landing plans:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
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
                        Anual <span className="text-green-600 font-bold ml-1">-30%</span>
                    </span>
                </div>

                {/* BARRA DE ESCASEZ (Comentada temporalmente por petición del usuario) */}
                {/* scarcity && scarcity.remaining && billingInterval === 'annual' && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-3"
                    >
                        <div className="flex justify-between text-sm font-bold text-red-700 mb-1">
                            <span>🔥 OFERTA DE LANZAMIENTO ({scarcity.percent_off}% EXTRA)</span>
                            <span>Quedan {scarcity.remaining}</span>
                        </div>
                        <div className="w-full bg-red-200 rounded-full h-2.5">
                            <div
                                className="bg-red-600 h-2.5 rounded-full transition-all duration-1000"
                                style={{ width: `${(scarcity.remaining / scarcity.total) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-red-600 mt-1">
                            Usa el código <b>{scarcity.code}</b> al pagar anualmente.
                        </p>
                    </motion.div>
                ) */}
            </div>

            {/* Grid de Planes Dinámico - 4 Columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {plans.map((plan) => {
                    const monthlyPrice = plan.price_monthly;
                    const annualPrice = plan.price_annual;
                    // Precio mensual equivalente al pagar anual
                    const annualMonthlyEquiv = annualPrice > 0 ? Math.round(annualPrice / 12) : 0;

                    // Determine button style based on highlight
                    const isHighlight = plan.highlight;

                    return (
                        <div key={plan.id} className={`relative p-6 bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-sm border transition-all hover:shadow-md flex flex-col ${isHighlight ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-slate-200 dark:border-slate-800'
                            }`}>
                            {plan.badge_text && (
                                <span className="absolute top-0 right-0 -mt-2.5 mr-4 px-2.5 py-0.5 bg-blue-600 text-white text-[10px] uppercase font-bold rounded-full tracking-wide">
                                    {plan.badge_text}
                                </span>
                            )}

                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                                {/* Short Description Line */}
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 h-8">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="mb-6">
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
                        </div>
                    );
                })}
            </div>

            {/* Comparison Button */}
            <div className="text-center">
                <a
                    href="/pricing"
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                >
                    Ver comparativa completa
                    <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </a>
            </div>
        </div>
    );
};