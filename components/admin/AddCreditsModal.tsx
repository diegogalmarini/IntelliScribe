import React, { useState } from 'react';
import { AdminUser } from '../../types';

type AssetType = 'transcription' | 'voice';
type CreditType = 'limit' | 'used' | 'balance';

interface Props {
    user: AdminUser;
    onClose: () => void;
    onConfirm: (
        userId: string,
        amount: number,
        asset: AssetType,
        type: CreditType
    ) => Promise<void>;
}

/**
 * AddCreditsModal
 * Modal for admins to add credits to user accounts
 * Supports Transcription (Limit/Usage) and Voice Calls (Monthly Limit/Prepaid Balance)
 */
export const AddCreditsModal: React.FC<Props> = ({ user, onClose, onConfirm }) => {
    const [amount, setAmount] = useState(60);
    const [asset, setAsset] = useState<AssetType>('transcription');
    const [type, setType] = useState<CreditType>('limit');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (amount <= 0) {
            alert('Amount must be greater than 0');
            return;
        }

        setSubmitting(true);
        await onConfirm(user.id, amount, asset, type);
        setSubmitting(false);
    };

    // Auto-adjust type when asset changes to ensure valid combinations
    const handleAssetChange = (newAsset: AssetType) => {
        setAsset(newAsset);
        if (newAsset === 'voice') {
            // Default voice type to 'balance' (prepaid) or 'limit' (monthly)
            setType('balance');
        } else {
            setType('limit');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-[#0f1115] border border-[#1f1f1f] rounded-xl w-full max-w-[420px] shadow-2xl overflow-hidden font-sans">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f1f1f]">
                    <h2 className="text-base font-semibold text-white">Add Credits / Adjust Limits</h2>
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

                    {/* Asset Type Selector */}
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">
                            Select Asset
                        </label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-lg border border-white/5">
                            <button
                                onClick={() => handleAssetChange('transcription')}
                                className={`py-1.5 px-3 rounded-md text-xs font-medium transition-all ${asset === 'transcription'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                Transcription
                            </button>
                            <button
                                onClick={() => handleAssetChange('voice')}
                                className={`py-1.5 px-3 rounded-md text-xs font-medium transition-all ${asset === 'voice'
                                    ? 'bg-purple-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                Voice Calls
                            </button>
                        </div>
                    </div>

                    {/* Current Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        {asset === 'transcription' ? (
                            <>
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                    <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">Used (Trans)</div>
                                    <div className="text-base font-medium text-white">{user.minutesUsed} min</div>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                    <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">Limit (Trans)</div>
                                    <div className="text-base font-medium text-white">
                                        {user.minutesLimit === -1 ? '∞' : `${user.minutesLimit} min`}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                    <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">Balance (Vox)</div>
                                    <div className="text-base font-medium text-white">{user.voiceCredits || 0} min</div>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                    <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">Limit (Vox)</div>
                                    <div className="text-base font-medium text-white">{user.callLimit || 0} min</div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Credit Action Type */}
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">
                            Action Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {asset === 'transcription' ? (
                                <>
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
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setType('balance')}
                                        className={`p-2.5 rounded-lg border transition-all text-left group ${type === 'balance'
                                            ? 'bg-purple-500/10 border-purple-500/50 text-purple-400'
                                            : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-white/5'
                                            }`}
                                    >
                                        <div className="font-medium text-sm">Add Balance</div>
                                        <div className={`text-[10px] mt-0.5 ${type === 'balance' ? 'text-purple-400/70' : 'text-slate-500'}`}>Prepaid</div>
                                    </button>

                                    <button
                                        onClick={() => setType('limit')}
                                        className={`p-2.5 rounded-lg border transition-all text-left ${type === 'limit'
                                            ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                                            : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-white/5'
                                            }`}
                                    >
                                        <div className="font-medium text-sm">Adjust Limit</div>
                                        <div className={`text-[10px] mt-0.5 ${type === 'limit' ? 'text-amber-400/70' : 'text-slate-500'}`}>Monthly</div>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">
                            {asset === 'transcription' ? 'Minutes to Add' : 'Credits to Add'}
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                            min="1"
                            step="15"
                            className="w-full px-3 py-2 bg-[#0a0c10] border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-slate-600"
                        />
                        <div className="flex gap-2 mt-2">
                            {[15, 30, 60, 120].map(val => (
                                <button
                                    key={val}
                                    onClick={() => setAmount(val)}
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
                        <span className="text-sm font-bold text-white">
                            {asset === 'transcription' ? (
                                type === 'limit'
                                    ? `${user.minutesLimit === -1 ? '∞' : user.minutesLimit + amount} min (New Limit)`
                                    : `${Math.max(0, user.minutesUsed - amount)} min (New Usage)`
                            ) : (
                                type === 'balance'
                                    ? `${(user.voiceCredits || 0) + amount} min (New Balance)`
                                    : `${(user.callLimit || 0) + amount} min (New Monthly Plan)`
                            )}
                        </span>
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
                        className={`px-4 py-1.5 text-white text-sm font-medium rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all ${asset === 'transcription' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' : 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20'
                            }`}
                    >
                        {submitting ? 'Adding...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};
