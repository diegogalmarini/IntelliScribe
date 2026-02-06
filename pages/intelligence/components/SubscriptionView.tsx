import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { supabase } from '../../../lib/supabase';
import { PlanConfig, UserProfile } from '../../../types';
import { Check, ChevronDown, Plus, ExternalLink, Minus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import * as Analytics from '../../../utils/analytics';
import { useToast } from '../../../components/Toast';
import { createCheckout } from '../../../services/paymentService';
import { VoiceRatesTable } from '../../../components/VoiceRatesTable';

interface SubscriptionViewProps {
    user: UserProfile;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ user }) => {
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');
    const [loading, setLoading] = useState<string | null>(null);
    const [plans, setPlans] = useState<PlanConfig[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [minutePacks, setMinutePacks] = useState<any[]>([]);
    const [callCreditPacks, setCallCreditPacks] = useState<any[]>([]);
    const [legalFooter, setLegalFooter] = useState<string>('');

    // FAQ State
    const [openFaqId, setOpenFaqId] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingData(true);
            try {
                const { data: plansData, error: plansError } = await supabase
                    .from('plans_configuration')
                    .select('*')
                    .eq('is_active', true)
                    .order('price_monthly', { ascending: true });

                if (plansError) throw plansError;
                setPlans(plansData || []);

                // Fetch legal footer with language
                const { data: settingsData, error: settingsError } = await supabase
                    .from('app_settings')
                    .select('value, value_en')
                    .eq('key', 'legal_disclaimer_plans') // Fixed key to match Admin Panel
                    .single();

                console.log('[Dashboard] Legal footer fetch:', { settingsData, settingsError });

                if (!settingsError && settingsData) {
                    // Choose correct language
                    const text = language === 'en' && settingsData.value_en
                        ? settingsData.value_en
                        : settingsData.value;
                    setLegalFooter(text);
                }

                // Fetch minute packs
                const { data: packsData, error: packsError } = await supabase
                    .from('minute_packs')
                    .select('*')
                    .eq('is_active', true)
                    .order('order', { ascending: true });

                if (!packsError) {
                    setMinutePacks(packsData || []);
                }

                // Fetch call credit packs
                const { data: callPacksData, error: callPacksError } = await supabase
                    .from('call_credit_packs')
                    .select('*')
                    .eq('is_active', true)
                    .order('order', { ascending: true });

                if (!callPacksError) {
                    setCallCreditPacks(callPacksData || []);
                }
            } catch (error) {
                console.error('Error loading subscription data:', error);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchData();
    }, [language]); // Re-fetch when language changes

    const currentPlanId = user?.subscription?.planId || 'free';

    const getPlanLevel = (planId: string) => {
        if (planId === 'free') return 0;
        if (planId === 'pro') return 1;
        if (planId === 'business') return 2;
        if (planId === 'business_plus') return 3;
        return 0;
    };

    const currentLevel = getPlanLevel(currentPlanId);

    const handleSubscribe = async (planId: string) => {
        if (!user) return;
        if (planId === 'free') return; // Free plan, no checkout needed

        // Find the plan in the plans array
        const plan = plans.find(p => p.id === planId);
        if (!plan) {
            showToast('Plan no encontrado', 'error');
            return;
        }

        // Select checkout ID based on billing interval
        const checkoutId = billingInterval === 'annual'
            ? plan.stripe_price_id_annual
            : plan.stripe_price_id_monthly;

        if (!checkoutId) {
            showToast('Este plan no tiene un checkout configurado. Contacta soporte.', 'error');
            return;
        }

        if (Analytics && typeof Analytics.trackEvent === 'function') {
            Analytics.trackEvent('checkout_started', {
                plan_id: planId,
                interval: billingInterval,
                checkout_id: checkoutId
            });
        }

        setLoading(planId);
        try {
            await createCheckout(checkoutId, user.email, user.id);
            // Redirect happens inside createCheckout
        } catch (error: any) {
            console.error('Error:', error);
            showToast('Error iniciando el pago: ' + (error.message || 'Verifica la conexión.'), 'error');
            setLoading(null);
        }
    };

    const toggleFaq = (index: number) => {
        setOpenFaqId(openFaqId === index ? null : index);
    };

    if (isLoadingData) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // FAQ Data
    const FAQS = [
        { q: t('faq_1_q'), a: t('faq_1_a') },
        { q: t('faq_2_q'), a: t('faq_2_a') },
        { q: t('faq_3_q'), a: t('faq_3_a') },
        { q: t('faq_4_q'), a: t('faq_4_a') }
    ];

    return (
        <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-[#1a1a1a]">
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="max-w-6xl mx-auto px-6 py-10">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-semibold text-[#0d0d0d] dark:text-white mb-6">
                            {t('plans_header')}
                        </h1>

                        {/* Toggle */}
                        <div className="flex items-center justify-center gap-4">
                            <div
                                className={`flex items-center gap-3 px-1 py-1 bg-[#f2f2f2] dark:bg-[#2a2a2a] rounded-full p-1 cursor-pointer transition-colors`}
                                onClick={() => setBillingInterval(prev => prev === 'monthly' ? 'annual' : 'monthly')}
                            >
                                <div className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${billingInterval === 'monthly' ? 'bg-white dark:bg-[#333] shadow-sm text-black dark:text-white' : 'text-gray-500'}`}>
                                    {t('billing_monthly')}
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${billingInterval === 'annual' ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm' : 'text-gray-500'}`}>
                                    {t('billing_annual')}
                                </div>
                            </div>
                            {billingInterval === 'annual' && (
                                <span className="text-[10px] font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded whitespace-nowrap">
                                    Ahorra 25%
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Plans Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                        {plans.map((plan) => {
                            const isCurrent = plan.id === currentPlanId;
                            const planLevel = getPlanLevel(plan.id);
                            const price = billingInterval === 'annual' && plan.price_annual > 0
                                ? Math.round(plan.price_annual / 12)
                                : plan.price_monthly;

                            const isBestValue = plan.highlight;

                            // Contextual Button Text
                            let buttonText = '';
                            let buttonDisabled = false;
                            if (isCurrent) {
                                buttonText = 'Plan Actual';
                                buttonDisabled = true;
                            } else if (planLevel > currentLevel) {
                                buttonText = `Actualizar a ${plan.name}`;
                            } else if (planLevel < currentLevel) {
                                buttonText = `Downgrade a ${plan.name}`;
                            } else {
                                buttonText = plan.id === 'free' ? 'Activar' : 'Suscribirse';
                            }

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative flex flex-col p-6 rounded-2xl border transition-all ${isBestValue
                                        ? 'border-blue-500 shadow-lg ring-1 ring-blue-500 dark:ring-blue-400 bg-blue-50/10'
                                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1f1f1f]'
                                        }`}
                                >
                                    {isBestValue && (
                                        <div className="absolute top-0 right-0 left-0 -mt-3 flex justify-center">
                                            <span className="bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                                {t('plan_best_value')}
                                            </span>
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                            {plan.name}
                                        </h3>
                                        {/* Subtitle from description - language-specific */}
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {language === 'en' && plan.description_en ? plan.description_en : plan.description}
                                        </p>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex items-baseline gap-1">
                                            {plan.id === 'free' ? (
                                                <span className="text-3xl font-bold text-slate-900 dark:text-white">Gratis</span>
                                            ) : (
                                                <>
                                                    <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                                        €{price}
                                                    </span>
                                                    <div className="flex flex-col text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                                                        <span>{t('plan_month_suffix')}</span>
                                                        {billingInterval === 'annual' && <span>{t('plan_annual_suffix')}</span>}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleSubscribe(plan.id)}
                                        disabled={loading === plan.id || buttonDisabled}
                                        className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors mb-6 ${buttonDisabled
                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-default'
                                            : isBestValue
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
                                                : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90'
                                            }`}
                                    >
                                        {buttonText}
                                    </button>

                                    {/* Features from Backend - language-specific */}
                                    <div className="space-y-3">
                                        {(language === 'en' && plan.features_en ? plan.features_en : plan.features)?.slice(0, 4).map((feature, i) => (
                                            <div key={i} className="text-[13px] text-slate-600 dark:text-slate-300 leading-snug">
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
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                {t('comparison_title')}
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th className="p-4 border-b border-slate-200 dark:border-slate-800 w-1/4"></th>
                                        {plans.map(p => (
                                            <th key={p.id} className="p-4 border-b border-slate-200 dark:border-slate-800 text-center min-w-[140px]">
                                                <div className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{p.name}</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Transcription Group */}
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
                                                {p.limits?.transcription_minutes == -1 ? '∞' : p.limits?.transcription_minutes}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                                            Etiquetas de Orador
                                        </td>
                                        {plans.map(p => (
                                            <td key={p.id} className="p-4 border-b border-slate-100 dark:border-slate-800 text-center">
                                                <div className="flex justify-center">
                                                    <Check size={18} className="text-blue-600 dark:text-blue-400" />
                                                </div>
                                            </td>
                                        ))}
                                    </tr>



                                    {/* AI Features Group */}
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
                                                <div className="flex justify-center">
                                                    {p.id !== 'free' ? <Check size={18} className="text-blue-600 dark:text-blue-400" /> : <span className="text-xs text-slate-400">-</span>}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                                            Resúmenes Avanzados
                                        </td>
                                        {plans.map(p => (
                                            <td key={p.id} className="p-4 border-b border-slate-100 dark:border-slate-800 text-center">
                                                <div className="flex justify-center">
                                                    {p.id !== 'free' ? <Check size={18} className="text-blue-600 dark:text-blue-400" /> : <span className="text-xs text-slate-400">-</span>}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                                            Asistente IA disponible 24/7
                                        </td>
                                        {plans.map(p => (
                                            <td key={p.id} className="p-4 border-b border-slate-100 dark:border-slate-800 text-center">
                                                <div className="flex justify-center">
                                                    {p.id !== 'free' ? <Check size={18} className="text-blue-600 dark:text-blue-400" /> : <span className="text-xs text-slate-400">-</span>}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Needs More Minutes - Transcription */}
                    <div className="bg-[#f9fafb] dark:bg-[#1f1f1f] rounded-2xl p-8 mb-8 border border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl">
                                    <Check className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                        {t('minutes_title') || '¿Necesitas más minutos de transcripción?'}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Los minutos de packs no caducan y se usan cuando agotas tu plan mensual.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Saldo Extra</div>
                                <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{user.subscription.extraMinutes || 0} min</div>
                            </div>
                        </div>

                        {currentLevel === 0 ? (
                            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl p-6 text-center">
                                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                                    Packs disponibles para Planes Pro
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
                                    Para comprar packs de minutos extra permanentes, necesitas estar en un plan de pago.
                                </p>
                                <button
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl"
                                >
                                    Ver Planes
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {minutePacks.map((pack) => (
                                    <div key={pack.id} className="bg-white dark:bg-[#2a2a2a] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-blue-300 transition-colors">
                                        <div className="text-base font-bold text-slate-900 dark:text-white mb-1">
                                            {pack.minutes} minutos
                                        </div>
                                        <div className="text-xl font-black text-slate-900 dark:text-white mb-4">
                                            €{pack.price}
                                        </div>
                                        <button
                                            onClick={() => window.open(pack.checkout_url, '_blank')}
                                            className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2"
                                        >
                                            <Plus size={14} />
                                            Comprar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Needs More Credits - Calls */}
                    <div className="bg-[#f9fafb] dark:bg-[#1f1f1f] rounded-2xl p-8 mb-16 border border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-500/10 rounded-xl">
                                    <Plus className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                        ¿Necesitas más créditos de llamada?
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Créditos válidos para llamadas VoIP internacionales. Sin caducidad.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Saldo de Créditos</div>
                                <div className="text-sm font-bold text-green-600 dark:text-green-400">{user.subscription?.voiceCredits || 0} min</div>
                            </div>
                        </div>

                        {currentLevel === 0 ? (
                            <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-xl p-6 text-center">
                                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                                    Créditos disponibles para Planes Pro
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
                                    Mejora tu plan para poder adquirir créditos de llamada y comunicarte con todo el mundo.
                                </p>
                                <button
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    className="px-6 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl"
                                >
                                    Ver Planes
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {callCreditPacks.length > 0 ? callCreditPacks.map((pack) => (
                                    <div key={pack.id} className="bg-white dark:bg-[#2a2a2a] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-green-300 transition-colors">
                                        <div className="text-base font-bold text-slate-900 dark:text-white mb-1">
                                            {pack.minutes} créditos
                                        </div>
                                        <div className="text-xl font-black text-slate-900 dark:text-white mb-4">
                                            €{pack.price}
                                        </div>
                                        <button
                                            onClick={() => window.open(pack.checkout_url, '_blank')}
                                            className="w-full py-2 bg-green-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2"
                                        >
                                            <Plus size={14} />
                                            Comprar
                                        </button>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-10 text-center text-slate-400 text-sm italic">
                                        No hay packs de créditos disponibles en este momento.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* VOICE RATES TABLE (Public for Dashboard) */}
                    <div className="mb-12">
                        <VoiceRatesTable />
                    </div>

                    {/* FAQ */}
                    <div className="mb-12">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 text-center">
                            {t('faq_title')}
                        </h3>
                        <div className="grid gap-3 max-w-3xl mx-auto">
                            {FAQS.map((faq, i) => (
                                <div
                                    key={i}
                                    onClick={() => toggleFaq(i)}
                                    className={`flex flex-col p-4 bg-white dark:bg-[#1f1f1f] border rounded-xl cursor-pointer transition-all ${openFaqId === i
                                        ? 'border-blue-500 dark:border-blue-400'
                                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{faq.q}</span>
                                        {openFaqId === i ? (
                                            <Minus size={16} className="text-blue-500" />
                                        ) : (
                                            <Plus size={16} className="text-slate-400" />
                                        )}
                                    </div>
                                    <AnimatePresence>
                                        {openFaqId === i && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pt-3 text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                                    {faq.a}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Legal Footer from Admin */}
                    {legalFooter && (
                        <div className="text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-8 pb-4">
                            {legalFooter}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
