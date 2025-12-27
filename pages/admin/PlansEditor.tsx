import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { PlanConfig, AppSetting } from '../../types';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, RefreshCw, AlertCircle } from 'lucide-react';

export const PlansEditor: React.FC = () => {
    const [plans, setPlans] = useState<PlanConfig[]>([]);
    const [settings, setSettings] = useState<AppSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState<Record<string, boolean>>({});

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

    // --- NUEVA LÓGICA PARA FEATURES ---

    const handleFeatureChange = (planId: string, featureIndex: number, value: string) => {
        setPlans(prev => prev.map(p => {
            if (p.id !== planId) return p;
            const newFeatures = [...(p.features || [])];
            newFeatures[featureIndex] = value;
            return { ...p, features: newFeatures };
        }));
    };

    const handleAddFeature = (planId: string) => {
        setPlans(prev => prev.map(p => {
            if (p.id !== planId) return p;
            return { ...p, features: [...(p.features || []), "Nueva característica"] };
        }));
    };

    const handleRemoveFeature = (planId: string, featureIndex: number) => {
        setPlans(prev => prev.map(p => {
            if (p.id !== planId) return p;
            const newFeatures = [...(p.features || [])];
            newFeatures.splice(featureIndex, 1);
            return { ...p, features: newFeatures };
        }));
    };

    // ----------------------------------

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

        if (success) {
            setSaveSuccess(prev => ({ ...prev, [plan.id]: true }));
            setTimeout(() => {
                setSaveSuccess(prev => ({ ...prev, [plan.id]: false }));
            }, 2000);
        } else {
            alert('Error al guardar. Verifica tus permisos de administrador.');
        }
        setSaving(null);
    };

    const saveSetting = async (key: string, value: string) => {
        setSaving(key);
        const success = await adminService.updateAppSetting(key, value);
        if (success) alert('Configuración guardada.');
        else alert('Error al guardar configuración.');
        setSaving(null);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Cargando configuración...
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Editor de Planes y Precios</h2>
                    <p className="text-slate-400 text-sm">Gestiona lo que ven tus usuarios en tiempo real.</p>
                </div>
                <button
                    onClick={loadData}
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" /> Recargar Datos
                </button>
            </div>

            {/* Grid de Planes */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {plans.map(plan => (
                    <div key={plan.id} className={`bg-slate-800 rounded-xl border p-6 space-y-5 transition-all ${plan.highlight ? 'border-blue-500 ring-1 ring-blue-500/30' : 'border-slate-700 hover:border-slate-600'}`}>

                        {/* Header del Plan */}
                        <div className="flex justify-between items-start border-b border-slate-700 pb-4">
                            <div className="flex-1 mr-4">
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">ID: {plan.id}</span>
                                <input
                                    type="text"
                                    value={plan.name}
                                    onChange={(e) => handlePlanChange(plan.id, 'name', e.target.value)}
                                    className="block w-full bg-transparent text-xl font-bold text-white border-none focus:ring-0 p-0 placeholder-slate-600"
                                    placeholder="Nombre del Plan"
                                />
                                <input
                                    type="text"
                                    value={plan.description}
                                    onChange={(e) => handlePlanChange(plan.id, 'description', e.target.value)}
                                    className="block w-full bg-transparent text-sm text-slate-400 border-none focus:ring-0 p-0 mt-1"
                                    placeholder="Descripción corta"
                                />
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer bg-slate-900 px-2 py-1 rounded border border-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={plan.highlight}
                                        onChange={(e) => handlePlanChange(plan.id, 'highlight', e.target.checked)}
                                        className="rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-offset-slate-900"
                                    />
                                    Destacado
                                </label>
                                <button
                                    onClick={() => savePlan(plan)}
                                    disabled={saving === plan.id}
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold disabled:opacity-50 transition-all shadow-lg ${saveSuccess[plan.id]
                                            ? 'bg-green-600 hover:bg-green-700 shadow-green-900/20'
                                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20'
                                        }`}
                                >
                                    {saving === plan.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving === plan.id ? '...' : saveSuccess[plan.id] ? '¡Guardado!' : 'Guardar'}
                                </button>
                            </div>
                        </div>

                        {/* Precios */}
                        <div className="grid grid-cols-2 gap-4 bg-slate-900/50 p-4 rounded-lg">
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400 font-semibold">Mensual (€)</label>
                                <input
                                    type="number"
                                    value={plan.price_monthly}
                                    onChange={(e) => handlePlanChange(plan.id, 'price_monthly', parseFloat(e.target.value))}
                                    className="w-full bg-slate-900 border-slate-700 rounded text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Stripe ID (price_...)"
                                    value={plan.stripe_price_id_monthly}
                                    onChange={(e) => handlePlanChange(plan.id, 'stripe_price_id_monthly', e.target.value)}
                                    className="w-full bg-slate-900 border-slate-700 rounded text-slate-500 text-xs font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400 font-semibold">Anual (€)</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="number"
                                        value={plan.price_annual}
                                        onChange={(e) => handlePlanChange(plan.id, 'price_annual', parseFloat(e.target.value))}
                                        className="w-full bg-slate-900 border-slate-700 rounded text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Stripe ID (price_...)"
                                    value={plan.stripe_price_id_annual}
                                    onChange={(e) => handlePlanChange(plan.id, 'stripe_price_id_annual', e.target.value)}
                                    className="w-full bg-slate-900 border-slate-700 rounded text-slate-500 text-xs font-mono"
                                />
                            </div>
                        </div>

                        {/* Límites Técnicos (Backend) */}
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                            <h4 className="text-xs font-bold text-slate-300 mb-3 uppercase flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-500"></span> Límites del Sistema
                            </h4>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase block mb-1">Minutos IA</label>
                                    <input
                                        type="number"
                                        value={plan.limits.transcription_minutes}
                                        onChange={(e) => handleLimitChange(plan.id, 'transcription_minutes', parseInt(e.target.value))}
                                        className="w-full bg-slate-800 border-slate-600 rounded text-white text-xs font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase block mb-1">Storage (GB)</label>
                                    <input
                                        type="number"
                                        value={plan.limits.storage_gb || 0}
                                        onChange={(e) => handleLimitChange(plan.id, 'storage_gb', parseInt(e.target.value))}
                                        className="w-full bg-slate-800 border-slate-600 rounded text-white text-xs font-mono"
                                    />
                                </div>
                                {plan.id === 'business_plus' && (
                                    <div>
                                        <label className="text-[10px] text-yellow-500 font-bold uppercase block mb-1">Minutos Call</label>
                                        <input
                                            type="number"
                                            value={plan.limits.call_minutes || 0}
                                            onChange={(e) => handleLimitChange(plan.id, 'call_minutes', parseInt(e.target.value))}
                                            className="w-full bg-slate-800 border-yellow-600/50 text-yellow-400 rounded text-xs font-mono"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Features (Visual - Con Botón +) */}
                        <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-700/30">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-xs font-bold text-slate-300 uppercase flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Características Visuales
                                </h4>
                                <button
                                    onClick={() => handleAddFeature(plan.id)}
                                    className="text-xs flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded transition-colors"
                                >
                                    <Plus className="w-3 h-3" /> Agregar
                                </button>
                            </div>

                            <div className="space-y-2">
                                {(plan.features || []).map((feature, idx) => (
                                    <div key={idx} className="flex gap-2 group">
                                        <input
                                            type="text"
                                            value={feature}
                                            onChange={(e) => handleFeatureChange(plan.id, idx, e.target.value)}
                                            className="flex-1 bg-slate-900 border-slate-700 rounded text-slate-300 text-xs py-1.5 px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        />
                                        <button
                                            onClick={() => handleRemoveFeature(plan.id, idx)}
                                            className="text-slate-600 hover:text-red-400 p-1.5 rounded hover:bg-slate-800 transition-colors opacity-50 group-hover:opacity-100"
                                            title="Eliminar característica"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {(plan.features || []).length === 0 && (
                                    <p className="text-xs text-slate-600 italic text-center py-2">Sin características. Agrega una.</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Legal Editor */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mt-8">
                <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-bold text-white">Configuración Legal (Footer)</h3>
                </div>

                {settings.filter(s => s.key === 'legal_disclaimer_plans').map(setting => (
                    <div key={setting.key}>
                        <label className="text-xs text-slate-400 block mb-2 font-mono uppercase">{setting.description}</label>
                        <textarea
                            value={setting.value}
                            onChange={(e) => setSettings(prev => prev.map(s => s.key === setting.key ? { ...s, value: e.target.value } : s))}
                            className="w-full h-24 bg-slate-900 border-slate-600 rounded text-slate-300 text-sm p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="mt-4 text-right">
                            <button
                                onClick={() => saveSetting(setting.key, setting.value)}
                                disabled={saving === setting.key}
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-900/20"
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