import React, { useState, useEffect } from 'react';
import { Check, Info, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { useLanguage } from '../contexts/LanguageContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageSelector } from '../components/LanguageSelector';
import { motion } from 'framer-motion';

// Inicializar Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// --- 1. CONFIGURACIÓN MAESTRA DE PLANES (Tus Precios Reales) ---
const PLANS = [
    {
        id: 'free',
        level: 0, // Para lógica de Upgrade/Downgrade
        name: 'Free',
        // Precio visual (0€)
        price: { monthly: 0, annual: 0, annual_monthly_equiv: 0 },
        description: 'Para probar la magia de Diktalo.',
        features: [
            '24 min/mes de transcripción',
            'Historial de 7 días',
            'Grabación de Micrófono',
            '1 Usuario'
        ],
        highlight: false,
        priceId: { monthly: '', annual: '' }
    },
    {
        id: 'pro',
        level: 1,
        name: 'Pro',
        // Mes: 12€ | Año: 108€ (Sale a 9€/mes)
        price: { monthly: 12, annual: 108, annual_monthly_equiv: 9 },
        description: 'Para profesionales independientes.',
        features: [
            '300 min/mes Transcripción (IA)',
            '5 GB Almacenamiento Cloud',
            'Grabación Mic + Sistema',
            'Chat con Grabación (IA)',
            'Descarga de Audio Original'
        ],
        highlight: true, // Plan Recomendado
        priceId: {
            monthly: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY,
            annual: import.meta.env.VITE_STRIPE_PRICE_PRO_ANNUAL
        }
    },
    {
        id: 'business',
        level: 2,
        name: 'Business',
        // Mes: 19€ | Año: 180€ (Sale a 15€/mes)
        price: { monthly: 19, annual: 180, annual_monthly_equiv: 15 },
        description: 'Para power users y managers.',
        features: [
            '600 min/mes Transcripción (IA)',
            '20 GB Almacenamiento Cloud',
            'Todo lo de Pro incluido',
            'Soporte Prioritario',
            'Panel de Gestión de Equipo'
        ],
        highlight: false,
        priceId: {
            monthly: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_MONTHLY,
            annual: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_ANNUAL
        }
    },
    {
        id: 'business_plus',
        level: 3,
        name: 'Business + Call',
        // Mes: 35€ | Año: 300€ (Sale a 25€/mes)
        price: { monthly: 35, annual: 300, annual_monthly_equiv: 25 },
        description: 'La suite completa de comunicación.',
        features: [
            '1200 min/mes Transcripción (IA)',
            '300 min/mes Llamadas (Dialer)',
            '50 GB Almacenamiento Cloud',
            'Todo lo de Business incluido',
            '📞 DIALER INCLUIDO (Calls)',
            'Grabación de Llamadas Salientes'
        ],
        highlight: false,
        priceId: {
            monthly: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_PLUS_MONTHLY,
            annual: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_PLUS_ANNUAL
        }
    }
];

// --- 2. HOOK DE ESCASEZ (Marketing) ---
const useRealScarcity = (code: string) => {
    const [data, setData] = useState<any>(null);
    useEffect(() => {
        const fetchScarcity = async () => {
            try {
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

export default function Plans() {
    const { user } = useAuth();
    const { t } = useLanguage(); // Mantenemos soporte i18n para header/footer
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');
    const [loading, setLoading] = useState<string | null>(null);

    // Marketing: Consultar cupón EARLY100
    const scarcity = useRealScarcity('EARLY100');

    // Determinar nivel de plan actual del usuario
    const currentPlanId = user?.plan || 'free';
    const currentPlanLevel = PLANS.find(p => p.id === currentPlanId)?.level || 0;

    const handleSubscribe = async (priceId: string, planId: string) => {
        if (!user) return window.location.href = '/login';
        if (planId === 'free') return window.location.href = '/dashboard';

        setLoading(planId);
        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.access_token}`
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
        } catch (error) {
            console.error('Error:', error);
            alert('Error al iniciar pago. Verifica tu conexión.');
        } finally {
            setLoading(null);
        }
    };

    // Lógica de etiqueta de botón (UX del archivo "OLD")
    const getButtonLabel = (planLevel: number, planId: string) => {
        if (planId === currentPlanId) return 'Tu Plan Actual';
        if (planId === 'free') return 'Downgrade';
        if (planLevel > currentPlanLevel) return 'Mejorar Plan';
        return 'Cambiar Plan';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">

            {/* Header con Selectores (Recuperado de OLD) */}
            <div className="absolute top-4 right-4 flex items-center space-x-4 z-10">
                <LanguageSelector />
                <ThemeToggle />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                {/* --- SECCIÓN 1: DASHBOARD DE ESTADO (Recuperado de OLD) --- */}
                {user && (
                    <div className="mb-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center space-x-4 mb-4 md:mb-0">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Hola, {user.email?.split('@')[0]}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Tu plan actual es <span className="font-bold uppercase text-blue-600">{currentPlanId}</span>
                                </p>
                            </div>
                        </div>

                        {/* Barra de uso simple */}
                        <div className="w-full md:w-1/3">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-300">Consumo Mensual</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {/* Aquí puedes conectar con datos reales si los tienes en el objeto user */}
                                    Reset en 30 días
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                                <div className="bg-green-500 h-2.5 rounded-full w-2"></div>
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

                    {/* --- BARRA DE ESCASEZ (Marketing V4.0) --- */}
                    {scarcity && scarcity.remaining && billingInterval === 'annual' && (
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
                                Se aplica automáticamente al pagar Anual (Pro/Business).
                            </p>
                        </motion.div>
                    )}
                </div>

                {/* --- SECCIÓN 3: GRID DE PRECIOS --- */}
                <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-4">
                    {PLANS.map((plan) => {
                        const isCurrent = plan.id === currentPlanId;
                        const btnLabel = getButtonLabel(plan.level, plan.id);
                        const isUpgrade = plan.level > currentPlanLevel;

                        return (
                            <div key={plan.id} className={`flex flex-col rounded-2xl shadow-lg bg-white dark:bg-slate-800 transition-all ${plan.highlight ? 'border-2 border-blue-500 relative transform scale-105 z-10' : 'border border-gray-200 dark:border-slate-700'}`}>

                                {plan.highlight && (
                                    <div className="absolute top-0 right-0 -mt-3 mr-3 px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                                        Recomendado
                                    </div>
                                )}

                                <div className="p-6 flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 h-10">{plan.description}</p>

                                    <div className="mt-6">
                                        <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                                            {billingInterval === 'annual' && plan.price.annual > 0
                                                ? `${plan.price.annual_monthly_equiv}€`
                                                : `${plan.price.monthly}€`
                                            }
                                        </span>
                                        <span className="text-base font-medium text-gray-500 dark:text-gray-400">/mes</span>
                                    </div>

                                    {billingInterval === 'annual' && plan.price.annual > 0 && (
                                        <p className="text-xs text-green-600 font-semibold mt-1">
                                            Facturado {plan.price.annual}€ / año
                                        </p>
                                    )}

                                    <ul className="mt-6 space-y-4">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start">
                                                <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                                                <span className="ml-3 text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-6 bg-gray-50 dark:bg-slate-800/50 rounded-b-2xl border-t border-gray-100 dark:border-slate-700">
                                    <button
                                        onClick={() => handleSubscribe(
                                            billingInterval === 'annual' ? plan.priceId.annual : plan.priceId.monthly,
                                            plan.id
                                        )}
                                        disabled={loading === plan.id || isCurrent || (plan.id === 'free' && currentPlanLevel > 0)}
                                        className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-bold rounded-xl transition-all shadow-sm
                      ${isCurrent
                                                ? 'bg-gray-100 text-gray-500 cursor-default'
                                                : isUpgrade
                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30'
                                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
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

                {/* --- SECCIÓN 4: FOOTER LEGAL (Recuperado de OLD) --- */}
                <div className="mt-16 text-center border-t border-gray-200 dark:border-slate-800 pt-8">
                    <div className="inline-flex items-center justify-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                        <span className="text-xs font-bold text-yellow-700 dark:text-yellow-500 uppercase tracking-wide">
                            Aviso Importante sobre Llamadas (Plan Business +)
                        </span>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        El servicio de llamadas (Dialer) incluido en Business+ está optimizado para
                        <span className="font-semibold text-gray-700 dark:text-gray-300"> España, Europa (Fijos) y EE.UU. </span>
                        El uso abusivo de llamadas a móviles internacionales o destinos premium puede estar sujeto a restricciones o cargos adicionales según nuestra Política de Uso Justo (FUP).
                        Los minutos de IA y Transcripción son independientes de los minutos de llamadas VoIP.
                    </p>
                </div>

            </div>
        </div>
    );
}