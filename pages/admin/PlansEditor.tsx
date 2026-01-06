import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { PlanConfig, AppSetting } from '../../types';
import { Plus, Trash2, Save, RefreshCw, AlertCircle, Check } from 'lucide-react';

export const PlansEditor: React.FC = () => {
    const [plans, setPlans] = useState<PlanConfig[]>([]);
    const [settings, setSettings] = useState<AppSetting[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados para controlar visualmente qué botón está cargando o tuvo éxito
    const [savingId, setSavingId] = useState<string | null>(null);
    const [successId, setSuccessId] = useState<string | null>(null);

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

    const savePlan = async (plan: PlanConfig) => {
        setSavingId(plan.id);
        setSuccessId(null);

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

        setSavingId(null);

        if (success) {
            setSuccessId(plan.id);
            setTimeout(() => setSuccessId(null), 3000);
        }
    };

    const saveSetting = async (key: string, value: string) => {
        setSavingId(key);
        const success = await adminService.updateAppSetting(key, value);
        setSavingId(null);
        if (success) {
            setSuccessId(key);
            setTimeout(() => setSuccessId(null), 3000);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-slate-400 gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
            <span className="text-sm">Cargando configuración...</span>
        </div>
    );

    return (
        <div className="pb-20 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Editor de Planes y Precios</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Gestiona lo que ven tus usuarios en tiempo real.</p>
                </div>
                <button
                    onClick={loadData}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 text-sm font-medium transition-colors shadow-sm"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>Recargar Datos</span>
                </button>
            </div>

            {/* Grid de Planes */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {plans.map(plan => (
                    <div key={plan.id} className={`bg-white dark:bg-[#0A0D13] rounded-xl border p-6 space-y-5 transition-all shadow-sm hover:shadow-md ${plan.highlight
                            ? 'border-blue-500 ring-1 ring-blue-500/30'
                            : 'border-slate-200 dark:border-[#1f1f1f]'
                        }`}>

                        {/* Header del Plan */}
                        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="flex-1 mr-4">
                                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">ID: {plan.id}</span>
                                <input
                                    type="text"
                                    value={plan.name}
                                    onChange={(e) => handlePlanChange(plan.id, 'name', e.target.value)}
                                    className="block w-full bg-transparent text-xl font-bold text-slate-900 dark:text-white border-none focus:ring-0 p-0 placeholder-slate-400 focus:outline-none"
                                    placeholder="Nombre del Plan"
                                />
                                <input
                                    type="text"
                                    value={plan.description}
                                    onChange={(e) => handlePlanChange(plan.id, 'description', e.target.value)}
                                    className="block w-full bg-transparent text-sm text-slate-500 dark:text-slate-400 border-none focus:ring-0 p-0 mt-1 focus:outline-none"
                                    placeholder="Descripción corta"
                                />
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer bg-slate-100 dark:bg-white/5 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={plan.highlight}
                                        onChange={(e) => handlePlanChange(plan.id, 'highlight', e.target.checked)}
                                        className="rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-offset-0"
                                    />
                                    Destacado
                                </label>

                                <button
                                    onClick={() => savePlan(plan)}
                                    disabled={savingId === plan.id}
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all shadow-sm ${successId === plan.id
                                        ? 'bg-green-600 text-white shadow-green-500/20'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                                        } disabled:opacity-50`}
                                >
                                    {savingId === plan.id && <RefreshCw className="w-4 h-4 animate-spin" />}
                                    {successId === plan.id && <Check className="w-4 h-4" />}
                                    {!savingId && !successId && <Save className="w-4 h-4" />}

                                    <span>
                                        {savingId === plan.id ? '...' : (successId === plan.id ? '¡Guardado!' : 'Guardar')}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Precios */}
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-lg border border-slate-100 dark:border-slate-800/50">
                            <div className="space-y-2">
                                <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Mensual (€)</label>
                                <input
                                    type="number"
                                    value={plan.price_monthly}
                                    onChange={(e) => handlePlanChange(plan.id, 'price_monthly', parseFloat(e.target.value))}
                                    className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm px-3 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Stripe ID (price_...)"
                                    value={plan.stripe_price_id_monthly}
                                    onChange={(e) => handlePlanChange(plan.id, 'stripe_price_id_monthly', e.target.value)}
                                    className="w-full bg-transparent border-0 border-b border-slate-200 dark:border-slate-700 rounded-none text-slate-400 text-xs font-mono py-1 focus:ring-0 px-0"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Anual (€)</label>
                                <input
                                    type="number"
                                    value={plan.price_annual}
                                    onChange={(e) => handlePlanChange(plan.id, 'price_annual', parseFloat(e.target.value))}
                                    className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm px-3 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Stripe ID (price_...)"
                                    value={plan.stripe_price_id_annual}
                                    onChange={(e) => handlePlanChange(plan.id, 'stripe_price_id_annual', e.target.value)}
                                    className="w-full bg-transparent border-0 border-b border-slate-200 dark:border-slate-700 rounded-none text-slate-400 text-xs font-mono py-1 focus:ring-0 px-0"
                                />
                            </div>
                        </div>

                        {/* Límites Técnicos (Backend) */}
                        <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-lg border border-slate-100 dark:border-slate-800/50">
                            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-500"></span> Límites del Sistema
                            </h4>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase block mb-1">Minutos IA</label>
                                    <input
                                        type="number"
                                        value={plan.limits.transcription_minutes}
                                        onChange={(e) => handleLimitChange(plan.id, 'transcription_minutes', parseInt(e.target.value))}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-mono px-2 py-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase block mb-1">Storage (GB)</label>
                                    <input
                                        type="number"
                                        value={plan.limits.storage_gb || 0}
                                        onChange={(e) => handleLimitChange(plan.id, 'storage_gb', parseInt(e.target.value))}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-mono px-2 py-1"
                                    />
                                </div>
                                {plan.id === 'business_plus' && (
                                    <div>
                                        <label className="text-[10px] text-yellow-600 dark:text-yellow-500 font-bold uppercase block mb-1">Minutos Call</label>
                                        <input
                                            type="number"
                                            value={plan.limits.call_minutes || 0}
                                            onChange={(e) => handleLimitChange(plan.id, 'call_minutes', parseInt(e.target.value))}
                                            className="w-full bg-yellow-50 dark:bg-slate-800 border border-yellow-200 dark:border-yellow-600/50 text-yellow-700 dark:text-yellow-400 rounded-lg text-xs font-mono px-2 py-1"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Features (Visual - Con Botón +) */}
                        <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-lg border border-slate-100 dark:border-slate-800/50">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Características Visuales
                                </h4>
                                <button
                                    onClick={() => handleAddFeature(plan.id)}
                                    className="text-xs flex items-center gap-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg transition-colors shadow-sm"
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
                                            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-xs py-1.5 px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all focus:outline-none shadow-sm"
                                        />
                                        <button
                                            onClick={() => handleRemoveFeature(plan.id, idx)}
                                            className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-50 group-hover:opacity-100"
                                            title="Eliminar característica"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {(plan.features || []).length === 0 && (
                                    <p className="text-xs text-slate-500 italic text-center py-2">Sin características. Agrega una.</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Legal Editor */}
            <div className="bg-white dark:bg-[#0A0D13] rounded-xl border border-slate-200 dark:border-[#1f1f1f] p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Configuración Legal (Footer)</h3>
                </div>

                {settings.filter(s => s.key === 'legal_disclaimer_plans').map(setting => (
                    <div key={setting.key}>
                        <label className="text-xs text-slate-500 block mb-2 font-mono uppercase font-medium">{setting.description}</label>
                        <textarea
                            value={setting.value}
                            onChange={(e) => setSettings(prev => prev.map(s => s.key === setting.key ? { ...s, value: e.target.value } : s))}
                            className="w-full h-24 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-sm p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                        <div className="mt-4 text-right">
                            <button
                                onClick={() => saveSetting(setting.key, setting.value)}
                                disabled={savingId === setting.key}
                                className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-all ${successId === setting.key
                                    ? 'bg-green-600 text-white shadow-green-500/20'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                                    }`}
                            >
                                {savingId === setting.key ? 'Guardando...' : (successId === setting.key ? '¡Guardado!' : 'Guardar Texto Legal')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};