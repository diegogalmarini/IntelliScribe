import React, { useState } from 'react';
import { UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { ThemeToggle } from '../components/ThemeToggle';
import { stripeService } from '../services/stripeService';

interface PlansProps {
    user: UserProfile;
    onUpdateUser: (updatedUser: Partial<UserProfile>) => void;
}

// Definición Maestra de Planes Comercial (v3.1)
export const PLANS = [
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
        limit: '24 min',
        storage: '7 días',
        highlight: false,
        cta: 'Comenzar Gratis',
        priceId: { monthly: '', annual: '' }
    },
    {
        id: 'pro',
        name: 'Pro',
        // Precio real: 15€/mes. Anual: 144€ (12€/mes) -> Ahorro 20%
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
        limit: '300 min',
        storage: '5 GB',
        highlight: true, // Plan recomendado visualmente
        cta: 'Mejorar a Pro',
        priceId: {
            monthly: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly_id',
            annual: import.meta.env.VITE_STRIPE_PRICE_PRO_ANNUAL || 'price_pro_annual_id'
        }
    },
    {
        id: 'business',
        name: 'Business',
        // Precio real: 25€/mes. Anual: 225€ (18.75€/mes) -> Ahorro 25%
        price: { monthly: 25, annual: 18.75 },
        description: 'Para power users y managers.',
        features: [
            '600 min/mes (~10 horas)',
            '20 GB Almacenamiento Cloud',
            'Todo lo de Pro incluido',
            'Prioridad de Procesamiento',
            'Soporte Prioritario',
            'Panel de Gestión de Equipo'
        ],
        limit: '600 min',
        storage: '20 GB',
        highlight: false,
        cta: 'Ir a Business',
        priceId: {
            monthly: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_MONTHLY || 'price_business_monthly_id',
            annual: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_ANNUAL || 'price_business_annual_id'
        }
    },
    {
        id: 'business_plus',
        name: 'Business + Call',
        // Precio real: 50€/mes. Anual: 420€ (35€/mes) -> Ahorro 30%
        price: { monthly: 50, annual: 35 },
        description: 'La suite completa de comunicación.',
        features: [
            '1200 min/mes (~20 horas)',
            '50 GB Almacenamiento Cloud',
            'Todo lo de Business incluido',
            '📞 DIALER INCLUIDO (Llamadas)',
            'Grabación de Llamadas Salientes',
            'Número Virtual (Opcional)'
        ],
        limit: '1200 min',
        storage: '50 GB',
        highlight: false,
        cta: 'Obtener Business +',
        priceId: {
            monthly: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_PLUS_MONTHLY || 'price_bizplus_monthly_id',
            annual: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_PLUS_ANNUAL || 'price_bizplus_annual_id'
        }
    }
];

export const Plans: React.FC<PlansProps> = ({ user, onUpdateUser }) => {
    const { t } = useLanguage();
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');
    const [currency, setCurrency] = useState<'USD' | 'EUR'>('EUR'); // Default to EUR as per prompt context implies Euro

    const handleSubscribe = async (plan: typeof PLANS[0]) => {
        if (plan.id === 'free') return; // Should handle downgrade logic or just ignore

        const priceId = billingInterval === 'monthly' ? plan.priceId.monthly : plan.priceId.annual;

        if (!priceId || priceId.startsWith('price_')) {
            console.error(`Stripe Configuration Error: Price ID missing for ${plan.name}`);
            alert('Checkout configuration error. Please contact support.');
            return;
        }

        if (!user.id || !user.email) {
            alert("Error: User session invalid");
            return;
        }

        await stripeService.startCheckout(priceId, user.id, user.email);
    };

    return (
        <div className="flex flex-1 flex-col h-full overflow-hidden bg-slate-50 dark:bg-background-dark relative transition-colors duration-200">
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 bg-white dark:bg-background-dark px-8 py-4 sticky top-0 z-20">
                <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">Planes & Suscripción (v3.1)</h2>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <LanguageSelector />
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                <div className="mx-auto max-w-7xl flex flex-col gap-8">

                    {/* Header */}
                    <div className="text-center mb-4">
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Planes Simples y Transparentes</h1>
                        <p className="text-slate-500 dark:text-slate-400">Elige la potencia que necesitas. Cambia o cancela cuando quieras.</p>
                    </div>

                    {/* Controls */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-white dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 inline-flex shadow-sm">
                            <button
                                onClick={() => setBillingInterval('monthly')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${billingInterval === 'monthly' ? 'bg-slate-200 dark:bg-white text-slate-900 dark:text-slate-900 shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}`}>
                                Mensual
                            </button>
                            <button
                                onClick={() => setBillingInterval('annual')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${billingInterval === 'annual' ? 'bg-slate-200 dark:bg-white text-slate-900 dark:text-slate-900 shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}`}>
                                Anual
                                <span className="text-[10px] bg-green-500 text-white px-1.5 rounded font-bold">-20-30%</span>
                            </button>
                        </div>
                    </div>

                    {/* Plans Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                        {PLANS.map((plan) => {
                            const isCurrent = user.subscription?.planId === plan.id;
                            const price = billingInterval === 'monthly' ? plan.price.monthly : plan.price.annual;
                            const isRecommended = plan.highlight;

                            return (
                                <div key={plan.id} className={`relative bg-white dark:bg-white/5 rounded-3xl p-8 border transition-all duration-300 flex flex-col h-full ${isRecommended ? 'border-brand-violet ring-2 ring-brand-violet/20 shadow-xl scale-105 z-10' : 'border-slate-200 dark:border-white/10 hover:border-brand-violet/50'}`}>
                                    {isRecommended && (
                                        <div className="absolute top-0 right-0 left-0 bg-brand-violet text-white text-[10px] font-black uppercase tracking-widest text-center py-1 rounded-t-2xl">
                                            Recomendado
                                        </div>
                                    )}

                                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 h-8">{plan.description}</p>

                                    <div className="mb-6">
                                        <span className="text-4xl font-black text-slate-900 dark:text-white">€{price}</span>
                                        <span className="text-slate-400 font-bold ml-1 text-xs">/mes</span>
                                        {billingInterval === 'annual' && (
                                            <p className="text-[10px] text-green-500 font-bold mt-1">
                                                Facturado €{price * 12}/año (Ahorro incluido)
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 mb-6 border-y border-slate-100 dark:border-white/5 py-4">
                                        <div>
                                            <p className="text-[10px] uppercase text-slate-400 font-bold">Límite</p>
                                            <p className="text-sm font-black text-slate-900 dark:text-white">{plan.limit}</p>
                                        </div>
                                        <div className="w-px h-8 bg-slate-200 dark:bg-white/10"></div>
                                        <div>
                                            <p className="text-[10px] uppercase text-slate-400 font-bold">Storage</p>
                                            <p className="text-sm font-black text-slate-900 dark:text-white">{plan.storage}</p>
                                        </div>
                                    </div>

                                    <ul className="space-y-3 mb-8 flex-grow">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                                                <span className={`material-symbols-outlined text-sm ${isRecommended ? 'text-brand-violet' : 'text-slate-400'}`}>check</span>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => handleSubscribe(plan)}
                                        disabled={isCurrent}
                                        className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all ${isCurrent
                                                ? 'bg-slate-100 dark:bg-white/10 text-slate-400 cursor-default'
                                                : isRecommended
                                                    ? 'bg-brand-violet text-white hover:bg-brand-violet/90 shadow-lg shadow-brand-violet/20'
                                                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
                                            }`}
                                    >
                                        {isCurrent ? 'Plan Actual' : plan.cta}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
