import React from 'react';
import { UserProfile, AppRoute } from '../../types';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Tag,
    BarChart,
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
 * AdminLayout - Styled to match MinimalSidebar.tsx exactly
 * Effectively replaces the main Sidebar when in Admin mode.
 */
export const AdminLayout: React.FC<Props> = ({
    currentRoute,
    onNavigate,
    user,
    children
}) => {
    // Default open on desktop, closed on mobile (matching standard behavior if we want)
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false); // Mobile state

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
        },
        {
            route: AppRoute.ADMIN_ANALYTICS,
            icon: BarChart,
            label: 'Analytics',
        }
    ];

    return (
        <div className="flex h-screen bg-white dark:bg-black overflow-hidden font-sans">
            {/* Mobile Header (Only visible on small screens to toggle sidebar) */}
            <div className="md:hidden fixed top-0 w-full bg-white dark:bg-[#050505] border-b border-black/[0.05] dark:border-white/[0.05] z-20 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img
                        src={document.documentElement.classList.contains('dark') ? '/logo-diktalo-b.svg' : '/logo-diktalo.svg'}
                        alt="Diktalo"
                        className="h-6 w-auto"
                    />
                    <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">Admin</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 text-[#676767] dark:text-[#c5c5c5] hover:bg-[#f0f0f0] dark:hover:bg-white/[0.08] rounded-lg"
                >
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Admin Sidebar - Matching MinimalSidebar.tsx styles */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-30 w-64 h-full bg-white dark:bg-[#050505] 
                border-r border-black/[0.05] dark:border-white/[0.05] flex flex-col 
                transition-transform duration-200 
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Header / Logo Area */}
                <div className="p-3 border-b border-black/[0.05] dark:border-white/[0.05]">
                    <div
                        className="flex items-center gap-3 px-2 py-1 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => onNavigate(AppRoute.DASHBOARD)}
                    >
                        <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm text-[#0d0d0d] dark:text-white leading-none">Admin Panel</span>
                            <span className="text-[10px] text-[#8e8e8e] mt-0.5">Management Console</span>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
                    {navItems.map((item) => {
                        const isActive = currentRoute === item.route;
                        return (
                            <button
                                key={item.route}
                                onClick={() => {
                                    onNavigate(item.route);
                                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors ${isActive
                                    ? 'bg-[#f0f0f0] dark:bg-[#1a1a1a] text-[#0d0d0d] dark:text-white font-medium'
                                    : 'text-[#676767] dark:text-[#c5c5c5] hover:bg-[#f7f7f8] dark:hover:bg-white/[0.05]'
                                    }`}
                            >
                                <item.icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Footer / Back to Dashboard */}
                <div className="p-2 border-t border-black/[0.05] dark:border-white/[0.05]">
                    <button
                        onClick={() => onNavigate(AppRoute.DASHBOARD)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#676767] dark:text-[#c5c5c5] hover:bg-[#f0f0f0] dark:hover:bg-white/[0.08] hover:text-[#0d0d0d] dark:hover:text-white rounded-lg transition-colors"
                    >
                        <ChevronLeft size={16} />
                        <span>Back to Dashboard</span>
                    </button>

                    {/* User Info Request */}
                    <div className="mt-2 px-3 py-2 text-[11px] text-[#8e8e8e] text-center">
                        Logged as {user.email}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden bg-white dark:bg-[#0A0D13] pt-16 md:pt-0">
                <div className="max-w-[1200px] mx-auto p-6 md:p-8">
                    {children}
                </div>
            </main>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
};