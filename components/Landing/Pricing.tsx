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
                <h2 className="text-4xl font-bold text-slate-900 mb-4">
                    Planes Flexibles y Transparentes
                </h2>
                <p className="text-xl text-slate-600">
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

            {/* Grid de Planes Dinámico */}
            <div className="grid md:grid-cols-3 gap-8">
                {plans.map((plan) => {
                    const monthlyPrice = plan.price_monthly;
                    const annualPrice = plan.price_annual;
                    // Precio mensual equivalente al pagar anual
                    const annualMonthlyEquiv = annualPrice > 0 ? Math.round(annualPrice / 12) : 0;

                    return (
                        <div key={plan.id} className={`relative p-8 bg-white rounded-2xl shadow-lg border ${plan.highlight ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'}`}>
                            {plan.badge_text && (
                                <span className="absolute top-0 right-0 -mt-3 mr-3 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                                    {plan.badge_text}
                                </span>
                            )}
                            <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                            <p className="text-sm text-slate-500 mt-2 h-10">{plan.description}</p>

                            <div className="my-6">
                                <span className="text-4xl font-extrabold text-slate-900">
                                    {billingInterval === 'annual' && annualPrice > 0
                                        ? `${annualMonthlyEquiv}€`
                                        : `${monthlyPrice}€`
                                    }
                                </span>
                                <span className="text-slate-500">/mes</span>
                                {billingInterval === 'annual' && annualPrice > 0 && (
                                    <p className="text-xs text-green-600 mt-1 font-semibold">
                                        Facturado {annualPrice}€ anualmente
                                    </p>
                                )}
                            </div>

                            <a
                                href="/login"
                                className={`block w-full py-3 px-4 rounded-lg text-center font-bold transition-all ${plan.highlight
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                                    }`}
                            >
                                {plan.id === 'free' ? 'Empezar Gratis' : plan.id === 'pro' ? 'Empezar con Pro' : plan.id === 'business' ? 'Ir a Business' : 'Obtener Business +'}
                            </a>

                            <ul className="mt-8 space-y-4">
                                {(plan.features || []).map((feature, i) => (
                                    <li key={i} className="flex items-start">
                                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                        <span className="text-sm text-slate-600">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};