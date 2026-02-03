import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { MinutePack } from '../../types';
import { Plus, Trash2, Save, RefreshCw, AlertCircle, Check, ArrowUp, ArrowDown } from 'lucide-react';

export const MinuteSalesEditor: React.FC = () => {
    const [packs, setPacks] = useState<MinutePack[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [successId, setSuccessId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await adminService.getMinutePacks();
        setPacks(data);
        setLoading(false);
    };

    const handlePackChange = (id: string, field: keyof MinutePack, value: any) => {
        setPacks(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const savePack = async (pack: MinutePack) => {
        setSavingId(pack.id);
        setSuccessId(null);

        const success = await adminService.updateMinutePack(pack.id, pack);

        setSavingId(null);
        if (success) {
            setSuccessId(pack.id);
            setTimeout(() => setSuccessId(null), 3000);
        }
    };

    const addPack = async () => {
        const newPack: Partial<MinutePack> = {
            name: 'Nuevo Pack',
            minutes: 30,
            price: 10,
            checkout_url: '',
            is_active: true,
            order: packs.length > 0 ? Math.max(...packs.map(p => p.order)) + 1 : 1
        };

        const success = await adminService.createMinutePack(newPack);
        if (success) loadData();
    };

    const deletePack = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este pack? Los usuarios ya no podrán comprarlo.')) return;

        const success = await adminService.deleteMinutePack(id);
        if (success) loadData();
    };

    const movePack = async (id: string, direction: 'up' | 'down') => {
        const index = packs.findIndex(p => p.id === id);
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === packs.length - 1) return;

        const newPacks = [...packs];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap orders
        const tempOrder = newPacks[index].order;
        newPacks[index].order = newPacks[swapIndex].order;
        newPacks[swapIndex].order = tempOrder;

        // Update local state for immediate feedback
        setPacks(newPacks.sort((a, b) => a.order - b.order));

        // Persist both changes
        await Promise.all([
            adminService.updateMinutePack(newPacks[index].id, { order: newPacks[index].order }),
            adminService.updateMinutePack(newPacks[swapIndex].id, { order: newPacks[swapIndex].order })
        ]);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-slate-400 gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
            <span className="text-sm">Cargando packs de minutos...</span>
        </div>
    );

    return (
        <div className="pb-20 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Venta de Minutos (Packs)</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Gestiona los paquetes de minutos adicionales que pueden comprar tus usuarios.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadData}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 text-sm font-medium transition-colors shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Recargar</span>
                    </button>
                    <button
                        onClick={addPack}
                        className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Crear Pack</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {packs.map((pack, idx) => (
                    <div key={pack.id} className={`bg-white dark:bg-[#0A0D13] rounded-xl border p-6 space-y-6 transition-all shadow-sm hover:shadow-md border-slate-200 dark:border-[#1f1f1f]`}>
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex-1 min-w-[280px]">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">ID: {pack.id.split('-')[0]}...</span>
                                    <div className="flex gap-1">
                                        <button onClick={() => movePack(pack.id, 'up')} disabled={idx === 0} className="p-1 text-slate-400 hover:text-blue-500 disabled:opacity-30"><ArrowUp size={14} /></button>
                                        <button onClick={() => movePack(pack.id, 'down')} disabled={idx === packs.length - 1} className="p-1 text-slate-400 hover:text-blue-500 disabled:opacity-30"><ArrowDown size={14} /></button>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    value={pack.name}
                                    onChange={(e) => handlePackChange(pack.id, 'name', e.target.value)}
                                    className="block w-full bg-transparent text-xl font-black text-slate-900 dark:text-white border-none focus:ring-0 p-0 placeholder-slate-400 focus:outline-none"
                                    placeholder="Nombre del Pack (ej: Pack Empresa)"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer bg-slate-100 dark:bg-white/5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={pack.is_active}
                                        onChange={(e) => handlePackChange(pack.id, 'is_active', e.target.checked)}
                                        className="rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-offset-0"
                                    />
                                    Pack Activo
                                </label>

                                <button
                                    onClick={() => deletePack(pack.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                    title="Eliminar Pack"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={() => savePack(pack)}
                                    disabled={savingId === pack.id}
                                    className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${successId === pack.id
                                        ? 'bg-green-600 text-white shadow-green-500/20'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                                        } disabled:opacity-50`}
                                >
                                    {savingId === pack.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : (successId === pack.id ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />)}
                                    <span>{savingId === pack.id ? 'Guardando...' : (successId === pack.id ? '¡Listo!' : 'Guardar')}</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 dark:bg-white/5 p-5 rounded-xl border border-slate-100 dark:border-white/5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Minutos Incluidos</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={pack.minutes}
                                        onChange={(e) => handlePackChange(pack.id, 'minutes', parseInt(e.target.value))}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none font-bold"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">MIN</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Precio Final (€)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={pack.price}
                                        onChange={(e) => handlePackChange(pack.id, 'price', parseFloat(e.target.value))}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none font-bold"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">EUR</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">URL de Pago / Stripe Link</label>
                                <input
                                    type="text"
                                    value={pack.checkout_url}
                                    onChange={(e) => handlePackChange(pack.id, 'checkout_url', e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-xs font-mono"
                                    placeholder="https://buy.stripe.com/..."
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {packs.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10">
                        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400">No hay packs configurados</h3>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mb-6">Empieza creando tu primer paquete de minutos para vender.</p>
                        <button
                            onClick={addPack}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg"
                        >
                            Crear Primer Pack
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
