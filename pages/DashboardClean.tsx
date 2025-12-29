import React, { useState, useRef } from 'react';
import { Recording, AppRoute, Folder, UserProfile } from '../types';
import { MinimalSidebar } from '../components/clean/MinimalSidebar';
import { UserMenu } from '../components/clean/UserMenu';
import { EmptyStateClean } from '../components/clean/EmptyStateClean';
import { SettingsModal } from '../components/clean/SettingsModal';

interface DashboardCleanProps {
    onNavigate: (route: AppRoute) => void;
    recordings: Recording[];
    onSelectRecording: (id: string) => void;
    onDeleteRecording: (id: string) => void;
    onRenameRecording: (id: string, newTitle: string) => void;
    onMoveRecording: (id: string, folderId: string) => void;
    selectedFolderId: string;
    folders: Folder[];
    user: UserProfile;
    onLogout: () => void;
    onUpdateUser?: (updates: Partial<UserProfile>) => void;
}

export const DashboardClean: React.FC<DashboardCleanProps> = ({
    onNavigate,
    recordings,
    onSelectRecording,
    user,
    onLogout,
    onUpdateUser
}) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isDialerOpen, setIsDialerOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Format plan name for display
    const formatPlanName = (planId: string) => {
        const names: Record<string, string> = {
            'free': 'Free',
            'pro': 'Pro',
            'business': 'Business',
            'business_plus': 'Business Plus'
        };
        return names[planId] || planId;
    };

    const handleSelectRecording = (id: string) => {
        setSelectedId(id);
        onSelectRecording(id);
    };

    const handleNewRecording = () => {
        onNavigate(AppRoute.RECORDING);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // TODO: Implement proper file upload to backend
            console.log('File selected:', file.name);
            // For now, navigate to recording page
            onNavigate(AppRoute.RECORDING);
        }
    };

    const handleAction = (type: 'record' | 'upload' | 'call') => {
        if (type === 'record') {
            onNavigate(AppRoute.RECORDING);
        }
        if (type === 'upload') {
            // Trigger hidden file input click
            fileInputRef.current?.click();
        }
        if (type === 'call') {
            // Open dialer only for Business+ users
            if (user?.subscription?.planId === 'business_plus') {
                setIsDialerOpen(true);
            } else {
                // Could show upgrade modal here
                alert('La función de llamadas está disponible solo para Business+');
            }
        }
    };

    // Find active recording
    const activeRecording = selectedId ? recordings.find(r => r.id === selectedId) : null;

    // Check if user has Business+ plan for call button
    const showCallButton = user?.subscription?.planId === 'business_plus';

    return (
        <div className="flex h-screen bg-white dark:bg-[#1a1a1a] overflow-hidden">
            {/* Hidden file input for upload */}
            <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.webm"
                onChange={handleFileUpload}
                className="hidden"
            />

            {/* Minimal Sidebar */}
            <MinimalSidebar
                recordings={recordings}
                selectedId={selectedId}
                onSelectRecording={handleSelectRecording}
                onNewRecording={handleNewRecording}
                userFirstName={user?.firstName || 'Usuario'}
                user={user}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                    {/* Empty left side */}
                    <div className="flex items-center gap-2">
                    </div>

                    {/* Right side: Plan badge + User Menu */}
                    <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-[#f0f0f0] dark:bg-[#2f2f2f] text-[#444746] dark:text-[#e3e3e3] text-xs font-medium rounded-md">
                            {formatPlanName(user?.subscription?.planId || 'free')}
                        </span>
                        <UserMenu
                            user={user}
                            onNavigate={onNavigate}
                            onLogout={onLogout}
                            onOpenSettings={() => setIsSettingsOpen(true)}
                        />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden">
                    {activeRecording ? (
                        <div className="h-full overflow-y-auto p-6">
                            {/* Recording Detail View */}
                            <div className="max-w-4xl mx-auto space-y-6">
                                {/* Title */}
                                <h1 className="text-2xl font-normal text-slate-900 dark:text-white">
                                    {activeRecording.title || 'Sin título'}
                                </h1>

                                {/* Audio Player */}
                                {activeRecording.audioUrl && (
                                    <div className="py-4">
                                        <audio
                                            controls
                                            src={activeRecording.audioUrl}
                                            className="w-full"
                                        />
                                    </div>
                                )}

                                {/* Transcription */}
                                {activeRecording.segments && activeRecording.segments.length > 0 && (
                                    <div className="space-y-3">
                                        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            Transcripción
                                        </h2>
                                        <div className="space-y-4">
                                            {activeRecording.segments.map((segment, idx) => (
                                                <div key={idx} className="flex gap-4">
                                                    <span className="text-xs text-slate-400 font-mono shrink-0 pt-1">
                                                        {segment.timestamp}
                                                    </span>
                                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                                        <span className="font-medium text-slate-900 dark:text-white">
                                                            {segment.speaker}:
                                                        </span>{' '}
                                                        {segment.text}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Summary */}
                                {activeRecording.summary && (
                                    <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                                        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            Resumen
                                        </h2>
                                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                            {activeRecording.summary}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <EmptyStateClean
                            userName={user?.firstName || 'Usuario'}
                            onAction={handleAction}
                            showCallButton={showCallButton}
                        />
                    )}
                </div>
            </div>

            {/* Settings Modal */}
            <SettingsModal
                user={user}
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onUpdateUser={onUpdateUser}
            />

            {/* Dialer Modal (TODO: Implement) */}
            {isDialerOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-semibold mb-4">Dialer</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            Dialer component will be integrated here
                        </p>
                        <button
                            onClick={() => setIsDialerOpen(false)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardClean;
