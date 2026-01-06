import React, { useEffect, useState } from 'react';
import { PhoneCall } from '../../types';
import { adminService } from '../../services/adminService';
import { RefreshCw, Phone, Clock, DollarSign } from 'lucide-react';

/**
 * Admin Financials Page
 * Shows recent phone calls, costs, and financial tracking
 * Refactored to Minimalist Light Theme
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
                <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-slate-400 text-sm">Loading logs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Financials & Call Logs</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Track phone call usage and costs</p>
                </div>
                <button
                    onClick={loadCalls}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 text-sm font-medium transition-colors shadow-sm"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh Data</span>
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#0A0D13] border border-slate-200 dark:border-[#1f1f1f] rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <Phone className="w-5 h-5" />
                        </div>
                        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Calls</div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">{calls.length}</div>
                </div>

                <div className="bg-white dark:bg-[#0A0D13] border border-slate-200 dark:border-[#1f1f1f] rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Minutes</div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalMinutes}</div>
                </div>

                <div className="bg-white dark:bg-[#0A0D13] border border-slate-200 dark:border-[#1f1f1f] rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Estimated Cost</div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">${totalCost.toFixed(2)}</div>
                </div>
            </div>

            {/* Calls Table */}
            <div className="bg-white dark:bg-[#0A0D13] border border-slate-200 dark:border-[#1f1f1f] rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-[#1f1f1f]">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">From</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">To</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cost</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-[#1f1f1f]">
                            {calls.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                                        No phone calls recorded yet
                                    </td>
                                </tr>
                            ) : (
                                calls.map((call) => (
                                    <tr key={call.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-900 dark:text-white">{call.userName}</div>
                                            <div className="text-xs text-slate-500">{call.userEmail}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-mono">{call.from}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-mono">{call.to}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{call.duration}</td>
                                        <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                                            ${call.cost.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{call.date}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
