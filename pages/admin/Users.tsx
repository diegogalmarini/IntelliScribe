import React, { useEffect, useState } from 'react';
import { AdminUser } from '../../types';
import { adminService } from '../../services/adminService';
import { AddCreditsModal } from '../../components/admin/AddCreditsModal';
import { UserRecordingsModal } from '../../components/admin/UserRecordingsModal';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import {
    Search,
    RefreshCw,
    PlusCircle,
    Eye,
    Ban,
    CheckCircle,
    MoreHorizontal,
    Filter,
    Calendar
} from 'lucide-react';

/**
 * Admin Users Page (CRM)
 * Manage all users: view, search, edit plans, add credits, ban/unban
 * Refactored to Minimalist Light Theme
 */
export const Users: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [showCreditsModal, setShowCreditsModal] = useState(false);
    const [showRecordingsModal, setShowRecordingsModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ type: 'ban' | 'plan', data?: any } | null>(null);
    const [filterPlan, setFilterPlan] = useState<string>('all');
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        loadUsers();
    }, [search]);

    const loadUsers = async () => {
        setLoading(true);
        const { users: data } = await adminService.getAllUsers(1, 100, search);
        setUsers(data);
        setLoading(false);
    };

    const handleChangePlan = (user: AdminUser, newPlan: string) => {
        setSelectedUser(user);
        setConfirmAction({ type: 'plan', data: newPlan });
        setShowConfirmModal(true);
    };

    const executeChangePlan = async () => {
        if (!selectedUser || !confirmAction?.data) return;

        const success = await adminService.updateUserPlan(selectedUser.id, confirmAction.data);
        if (success) {
            loadUsers();
            showToast('Plan updated successfully', 'success');
        } else {
            showToast('Failed to update plan', 'error');
        }

        setShowConfirmModal(false);
        setConfirmAction(null);
        setSelectedUser(null);
    };

    const handleBanUser = (user: AdminUser) => {
        setSelectedUser(user);
        setConfirmAction({ type: 'ban' });
        setShowConfirmModal(true);
    };

    const executeBanUser = async () => {
        if (!selectedUser) return;

        const action = selectedUser.status === 'banned' ? 'unban' : 'ban';
        const success = await adminService.toggleBanUser(selectedUser.id, selectedUser.status !== 'banned');

        if (success) {
            loadUsers();
            showToast(`User ${action}ned successfully`, 'success');
        } else {
            showToast(`Failed to ${action} user`, 'error');
        }

        setShowConfirmModal(false);
        setConfirmAction(null);
        setSelectedUser(null);
    };

    const getPlanColor = (plan: string) => {
        const colors: Record<string, string> = {
            'free': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
            'pro': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
            'business': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
            'business_plus': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
        };
        return colors[plan] || 'bg-slate-100 text-slate-700';
    };

    const handleTrialChange = async (userId: string, date: string) => {
        // 1. Optimistic Update: Update UI immediately to prevent input loss/picker closing
        const newDate = date || null;
        setUsers(prev => prev.map(u =>
            u.id === userId
                ? { ...u, trialEndsAt: newDate }
                : u
        ));

        try {
            // 2. Background Update
            const success = await adminService.updateUserTrial(userId, newDate);

            if (success) {
                showToast('Trial date updated', 'success');
                // Do NOT reload users here, it forces a re-render and closes the date picker
            } else {
                showToast('Failed to update trial date', 'error');
                loadUsers(); // Revert on failure
            }
        } catch (err) {
            console.error(err);
            showToast('An error occurred while updating the trial', 'error');
            loadUsers(); // Revert on error
        }
    };

    const safeDateValue = (dateStr: string | null | undefined) => {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return '';
            return d.toISOString().split('T')[0];
        } catch (e) {
            return '';
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'active': 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/20',
            'past_due': 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/20',
            'canceled': 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-800',
            'banned': 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/20'
        };
        const classes = colors[status] || 'text-slate-500';
        return `px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes}`;
    };

    const filteredUsers = filterPlan === 'all'
        ? users
        : users.filter(u => u.planId === filterPlan);

    const formatRelativeTime = (dateStr: string | null | undefined) => {
        if (!dateStr) return 'Never';
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;
            return date.toLocaleDateString();
        } catch (e) {
            return 'Invalid';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="text-sm text-slate-400">Loading users...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage customer accounts, plans, and credits</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="w-full md:w-64 px-4 py-2 pl-10 bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all shadow-sm"
                        />
                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    </div>

                    <select
                        value={filterPlan}
                        onChange={(e) => setFilterPlan(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                    >
                        <option value="all">All Plans</option>
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                        <option value="business">Business</option>
                        <option value="business_plus">Business+</option>
                    </select>

                    <button
                        onClick={loadUsers}
                        className="p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition-colors shadow-sm"
                        title="Refresh"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-[#0A0D13] border border-slate-200 dark:border-[#1f1f1f] rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-[#1f1f1f]">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trial Ends</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Usage</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-blue-500 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-[#1f1f1f]">Last Login</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider sticky right-0 bg-slate-50 dark:bg-[#050505] z-10 border-b border-l border-slate-200 dark:border-[#1f1f1f] shadow-[-1px_0_0_0_rgba(0,0,0,0.1)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-[#1f1f1f]">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                                        No users found matching your criteria
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.avatarUrl ? (
                                                    <img src={user.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-100 dark:ring-white/10" />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xs">
                                                        {user.firstName?.[0] || user.email[0].toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {user.firstName} {user.lastName}
                                                    </div>
                                                    <div className="text-xs text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <select
                                                value={user.planId}
                                                onChange={(e) => handleChangePlan(user, e.target.value)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${getPlanColor(user.planId)} border-0 cursor-pointer focus:ring-2 focus:ring-blue-500/20`}
                                            >
                                                <option value="free">Free</option>
                                                <option value="pro">Pro</option>
                                                <option value="business">Business</option>
                                                <option value="business_plus">Business+</option>
                                            </select>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 group/date">
                                                <input
                                                    type="date"
                                                    min={(() => {
                                                        const d = new Date();
                                                        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                                                    })()}
                                                    value={safeDateValue(user.trialEndsAt)}
                                                    onChange={(e) => handleTrialChange(user.id, e.target.value)}
                                                    className="bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-black cursor-pointer transition-all shadow-sm w-[110px]"
                                                />
                                                {user.trialEndsAt && new Date(user.trialEndsAt) > new Date() && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse shrink-0" title="Active Trial"></span>
                                                )}
                                                {!user.trialEndsAt && (
                                                    <span className="text-[10px] text-slate-300 dark:text-slate-600 opacity-0 group-hover/date:opacity-100 transition-opacity">
                                                        Set Date
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2">
                                                {/* Minutes Usage */}
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex justify-between text-[10px] text-slate-500">
                                                        <span>Mins</span>
                                                        <span className="font-mono">{user.minutesUsed}/{user.minutesLimit === -1 ? '∞' : user.minutesLimit}m</span>
                                                    </div>
                                                    <div className="w-24 h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${user.usagePercentage > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                                                            style={{ width: `${Math.min(user.usagePercentage, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Storage Usage */}
                                                {(user.storageLimit && user.storageLimit > 0) ? (
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex justify-between text-[10px] text-slate-500">
                                                            <span>Store</span>
                                                            <span className="font-mono">
                                                                {(user.storageUsed / 1073741824).toFixed(1)}/{(user.storageLimit / 1073741824).toFixed(0)}GB
                                                            </span>
                                                        </div>
                                                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full bg-purple-500"
                                                                style={{ width: `${Math.min((user.storageUsed / user.storageLimit) * 100, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : null}

                                                {/* Call Plans (Business+) */}
                                                {(user.callLimit > 0 || (user.voiceCredits || 0) > 0) && (
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex justify-between text-[10px] text-slate-500">
                                                            <span>Calls</span>
                                                            <span className="font-mono">
                                                                {user.callMinutesUsed}/{user.callLimit}m
                                                                {(user.voiceCredits || 0) > 0 && <span className="text-purple-500 ml-1">+{user.voiceCredits}p</span>}
                                                            </span>
                                                        </div>
                                                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${user.callMinutesUsed >= user.callLimit ? 'bg-orange-500' : 'bg-purple-500'}`}
                                                                style={{ width: `${Math.min((user.callMinutesUsed / user.callLimit) * 100, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Days Remaining */}
                                                {user.trialEndsAt && new Date(user.trialEndsAt) > new Date() && (
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex justify-between text-[10px] text-slate-500">
                                                            <span>Trial</span>
                                                            <span className="font-mono text-green-600">
                                                                {Math.ceil((new Date(user.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}d left
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={getStatusColor(user.status)}>
                                                {user.status}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            <div className="font-medium text-slate-700 dark:text-slate-300">
                                                {formatRelativeTime(user.lastLoginAt)}
                                            </div>
                                            {user.lastDeviceType && (
                                                <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <span className="material-symbols-outlined text-[10px] scale-75">
                                                        {user.lastDeviceType === 'Mobile' ? 'smartphone' :
                                                            user.lastDeviceType === 'Tablet' ? 'tablet' : 'desktop_windows'}
                                                    </span>
                                                    {user.lastDeviceType}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 sticky right-0 bg-white dark:bg-[#0A0D13] z-10 border-b border-l border-slate-100 dark:border-[#1f1f1f] shadow-[-4px_0_12px_rgba(0,0,0,0.03)]">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowCreditsModal(true);
                                                    }}
                                                    className="p-1.5 hover:bg-green-50 text-slate-400 hover:text-green-600 rounded-lg transition-colors"
                                                    title="Add Credits"
                                                >
                                                    <PlusCircle className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowRecordingsModal(true);
                                                    }}
                                                    className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                                                    title="View Recordings"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleBanUser(user)}
                                                    className={`p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors ${user.status === 'banned' ? 'text-red-600 bg-red-50' : ''}`}
                                                    title={user.status === 'banned' ? 'Unban User' : 'Ban User'}
                                                >
                                                    {user.status === 'banned' ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4 text-sm text-slate-500 dark:text-slate-400 px-1">
                Showing {filteredUsers.length} of {users.length} total users
            </div>

            {/* Modals */}
            {showCreditsModal && selectedUser && (
                <AddCreditsModal
                    user={selectedUser}
                    onClose={() => {
                        setShowCreditsModal(false);
                        setSelectedUser(null);
                    }}
                    onConfirm={async (userId, amount, asset, type) => {
                        let success = false;

                        if (asset === 'transcription') {
                            success = await adminService.addCredits(userId, amount, type as 'limit' | 'used');
                        } else {
                            // type for voice is 'limit' (monthly) or 'balance' (prepaid)
                            success = await adminService.addVoiceCredits(userId, amount, type as 'limit' | 'balance');
                        }

                        if (success) {
                            loadUsers();
                            setShowCreditsModal(false);
                            setSelectedUser(null);
                            showToast('Credits/Limits updated successfully', 'success');
                        } else {
                            showToast('Failed to update credits', 'error');
                        }
                    }}
                />
            )}

            {showRecordingsModal && selectedUser && (
                <UserRecordingsModal
                    userId={selectedUser.id}
                    userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
                    onClose={() => {
                        setShowRecordingsModal(false);
                        setSelectedUser(null);
                    }}
                />
            )}

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={showConfirmModal}
                title={confirmAction?.type === 'ban'
                    ? (selectedUser?.status === 'banned' ? 'Unban User' : 'Ban User')
                    : 'Change Plan'
                }
                message={confirmAction?.type === 'ban'
                    ? `Are you sure you want to ${selectedUser?.status === 'banned' ? 'unban' : 'ban'} ${selectedUser?.email}?`
                    : `Change ${selectedUser?.email} from ${selectedUser?.planId} to ${confirmAction?.data} plan?`
                }
                confirmText={confirmAction?.type === 'ban' ? (selectedUser?.status === 'banned' ? 'Unban' : 'Ban') : 'Change Plan'}
                cancelText="Cancel"
                onConfirm={confirmAction?.type === 'ban' ? executeBanUser : executeChangePlan}
                onCancel={() => {
                    setShowConfirmModal(false);
                    setConfirmAction(null);
                    setSelectedUser(null);
                }}
                danger={confirmAction?.type === 'ban' && selectedUser?.status !== 'banned'}
            />

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-6 right-6 z-[100] px-4 py-3 rounded-lg shadow-lg border flex items-center gap-3 animate-in slide-in-from-right-10 duration-300 ${toast.type === 'success'
                    ? 'bg-white dark:bg-[#1a1a1a] border-green-200 text-green-600'
                    : 'bg-white dark:bg-[#1a1a1a] border-red-200 text-red-600'
                    }`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                    <span className="text-sm font-medium">{toast.message}</span>
                </div>
            )}
        </div>
    );
};
