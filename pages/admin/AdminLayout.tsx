import React from 'react';
import { UserProfile, AppRoute } from '../../types';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Tag, // Using Tag or DollarSign for Plans
    LogOut,
    Menu,
    X,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    currentRoute: AppRoute;
    onNavigate: (route: AppRoute) => void;
    user: UserProfile;
    children: React.ReactNode;
}

/**
 * AdminLayout - Minimalist Light Theme
 * Matches the main application design language (SettingsModal, IntelligenceDashboard).
 */
export const AdminLayout: React.FC<Props> = ({
    currentRoute,
    onNavigate,
    user,
    children
}) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    const navItems = [
        {
            route: AppRoute.ADMIN_OVERVIEW,
            icon: LayoutDashboard,
            label: 'Overview',
        },
        {
            route: AppRoute.ADMIN_USERS,
            icon: Users,
            label: 'Users',
        },
        {
            route: AppRoute.ADMIN_FINANCIALS,
            icon: CreditCard,
            label: 'Financials',
        },
        {
            route: AppRoute.ADMIN_PLANS,
            icon: Tag,
            label: 'Plans & Pricing',
        }
    ];

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white overflow-hidden font-sans">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-white dark:bg-[#0A0D13] border-b border-slate-200 dark:border-[#1f1f1f] z-20 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span>Admin</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg"
                >
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Admin Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-10 w-64 bg-white dark:bg-[#0A0D13] border-r border-slate-200 dark:border-[#1f1f1f] flex flex-col transition-transform duration-200
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Header */}
                <div className="p-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <Shield size={18} fill="currentColor" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-slate-900 dark:text-white leading-none">
                                Diktalo
                            </h1>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Administration</span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = currentRoute === item.route;
                        return (
                            <button
                                key={item.route}
                                onClick={() => {
                                    onNavigate(item.route);
                                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
                                    }`}
                            >
                                <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Footer Controls */}
                <div className="p-4 border-t border-slate-100 dark:border-[#1f1f1f]">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        {user.avatarUrl ? (
                            <img
                                src={user.avatarUrl}
                                alt={user.firstName}
                                className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-[#1f1f1f]"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-xs">
                                {user.firstName?.[0] || 'A'}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                {user.firstName}
                            </div>
                            <div className="text-xs text-slate-500 truncate">Administrator</div>
                        </div>
                    </div>

                    <button
                        onClick={() => onNavigate(AppRoute.DASHBOARD)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg text-sm font-medium transition-colors"
                    >
                        <LogOut size={16} />
                        <span>Exit Admin</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto pt-16 md:pt-0">
                <div className="max-w-[1600px] mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};