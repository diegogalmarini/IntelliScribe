import React, { useState, useEffect } from 'react';
import { Check, Info, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { useLanguage } from '../contexts/LanguageContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageSelector } from '../components/LanguageSelector';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { PlanConfig, AppSetting, UserProfile } from '../types';

// Inicializar Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PlansProps {
    user: UserProfile;
}

// --- HOOK DE ESCASEZ (Marketing) ---
const useRealScarcity = (code: string) => {
    const [data, setData] = useState<any>(null);
    useEffect(() => {
        const fetchScarcity = async () => {
            try {
                // Solo ejecutar si hay código
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

export function Plans({ user }: PlansProps) {
    const { t } = useLanguage();
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');
    const [loading, setLoading] = useState<string | null>(null);

    // Estados para datos dinámicos
    const [plans, setPlans] = useState<PlanConfig[]>([]);
    const [legalText, setLegalText] = useState<string>('');
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Marketing: Consultar cupón EARLY100 (Podrías hacerlo dinámico también si quisieras)
    const scarcity = useRealScarcity('EARLY100');

    // --- CARGAR DATOS DE LA BASE DE DATOS ---
    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingData(true);
            try {
                // 1. Cargar Planes Activos
                const { data: plansData, error: plansError } = await supabase
                    .from('plans_configuration')
                    .select('*')
                    .eq('is_active', true) // Solo mostrar planes activos
                    .order('price_monthly', { ascending: true });

                if (plansError) throw plansError;
                setPlans(plansData || []);

                // 2. Cargar Texto Legal
                const { data: settingsData } = await supabase
                    .from('app_settings')
                    .select('value')
                    .eq('key', 'legal_disclaimer_plans')
                    .single();

                if (settingsData) setLegalText(settingsData.value);

            } catch (error) {
                console.error('Error loading plans from DB:', error);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, []);

    // Determinar nivel de plan actual del usuario para lógica visual
    const currentPlanId = user?.subscription?.planId || 'free';

    // Función auxiliar para saber el "nivel" del plan (basado en precio)
    const getPlanLevel = (plan: PlanConfig) => {
        if (plan.id === 'free') return 0;
        if (plan.id === 'pro') return 1;
        if (plan.id === 'business') return 2;
        if (plan.id === 'business_plus') return 3;
        return 0; // Default
    };

    const currentPlan = plans.find(p => p.id === currentPlanId);
    const currentLevel = currentPlan ? getPlanLevel(currentPlan) : 0;

    const handleSubscribe = async (priceId: string, planId: string) => {
        if (!user) return window.location.href = '/login';
        if (planId === 'free') return window.location.href = '/dashboard';

        // Protección: No permitir suscribirse sin Price ID (ej: plan no configurado)
        if (!priceId) {
            alert('Error: Este plan no tiene un ID de precio configurado. Contacta a soporte.');
            return;
        }

        setLoading(planId);
        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.id}` // Usamos ID para referencia simple, backend valida token real si es necesario
                },
                body: JSON.stringify({
                    priceId,
                    userId: user.id,
                    email: user.email,
                    planId
                })
            });

            const { sessionId, error } = await response.json();
            if (error) throw new Error(error);

            const stripe = await stripePromise;
            if (stripe) await stripe.redirectToCheckout({ sessionId });
        } catch (error: any) {
            console.error('Error:', error);
            alert('Error al iniciar pago: ' + (error.message || 'Verifica tu conexión.'));
        } finally {
            setLoading(null);
        }
    };

    // Lógica de etiqueta de botón
    const getButtonLabel = (planLevel: number, planId: string) => {
        if (planId === currentPlanId) return 'Tu Plan Actual';
        if (planId === 'free') return 'Downgrade';
        if (planLevel > currentLevel) return 'Mejorar Plan';
        return 'Cambiar Plan';
    };

    if (isLoadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">

            {/* Header con Selectores */}
            <div className="absolute top-4 right-4 flex items-center space-x-4 z-10">
                <LanguageSelector />
                <ThemeToggle />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                {/* --- SECCIÓN 1: DASHBOARD DE ESTADO --- */}
                {user && (
                    <div className="mb-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center space-x-4 mb-4 md:mb-0">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Hola, {user.firstName || user.email?.split('@')[0]}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Tu plan actual es <span className="font-bold uppercase text-blue-600">{currentPlanId.replace('_', ' ')}</span>
                                </p>
                            </div>
                        </div>

                        {/* Barra de uso simple */}
                        <div className="w-full md:w-1/3">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-300">Minutos usados</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {user.subscription?.minutesUsed || 0} / {user.subscription?.minutesLimit === -1 ? '∞' : user.subscription?.minutesLimit}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                                <div
                                    className="bg-green-500 h-2.5 rounded-full"
                                    style={{ width: `${Math.min(100, ((user.subscription?.minutesUsed || 0) / (user.subscription?.minutesLimit || 1)) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- SECCIÓN 2: TÍTULO Y TOGGLE --- */}
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                        Planes Flexibles para Escalar
                    </h2>
                    <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
                        Potencia tu comunicación sin límites absurdos.
                    </p>

                    {/* Toggle Mensual / Anual */}
                    <div className="mt-8 flex justify-center items-center space-x-4">
                        <span className={`text-sm ${billingInterval === 'monthly' ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                            Mensual
                        </span>
                        <button
                            onClick={() => setBillingInterval(prev => prev === 'monthly' ? 'annual' : 'monthly')}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${billingInterval === 'annual' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                        >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${billingInterval === 'annual' ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                        <span className={`text-sm ${billingInterval === 'annual' ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                            Anual <span className="text-green-600 font-bold ml-1">(Ahorro)</span>
                        </span>
                    </div>

                    {/* --- BARRA DE ESCASEZ (Comentada temporalmente por petición del usuario) --- */}
                    {/* scarcity && scarcity.remaining && billingInterval === 'annual' && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 max-w-md mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
                        >
                            <div className="flex justify-between text-sm font-bold text-red-700 dark:text-red-400 mb-1">
                                <span>🔥 OFERTA LANZAMIENTO ({scarcity.percent_off}% EXTRA)</span>
                                <span>Quedan {scarcity.remaining}</span>
                            </div>
                            <div className="w-full bg-red-200 dark:bg-red-900 rounded-full h-2">
                                <div
                                    className="bg-red-600 h-2 rounded-full transition-all duration-1000"
                                    style={{ width: `${(scarcity.remaining / scarcity.total) * 100}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                Se aplica automáticamente al pagar Anual.
                            </p>
                        </motion.div>
                    ) */}
                </div>

                {/* --- SECCIÓN 3: GRID DE PRECIOS DINÁMICO --- */}
                <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-4">
                    {plans.map((plan) => {
                        const planLevel = getPlanLevel(plan);
                        const isCurrent = plan.id === currentPlanId;
                        const btnLabel = getButtonLabel(planLevel, plan.id);
                        const isUpgrade = planLevel > currentLevel;

                        // Cálculos de precio visual
                        const monthlyPrice = plan.price_monthly;
                        const annualPrice = plan.price_annual;
                        const annualMonthlyEquiv = annualPrice > 0 ? Math.round(annualPrice / 12) : 0;

                        // Calcular ahorro real dinámicamente
                        const savingsPercent = monthlyPrice > 0 && annualPrice > 0
                            ? Math.round((1 - (annualPrice / (monthlyPrice * 12))) * 100)
                            : 0;

                        return (
                            <div key={plan.id} className={`flex flex-col rounded-2xl shadow-lg bg-white dark:bg-slate-800 transition-all ${plan.highlight ? 'border-2 border-blue-500 relative transform scale-105 z-10' : 'border border-gray-200 dark:border-slate-700'}`}>

                                {plan.highlight && (
                                    <div className="absolute top-0 right-0 -mt-3 mr-3 px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                                        {plan.badge_text || 'Popular'}
                                    </div>
                                )}

                                <div className="p-6 flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 h-10">{plan.description}</p>

                                    <div className="mt-6">
                                        <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                                            {billingInterval === 'annual' && annualPrice > 0
                                                ? `${annualMonthlyEquiv}€`
                                                : `${monthlyPrice}€`
                                            }
                                        </span>
                                        <span className="text-base font-medium text-gray-500 dark:text-gray-400">/mes</span>
                                    </div>

                                    {billingInterval === 'annual' && annualPrice > 0 && (
                                        <div className="flex flex-col mt-1">
                                            <p className="text-xs text-gray-500">
                                                Facturado {annualPrice}€ / año
                                            </p>
                                            {savingsPercent > 0 && (
                                                <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full w-fit mt-1">
                                                    Ahorras {savingsPercent}%
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Lista de Features Dinámica */}
                                    <ul className="mt-6 space-y-4">
                                        {(plan.features || []).map((feature, i) => (
                                            <li key={i} className="flex items-start">
                                                <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                                                <span className="ml-3 text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-6 bg-gray-50 dark:bg-slate-800/50 rounded-b-2xl border-t border-gray-100 dark:border-slate-700">
                                    <button
                                        onClick={() => handleSubscribe(
                                            billingInterval === 'annual' ? plan.stripe_price_id_annual : plan.stripe_price_id_monthly,
                                            plan.id
                                        )}
                                        disabled={loading === plan.id || isCurrent || (plan.id === 'free' && currentLevel > 0)}
                                        className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-bold rounded-xl transition-all shadow-sm
                                            ${isCurrent
                                                ? 'bg-gray-100 dark:bg-slate-700 text-gray-500 cursor-default'
                                                : isUpgrade
                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30'
                                                    : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700'
                                            }
                                        `}
                                    >
                                        {loading === plan.id ? 'Procesando...' : btnLabel}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* --- SECCIÓN 4: FOOTER LEGAL DINÁMICO --- */}
                {legalText && (
                    <div className="mt-16 text-center border-t border-gray-200 dark:border-slate-800 pt-8">
                        <div className="inline-flex items-center justify-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4">
                            <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                            <span className="text-xs font-bold text-yellow-700 dark:text-yellow-500 uppercase tracking-wide">
                                Aviso Legal
                            </span>
                        </div>

                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed whitespace-pre-wrap">
                            {legalText}
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
}