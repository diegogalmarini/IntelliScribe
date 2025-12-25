import React, { useEffect, useState } from 'react';
import { PhoneCall } from '../../types';
import { adminService } from '../../services/adminService';

/**
 * Admin Financials Page
 * Shows recent phone calls, costs, and financial tracking
 */
export const Financials: React.FC = () => {
    const [calls, setCalls] = useState<PhoneCall[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCalls();
    }, []);

    const loadCalls = async () => {
        setLoading(true);
        const data = await adminService.getPhoneCalls(100);
        setCalls(data);
        setLoading(false);
    };

    const totalCost = calls.reduce((sum, call) => sum + call.cost, 0);
    const totalMinutes = calls.reduce((sum, call) => sum + Math.ceil(call.durationSeconds / 60), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin material-symbols-outlined text-4xl text-amber-400">
                    progress_activity
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Financials & Call Logs</h1>
                <p className="text-slate-400">Track phone call usage and costs</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <div className="text-sm text-slate-400 mb-1">Total Calls</div>
                    <div className="text-3xl font-bold text-white">{calls.length}</div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <div className="text-sm text-slate-400 mb-1">Total Minutes</div>
                    <div className="text-3xl font-bold text-blue-400">{totalMinutes}</div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <div className="text-sm text-slate-400 mb-1">Estimated Cost</div>
                    <div className="text-3xl font-bold text-orange-400">${totalCost.toFixed(2)}</div>
                </div>
            </div>

            {/* Calls Table */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">From</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">To</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Duration</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Cost</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {calls.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        No phone calls recorded yet
                                    </td>
                                </tr>
                            ) : (
                                calls.map((call) => (
                                    <tr key={call.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-white font-medium">{call.userName}</div>
                                            <div className="text-xs text-slate-400">{call.userEmail}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-300">{call.from}</td>
                                        <td className="px-6 py-4 text-sm text-slate-300">{call.to}</td>
                                        <td className="px-6 py-4 text-sm text-slate-300">{call.duration}</td>
                                        <td className="px-6 py-4 text-sm text-orange-400 font-medium">
                                            ${call.cost.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400">{call.date}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4 flex justify-end">
                <button
                    onClick={loadCalls}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                >
                    <span className="material-symbols-outlined text-lg">refresh</span>
                    <span>Refresh</span>
                </button>
            </div>
        </div>
    );
};
