import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { PlanConfig, AppSetting } from '../../types';
import { motion } from 'framer-motion';

export const PlansEditor: React.FC = () => {
    const [plans, setPlans] = useState<PlanConfig[]>([]);
    const [settings, setSettings] = useState<AppSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [plansData, settingsData] = await Promise.all([
            adminService.getPlansConfig(),
            adminService.getAppSettings()
        ]);
        setPlans(plansData);
        setSettings(settingsData);
        setLoading(false);
    };

    const handlePlanChange = (planId: string, field: keyof PlanConfig, value: any) => {
        setPlans(prev => prev.map(p => p.id === planId ? { ...p, [field]: value } : p));
    };

    const handleLimitChange = (planId: string, limitField: string, value: number) => {
        setPlans(prev => prev.map(p => {
            if (p.id !== planId) return p;
            return {
                ...p,
                limits: { ...p.limits, [limitField]: value }
            };
        }));
    };

    const handleFeatureChange = (planId: string, featureIndex: number, value: string) => {
        setPlans(prev => prev.map(p => {
            if (p.id !== planId) return p;
            const newFeatures = [...p.features];
            newFeatures[featureIndex] = value;
            return { ...p, features: newFeatures };
        }));
    };

    const savePlan = async (plan: PlanConfig) => {
        setSaving(plan.id);
        const success = await adminService.updatePlanConfig(plan.id, {
            name: plan.name,
            description: plan.description,
            price_monthly: plan.price_monthly,
            price_annual: plan.price_annual,
            stripe_price_id_monthly: plan.stripe_price_id_monthly,
            stripe_price_id_annual: plan.stripe_price_id_annual,
            highlight: plan.highlight,
            badge_text: plan.badge_text,
            features: plan.features,
            limits: plan.limits
        });
        if (success) alert(`Plan ${plan.name} actualizado correctamente.`);
        else alert('Error al guardar.');
        setSaving(null);
    };

    const saveSetting = async (key: string, value: string) => {
        setSaving(key);
        const success = await adminService.updateAppSetting(key, value);
        if (success) alert('Configuración guardada.');
        setSaving(null);
    };

    if (loading) return <div className="p-8 text-white">Cargando configuración...</div>;

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Editor de Planes y Precios</h2>
                <button onClick={loadData} className="text-sm text-blue-400 hover:underline">Recargar Datos</button>
            </div>

            {/* Grid de Planes */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {plans.map(plan => (
                    <div key={plan.id} className={`bg-slate-800 rounded-xl border p-6 space-y-4 ${plan.highlight ? 'border-blue-500 ring-1 ring-blue-500/30' : 'border-slate-700'}`}>
                        {/* Header del Plan */}
                        <div className="flex justify-between items-start border-b border-slate-700 pb-4">
                            <div>
                                <span className="text-xs font-mono text-slate-500 uppercase">ID: {plan.id}</span>
                                <input
                                    type="text"
                                    value={plan.name}
                                    onChange={(e) => handlePlanChange(plan.id, 'name', e.target.value)}
                                    className="block bg-transparent text-xl font-bold text-white border-none focus:ring-0 p-0"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={plan.highlight}
                                        onChange={(e) => handlePlanChange(plan.id, 'highlight', e.target.checked)}
                                        className="rounded bg-slate-700 border-slate-600 text-blue-500"
                                    />
                                    Destacado
                                </label>
                                <button
                                    onClick={() => savePlan(plan)}
                                    disabled={saving === plan.id}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-bold disabled:opacity-50"
                                >
                                    {saving === plan.id ? '...' : 'Guardar'}
                                </button>
                            </div>
                        </div>

                        {/* Precios y Stripe IDs */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400">Precio Mensual (€)</label>
                                <input
                                    type="number"
                                    value={plan.price_monthly}
                                    onChange={(e) => handlePlanChange(plan.id, 'price_monthly', parseFloat(e.target.value))}
                                    className="w-full bg-slate-900 border-slate-700 rounded text-white text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Stripe ID Monthly (price_...)"
                                    value={plan.stripe_price_id_monthly}
                                    onChange={(e) => handlePlanChange(plan.id, 'stripe_price_id_monthly', e.target.value)}
                                    className="w-full bg-slate-900 border-slate-700 rounded text-slate-400 text-xs font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400">Precio Anual (€)</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="number"
                                        value={plan.price_annual}
                                        onChange={(e) => handlePlanChange(plan.id, 'price_annual', parseFloat(e.target.value))}
                                        className="w-full bg-slate-900 border-slate-700 rounded text-white text-sm"
                                    />
                                    {plan.price_monthly > 0 && (
                                        <span className="text-xs text-green-400 whitespace-nowrap">
                                            -{Math.round((1 - (plan.price_annual / (plan.price_monthly * 12))) * 100)}%
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Stripe ID Annual (price_...)"
                                    value={plan.stripe_price_id_annual}
                                    onChange={(e) => handlePlanChange(plan.id, 'stripe_price_id_annual', e.target.value)}
                                    className="w-full bg-slate-900 border-slate-700 rounded text-slate-400 text-xs font-mono"
                                />
                            </div>
                        </div>

                        {/* Límites Técnicos */}
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                            <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase">Límites (Backend)</h4>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[10px] text-slate-500">Minutos IA</label>
                                    <input
                                        type="number"
                                        value={plan.limits.transcription_minutes}
                                        onChange={(e) => handleLimitChange(plan.id, 'transcription_minutes', parseInt(e.target.value))}
                                        className="w-full bg-slate-800 border-slate-600 rounded text-white text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500">Storage (GB)</label>
                                    <input
                                        type="number"
                                        value={plan.limits.storage_gb || 0}
                                        onChange={(e) => handleLimitChange(plan.id, 'storage_gb', parseInt(e.target.value))}
                                        className="w-full bg-slate-800 border-slate-600 rounded text-white text-xs"
                                    />
                                </div>
                                {plan.id === 'business_plus' && (
                                    <div>
                                        <label className="text-[10px] text-yellow-500 font-bold">Minutos Call</label>
                                        <input
                                            type="number"
                                            value={plan.limits.call_minutes || 0}
                                            onChange={(e) => handleLimitChange(plan.id, 'call_minutes', parseInt(e.target.value))}
                                            className="w-full bg-slate-800 border-yellow-600/50 rounded text-yellow-400 text-xs"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Features (Visual) */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase">Características (Lista Visual)</h4>
                            <div className="space-y-1">
                                {plan.features.map((feature, idx) => (
                                    <input
                                        key={idx}
                                        type="text"
                                        value={feature}
                                        onChange={(e) => handleFeatureChange(plan.id, idx, e.target.value)}
                                        className="w-full bg-slate-900 border-slate-700 rounded text-slate-300 text-xs py-1 px-2"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Legal Editor */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mt-8">
                <h3 className="text-lg font-bold text-white mb-4">Configuración Legal (Footer)</h3>
                {settings.filter(s => s.key === 'legal_disclaimer_plans').map(setting => (
                    <div key={setting.key}>
                        <label className="text-sm text-slate-400 block mb-2">{setting.description}</label>
                        <textarea
                            value={setting.value}
                            onChange={(e) => setSettings(prev => prev.map(s => s.key === setting.key ? { ...s, value: e.target.value } : s))}
                            className="w-full h-24 bg-slate-900 border-slate-600 rounded text-slate-300 text-sm p-3"
                        />
                        <div className="mt-2 text-right">
                            <button
                                onClick={() => saveSetting(setting.key, setting.value)}
                                disabled={saving === setting.key}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold"
                            >
                                {saving === setting.key ? 'Guardando...' : 'Guardar Texto Legal'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};