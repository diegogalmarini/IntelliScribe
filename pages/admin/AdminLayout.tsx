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
    const [isCollapsed, setIsCollapsed] = React.useState(false); // Desktop collapse state

    const navItems = [
        { label: 'Overview', icon: LayoutDashboard, route: AppRoute.ADMIN_OVERVIEW },
        { label: 'Users', icon: Users, route: AppRoute.ADMIN_USERS },
        { label: 'Plans', icon: Tag, route: AppRoute.ADMIN_PLANS },
    ];

    return (
        <div className="flex h-screen bg-white dark:bg-[#0A0D13]">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#050505] border-b border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between px-4 z-40">
                <div className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-blue-600" />
                    <span className="font-bold text-sm dark:text-white">Admin Panel</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 text-slate-600 dark:text-slate-400"
                >
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Admin Sidebar - Matching MinimalSidebar.tsx styles */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-30 h-full bg-white dark:bg-[#050505]
                border-r border-black/[0.05] dark:border-white/[0.05] flex flex-col
                transition-all duration-300 ease-in-out
                ${isCollapsed ? 'md:w-20' : 'md:w-64'}
                ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Header / Logo Area */}
                <div className="p-3 border-b border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between">
                    <div
                        className={`flex items-center gap-3 px-2 py-1 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden ${isCollapsed ? 'md:w-0 md:p-0 md:opacity-0' : 'w-auto'}`}
                        onClick={() => onNavigate(AppRoute.DASHBOARD)}
                    >
                        <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex flex-col whitespace-nowrap">
                            <span className="font-semibold text-sm text-[#0d0d0d] dark:text-white leading-none">Admin Panel</span>
                            <span className="text-[10px] text-[#8e8e8e] mt-0.5">Management</span>
                        </div>
                    </div>

                    {/* Collapse Toggle Button (Visible only on desktop) */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`hidden md:flex p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-slate-400 transition-transform duration-300 ${isCollapsed ? 'rotate-180 mx-auto' : ''}`}
                    >
                        <ChevronLeft size={18} />
                    </button>
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
                                className={`w-full flex items-center rounded-lg text-[13px] transition-all group relative ${isActive
                                    ? 'bg-[#f0f0f0] dark:bg-[#1a1a1a] text-[#0d0d0d] dark:text-white font-medium'
                                    : 'text-[#676767] dark:text-[#c5c5c5] hover:bg-[#f7f7f8] dark:hover:bg-white/[0.05]'
                                    } ${isCollapsed ? 'justify-center py-3' : 'px-3 py-2 gap-3'}`}
                                title={isCollapsed ? item.label : ''}
                            >
                                <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} className="flex-shrink-0" />
                                <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'md:w-0 md:opacity-0' : 'w-auto opacity-100'}`}>
                                    {item.label}
                                </span>

                                {/* Tooltip for collapsed state */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                        {item.label}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer / Back to Dashboard */}
                <div className="p-2 border-t border-black/[0.05] dark:border-white/[0.05]">
                    <button
                        onClick={() => onNavigate(AppRoute.DASHBOARD)}
                        className={`w-full flex items-center text-[13px] text-[#676767] dark:text-[#c5c5c5] hover:bg-[#f0f0f0] dark:hover:bg-white/[0.08] hover:text-[#0d0d0d] dark:hover:text-white rounded-lg transition-all ${isCollapsed ? 'justify-center py-3' : 'px-3 py-2 gap-2'}`}
                        title={isCollapsed ? 'Back to Dashboard' : ''}
                    >
                        <ChevronLeft size={18} className="flex-shrink-0" />
                        <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'md:w-0 md:opacity-0' : 'w-auto opacity-100'}`}>
                            Dashboard
                        </span>
                    </button>

                    <div className={`mt-2 py-2 text-[10px] text-[#8e8e8e] text-center overflow-hidden transition-all duration-300 ${isCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'}`}>
                        {user.email}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden bg-white dark:bg-[#0A0D13] pt-16 md:pt-0">
                <div className={`mx-auto p-6 md:p-8 transition-all duration-300 ${isCollapsed ? 'max-w-[1400px]' : 'max-w-[1200px]'}`}>
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