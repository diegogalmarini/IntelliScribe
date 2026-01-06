import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { AdminStats } from '../../types';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Clock,
    DollarSign,
    Activity, // Replaced Insights with Activity
    RefreshCw
} from 'lucide-react';

/**
 * Admin Overview Page
 * Displays business intelligence KPIs: MRR, users, usage, costs, margins
 * Refactored to Minimalist Light Theme
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
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-slate-400 text-sm">Loading statistics...</p>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                        <Activity className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{error || 'Failed to load data'}</p>
                    <button
                        onClick={loadStats}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
            icon: DollarSign,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-500/10'
        },
        {
            title: 'Active Users',
            value: stats.activeUsers.toLocaleString(),
            subtitle: `of ${stats.totalUsers} total`,
            change: stats.userGrowth,
            icon: Users,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-500/10'
        },
        {
            title: 'Total Minutes Used',
            value: stats.totalMinutesUsed.toLocaleString(),
            subtitle: 'across all users',
            icon: Clock,
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-100 dark:bg-purple-500/10'
        },
        {
            title: 'Estimated Cost',
            value: `$${stats.estimatedCost.toLocaleString()}`,
            subtitle: 'Twilio usage',
            icon: Activity, // Replaced ReceiptLong
            color: 'text-orange-600 dark:text-orange-400',
            bgColor: 'bg-orange-100 dark:bg-orange-500/10'
        },
        {
            title: 'Gross Profit',
            value: `$${stats.grossProfit.toLocaleString()}`,
            subtitle: 'Revenue - Cost',
            icon: TrendingUp,
            color: stats.grossProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
            bgColor: stats.grossProfit >= 0 ? 'bg-green-100 dark:bg-green-500/10' : 'bg-red-100 dark:bg-red-500/10'
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Business Overview</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time KPIs and performance metrics</p>
                </div>
                <button
                    onClick={loadStats}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 text-sm font-medium transition-colors shadow-sm"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {statCards.map((card, index) => (
                    <div
                        key={index}
                        className="bg-white dark:bg-[#0A0D13] border border-slate-200 dark:border-[#1f1f1f] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-2.5 rounded-lg ${card.bgColor}`}>
                                <card.icon className={`w-5 h-5 ${card.color}`} />
                            </div>

                            {card.change !== undefined && (
                                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${card.change >= 0
                                        ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                                        : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                                    }`}>
                                    {card.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    <span>{Math.abs(card.change)}%</span>
                                </div>
                            )}
                        </div>

                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{card.title}</h3>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{card.value}</div>
                        {card.subtitle && (
                            <p className="text-xs text-slate-400 dark:text-slate-500">{card.subtitle}</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Margin Analysis Section */}
            <div className="bg-white dark:bg-[#0A0D13] border border-slate-200 dark:border-[#1f1f1f] rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Profit Margin Analysis
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x divide-slate-100 dark:divide-[#1f1f1f]">
                    <div className="md:pr-8">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Revenue (MRR)</div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            ${stats.mrr.toLocaleString()}
                        </div>
                    </div>

                    <div className="md:px-8">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Costs (Est.)</div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            ${stats.estimatedCost.toLocaleString()}
                        </div>
                    </div>

                    <div className="md:pl-8">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Net Margin</div>
                        <div className={`text-3xl font-bold tracking-tight ${stats.grossProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            ${stats.grossProfit.toLocaleString()}
                        </div>
                        <div className="text-xs font-medium text-slate-500 mt-1">
                            {stats.mrr > 0
                                ? `${Math.round((stats.grossProfit / stats.mrr) * 100)}% margin`
                                : 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="mt-8">
                    <div className="flex items-center justify-between text-xs font-medium mb-2">
                        <span className="text-slate-500">Cost Ratio</span>
                        <span className="text-slate-700 dark:text-slate-300">
                            {stats.mrr > 0
                                ? `${Math.round((stats.estimatedCost / stats.mrr) * 100)}%`
                                : 'N/A'}
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-orange-500 h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                                width: stats.mrr > 0
                                    ? `${Math.min((stats.estimatedCost / stats.mrr) * 100, 100)}%`
                                    : '0%'
                            }}
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        Lower cost ratio equals higher profit margin. Target &lt; 20%.
                    </p>
                </div>
            </div>
        </div>
    );
};
