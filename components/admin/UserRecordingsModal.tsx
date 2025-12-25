import React, { useEffect, useState } from 'react';
import { Recording } from '../../types';
import { adminService } from '../../services/adminService';

interface Props {
    userId: string;
    userName: string;
    onClose: () => void;
}

/**
 * UserRecordingsModal (Ghost Mode)
 * View any user's recordings for support and debugging
 * Read-only access for administrators
 */
export const UserRecordingsModal: React.FC<Props> = ({ userId, userName, onClose }) => {
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRecordings();
    }, [userId]);

    const loadRecordings = async () => {
        setLoading(true);
        const data = await adminService.getUserRecordings(userId);
        setRecordings(data);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-400">visibility</span>
                            Ghost Mode: {userName}
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">Read-only view of user recordings</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-slate-400">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin material-symbols-outlined text-3xl text-amber-400">
                                progress_activity
                            </div>
                        </div>
                    ) : recordings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <span className="material-symbols-outlined text-5xl text-slate-600 mb-3">
                                mic_off
                            </span>
                            <p className="text-slate-400">No recordings found for this user</p>
                        </div>
                    ) : (
                        <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-700/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                                            Title
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                                            Duration
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {recordings.map((rec) => (
                                        <tr key={rec.id} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="text-sm text-white font-medium">{rec.title}</div>
                                                <div className="text-xs text-slate-400 truncate">{rec.id}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-300">
                                                {rec.date}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-300">
                                                {rec.duration}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-sm ${rec.status === 'Completed' ? 'text-green-400' :
                                                        rec.status === 'Processing' ? 'text-blue-400' :
                                                            'text-slate-400'
                                                    }`}>
                                                    {rec.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-slate-700">
                    <div className="text-sm text-slate-400">
                        {recordings.length} recording{recordings.length !== 1 ? 's' : ''} found
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
