import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Info } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

// Hook para obtener escasez REAL desde el backend
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
        // Actualizar cada 60s para mantener vivo el contador
        const interval = setInterval(fetchScarcity, 60000);
        return () => clearInterval(interval);
    }, [code]);

    return data;
};

// PLANES DE LANDING (Sincronizados con la realidad rentable)
const LANDING_PLANS = [
    {
        id: 'pro',
        name: 'Pro',
        price: { monthly: 15, annual: 12 }, // 144€/año
        description: 'Para profesionales independientes.',
        features: [
            '300 min/mes Transcripción (IA)',
            '5 GB Almacenamiento',
            'Grabación Mic + Sistema',
            'Chat con Grabación (IA)',
            'Descarga de Audio'
        ],
        highlight: true,
        badge: 'POPULAR',
        cta: 'Empezar con Pro'
    },
    {
        id: 'business',
        name: 'Business',
        price: { monthly: 25, annual: 19 }, // 225€/año aprox (ajustado visualmente)
        description: 'Para power users y managers.',
        features: [
            '600 min/mes Transcripción (IA)',
            '20 GB Almacenamiento',
            'Soporte Prioritario',
            'Panel de Gestión de Equipo',
            'Todo lo de Pro incluido'
        ],
        highlight: false,
        badge: null,
        cta: 'Ir a Business'
    },
    {
        id: 'business_plus',
        name: 'Business + Call',
        price: { monthly: 50, annual: 35 }, // 420€/año
        description: 'La suite completa de comunicación.',
        features: [
            '1200 min/mes Transcripción (IA)',
            '300 min/mes Llamadas (Dialer)',
            '50 GB Almacenamiento',
            '📞 DIALER INCLUIDO',
            'Grabación de Llamadas Salientes'
        ],
        highlight: false,
        badge: 'EMPRESA',
        cta: 'Obtener Business +'
    }
];

export const Pricing: React.FC = () => {
    const { t } = useLanguage();
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');

    // Conectar al cupón EARLY100 (El de 15% extra para Pro/Biz)
    const scarcity = useRealScarcity('EARLY100');

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
                    <span className={`text-sm ${billingInterval === 'monthly' ? 'font-bold' : 'text-slate-500'}`}>Mensual</span>
                    <button
                        onClick={() => setBillingInterval(prev => prev === 'monthly' ? 'annual' : 'monthly')}
                        className={`relative w-14 h-8 rounded-full transition-colors ${billingInterval === 'annual' ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                        <motion.div
                            className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow"
                            animate={{ x: billingInterval === 'annual' ? 24 : 0 }}
                        />
                    </button>
                    <span className={`text-sm ${billingInterval === 'annual' ? 'font-bold' : 'text-slate-500'}`}>
                        Anual <span className="text-green-600 font-bold ml-1">-30%</span>
                    </span>
                </div>

                {/* BARRA DE ESCASEZ (Solo visible si hay cupón activo y es pago anual) */}
                {scarcity && scarcity.remaining && billingInterval === 'annual' && (
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
                )}
            </div>

            {/* Grid de Planes */}
            <div className="grid md:grid-cols-3 gap-8">
                {LANDING_PLANS.map((plan) => (
                    <div key={plan.id} className={`relative p-8 bg-white rounded-2xl shadow-lg border ${plan.highlight ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'}`}>
                        {plan.badge && (
                            <span className="absolute top-0 right-0 -mt-3 mr-3 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                                {plan.badge}
                            </span>
                        )}
                        <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                        <p className="text-sm text-slate-500 mt-2 h-10">{plan.description}</p>

                        <div className="my-6">
                            <span className="text-4xl font-extrabold text-slate-900">
                                {billingInterval === 'annual' ? plan.price.annual : plan.price.monthly}€
                            </span>
                            <span className="text-slate-500">/mes</span>
                            {billingInterval === 'annual' && (
                                <p className="text-xs text-green-600 mt-1 font-semibold">
                                    Facturado {plan.price.annual * 12}€ anualmente
                                </p>
                            )}
                        </div>

                        <a
                            href="/login" // Redirige al login/registro
                            className={`block w-full py-3 px-4 rounded-lg text-center font-bold transition-all ${plan.highlight
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                                }`}
                        >
                            {plan.cta}
                        </a>

                        <ul className="mt-8 space-y-4">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-start">
                                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-slate-600">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};
