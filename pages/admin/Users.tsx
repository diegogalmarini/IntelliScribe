import React, { useEffect, useState } from 'react';
import { AdminUser } from '../../types';
import { adminService } from '../../services/adminService';
import { AddCreditsModal } from '../../components/admin/AddCreditsModal';
import { UserRecordingsModal } from '../../components/admin/UserRecordingsModal';

/**
 * Admin Users Page (CRM)
 * Manage all users: view, search, edit plans, add credits, ban/unban
 */
export const Users: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [showCreditsModal, setShowCreditsModal] = useState(false);
    const [showRecordingsModal, setShowRecordingsModal] = useState(false);
    const [filterPlan, setFilterPlan] = useState<string>('all');

    useEffect(() => {
        loadUsers();
    }, [search]);

    const loadUsers = async () => {
        setLoading(true);
        const { users: data } = await adminService.getAllUsers(1, 100, search);
        setUsers(data);
        setLoading(false);
    };

    const handleChangePlan = async (user: AdminUser, newPlan: string) => {
        if (confirm(`Change ${user.email} to ${newPlan} plan?`)) {
            const success = await adminService.updateUserPlan(user.id, newPlan);
            if (success) {
                loadUsers();
                alert('Plan updated successfully');
            } else {
                alert('Failed to update plan');
            }
        }
    };

    const handleBanUser = async (user: AdminUser) => {
        const action = user.status === 'banned' ? 'unban' : 'ban';
        if (confirm(`Are you sure you want to ${action} ${user.email}?`)) {
            const success = await adminService.toggleBanUser(user.id, user.status !== 'banned');
            if (success) {
                loadUsers();
                alert(`User ${action}ned successfully`);
            } else {
                alert(`Failed to ${action} user`);
            }
        }
    };

    const getPlanColor = (plan: string) => {
        const colors: Record<string, string> = {
            'free': 'bg-slate-600 text-slate-200',
            'pro': 'bg-blue-600 text-white',
            'business': 'bg-purple-600 text-white',
            'business_plus': 'bg-amber-600 text-white'
        };
        return colors[plan] || 'bg-slate-600';
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'active': 'text-green-400',
            'past_due': 'text-orange-400',
            'canceled': 'text-slate-400',
            'banned': 'text-red-400'
        };
        return colors[status] || 'text-slate-400';
    };

    const filteredUsers = filterPlan === 'all'
        ? users
        : users.filter(u => u.planId === filterPlan);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin material-symbols-outlined text-4xl text-amber-400">
                    progress_activity
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">User Management (CRM)</h1>
                <p className="text-slate-400">Manage customer accounts, plans, and credits</p>
            </div>

            {/* Search & Filters */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by email, name, or UUID..."
                            className="w-full px-4 py-3 pl-12 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                        />
                        <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-400">
                            search
                        </span>
                    </div>
                </div>

                <select
                    value={filterPlan}
                    onChange={(e) => setFilterPlan(e.target.value)}
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                >
                    <option value="all">All Plans</option>
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="business">Business</option>
                    <option value="business_plus">Business+</option>
                </select>

                <button
                    onClick={loadUsers}
                    className="flex items-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
                >
                    <span className="material-symbols-outlined">refresh</span>
                    <span>Refresh</span>
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Plan</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Usage</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Joined</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.avatarUrl ? (
                                                    <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                                                        {user.firstName?.[0] || user.email[0].toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-white">
                                                        {user.firstName} {user.lastName}
                                                    </div>
                                                    <div className="text-xs text-slate-400">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <select
                                                value={user.planId}
                                                onChange={(e) => handleChangePlan(user, e.target.value)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${getPlanColor(user.planId)} cursor-pointer`}
                                            >
                                                <option value="free">Free</option>
                                                <option value="pro">Pro</option>
                                                <option value="business">Business</option>
                                                <option value="business_plus">Business+</option>
                                            </select>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden max-w-[120px]">
                                                    <div
                                                        className={`h-full transition-all ${user.usagePercentage > 90 ? 'bg-red-500' :
                                                                user.usagePercentage > 70 ? 'bg-orange-500' :
                                                                    'bg-blue-500'
                                                            }`}
                                                        style={{ width: `${Math.min(user.usagePercentage, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-slate-400 min-w-[60px]">
                                                    {user.minutesUsed}/{user.minutesLimit === -1 ? '∞' : user.minutesLimit}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={`text-sm font-medium ${getStatusColor(user.status)}`}>
                                                {user.status}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-400">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowCreditsModal(true);
                                                    }}
                                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-green-400"
                                                    title="Add Credits"
                                                >
                                                    <span className="material-symbols-outlined text-lg">add_circle</span>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowRecordingsModal(true);
                                                    }}
                                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-blue-400"
                                                    title="View Recordings (Ghost Mode)"
                                                >
                                                    <span className="material-symbols-outlined text-lg">visibility</span>
                                                </button>

                                                <button
                                                    onClick={() => handleBanUser(user)}
                                                    className={`p-2 hover:bg-slate-700 rounded-lg transition-colors ${user.status === 'banned' ? 'text-green-400' : 'text-red-400'
                                                        }`}
                                                    title={user.status === 'banned' ? 'Unban User' : 'Ban User'}
                                                >
                                                    <span className="material-symbols-outlined text-lg">
                                                        {user.status === 'banned' ? 'check_circle' : 'block'}
                                                    </span>
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

            <div className="mt-4 text-sm text-slate-400">
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
                    onConfirm={async (userId, minutes, type) => {
                        const success = await adminService.addCredits(userId, minutes, type);
                        if (success) {
                            loadUsers();
                            setShowCreditsModal(false);
                            setSelectedUser(null);
                            alert('Credits added successfully');
                        } else {
                            alert('Failed to add credits');
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
        </div>
    );
};
