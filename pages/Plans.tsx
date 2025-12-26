import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageSelector } from '../components/LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';
import { Footer } from '../components/Footer';

// Inicializar Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Configuración de visualización de moneda
const CURRENCIES = {
    EUR: { symbol: '€', label: 'EUR', rate: 1 },
    USD: { symbol: '$', label: 'USD', rate: 1.05 }, // Paridad aproximada SaaS
    GBP: { symbol: '£', label: 'GBP', rate: 0.85 }
};

const PLANS_DATA = [
    {
        id: 'free',
        name: 'Free',
        prices: {
            EUR: { monthly: 0, annual: 0 },
            USD: { monthly: 0, annual: 0 },
            GBP: { monthly: 0, annual: 0 }
        },
        description: 'Para probar la magia de Diktalo.',
        features: [
            '24 min/mes de transcripción',
            'Historial de 7 días',
            'Grabación de Micrófono',
            '1 Usuario'
        ],
        highlight: false,
        cta: 'Plan Actual',
        priceId: { monthly: '', annual: '' }
    },
    {
        id: 'pro',
        name: 'Pro',
        prices: {
            EUR: { monthly: 12, annual: 9 },
            USD: { monthly: 13, annual: 10 },
            GBP: { monthly: 10, annual: 8 }
        },
        description: 'Para profesionales independientes.',
        features: [
            '300 min/mes de Transcripción (IA)',
            '5 GB Almacenamiento Cloud',
            'Grabación Mic + Sistema',
            'Chat con Grabación (IA)',
            'Descarga de Audio Original'
        ],
        highlight: true,
        cta: 'Mejorar a Pro',
        priceId: {
            monthly: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY,
            annual: import.meta.env.VITE_STRIPE_PRICE_PRO_ANNUAL
        }
    },
    {
        id: 'business',
        name: 'Business',
        prices: {
            EUR: { monthly: 19, annual: 15 },
            USD: { monthly: 21, annual: 17 },
            GBP: { monthly: 16, annual: 13 }
        },
        description: 'Para power users y managers.',
        features: [
            '600 min/mes de Transcripción (IA)',
            '20 GB Almacenamiento Cloud',
            'Todo lo de Pro incluido',
            'Soporte Prioritario',
            'Panel de Gestión de Equipo'
        ],
        highlight: false,
        cta: 'Ir a Business',
        priceId: {
            monthly: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_MONTHLY,
            annual: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_ANNUAL
        }
    },
    {
        id: 'business_plus',
        name: 'Business + Call',
        prices: {
            EUR: { monthly: 35, annual: 25 },
            USD: { monthly: 39, annual: 28 },
            GBP: { monthly: 30, annual: 22 }
        },
        description: 'La suite completa de comunicación.',
        features: [
            '1200 min/mes de Transcripción (IA)',
            '300 min/mes Llamadas (Dialer)',
            '50 GB Almacenamiento Cloud',
            'Todo lo de Business incluido',
            '📞 DIALER INCLUIDO (Calls)',
            'Grabación de Llamadas Salientes'
        ],
        highlight: false,
        cta: 'Obtener Business +',
        priceId: {
            monthly: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_PLUS_MONTHLY,
            annual: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_PLUS_ANNUAL
        }
    }
];

export function Plans() {
    const { user, session } = useAuth();
    const { t } = useLanguage();
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');
    const [currency, setCurrency] = useState<'EUR' | 'USD' | 'GBP'>('EUR');
    const [loading, setLoading] = useState<string | null>(null);

    const handleSubscribe = async (priceId: string, planId: string) => {
        if (!user) {
            window.location.href = '/login';
            return;
        }
        if (planId === 'free') {
            window.location.href = '/dashboard';
            return;
        }


        if (!priceId) {
            console.error('Price ID missing. Check env vars.');
            alert('Error de configuración: El ID del precio no está disponible. Contacta soporte.');
            return;
        }

        setLoading(planId);
        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
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
            if (stripe) {
                await (stripe as any).redirectToCheckout({ sessionId });
            }
        } catch (error: any) {
            console.error('Error al suscribir:', error);
            alert('Hubo un error al iniciar el pago. Por favor intenta de nuevo.');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-hidden relative h-screen transition-colors duration-200">
            {/* Header */}
            <header className="h-auto flex flex-row items-center justify-between px-4 py-4 md:px-8 md:py-6 border-b border-slate-200 dark:border-border-dark bg-white/50 dark:bg-background-dark/80 backdrop-blur-sm z-10 transition-colors duration-200">
                <div className="flex flex-col">
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">workspace_premium</span>
                        Planes de Suscripción
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <LanguageSelector />
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth w-full">
                <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-10 min-h-screen" style={{ zoom: 0.9 }}>

                    <div className="text-center relative">
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                            Planes Flexibles para tu Crecimiento
                        </h2>
                        {/* ... existing header logic ... */}
                        <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
                            Elige el plan que mejor se adapte a tus necesidades de transcripción y análisis.
                        </p>

                        {/* Selector de Moneda (Absolute Right) */}
                        <div className="absolute top-0 right-0 hidden lg:flex bg-white dark:bg-surface-dark rounded-lg p-1 border border-gray-200 dark:border-white/10 shadow-sm">
                            {(Object.keys(CURRENCIES) as Array<keyof typeof CURRENCIES>).map((curr) => (
                                <button
                                    key={curr}
                                    onClick={() => setCurrency(curr)}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${currency === curr
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
                                        }`}
                                >
                                    {curr}
                                </button>
                            ))}
                        </div>

                        {/* Mobile Currency Selector (Visible on small screens) */}
                        <div className="lg:hidden mt-4 flex justify-center">
                            <div className="flex bg-white dark:bg-surface-dark rounded-lg p-1 border border-gray-200 dark:border-white/10 shadow-sm">
                                {(Object.keys(CURRENCIES) as Array<keyof typeof CURRENCIES>).map((curr) => (
                                    <button
                                        key={curr}
                                        onClick={() => setCurrency(curr)}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${currency === curr
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        {curr}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Toggle Mensual / Anual */}
                        <div className="mt-6 flex justify-center items-center space-x-4">
                            <span className={`text-sm ${billingInterval === 'monthly' ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500'}`}>Mensual</span>
                            <button
                                onClick={() => setBillingInterval(prev => prev === 'monthly' ? 'annual' : 'monthly')}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${billingInterval === 'annual' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                            >
                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${billingInterval === 'annual' ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                            <span className={`text-sm ${billingInterval === 'annual' ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                Anual <span className="text-green-600 font-bold">(Hasta 30% OFF)</span>
                            </span>
                        </div>
                    </div>

                    {/* Tarjetas de Precios */}
                    <div className="mt-8 space-y-4 sm:mt-8 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-4">
                        {PLANS_DATA.map((plan) => (
                            <div key={plan.id} className={`rounded-lg shadow-lg divide-y divide-gray-200 dark:divide-white/10 bg-white dark:bg-surface-dark flex flex-col ${plan.highlight ? 'border-2 border-blue-500 relative' : 'border border-gray-200 dark:border-white/10'}`}>
                                {plan.highlight && (
                                    <div className="absolute top-0 right-0 -mt-3 mr-3 px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                                        Popular
                                    </div>
                                )}
                                <div className="p-6 flex-1">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{plan.name}</h3>
                                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                                    <p className="mt-8">
                                        <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                                            {CURRENCIES[currency].symbol}{billingInterval === 'annual' ? plan.prices[currency].annual : plan.prices[currency].monthly}
                                        </span>
                                        <span className="text-base font-medium text-gray-500 dark:text-gray-400">/mes</span>
                                    </p>
                                    {billingInterval === 'annual' && plan.prices[currency].annual > 0 && (
                                        <p className="text-xs text-green-600 mt-1 font-semibold">
                                            Facturado {CURRENCIES[currency].symbol}{plan.prices[currency].annual * 12} anualmente
                                        </p>
                                    )}

                                    <ul className="mt-6 space-y-4">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex">
                                                <span className="material-symbols-outlined text-green-500">check_circle</span>
                                                <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-b-lg">
                                    <button
                                        onClick={() => handleSubscribe(
                                            billingInterval === 'annual' ? plan.priceId.annual : plan.priceId.monthly,
                                            plan.id
                                        )}
                                        disabled={loading === plan.id || plan.id === 'free'}
                                        className={`w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${plan.id === 'free'
                                            ? 'bg-gray-400 cursor-default'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                            } transition-colors`}
                                    >
                                        {loading === plan.id ? 'Procesando...' : plan.cta}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
