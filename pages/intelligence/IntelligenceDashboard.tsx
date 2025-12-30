import React, { useState, useRef, useEffect } from 'react';
import { Recording, AppRoute, Folder, UserProfile, NoteItem, MediaItem } from '../../types';
import { MinimalSidebar } from './components/MinimalSidebar';
import { ProfileAvatar } from './components/ProfileAvatar';
import { EmptyStateClean } from './components/EmptyStateClean';
import { SettingsModal } from './components/SettingsModal';
import { RecordingDetailView } from './components/RecordingDetailView';
import { InlineRecorder } from './components/InlineRecorder';
import { InlineEditor } from './components/InlineEditor';

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
    onRecordingComplete: (url: string, durationSeconds: number, customTitle: string, notes: NoteItem[], media: MediaItem[], audioBlob?: Blob) => Promise<Recording | void> | void;
    onUpdateRecording: (id: string, updates: Partial<Recording>) => void;
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
    onSearch,
    onRecordingComplete,
    onUpdateRecording
}) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editorRecording, setEditorRecording] = useState<Recording | null>(null);
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

    const handleAction = (type: 'record' | 'upload') => {
        if (type === 'record') {
            // Open inline recorder instead of navigating
            setIsRecording(true);
            setSelectedId(null); // Clear any selected recording
        }
        if (type === 'upload') {
            // Trigger hidden file input click
            fileInputRef.current?.click();
        }
    };

    const handleRecordingComplete = (audioBlob: Blob, durationSeconds: number, title: string, notes: NoteItem[], media: MediaItem[]) => {
        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
            const base64Audio = reader.result as string;
            onRecordingComplete(base64Audio, durationSeconds, title, notes, media, audioBlob);
            setIsRecording(false);

            // Navigate to editor page
            onNavigate(AppRoute.EDITOR);
        };
    };

    const handleCancelRecording = () => {
        setIsRecording(false);
    };

    const handleCloseEditor = () => {
        setIsEditorOpen(false);
        setEditorRecording(null);
    };

    const handleNavigateToEditor = () => {
        if (activeRecording) {
            onSelectRecording(activeRecording.id);
            onNavigate(AppRoute.EDITOR);
        }
    };

    // Debounced search effect
    useEffect(() => {
        if (!onSearch) {
            // Fallback: no search capability, show all recordings
            return;
        }

        if (!searchQuery.trim()) {
            // No search query, let displayedRecordings show all recordings
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

                {/* Content Area - Editor, Recorder, Recording Detail, or Empty State */}
                <div className="flex-1 overflow-hidden bg-white dark:bg-[#1a1a1a]">
                    {isEditorOpen && editorRecording ? (
                        <InlineEditor
                            recording={editorRecording}
                            user={user}
                            onUpdateRecording={onUpdateRecording}
                            onClose={handleCloseEditor}
                        />
                    ) : isRecording ? (
                        <InlineRecorder
                            user={user}
                            onComplete={handleRecordingComplete}
                            onCancel={handleCancelRecording}
                        />
                    ) : activeRecording ? (
                        <RecordingDetailView
                            recording={activeRecording}
                            onNavigateToEditor={handleNavigateToEditor}
                        />
                    ) : (
                        <EmptyStateClean
                            userName={user?.firstName || 'Usuario'}
                            onAction={handleAction}
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


        </div>
    );
};

export default IntelligenceDashboard;
