
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { ThemeToggle } from '../components/ThemeToggle';

import { stripeService } from '../services/stripeService';
import { useAuth } from '../contexts/AuthContext'; // Assuming we can get email from here if not in user prop

interface PlansProps {
    user: UserProfile;
    onUpdateUser: (updatedUser: Partial<UserProfile>) => void;
}

export const Plans: React.FC<PlansProps> = ({ user, onUpdateUser }) => {
    const { t } = useLanguage();

    // --- Pricing Logic ---
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');
    const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');

    // Simulated Exchange Rate
    const EXCHANGE_RATE_USD_TO_EUR = 0.92;

    const formatPrice = (priceInUSD: number): string => {
        if (priceInUSD === 0) return t('freePrice');

        if (currency === 'USD') {
            return `$${priceInUSD}`;
        } else {
            const eur = priceInUSD * EXCHANGE_RATE_USD_TO_EUR;
            return `€${eur.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
    };

    // --- Plan Hierarchy Logic ---
    const PLAN_LEVELS = {
        'free': 0,
        'pro': 1,
        'business': 2,
        'business_plus': 3
    };

    const currentLevel = PLAN_LEVELS[user.subscription?.planId || 'free'] || 0;

    const getButtonLabel = (targetPlan: 'free' | 'pro' | 'business' | 'business_plus') => {
        if (user.subscription?.planId === targetPlan) return t('currentPlan') || 'Current Plan';
        const targetLevel = PLAN_LEVELS[targetPlan];
        if (currentLevel > targetLevel) return t('downgrade') || 'Downgrade';
        return t('subscribe');
    };


    const handleSubscribe = async (planType: 'pro' | 'business' | 'business_plus') => {
        let priceId = '';

        // Select Price ID based on Plan + Interval (Annual/Monthly)
        // Note: In a real app, you'd have 6 Price IDs (3 plans * 2 intervals).
        // For MVP, we'll assume Monthly IDs for now or use Env Vars mapping.

        if (billingInterval === 'monthly') {
            switch (planType) {
                case 'pro':
                    priceId = import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY;
                    break;
                case 'business':
                    priceId = import.meta.env.VITE_STRIPE_PRICE_BUSINESS_MONTHLY;
                    break;
                case 'business_plus':
                    priceId = import.meta.env.VITE_STRIPE_PRICE_BUSINESS_PLUS_MONTHLY;
                    break;
            }
        } else {
            // Annual
            switch (planType) {
                case 'pro':
                    priceId = import.meta.env.VITE_STRIPE_PRICE_PRO_ANNUAL;
                    break;
                case 'business':
                    priceId = import.meta.env.VITE_STRIPE_PRICE_BUSINESS_ANNUAL;
                    break;
                case 'business_plus':
                    priceId = import.meta.env.VITE_STRIPE_PRICE_BUSINESS_PLUS_ANNUAL;
                    break;
            }
        }

        if (!priceId) {
            // Debugging Aid: Show exactly which key failed
            const suffix = billingInterval === 'monthly' ? '_MONTHLY' : '_ANNUAL';
            let debugKey = '';

            if (planType === 'pro') debugKey = `VITE_STRIPE_PRICE_PRO${suffix}`;
            else if (planType === 'business') debugKey = `VITE_STRIPE_PRICE_BUSINESS${suffix}`;
            else debugKey = `VITE_STRIPE_PRICE_BUSINESS_PLUS${suffix}`;

            alert(`Error: Price ID not configured! \nTesting Key: ${debugKey} \nValue: ${priceId || 'undefined'}`);
            return;
        }

        if (!user.id || !user.email) {
            alert("Error: User session invalid");
            return;
        }

        await stripeService.startCheckout(priceId, user.id, user.email);
    };

    return (
        <div className="flex flex-1 flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative transition-colors duration-200">
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-border-dark bg-white/80 dark:bg-[#111722]/80 backdrop-blur-md px-4 md:px-8 py-4 sticky top-0 z-20 transition-colors duration-200">
                <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">{t('plans')} & {t('subscription')}</h2>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <LanguageSelector />
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                <div className="mx-auto max-w-[1600px] flex flex-col gap-8">

                    {/* Page Title & Intro */}
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('plans')}</h1>
                        <p className="text-slate-500 dark:text-text-secondary text-lg">Escala tu inteligencia conversacional con el plan perfecto.</p>
                    </div>

                    {/* Current Plan Status - Using Gradient Background */}
                    <div className="bg-gradient-brand p-[1px] rounded-xl shadow-lg">
                        <div className="bg-white dark:bg-[#111722] p-6 rounded-[11px] flex flex-col md:flex-row items-center justify-between gap-4 h-full relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-brand opacity-20"></div>
                            <div className="z-10">
                                <p className="text-transparent bg-clip-text bg-gradient-brand font-bold text-sm mb-1">{t('currentPlan')}</p>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white capitalize tracking-tight">{user.subscription.planId === 'business_plus' ? 'Business +' : user.subscription.planId === 'business' ? 'Business' : user.subscription.planId === 'pro' ? 'Pro' : 'Free'}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                    {user.subscription.planId === 'free'
                                        ? `${user.subscription.minutesUsed} / ${user.subscription.minutesLimit} minutes used this month.`
                                        : 'Unlimited access active.'}
                                </p>
                            </div>
                            <div className="flex items-center gap-4 z-10">
                                <div className="text-right">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${user.subscription.status === 'active' ? 'bg-brand-green/10 text-brand-green border-brand-green/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                        {user.subscription.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Controls Row */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 pt-2 pb-4 bg-background-light dark:bg-background-dark z-10">
                        {/* Currency Toggle */}
                        <div className="flex items-center gap-2 bg-white dark:bg-surface-dark p-1 rounded-lg border border-slate-200 dark:border-border-dark shadow-sm">
                            <button
                                onClick={() => setCurrency('USD')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${currency === 'USD' ? 'bg-brand-blue text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}>
                                USD ($)
                            </button>
                            <button
                                onClick={() => setCurrency('EUR')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${currency === 'EUR' ? 'bg-brand-blue text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}>
                                EUR (€)
                            </button>
                        </div>

                        {/* Interval Toggle */}
                        <div className="bg-white dark:bg-surface-dark p-1 rounded-xl border border-slate-200 dark:border-border-dark inline-flex shadow-sm">
                            <button
                                onClick={() => setBillingInterval('monthly')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${billingInterval === 'monthly' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                                {t('monthly')}
                            </button>
                            <button
                                onClick={() => setBillingInterval('annual')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${billingInterval === 'annual' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                                {t('annual')}
                                <span className="text-[10px] bg-brand-green text-slate-900 px-1.5 rounded font-bold">{t('save20')}</span>
                            </button>
                        </div>
                    </div>



                    // ... (rendering code)

                    {/* 1. FREE PLAN - GREY */}
                    <div className={`rounded-3xl border flex flex-col transition-all duration-300 bg-white dark:bg-surface-dark overflow-hidden hover:shadow-xl ${user.subscription.planId === 'free' ? 'border-brand-grey ring-1 ring-brand-grey shadow-lg' : 'border-slate-200 dark:border-border-dark hover:border-brand-grey/50'}`}>
                        <div className="h-2 w-full bg-brand-grey"></div>
                        <div className="p-6 flex flex-col h-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-lg font-bold text-brand-grey dark:text-slate-200">{t('freeTitle')}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">{t('freeDesc')}</p>
                                </div>
                                {user.subscription.planId === 'free' && <span className="bg-brand-grey text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">Active</span>}
                            </div>

                            <div className="mt-4 mb-6">
                                <p className="text-3xl font-black text-slate-900 dark:text-white">{formatPrice(0)}</p>
                                <p className="text-slate-400 text-[10px] mt-1 uppercase tracking-wide font-medium">{t('currency')}</p>
                            </div>

                            <div className="flex-1">
                                <ul className="flex flex-col gap-3 mb-8">
                                    {[t('freeF1'), t('freeF2'), t('freeF3')].map((feat, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-300 text-xs">
                                            <span className="material-symbols-outlined text-brand-grey dark:text-slate-400 text-sm font-bold">check</span>
                                            <span className="leading-tight">{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button disabled={user.subscription.planId === 'free'} className="w-full py-3 rounded-xl border border-brand-grey text-brand-grey dark:text-slate-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-xs uppercase tracking-wider">
                                {getButtonLabel('free')}
                            </button>
                        </div>
                    </div>

                    {/* 2. PRO PLAN - VIOLET (#8F53ED) */}
                    <div className={`rounded-3xl border flex flex-col transition-all duration-300 bg-white dark:bg-surface-dark overflow-hidden hover:shadow-xl relative transform hover:-translate-y-1 ${user.subscription.planId === 'pro' ? 'border-brand-violet ring-1 ring-brand-violet shadow-lg' : 'border-slate-200 dark:border-border-dark hover:border-brand-violet/50'}`}>
                        <div className="h-2 w-full bg-brand-violet"></div>
                        <div className="p-6 flex flex-col h-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">{t('proTitle')}</h4>
                                        <span className="text-[10px] font-bold text-white bg-brand-violet px-2 py-0.5 rounded-full">{t('proBadge')}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">{t('proDesc')}</p>
                                </div>
                            </div>

                            <div className="mt-4 mb-6">
                                <p className="text-3xl font-black text-slate-900 dark:text-white">
                                    {formatPrice(billingInterval === 'annual' ? 9 : 12)}
                                    <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/mo</span>
                                </p>
                                <p className="text-slate-500 text-[10px] mt-1">{billingInterval === 'annual' ? 'Billed annually' : 'Billed monthly'}</p>
                            </div>

                            <div className="flex-1">
                                <ul className="flex flex-col gap-3 mb-8">
                                    {[t('proF1'), t('proF2'), t('proF3')].map((feat, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-white text-xs">
                                            <span className="material-symbols-outlined text-brand-violet text-sm font-bold">check</span>
                                            <span className="leading-tight">{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button
                                onClick={() => handleSubscribe('pro')}
                                disabled={user.subscription.planId === 'pro'}
                                className="w-full py-3 rounded-xl bg-brand-violet hover:bg-[#7a42d1] text-white font-bold transition-colors text-xs uppercase tracking-wider shadow-md shadow-brand-violet/20 disabled:opacity-50 disabled:cursor-default">
                                {getButtonLabel('pro')}
                            </button>
                        </div>
                    </div>

                    {/* 3. BUSINESS - BLUE (#2CA3FF) */}
                    <div className={`rounded-3xl border flex flex-col transition-all duration-300 bg-white dark:bg-surface-dark overflow-hidden hover:shadow-xl relative transform hover:-translate-y-1 ${user.subscription.planId === 'business' ? 'border-brand-blue ring-1 ring-brand-blue shadow-lg' : 'border-slate-200 dark:border-border-dark hover:border-brand-blue/50'}`}>
                        <div className="h-2 w-full bg-brand-blue"></div>
                        <div className="p-6 flex flex-col h-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">{t('bizTitle')}</h4>
                                        <span className="text-[10px] font-bold text-white bg-brand-blue px-2 py-0.5 rounded-full">{t('bizBadge')}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">{t('bizDesc')}</p>
                                </div>
                            </div>

                            <div className="mt-4 mb-6">
                                <p className="text-3xl font-black text-slate-900 dark:text-white">
                                    {formatPrice(billingInterval === 'annual' ? 15 : 19)}
                                    <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/mo</span>
                                </p>
                                <p className="text-slate-500 text-[10px] mt-1">{billingInterval === 'annual' ? 'Billed annually' : 'Billed monthly'}</p>
                            </div>

                            <div className="flex-1">
                                <ul className="flex flex-col gap-3 mb-8">
                                    {[t('bizF1'), t('bizF2'), t('bizF3'), t('bizF4')].map((feat, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-white text-xs">
                                            <span className="material-symbols-outlined text-brand-blue text-sm font-bold">verified</span>
                                            <span className="leading-tight font-medium">{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button
                                onClick={() => handleSubscribe('business')}
                                disabled={user.subscription.planId === 'business'}
                                className="w-full py-3 rounded-xl bg-brand-blue hover:bg-[#208ade] text-white font-bold transition-all shadow-md shadow-brand-blue/25 text-xs uppercase tracking-wider disabled:opacity-50 disabled:cursor-default">
                                {getButtonLabel('business')}
                            </button>
                        </div>
                    </div>

                    {/* 4. BUSINESS + CALLS - GREEN (#39F672) */}
                    <div className={`rounded-3xl border flex flex-col transition-all duration-300 bg-white dark:bg-surface-dark overflow-hidden hover:shadow-xl relative transform hover:-translate-y-1 ${user.subscription.planId === 'business_plus' ? 'border-brand-green ring-1 ring-brand-green shadow-lg' : 'border-slate-200 dark:border-border-dark hover:border-brand-green/50'}`}>
                        <div className="h-2 w-full bg-brand-green"></div>
                        <div className="p-6 flex flex-col h-full bg-gradient-to-b from-brand-green/5 to-transparent">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-lg font-black text-slate-900 dark:text-white">{t('bizPlusTitle')}</h4>
                                        <span className="text-[10px] font-bold text-slate-900 bg-brand-green px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">{t('bizPlusBadge')}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-300 mt-1 min-h-[32px]">{t('bizPlusDesc')}</p>
                                </div>
                            </div>

                            <div className="mt-4 mb-6">
                                <p className="text-3xl font-black text-slate-900 dark:text-white">
                                    {formatPrice(billingInterval === 'annual' ? 25 : 35)}
                                    <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/mo</span>
                                </p>
                                <p className="text-slate-500 text-[10px] mt-1">{billingInterval === 'annual' ? 'Billed annually' : 'Billed monthly'}</p>
                            </div>

                            <div className="flex-1">
                                <ul className="flex flex-col gap-3 mb-8">
                                    {[t('bizPlusF1'), t('bizPlusF2'), t('bizPlusF3')].map((feat, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-white text-xs">
                                            <span className="material-symbols-outlined text-brand-green text-sm font-bold">stars</span>
                                            <span className="leading-tight font-bold">{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button
                                onClick={() => handleSubscribe('business_plus')}
                                disabled={user.subscription.planId === 'business_plus'}
                                className="w-full py-3 rounded-xl bg-brand-green hover:bg-brand-green/90 text-slate-900 font-bold transition-all shadow-md shadow-brand-green/25 text-xs uppercase tracking-wider transform group-hover:scale-105 disabled:opacity-50 disabled:cursor-default disabled:transform-none">
                                {getButtonLabel('business_plus')}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>

    );
};
