import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { AppRoute } from '../types';

interface Props {
    children: React.ReactNode;
    onNavigate: (route: AppRoute) => void;
}

/**
 * AdminRoute - Protected Route Guard
 * Checks if user has admin role before rendering admin pages
 * Redirects non-admin users to dashboard
 */
export const AdminRoute: React.FC<Props> = ({ children, onNavigate }) => {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAdminStatus = async () => {
            setIsChecking(true);
            const result = await adminService.isAdmin();
            setIsAdmin(result);

            if (!result) {
                console.warn('[AdminRoute] Access denied: User is not admin');
                // Redirect to dashboard after short delay to show message
                setTimeout(() => {
                    onNavigate(AppRoute.DASHBOARD);
                }, 1500);
            }

            setIsChecking(false);
        };

        checkAdminStatus();
    }, [onNavigate]);

    // Loading state
    if (isChecking || isAdmin === null) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin">
                        <span className="material-symbols-outlined text-5xl text-amber-400">
                            shield_person
                        </span>
                    </div>
                    <p className="text-lg">Verifying admin access...</p>
                </div>
            </div>
        );
    }

    // Access denied - show message before redirect
    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
                <div className="flex flex-col items-center gap-4 text-center max-w-md">
                    <span className="material-symbols-outlined text-6xl text-red-500">
                        block
                    </span>
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                    <p className="text-slate-400">
                        This area is restricted to administrators only.
                    </p>
                    <p className="text-sm text-slate-500">
                        Redirecting to dashboard...
                    </p>
                </div>
            </div>
        );
    }

    // Authorized - render admin content
    return <>{children}</>;
};
