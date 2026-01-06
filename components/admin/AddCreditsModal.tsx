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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-[#0f1115] border border-[#1f1f1f] rounded-xl w-full max-w-[420px] shadow-2xl overflow-hidden font-sans">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f1f1f]">
                    <h2 className="text-base font-semibold text-white">Add Credits</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/5 rounded transition-colors text-slate-400 hover:text-white"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-5">
                    {/* User Info */}
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                                {user.firstName?.[0] || user.email[0].toUpperCase()}
                            </div>
                        )}
                        <div className="overflow-hidden">
                            <div className="font-medium text-white text-sm truncate">{user.firstName} {user.lastName}</div>
                            <div className="text-xs text-slate-400 truncate">{user.email}</div>
                        </div>
                    </div>

                    {/* Current Usage */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                            <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">Used</div>
                            <div className="text-base font-medium text-white">{user.minutesUsed} min</div>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                            <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">Limit</div>
                            <div className="text-base font-medium text-white">
                                {user.minutesLimit === -1 ? '∞' : `${user.minutesLimit} min`}
                            </div>
                        </div>
                    </div>

                    {/* Credit Type */}
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">
                            Credit Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setType('limit')}
                                className={`p-2.5 rounded-lg border transition-all text-left group ${type === 'limit'
                                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                                    : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-white/5'
                                    }`}
                            >
                                <div className="font-medium text-sm">Increase Limit</div>
                                <div className={`text-[10px] mt-0.5 ${type === 'limit' ? 'text-blue-400/70' : 'text-slate-500'}`}>Permanent</div>
                            </button>

                            <button
                                onClick={() => setType('used')}
                                className={`p-2.5 rounded-lg border transition-all text-left ${type === 'used'
                                    ? 'bg-green-500/10 border-green-500/50 text-green-400'
                                    : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-white/5'
                                    }`}
                            >
                                <div className="font-medium text-sm">Refund Usage</div>
                                <div className={`text-[10px] mt-0.5 ${type === 'used' ? 'text-green-400/70' : 'text-slate-500'}`}>One-time</div>
                            </button>
                        </div>
                    </div>

                    {/* Minutes Input */}
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">
                            Minutes to Add
                        </label>
                        <input
                            type="number"
                            value={minutes}
                            onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                            min="1"
                            step="15"
                            className="w-full px-3 py-2 bg-[#0a0c10] border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-slate-600"
                        />
                        <div className="flex gap-2 mt-2">
                            {[30, 60, 120].map(val => (
                                <button
                                    key={val}
                                    onClick={() => setMinutes(val)}
                                    className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 rounded text-[11px] text-slate-300 transition-colors"
                                >
                                    {val < 60 ? `${val} min` : `${val / 60} hour${val > 60 ? 's' : ''}`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="px-3 py-2 bg-blue-500/5 border border-blue-500/10 rounded-lg flex items-center justify-between">
                        <span className="text-xs text-blue-200/50">Preview Result:</span>
                        {type === 'limit' ? (
                            <span className="text-sm font-bold text-blue-400">
                                {user.minutesLimit === -1 ? '∞' : user.minutesLimit + minutes} min <span className="text-[10px] font-normal opacity-70">(Limit)</span>
                            </span>
                        ) : (
                            <span className="text-sm font-bold text-green-400">
                                {Math.max(0, user.minutesUsed - minutes)} min <span className="text-[10px] font-normal opacity-70">(Used)</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#1f1f1f] bg-black/20">
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {submitting ? 'Adding...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};
