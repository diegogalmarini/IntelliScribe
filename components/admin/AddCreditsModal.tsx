import React, { useState } from 'react';
import { AdminUser } from '../../types';

interface Props {
    user: AdminUser;
    onClose: () => void;
    onConfirm: (userId: string, minutes: number, type: 'limit' | 'used') => Promise<void>;
}

/**
 * AddCreditsModal
 * Modal for admins to add credits to user accounts
 * Two modes: Increase limit (permanent) or Refund usage (temporary)
 */
export const AddCreditsModal: React.FC<Props> = ({ user, onClose, onConfirm }) => {
    const [minutes, setMinutes] = useState(60);
    const [type, setType] = useState<'limit' | 'used'>('limit');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (minutes <= 0) {
            alert('Minutes must be greater than 0');
            return;
        }

        setSubmitting(true);
        await onConfirm(user.id, minutes, type);
        setSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white">Add Credits</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-slate-400">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* User Info */}
                    <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-12 h-12 rounded-full" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold">
                                {user.firstName?.[0] || user.email[0].toUpperCase()}
                            </div>
                        )}
                        <div>
                            <div className="font-medium text-white">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-slate-400">{user.email}</div>
                        </div>
                    </div>

                    {/* Current Usage */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-xs text-slate-400 mb-1">Used</div>
                            <div className="text-lg font-bold text-white">{user.minutesUsed} min</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-400 mb-1">Limit</div>
                            <div className="text-lg font-bold text-white">
                                {user.minutesLimit === -1 ? '∞' : `${user.minutesLimit} min`}
                            </div>
                        </div>
                    </div>

                    {/* Credit Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Credit Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setType('limit')}
                                className={`p-3 rounded-lg border transition-colors ${type === 'limit'
                                        ? 'bg-blue-600 border-blue-500 text-white'
                                        : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                                    }`}
                            >
                                <div className="font-medium">Increase Limit</div>
                                <div className="text-xs mt-1 opacity-80">Permanent credit</div>
                            </button>

                            <button
                                onClick={() => setType('used')}
                                className={`p-3 rounded-lg border transition-colors ${type === 'used'
                                        ? 'bg-green-600 border-green-500 text-white'
                                        : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                                    }`}
                            >
                                <div className="font-medium">Refund Usage</div>
                                <div className="text-xs mt-1 opacity-80">One-time refund</div>
                            </button>
                        </div>
                    </div>

                    {/* Minutes Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Minutes to Add
                        </label>
                        <input
                            type="number"
                            value={minutes}
                            onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                            min="1"
                            step="15"
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                        />
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => setMinutes(30)}
                                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300"
                            >
                                30 min
                            </button>
                            <button
                                onClick={() => setMinutes(60)}
                                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300"
                            >
                                1 hour
                            </button>
                            <button
                                onClick={() => setMinutes(120)}
                                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300"
                            >
                                2 hours
                            </button>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="p-4 bg-slate-700/50 rounded-lg">
                        <div className="text-sm text-slate-400 mb-2">Preview:</div>
                        {type === 'limit' ? (
                            <div className="text-white">
                                New Limit: <span className="font-bold text-blue-400">
                                    {user.minutesLimit === -1 ? '∞' : user.minutesLimit + minutes} min
                                </span>
                            </div>
                        ) : (
                            <div className="text-white">
                                New Usage: <span className="font-bold text-green-400">
                                    {Math.max(0, user.minutesUsed - minutes)} min
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors text-slate-900 font-medium disabled:opacity-50"
                    >
                        {submitting ? 'Adding...' : 'Add Credits'}
                    </button>
                </div>
            </div>
        </div>
    );
};
