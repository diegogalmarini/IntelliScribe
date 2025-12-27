import React from 'react';
import { UserProfile, AppRoute } from '../../types';

interface Props {
    currentRoute: AppRoute;
    onNavigate: (route: AppRoute) => void;
    user: UserProfile;
    children: React.ReactNode;
}

/**
 * AdminLayout - Dark-themed command center layout
 * Features: Admin sidebar with navigation, distinct branding, exit button
 */
export const AdminLayout: React.FC<Props> = ({
    currentRoute,
    onNavigate,
    user,
    children
}) => {
    const navItems = [
        {
            route: AppRoute.ADMIN_OVERVIEW,
            icon: 'dashboard',
            label: 'Overview',
            description: 'Business KPIs & Stats'
        },
        {
            route: AppRoute.ADMIN_USERS,
            icon: 'group',
            label: 'Users (CRM)',
            description: 'Manage customers & plans'
        },
        {
            route: AppRoute.ADMIN_FINANCIALS,
            icon: 'attach_money',
            label: 'Financials',
            description: 'Calls & revenue tracking'
        },
        // --- NUEVA PESTAÑA AÑADIDA AQUÍ ---
        {
            route: AppRoute.ADMIN_PLANS,
            icon: 'price_change', // Icono de Google Fonts
            label: 'Planes & Precios',
            description: 'Editor de productos y límites'
        }
    ];

    return (
        <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-3xl text-amber-400">
                            bolt
                        </span>
                        <div>
                            <h1 className="text-xl font-bold text-amber-400 tracking-wide">
                                COMMAND CENTER
                            </h1>
                            <p className="text-xs text-slate-400">Admin Dashboard</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = currentRoute === item.route;
                        return (
                            <button
                                key={item.route}
                                onClick={() => onNavigate(item.route)}
                                className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/30'
                                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-2xl">
                                    {item.icon}
                                </span>
                                <div className="flex-1 text-left">
                                    <div className={`font-semibold ${isActive ? 'text-slate-900' : 'text-white'}`}>
                                        {item.label}
                                    </div>
                                    <div className={`text-xs ${isActive ? 'text-slate-700' : 'text-slate-400'}`}>
                                        {item.description}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </nav>

                {/* Admin User Info */}
                <div className="p-4 border-t border-slate-700">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        {user.avatarUrl ? (
                            <img
                                src={user.avatarUrl}
                                alt={user.firstName}
                                className="w-8 h-8 rounded-full"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 font-bold">
                                {user.firstName?.[0] || 'A'}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                                {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-amber-400">Administrator</div>
                        </div>
                    </div>

                    {/* Exit Admin Button */}
                    <button
                        onClick={() => onNavigate(AppRoute.DASHBOARD)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
                    >
                        <span className="material-symbols-outlined text-lg">exit_to_app</span>
                        <span>Exit Admin</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto bg-slate-900">
                {children}
            </main>
        </div>
    );
};