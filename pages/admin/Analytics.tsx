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
    RefreshCw
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
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!stats) return <div className="p-8 text-center text-slate-500 font-sans">No analytics data available.</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-sans">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Business Intelligence</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Deep dive into user behavior and platform health</p>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#0A0D13] p-5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">ACTIVE</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.usageMetrics.activeRecorders}</div>
                    <div className="text-xs text-slate-500 mt-1">Users with recordings</div>
                </div>

                <div className="bg-white dark:bg-[#0A0D13] p-5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{Math.round(stats.usageMetrics.totalMinutes).toLocaleString()}</div>
                    <div className="text-xs text-slate-500 mt-1">Total minutes processed</div>
                </div>

                <div className="bg-white dark:bg-[#0A0D13] p-5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                            <HardDrive className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.usageMetrics.totalStorageGB.toFixed(2)} GB</div>
                    <div className="text-xs text-slate-500 mt-1">Cloud storage used</div>
                </div>

                <div className="bg-white dark:bg-[#0A0D13] p-5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <Mic className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.featureAdoption.totalRecordings.toLocaleString()}</div>
                    <div className="text-xs text-slate-500 mt-1">Total recordings made</div>
                </div>
            </div>

            {/* Charts Row 1: Plans & Devices */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#0A0D13] p-6 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-6">Subscription Breakdown</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.planDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.planDistribution.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value: any, name: any, props: any) => [`${value} (${props.payload.percentage}%)`, name]}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0A0D13] p-6 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-6">Device Distribution (User Choice)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.deviceDistribution}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888810" />
                                <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} />
                                <YAxis fontSize={12} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: '#88888810' }}
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
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
            <div className="bg-white dark:bg-[#0A0D13] p-6 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-8">Feature Adoption Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
                            <Chrome className="w-8 h-8 text-orange-500" />
                        </div>
                        <div className="text-xl font-bold text-slate-900 dark:text-white">{stats.featureAdoption.extensionUsage}</div>
                        <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Chrome Extension</div>
                        <p className="text-[10px] text-slate-400 mt-2 max-w-[150px]">Recordings from browser extension</p>
                    </div>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                            <Layers className="w-8 h-8 text-blue-500" />
                        </div>
                        <div className="text-xl font-bold text-slate-900 dark:text-white">{stats.featureAdoption.multiAudioUsage}</div>
                        <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Multi-Audio</div>
                        <p className="text-[10px] text-slate-400 mt-2 max-w-[150px]">Sessions with multiple segments</p>
                    </div>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                            <Mic className="w-8 h-8 text-green-500" />
                        </div>
                        <div className="text-xl font-bold text-slate-900 dark:text-white">{stats.featureAdoption.liveUsage}</div>
                        <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Live Recordings</div>
                        <p className="text-[10px] text-slate-400 mt-2 max-w-[150px]">Recordings made live in-app</p>
                    </div>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900/20 rounded-full flex items-center justify-center mb-4">
                            <HardDrive className="w-8 h-8 text-slate-500" />
                        </div>
                        <div className="text-xl font-bold text-slate-900 dark:text-white">{stats.featureAdoption.uploadUsage}</div>
                        <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Files Uploaded</div>
                        <p className="text-[10px] text-slate-400 mt-2 max-w-[150px]">MP3/Audio files uploaded manually</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
