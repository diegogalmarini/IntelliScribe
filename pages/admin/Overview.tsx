import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { AdminStats } from '../../types';

/**
 * Admin Overview Page
 * Displays business intelligence KPIs: MRR, users, usage, costs, margins
 */
export const Overview: React.FC = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        setError(null);

        const data = await adminService.getStats();

        if (data) {
            setStats(data);
        } else {
            setError('Failed to load statistics');
        }

        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin material-symbols-outlined text-4xl text-amber-400">
                        progress_activity
                    </div>
                    <p className="text-slate-400">Loading statistics...</p>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3 text-center">
                    <span className="material-symbols-outlined text-5xl text-red-500">error</span>
                    <p className="text-red-400">{error || 'Failed to load data'}</p>
                    <button
                        onClick={loadStats}
                        className="px-4 py-2 bg-amber-500 text-slate-900 rounded-lg hover:bg-amber-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Monthly Recurring Revenue',
            value: `$${stats.mrr.toLocaleString()}`,
            change: stats.mrrGrowth,
            icon: 'payments',
            color: 'text-green-400',
            bgColor: 'bg-green-500/10'
        },
        {
            title: 'Active Users',
            value: stats.activeUsers.toLocaleString(),
            subtitle: `of ${stats.totalUsers} total`,
            change: stats.userGrowth,
            icon: 'person',
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10'
        },
        {
            title: 'Total Minutes Used',
            value: stats.totalMinutesUsed.toLocaleString(),
            subtitle: 'across all users',
            icon: 'schedule',
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10'
        },
        {
            title: 'Estimated Cost',
            value: `$${stats.estimatedCost.toLocaleString()}`,
            subtitle: 'Twilio usage',
            icon: 'receipt_long',
            color: 'text-orange-400',
            bgColor: 'bg-orange-500/10'
        },
        {
            title: 'Gross Profit',
            value: `$${stats.grossProfit.toLocaleString()}`,
            subtitle: 'Revenue - Cost',
            icon: 'trending_up',
            color: stats.grossProfit >= 0 ? 'text-green-400' : 'text-red-400',
            bgColor: stats.grossProfit >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
        }
    ];

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Business Overview</h1>
                <p className="text-slate-400">Real-time KPIs and performance metrics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {statCards.map((card, index) => (
                    <div
                        key={index}
                        className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-lg ${card.bgColor}`}>
                                <span className={`material-symbols-outlined text-2xl ${card.color}`}>
                                    {card.icon}
                                </span>
                            </div>

                            {card.change !== undefined && (
                                <div className={`flex items-center gap-1 text-sm ${card.change >= 0 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    <span className="material-symbols-outlined text-sm">
                                        {card.change >= 0 ? 'trending_up' : 'trending_down'}
                                    </span>
                                    <span>{Math.abs(card.change)}%</span>
                                </div>
                            )}
                        </div>

                        <h3 className="text-sm text-slate-400 mb-2">{card.title}</h3>
                        <div className="text-3xl font-bold text-white mb-1">{card.value}</div>
                        {card.subtitle && (
                            <p className="text-xs text-slate-500">{card.subtitle}</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Margin Analysis */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400">insights</span>
                    Profit Margin Analysis
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <div className="text-sm text-slate-400 mb-1">Revenue (MRR)</div>
                        <div className="text-2xl font-bold text-green-400">
                            ${stats.mrr.toLocaleString()}
                        </div>
                    </div>

                    <div>
                        <div className="text-sm text-slate-400 mb-1">Costs (Estimated)</div>
                        <div className="text-2xl font-bold text-orange-400">
                            ${stats.estimatedCost.toLocaleString()}
                        </div>
                    </div>

                    <div>
                        <div className="text-sm text-slate-400 mb-1">Net Margin</div>
                        <div className={`text-2xl font-bold ${stats.grossProfit >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                            ${stats.grossProfit.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            {stats.mrr > 0
                                ? `${Math.round((stats.grossProfit / stats.mrr) * 100)}% margin`
                                : 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="mt-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-400">Cost Ratio</span>
                        <span className="text-slate-400">
                            {stats.mrr > 0
                                ? `${Math.round((stats.estimatedCost / stats.mrr) * 100)}%`
                                : 'N/A'}
                        </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-orange-400 h-full transition-all duration-500"
                            style={{
                                width: stats.mrr > 0
                                    ? `${Math.min((stats.estimatedCost / stats.mrr) * 100, 100)}%`
                                    : '0%'
                            }}
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        Lower cost ratio = higher profit margin
                    </p>
                </div>
            </div>

            {/* Refresh Button */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={loadStats}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                >
                    <span className="material-symbols-outlined text-lg">refresh</span>
                    <span>Refresh Data</span>
                </button>
            </div>
        </div>
    );
};
