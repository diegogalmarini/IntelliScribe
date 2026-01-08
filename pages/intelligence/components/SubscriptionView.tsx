import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../../../lib/supabase';
import { PlanConfig, UserProfile } from '../../../types';
import { Check, ChevronDown, Plus, ExternalLink } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface SubscriptionViewProps {
    user: UserProfile;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ user }) => {
    const { t } = useLanguage();
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');
    const [loading, setLoading] = useState<string | null>(null);
    const [plans, setPlans] = useState<PlanConfig[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

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
            } catch (error) {
                console.error('Error loading plans:', error);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchData();
    }, []);

    const currentPlanId = user?.subscription?.planId || 'free';

    const getPlanLevel = (planId: string) => {
        if (planId === 'free') return 0;
        if (planId === 'pro') return 1;
        if (planId === 'business') return 2;
        if (planId === 'business_plus') return 3;
        return 0;
    };

    const currentLevel = getPlanLevel(currentPlanId);

    // Helper to get translated plan details
    const getPlanDetails = (planId: string) => {
        switch (planId) {
            case 'free':
                return {
                    name: t('planFree') || 'Free',
                    description: t('freeDesc'),
                    features: [t('freeF1'), t('freeF2'), t('freeF3'), t('freeF4')]
                };
            case 'pro':
                return {
                    name: t('planPro') || 'Pro',
                    description: t('proDesc'),
                    features: [t('proF1'), t('proF2'), t('proF3'), t('proF4')]
                };
            case 'business':
                return {
                    name: t('planBiz') || 'Business',
                    description: t('bizDesc'),
                    features: [t('bizF1'), t('bizF2'), t('bizF3'), t('bizF4')]
                };
            case 'business_plus':
                return {
                    name: t('planBizPlus') || 'Business +',
                    description: t('bizPlusDesc'),
                    features: [t('bizPlusF1'), t('bizPlusF2'), t('bizPlusF3'), t('bizPlusF4')]
                };
            default:
                return { name: planId, description: '', features: [] };
        }
    };

    const handleSubscribe = async (priceId: string, planId: string) => {
        if (!user) return;
        if (planId === 'free') return; // Downgrades usually handled via portal or support for now

        if (!priceId) {
            alert('Error: Configuration missing for this plan.');
            return;
        }

        setLoading(planId);
        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.id}`
                },
                body: JSON.stringify({
                    priceId,
                    userId: user.id,
                    email: user.email,
                    planId
                })
            });

            const { url, error } = await response.json();
            if (error) throw new Error(error);

            // Use direct redirect instead of deprecated redirectToCheckout
            if (url) window.location.href = url;
        } catch (error: any) {
            console.error('Error:', error);
            alert('Error initiating payment: ' + (error.message || 'Check connection.'));
        } finally {
            setLoading(null);
        }
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
        { q: t('faq_1_q'), a: '' },
        { q: t('faq_2_q'), a: '' },
        { q: t('faq_3_q'), a: '' },
        { q: t('faq_4_q'), a: '' }
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
                                <span className="text-[12px] font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                                    {t('billing_save')}
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

                            const isBestValue = plan.id === 'business'; // Example logic
                            const translated = getPlanDetails(plan.id);

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
                                            {translated.name}
                                        </h3>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                                {price === 0 ? t('planFree') : `€${price}`}
                                            </span>
                                            {price > 0 && (
                                                <div className="flex flex-col text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                                                    <span>{t('plan_month_suffix')}</span>
                                                    {billingInterval === 'annual' && <span>{t('plan_annual_suffix')}</span>}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleSubscribe(
                                            billingInterval === 'annual' ? plan.stripe_price_id_annual : plan.stripe_price_id_monthly,
                                            plan.id
                                        )}
                                        disabled={loading === plan.id || isCurrent || (plan.id === 'free' && currentLevel > 0)}
                                        className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors mb-6 ${isCurrent
                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-default'
                                            : isBestValue
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
                                                : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90'
                                            }`}
                                    >
                                        {isCurrent ? t('plan_current') : (plan.id === 'free' ? t('plan_activate') : t('plan_subscribe'))}
                                    </button>

                                    <div className="space-y-3">
                                        {(translated.features.length > 0 ? translated.features : (plan.features || [])).slice(0, 4).map((feature, i) => (
                                            <div key={i} className="flex items-start gap-2.5 text-[13px] text-slate-600 dark:text-slate-300">
                                                <Check size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                                <span className="leading-snug">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-auto pt-6 text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                                        {translated.description || plan.description}
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
                                        {plans.map(p => {
                                            const translated = getPlanDetails(p.id);
                                            return (
                                                <th key={p.id} className="p-4 border-b border-slate-200 dark:border-slate-800 text-center min-w-[140px]">
                                                    <div className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{translated.name}</div>
                                                    <button
                                                        onClick={() => handleSubscribe(
                                                            billingInterval === 'annual' ? p.stripe_price_id_annual : p.stripe_price_id_monthly,
                                                            p.id
                                                        )}
                                                        disabled={p.id === currentPlanId || (p.id === 'free' && currentLevel > 0)}
                                                        className={`w-full py-1.5 px-3 rounded text-xs font-medium transition-colors ${p.id === 'business'
                                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                            } ${p.id === currentPlanId ? 'opacity-50 cursor-default' : ''}`}
                                                    >
                                                        {p.id === currentPlanId ? t('comp_active') : t('comp_select')}
                                                    </button>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Transcription Group */}
                                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                                        <td colSpan={plans.length + 1} className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            {t('comp_transcription')}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                                            {t('comp_minutes')}
                                        </td>
                                        {plans.map(p => (
                                            <td key={p.id} className="p-4 border-b border-slate-100 dark:border-slate-800 text-center text-sm font-medium text-slate-900 dark:text-white">
                                                {p.limits?.transcription_minutes == -1 ? t('comp_unlimited') : p.limits?.transcription_minutes}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                                            {t('comp_speaker_labels')}
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
                                            {t('comp_ai_features')}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                                            {t('comp_ask_diktalo')}
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
                                            {t('comp_advanced_summaries')}
                                        </td>
                                        {plans.map(p => (
                                            <td key={p.id} className="p-4 border-b border-slate-100 dark:border-slate-800 text-center">
                                                <div className="flex justify-center">
                                                    <Check size={18} className="text-blue-600 dark:text-blue-400" />
                                                </div>
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Integration Group */}
                                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                                        <td colSpan={plans.length + 1} className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            {t('comp_integration')}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                                            {t('comp_zapier')}
                                        </td>
                                        {plans.map(p => (
                                            <td key={p.id} className="p-4 border-b border-slate-100 dark:border-slate-800 text-center">
                                                <div className="flex justify-center">
                                                    {p.id === 'business' || p.id === 'business_plus'
                                                        ? <Check size={18} className="text-blue-600 dark:text-blue-400" />
                                                        : <span className="text-xs text-slate-400">-</span>}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Needs More Minutes */}
                    <div className="bg-[#f9fafb] dark:bg-[#1f1f1f] rounded-2xl p-8 mb-16 border border-slate-200 dark:border-slate-800">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                            {t('minutes_title')}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[120, 600, 3000, 6000].map((mins, i) => (
                                <div key={i} className="bg-white dark:bg-[#2a2a2a] p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="text-lg font-bold text-slate-900 dark:text-white mb-1">{mins} minutes</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t('minutes_one_time')}</div>
                                    <button className="w-full py-1.5 bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded-lg hover:opacity-90 transition-opacity">
                                        {t('minutes_buy')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FAQ */}
                    <div className="mb-12">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 text-center">
                            {t('faq_title')}
                        </h3>
                        <div className="grid gap-3 max-w-3xl mx-auto">
                            {FAQS.map((faq, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-[#1f1f1f] border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{faq.q}</span>
                                    <Plus size={16} className="text-slate-400" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Links */}
                    <div className="flex justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-8 pb-4">
                        <a href="/faq" target="_blank" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t('footer_faq')}</a>
                        <span className="text-slate-300">|</span>
                        <a href="/terms" target="_blank" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t('footer_terms')}</a>
                    </div>
                </div>
            </div>
        </div>
    );
};
