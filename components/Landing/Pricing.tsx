import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { PlanConfig } from '../../types';



export const Pricing: React.FC = () => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');

    // Estados Dinámicos
    const [plans, setPlans] = useState<PlanConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [legalFooter, setLegalFooter] = useState<string>('');



    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch plans - EXPLICITLY select multilingual columns
                const { data: plansData, error: plansError } = await supabase
                    .from('plans_configuration')
                    .select('id, name, description, description_en, price_monthly, price_annual, stripe_price_id_monthly, stripe_price_id_annual, features, features_en, limits, highlight, badge_text, is_active')
                    .eq('is_active', true)
                    .order('price_monthly', { ascending: true });

                if (plansError) throw plansError;

                if (plansData) {
                    setPlans(plansData);
                }


                // Fetch legal footer - get BOTH fields and choose in JavaScript
                const { data: settingsData, error: settingsError } = await supabase
                    .from('app_settings')
                    .select('value, value_en')
                    .eq('key', 'legal_footer_text')
                    .single();

                if (!settingsError && settingsData) {
                    // Choose the appropriate field based on language, fallback to Spanish
                    const footerText = language === 'en' && settingsData.value_en
                        ? settingsData.value_en
                        : settingsData.value;
                    setLegalFooter(footerText);
                    console.log('[Pricing] Legal footer loaded:', { language, hasEnglish: !!settingsData.value_en, textLength: footerText?.length });
                }
            } catch (err) {
                console.error('Error loading landing data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [language]); // Re-fetch when language changes

    if (loading) return <div className="py-24 text-center">Cargando ofertas...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-24 relative" id="pricing">
            <div className="text-center mb-16">
                <h2 className="h2 home text-slate-900 dark:text-white mb-4">
                    {t('pricing_title')}
                </h2>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">
                    {t('pricing_subtitle')}
                </p>

                {/* Toggle Anual */}
                <div className="mt-8 flex justify-center items-center gap-4">
                    <span className={`text-sm ${billingInterval === 'monthly' ? 'font-bold text-slate-900' : 'text-slate-500'}`}>{t('pricing_monthly')}</span>
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
                        {t('pricing_annual')} <span className="text-green-600 font-bold ml-1">{t('pricing_discount')}</span>
                    </span>
                </div>
            </div>

            {/* Grid de Planes - Con Features del Backend */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {plans.map((plan) => {
                    const monthlyPrice = plan.price_monthly;
                    const annualPrice = plan.price_annual;
                    const annualMonthlyEquiv = annualPrice > 0 ? Math.round(annualPrice / 12) : 0;
                    const isHighlight = plan.highlight;

                    return (
                        <div key={plan.id} className={`relative p-6 bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-sm border transition-all hover:shadow-md flex flex-col ${isHighlight ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-slate-200 dark:border-slate-800'
                            }`}>


                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                                {/* Subtitle Description - Use language-specific field */}
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 h-8">
                                    {language === 'en' && plan.description_en ? plan.description_en : plan.description}
                                </p>
                            </div>

                            <div className="mb-6">
                                {plan.id === 'free' ? (
                                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{t('pricing_free')}</span>
                                ) : (
                                    <>
                                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                                            {billingInterval === 'annual' && annualPrice > 0
                                                ? `${annualMonthlyEquiv}€`
                                                : `${monthlyPrice}€`
                                            }
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-500 font-medium">{t('pricing_per_month')}</span>
                                        {billingInterval === 'annual' && annualPrice > 0 && (
                                            <p className="text-[10px] text-green-600 mt-1 font-bold">
                                                {t('pricing_billed_annually').replace('{amount}', annualPrice.toString())}
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>

                            <button
                                onClick={() => navigate('/login')}
                                className={`mt-auto block w-full py-2.5 px-4 rounded-lg text-center text-sm font-bold transition-all ${isHighlight
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/20'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {plan.id === 'free' ? t('pricing_start_free') : t('pricing_choose_plan')}
                            </button>

                            {/* Features from Backend - Use language-specific field */}
                            <div className="mt-6 space-y-2">
                                {(language === 'en' && plan.features_en ? plan.features_en : plan.features)?.slice(0, 4).map((feature, i) => (
                                    <div key={i} className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
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
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse bg-white dark:bg-[#1a1a1a] rounded-xl overflow-hidden">
                        <thead>
                            <tr>
                                <th className="p-4 border-b border-slate-200 dark:border-slate-800 w-1/5"></th>
                                {plans.map(p => (
                                    <th key={p.id} className="p-4 border-b border-slate-200 dark:border-slate-800 text-center min-w-[120px]">
                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{p.name}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* TRANSCRIPCIÓN Group */}
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <td colSpan={plans.length + 1} className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    {t('table_transcription')}
                                </td>
                            </tr>
                            <tr>
                                <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                                    {t('table_monthly_minutes')}
                                </td>
                                {plans.map(p => (
                                    <td key={p.id} className="p-4 border-b border-slate-100 dark:border-slate-800 text-center text-sm font-medium text-slate-900 dark:text-white">
                                        {p.limits?.transcription_minutes === -1 ? '∞' : p.limits?.transcription_minutes}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                                    {t('table_speaker_labels')}
                                </td>
                                {plans.map(p => (
                                    <td key={p.id} className="p-4 border-b border-slate-100 dark:border-slate-800 text-center">
                                        <Check size={18} className="mx-auto text-blue-600 dark:text-blue-400" />
                                    </td>
                                ))}
                            </tr>


                            {/* FUNCIONES IA Group - DYNAMIC from database */}
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <td colSpan={plans.length + 1} className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    {t('table_ai_features')}
                                </td>
                            </tr>
                            {(() => {
                                // Extract all unique AI-related features from all plans
                                const aiKeywords = ['IA', 'Chat', 'Asistente', 'Resúmenes', 'Diktalo', 'AI', 'Assistant', 'Summaries'];
                                const allFeatures = plans.flatMap(p =>
                                    (language === 'en' && p.features_en ? p.features_en : p.features)?.filter(f =>
                                        aiKeywords.some(keyword => f.toLowerCase().includes(keyword.toLowerCase()))
                                    ) || []
                                );
                                const uniqueAiFeatures = [...new Set(allFeatures)];

                                return uniqueAiFeatures.map((feature, idx) => (
                                    <tr key={`ai-${idx}`}>
                                        <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                                            {feature}
                                        </td>
                                        {plans.map(p => {
                                            const planFeatures = language === 'en' && p.features_en ? p.features_en : p.features;
                                            const hasFeature = planFeatures?.includes(feature);
                                            return (
                                                <td key={p.id} className="p-4 border-b border-slate-100 dark:border-slate-800 text-center">
                                                    {hasFeature ? (
                                                        <Check size={18} className="mx-auto text-blue-600 dark:text-blue-400" />
                                                    ) : (
                                                        <span className="text-slate-400">-</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ));
                            })()}

                            {/* INTEGRACIÓN Group */}
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <td colSpan={plans.length + 1} className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    {t('table_integration')}
                                </td>
                            </tr>
                            <tr>
                                <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                                    {t('table_zapier')}
                                </td>
                                {plans.map(p => (
                                    <td key={p.id} className="p-4 border-b border-slate-100 dark:border-slate-800 text-center">
                                        {p.id === 'business' || p.id === 'business_plus' ? <Check size={18} className="mx-auto text-blue-600 dark:text-blue-400" /> : <span className="text-slate-400">-</span>}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="p-4 border-b border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
                                    {t('table_calls')}
                                </td>
                                {plans.map(p => (
                                    <td key={p.id} className="p-4 border-b border-slate-100 dark:border-slate-800 text-center">
                                        {p.id === 'business_plus' ? <Check size={18} className="mx-auto text-blue-600 dark:text-blue-400" /> : <span className="text-slate-400">-</span>}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legal Footer from Admin */}
            {legalFooter && (
                <div className="text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-8 max-w-3xl mx-auto">
                    {legalFooter}
                </div>
            )}
        </div>
    );
};