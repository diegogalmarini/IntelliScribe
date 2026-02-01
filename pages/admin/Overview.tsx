import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { AdminStats } from '../../types';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Clock,
    DollarSign,
    Activity,
    RefreshCw,
    Chrome,
    Layers,
    Mic,
    Monitor,
    HardDrive,
    Zap,
    Shield
} from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

/**
 * Admin Overview Page (Consolidated with Analytics)
 * Single comprehensive dashboard with business KPIs and visual analytics
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

    // Determine if we're in beta mode (MRR is 0)
    const isBetaMode = stats.mrr === 0;

    const topCards = [
        {
            title: 'Monthly Revenue',
            value: isBetaMode ? '$0.00' : `$${stats.mrr.toLocaleString()}`,
            subtitle: isBetaMode ? 'Beta Mode - Trial Users' : undefined,
            change: stats.mrrGrowth,
            icon: DollarSign,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-500/10',
            badge: isBetaMode ? 'BETA' : undefined
        },
        {
            title: 'Active Users',
            value: stats.usageMetrics?.activeRecorders || stats.activeUsers.toLocaleString(),
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
            title: 'Twilio Costs',
            value: `$${Number(stats.costs?.twilio || stats.estimatedCost || 0).toFixed(2)}`,
            subtitle: 'Current month',
            icon: Zap,
            color: 'text-orange-600 dark:text-orange-400',
            bgColor: 'bg-orange-100 dark:bg-orange-500/10'
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header with Beta Badge */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Business Overview</h1>
                        {isBetaMode && (
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full">
                                BETA MODE
                            </span>
                        )}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Real-time KPIs and performance metrics{isBetaMode ? ' • All users are trial accounts' : ''}
                    </p>
                </div>
                <button
                    onClick={loadStats}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 text-sm font-medium transition-colors shadow-sm"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {topCards.map((card, index) => (
                    <div
                        key={index}
                        className="bg-white dark:bg-[#0A0D13] border border-slate-200 dark:border-[#1f1f1f] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-2.5 rounded-lg ${card.bgColor}`}>
                                <card.icon className={`w-5 h-5 ${card.color}`} />
                            </div>

                            {card.badge && (
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full tracking-wider">
                                    {card.badge}
                                </span>
                            )}

                            {card.change !== undefined && !card.badge && (
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

            {/* Infrastructure Costs Section */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200/60 dark:border-red-900/30 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-red-600" />
                    Infrastructure Costs (Monthly)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Twilio */}
                    <div className="bg-white dark:bg-[#0A0D13] p-4 rounded-xl border border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-orange-500" />
                            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Twilio</h3>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            ${Number(stats.costs?.twilio || stats.estimatedCost || 0).toFixed(2)}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Telephony & SMS</p>
                    </div>

                    {/* Vercel */}
                    <div className="bg-white dark:bg-[#0A0D13] p-4 rounded-xl border border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Monitor className="w-4 h-4 text-blue-500" />
                            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Vercel</h3>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            $20.00
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Hosting (Pro Plan)</p>
                    </div>

                    {/* Supabase */}
                    <div className="bg-white dark:bg-[#0A0D13] p-4 rounded-xl border border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <HardDrive className="w-4 h-4 text-green-500" />
                            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Supabase</h3>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            $0.00
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Free Tier (Paused Project)</p>
                    </div>
                </div>

                {/* Total Infrastructure Cost */}
                <div className="mt-6 pt-4 border-t border-red-200/60 dark:border-red-900/30">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total Monthly Infrastructure Cost</span>
                        <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                            ${(Number(stats.costs?.twilio || stats.estimatedCost || 0) + 20).toFixed(2)}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 italic">
                        Twilio ${Number(stats.costs?.twilio || 0).toFixed(2)} + Vercel $20.00 + Supabase $0.00
                    </p>
                </div>
            </div>

            {/* Charts Section (if analytics data available) */}
            {stats.planDistribution && stats.deviceDistribution && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Plan Distribution */}
                    <div className="bg-white dark:bg-[#0A0D13] p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-6 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
                            Subscription Tiers {isBetaMode && '(Trial)'}
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.planDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={75}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stats.planDistribution.map((entry: any, index: number) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                                className="hover:opacity-80 transition-opacity"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(10, 13, 19, 0.95)',
                                            backdropFilter: 'blur(8px)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                            fontSize: '11px',
                                            padding: '10px'
                                        }}
                                        itemStyle={{ color: '#fff', padding: '2px 0' }}
                                        formatter={(value: any, name: any, props: any) => [`${value} users (${props.payload.percentage}%)`, name.toUpperCase()]}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        iconSize={8}
                                        formatter={(value) => <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Device Distribution */}
                    <div className="bg-white dark:bg-[#0A0D13] p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-6 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
                            Access Modality
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.deviceDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                                    <XAxis
                                        dataKey="name"
                                        fontSize={10}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontWeight: 500 }}
                                    />
                                    <YAxis
                                        fontSize={10}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontWeight: 500 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(148, 163, 184, 0.05)', radius: 4 }}
                                        contentStyle={{
                                            backgroundColor: 'rgba(10, 13, 19, 0.95)',
                                            backdropFilter: 'blur(8px)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            fontSize: '11px'
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                                        {stats.deviceDistribution.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Feature Usage Section */}
            {stats.featureAdoption && (
                <div className="bg-white dark:bg-[#0A0D13] p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-8 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1 h-3 bg-pink-500 rounded-full"></div>
                        Core Feature Adoption (Real Data)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Chrome, value: stats.featureAdoption.extensionUsage, label: 'Extension', color: 'orange', desc: 'Browser capture flow' },
                            { icon: Layers, value: stats.featureAdoption.multiAudioUsage, label: 'Multi-Audio', color: 'blue', desc: 'Complex segment sessions' },
                            { icon: Mic, value: stats.featureAdoption.liveUsage, label: 'Live', color: 'green', desc: 'Direct in-app recording' },
                            { icon: Monitor, value: stats.featureAdoption.uploadUsage, label: 'Uploads', color: 'slate', desc: 'Manual legacy imports' }
                        ].map((feature, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center group">
                                <div className={`w-14 h-14 bg-${feature.color}-50/50 dark:bg-${feature.color}-900/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className={`w-6 h-6 text-${feature.color}-500/80`} />
                                </div>
                                <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                                    {feature.value.toLocaleString()}
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                    {feature.label}
                                </div>
                                <p className="text-[10px] text-slate-500/70 mt-2 font-medium leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center py-4 border-t border-slate-100 dark:border-white/5">
                <div className="text-[11px] text-slate-400 font-medium italic">
                    {isBetaMode
                        ? 'Beta Mode: All users are trial accounts. Real Twilio/Stripe data shown.'
                        : 'Financial data sourced directly from Stripe & Twilio APIs.'
                    }
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[11px] font-bold text-slate-500 tracking-tight">SYSTEM STATUS: OPTIMAL</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
