import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

// Scarcity Hook (Melting Stock)
const useScarcity = () => {
    const [stock, setStock] = useState(89);

    useEffect(() => {
        // Initialize from localStorage or random
        const stored = localStorage.getItem('diktalo_early_bird_stock');
        const lastUpdate = localStorage.getItem('diktalo_early_bird_update');
        const now = Date.now();

        // Default range 85-95 if new
        let currentStock = stored ? parseInt(stored) : Math.floor(Math.random() * (95 - 85) + 85);

        if (lastUpdate) {
            // Decay based on time elapsed if valid
            const elapsed = now - parseInt(lastUpdate);
            const drops = Math.floor(elapsed / (45 * 1000)); // approx 1 drop per 45s
            if (drops > 0) {
                currentStock = Math.max(3, currentStock - drops);
            }
        }

        setStock(currentStock);

        // Decay Interval
        const interval = setInterval(() => {
            setStock(prev => {
                const next = Math.max(3, prev - 1);
                localStorage.setItem('diktalo_early_bird_stock', next.toString());
                localStorage.setItem('diktalo_early_bird_update', Date.now().toString());
                return next;
            });
        }, Math.random() * (90000 - 45000) + 45000); // Random decay 45-90s

        return () => clearInterval(interval);
    }, []);

    return stock;
};

// DEFINICIÓN DE PLANES (Debe coincidir EXACTAMENTE con Pages/Plans.tsx)
const LANDING_PLANS = [
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
        badge: null,
        cta: 'Comenzar Gratis'
    },
    {
        id: 'pro',
        name: 'Pro',
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
        highlight: true,
        badge: 'PERSONAL',
        cta: 'Mejorar a Pro'
    },
    {
        id: 'business',
        name: 'Business',
        price: { monthly: 25, annual: 18.75 },
        description: 'Para power users y managers.',
        features: [
            'Todo lo de Pro incluido',
            '600 min/mes (~10 horas)',
            '20 GB Almacenamiento Cloud',
            'Prioridad de Procesamiento',
            'Soporte Prioritario',
            'Panel de Gestión de Equipo'
        ],
        highlight: false,
        badge: 'EQUIPOS',
        cta: 'Ir a Business'
    },
    {
        id: 'business_plus',
        name: 'Business + Call',
        price: { monthly: 50, annual: 35 },
        description: 'La suite completa de comunicación.',
        features: [
            'Todo lo de Business incluido',
            '1200 min/mes (~20 horas)',
            '50 GB Almacenamiento Cloud',
            '📞 DIALER INCLUIDO (Llamadas)',
            'Grabación de Llamadas Salientes',
            'Número Virtual (Opcional)'
        ],
        highlight: false,
        badge: 'EMPRESA',
        cta: 'Obtener Business +'
    }
];

export const Pricing: React.FC = () => {
    const { t } = useLanguage();
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');
    const remainingStock = useScarcity();

    const planVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-24 relative">
            {/* Background Gradients */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-gradient-to-r from-primary/10 to-brand-violet/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="text-center mb-16 relative z-10">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Planes</h2>
                <h3 className="text-3xl md:text-5xl font-display font-bold text-slate-900 dark:text-white tracking-tight mb-8">
                    Precios simples y transparentes
                </h3>

                {/* Toggle */}
                <div className="inline-flex bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-slate-200 dark:border-white/10 relative">
                    <button
                        onClick={() => setBillingInterval('monthly')}
                        className={`px-6 py-2 rounded-full text-xs font-bold transition-all z-10 ${billingInterval === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}
                    >
                        Mensual
                    </button>
                    <button
                        onClick={() => setBillingInterval('annual')}
                        className={`px-6 py-2 rounded-full text-xs font-bold transition-all z-10 ${billingInterval === 'annual' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}
                    >
                        Anual <span className="text-green-500 ml-1">-20-30%</span>
                    </button>

                    {/* Animated Pill */}
                    <motion.div
                        layout
                        className="absolute top-1 bottom-1 bg-white dark:bg-white/10 rounded-full shadow-sm"
                        initial={false}
                        animate={{
                            left: billingInterval === 'monthly' ? '4px' : '50%',
                            right: billingInterval === 'monthly' ? '50%' : '4px',
                            x: billingInterval === 'annual' ? 0 : 0
                        }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                {LANDING_PLANS.map((plan) => {
                    const price = billingInterval === 'monthly' ? plan.price.monthly : plan.price.annual;

                    return (
                        <motion.div
                            key={plan.id}
                            variants={planVariants}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            className={`relative bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border flex flex-col transition-colors ${plan.highlight
                                ? 'border-brand-violet/50 dark:border-brand-violet/50 hover:border-brand-violet ring-4 ring-brand-violet/10 transform md:-translate-y-4 z-10'
                                : 'border-slate-200/50 dark:border-white/10 hover:border-primary/30'
                                }`}
                        >
                            {plan.highlight && (
                                <>
                                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl animate-pulse z-20">
                                        🔥 Early Bird Offer
                                    </div>
                                </>
                            )}

                            <h3 className="text-base font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{plan.name}</h3>
                            {plan.badge && <p className={`text-xs font-bold mb-4 ${plan.highlight ? 'text-brand-violet' : 'text-blue-500'}`}>{plan.badge}</p>}

                            {/* Scarcity Bar for Pro only */}
                            {plan.id === 'pro' && (
                                <div className="mb-6 bg-slate-100 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Coupon: <span className="text-slate-900 dark:text-white font-black select-all cursor-pointer" onClick={() => navigator.clipboard.writeText('EARLY50')}>EARLY50</span></span>
                                        <span className="text-[10px] uppercase font-bold text-red-500">{remainingStock} spots left</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: '100%' }}
                                            animate={{ width: `${remainingStock}%` }}
                                            className={`h-full rounded-full ${remainingStock < 10 ? 'bg-red-500' : 'bg-green-500'}`}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="mb-8">
                                <span className="text-4xl font-black text-slate-900 dark:text-white">€{price}</span>
                                <span className="text-slate-400 font-bold ml-2">/mes</span>
                            </div>

                            <ul className="space-y-4 mb-8 flex-grow">
                                {plan.features.map(f => (
                                    <li key={f} className={`flex items-start gap-3 text-xs font-medium ${plan.highlight ? 'text-slate-600 dark:text-slate-400 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                                        <span className={`material-symbols-outlined text-lg ${plan.highlight ? 'text-brand-violet' : 'text-slate-400'}`}>check_circle</span>
                                        <span className="leading-tight">{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <a href="/login" className={`block w-full py-4 text-center rounded-2xl font-black transition-all uppercase tracking-wide text-[10px] ${plan.highlight
                                ? 'bg-brand-violet text-white hover:bg-brand-violet/90 shadow-lg shadow-brand-violet/20 active:scale-95'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10'
                                }`}>
                                {plan.cta}
                            </a>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
