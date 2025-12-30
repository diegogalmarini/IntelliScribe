import React, { useState, useRef, useEffect } from 'react';
import { Recording, AppRoute, Folder, UserProfile } from '../../types';
import { MinimalSidebar } from './components/MinimalSidebar';
import { ProfileAvatar } from './components/ProfileAvatar';
import { EmptyStateClean } from './components/EmptyStateClean';
import { SettingsModal } from './components/SettingsModal';
import { RecordingDetailView } from './components/RecordingDetailView';

interface IntelligenceDashboardProps {
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
    onSearch?: (query: string) => Promise<Recording[]>;
}

export const IntelligenceDashboard: React.FC<IntelligenceDashboardProps> = ({
    onNavigate,
    recordings,
    onSelectRecording,
    onDeleteRecording,
    onRenameRecording,
    onMoveRecording,
    selectedFolderId,
    folders,
    user,
    onLogout,
    onUpdateUser,
    onSearch
}) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isDialerOpen, setIsDialerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Recording[]>([]);
    const [isSearching, setIsSearching] = useState(false);
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

    // Debounced search effect
    useEffect(() => {
        if (!onSearch) {
            // Fallback: use recordings if no search callback provided
            setSearchResults(recordings);
            return;
        }

        if (!searchQuery.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const timer = setTimeout(async () => {
            try {
                const results = await onSearch(searchQuery);
                setSearchResults(results);
            } catch (error) {
                console.error('Search failed:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [searchQuery, onSearch]);

    // Use search results when searching, otherwise use all recordings
    const displayedRecordings = searchQuery.trim() ? searchResults : recordings;

    // Find active recording - check both search results and full recordings
    const activeRecording = selectedId
        ? (searchResults.find(r => r.id === selectedId) || recordings.find(r => r.id === selectedId))
        : null;

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

            <MinimalSidebar
                recordings={displayedRecordings}
                selectedId={selectedId}
                onSelectRecording={handleSelectRecording}
                onNewRecording={handleNewRecording}
                userFirstName={user?.firstName || 'Usuario'}
                user={user}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onRenameRecording={onRenameRecording}
                onDeleteRecording={onDeleteRecording}
                onMoveRecording={onMoveRecording}
                folders={folders}
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
                        <ProfileAvatar
                            user={user}
                            onClick={() => setIsSettingsOpen(true)}
                        />
                    </div>
                </div>

                {/* Content Area - Chat Interface or Empty State */}
                <div className="flex-1 overflow-hidden bg-white dark:bg-[#1a1a1a]">
                    {activeRecording ? (
                        <RecordingDetailView recording={activeRecording} />
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
                onNavigate={onNavigate}
                onLogout={onLogout}
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

export default IntelligenceDashboard;
