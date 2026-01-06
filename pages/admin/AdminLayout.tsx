import React from 'react';
import { UserProfile, AppRoute } from '../../types';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Tag,
    LogOut,
    Menu,
    X,
    Shield,
    ChevronLeft
} from 'lucide-react';

interface Props {
    currentRoute: AppRoute;
    onNavigate: (route: AppRoute) => void;
    user: UserProfile;
    children: React.ReactNode;
}

/**
 * AdminLayout - Minimalist Light Theme Sub-Navigation
 * Designed to sit alongside the main app sidebar.
 * Removed redundant Logo/Header and Profile Footer.
 */
export const AdminLayout: React.FC<Props> = ({
    currentRoute,
    onNavigate,
    user,
    children
}) => {
    // Default open on desktop, closed on mobile
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
            {/* Mobile Header (Only visible on small screens) */}
            <div className="md:hidden fixed top-0 w-full bg-white dark:bg-[#0A0D13] border-b border-slate-200 dark:border-[#1f1f1f] z-20 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
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

            {/* Admin Sub-Sidebar / Navigation Panel */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-10 w-64 bg-white/50 dark:bg-[#0A0D13]/50 border-r border-slate-200 dark:border-[#1f1f1f] flex flex-col transition-transform duration-200 backdrop-blur-xl
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">
                        Administration
                    </div>
                    {navItems.map((item) => {
                        const isActive = currentRoute === item.route;
                        return (
                            <button
                                key={item.route}
                                onClick={() => {
                                    onNavigate(item.route);
                                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-white/10'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
                                    }`}
                            >
                                <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Exit Button */}
                <div className="p-4 border-t border-slate-100 dark:border-[#1f1f1f]">
                    <button
                        onClick={() => onNavigate(AppRoute.DASHBOARD)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-sm font-medium transition-colors"
                    >
                        <ChevronLeft size={16} />
                        <span>Back to Dashboard</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto pt-16 md:pt-0 bg-slate-50 dark:bg-[#050505]">
                <div className="max-w-[1200px] mx-auto p-6 md:p-10">
                    {children}
                </div>
            </main>
        </div>
    );
};