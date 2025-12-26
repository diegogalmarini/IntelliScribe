import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { ThemeToggle } from '../components/ThemeToggle';
import { LanguageSelector } from '../components/LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';

// Inicializar Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        price: { monthly: 0, annual: 0 },
        description: 'Para probar la magia de Diktalo.',
        features: [
            '24 min/mes de transcripción',
            'Historial de 7 días',
            'Grabación de Micrófono',
            'Exportación simple (TXT)',
            '1 Usuario'
        ],
        highlight: false,
        cta: 'Plan Actual',
        priceId: { monthly: '', annual: '' }
    },
    {
        id: 'pro',
        name: 'Pro',
        // Precio Real: 15€ mes | Anual: 144€ (12€/mes) -> 20% Ahorro
        price: { monthly: 15, annual: 12 },
        description: 'Para profesionales independientes.',
        features: [
            '300 min/mes (~5 horas)',
            '5 GB Almacenamiento Cloud',
            'Grabación Mic + Sistema (Reuniones)',
            'Chat con Grabación (IA)',
            'Descarga de Audio Original',
            'Exportación avanzada (JSON)'
        ],
        highlight: true, // Recomendado
        cta: 'Mejorar a Pro',
        priceId: {
            monthly: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY || 'price_pro_month',
            annual: import.meta.env.VITE_STRIPE_PRICE_PRO_ANNUAL || 'price_pro_year'
        }
    },
    {
        id: 'business',
        name: 'Business',
        // Precio Real: 25€ mes | Anual: 225€ (18.75€/mes) -> 25% Ahorro
        price: { monthly: 25, annual: 18.75 },
        description: 'Para power users y managers.',
        features: [
            'Todo lo de Pro incluido', // MOVED TO TOP
            '600 min/mes (~10 horas)',
            '20 GB Almacenamiento Cloud',
            'Prioridad de Procesamiento',
            'Soporte Prioritario',
            'Panel de Gestión de Equipo'
        ],
        highlight: false,
        cta: 'Ir a Business',
        priceId: {
            monthly: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_MONTHLY || 'price_biz_month',
            annual: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_ANNUAL || 'price_biz_year'
        }
    },
    {
        id: 'business_plus',
        name: 'Business + Call',
        // Precio Real: 50€ mes | Anual: 420€ (35€/mes) -> 30% Ahorro
        price: { monthly: 50, annual: 35 },
        description: 'La suite completa de comunicación.',
        features: [
            'Todo lo de Business incluido', // MOVED TO TOP
            '1200 min/mes (~20 horas)',
            '50 GB Almacenamiento Cloud',
            '📞 DIALER INCLUIDO (Llamadas)',
            'Grabación de Llamadas Salientes',
            'Número Virtual (Opcional)'
        ],
        highlight: false,
        cta: 'Obtener Business +',
        priceId: {
            monthly: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_PLUS_MONTHLY || 'price_bizplus_month',
            annual: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_PLUS_ANNUAL || 'price_bizplus_year'
        }
    }
];

export function Plans() {
    const { user, session } = useAuth();
    const { t } = useLanguage();
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');
    const [loading, setLoading] = useState<string | null>(null);

    const handleSubscribe = async (priceId: string, planId: string) => {
        if (!user) {
            window.location.href = '/login';
            return;
        }
        if (planId === 'free') return; // Lógica para cancelar o downgrade manual si se requiere

        setLoading(planId);
        try {
            // Llamada al backend para crear sesión de Checkout
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}` // Asumiendo que pasas el token
                },
                body: JSON.stringify({
                    priceId,
                    userId: user.id,
                    email: user.email,
                    planId // Enviamos el ID del plan para referencia
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
            {/* Header (Restored from Dashboard Style) */}
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

            {/* Content (Scalable Container) */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth w-full">
                <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-10" style={{ zoom: 0.9 }}>

                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                            Planes Flexibles para tu Crecimiento
                        </h2>
                        <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
                            Elige el plan que mejor se adapte a tus necesidades de transcripción y análisis.
                        </p>

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
                    <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-4">
                        {PLANS.map((plan) => (
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
                                            {billingInterval === 'annual' ? plan.price.annual : plan.price.monthly}€
                                        </span>
                                        <span className="text-base font-medium text-gray-500 dark:text-gray-400">/mes</span>
                                    </p>
                                    {billingInterval === 'annual' && plan.price.annual > 0 && (
                                        <p className="text-xs text-green-600 mt-1 font-semibold">
                                            Facturado {plan.price.annual * 12}€ anualmente
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
