import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
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
    LineChart,
    Line,
    Legend
} from 'recharts';
import {
    Users,
    Smartphone,
    Monitor,
    Tablet,
    Mic,
    Chrome,
    Layers,
    Clock,
    HardDrive,
    RefreshCw,
    TrendingUp,
    CreditCard,
    DollarSign,
    Zap
} from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export const Analytics: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        const data = await adminService.getAnalyticsStats();
        setStats(data);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500/50" />
            </div>
        );
    }

    if (!stats) return <div className="p-8 text-center text-slate-500 font-sans">No analytics data available.</div>;

    const topCards = [
        {
            label: 'Active Users',
            value: stats.usageMetrics.activeRecorders,
            icon: Users,
            color: 'blue',
            badge: 'ACTIVE'
        },
        {
            label: 'Revenue (MRR)',
            value: `${Number(stats.revenue?.mrr || 0).toLocaleString()} ${stats.revenue?.currency?.toUpperCase() || 'EUR'}`,
            icon: TrendingUp,
            color: 'emerald',
            secondary: `Balance: ${Number(stats.revenue?.balance || 0).toLocaleString()}`
        },
        {
            label: 'Twilio Costs',
            value: `${Number(stats.costs?.twilio || 0).toFixed(2)}$`,
            icon: Zap,
            color: 'amber',
            secondary: 'Current month'
        },
        {
            label: 'Storage Used',
            value: `${Number(stats.usageMetrics?.totalStorageGB || 0).toFixed(2)} GB`,
            icon: HardDrive,
            color: 'pink'
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-700 font-sans max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Business Intelligence</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-medium">Real-time performance and financial metrics</p>
                </div>
                <button
                    onClick={loadStats}
                    className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                    title="Refresh Data"
                >
                    <RefreshCw className="w-4 h-4 text-slate-500" />
                </button>
            </div>

            {/* Top Cards - Refined for "Premium" look */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {topCards.map((card, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#0A0D13] p-4 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all">
                        <div className="flex justify-between items-start mb-3">
                            <div className={`p-2 bg-${card.color}-50 dark:bg-${card.color}-900/10 rounded-xl`}>
                                <card.icon className={`w-4 h-4 text-${card.color}-600 dark:text-${card.color}-400`} />
                            </div>
                            {card.badge && (
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full tracking-wider">
                                    {card.badge}
                                </span>
                            )}
                        </div>
                        <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {card.value}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{card.label}</div>
                            {card.secondary && (
                                <div className="text-[10px] text-slate-400 font-medium italic">{card.secondary}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row 1: Plans & Devices */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#0A0D13] p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-6 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
                        Subscription Tiers
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

            {/* Feature Usage Section */}
            <div className="bg-white dark:bg-[#0A0D13] p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-8 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-3 bg-pink-500 rounded-full"></div>
                    Core Feature Adoption
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

            <div className="flex justify-between items-center py-4 border-t border-slate-100 dark:border-white/5">
                <div className="text-[11px] text-slate-400 font-medium italic">
                    All financial data sourced directly from Stripe & Twilio APIs.
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
