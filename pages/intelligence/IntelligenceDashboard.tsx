import React, { useState, useRef, useEffect } from 'react';
import { Recording, AppRoute, Folder, UserProfile, NoteItem, MediaItem } from '../../types';
import { MinimalSidebar } from './components/MinimalSidebar';
import { ProfileAvatar } from './components/ProfileAvatar';
import { EmptyStateClean } from './components/EmptyStateClean';
import { SettingsModal } from './components/SettingsModal';
import { RecordingDetailView } from './components/RecordingDetailView';
import { InlineRecorder } from './components/InlineRecorder';
import { InlineEditor } from './components/InlineEditor';
import { SubscriptionView } from './components/SubscriptionView';   // Added import
import { transcribeAudio } from '../../services/geminiService';
import { getSignedAudioUrl } from '../../services/storageService';
import { databaseService } from '../../services/databaseService';

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
    initialView?: 'recordings' | 'subscription'; // Added prop
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
    onUpdateRecording,
    initialView = 'recordings' // Default value
}) => {
    const [view, setView] = useState<'recordings' | 'subscription'>(initialView); // View state
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Sync view with prop changes (e.g. navigation trigger)
    useEffect(() => {
        if (initialView) setView(initialView);
    }, [initialView]);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    // editorRecording removed - using activeRecording source of truth
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
        setView('recordings'); // Switch back to recordings view
        setSelectedId(id);
        onSelectRecording(id);
        // CRITICAL: Close editor when switching recordings to show Detail View first
        setIsEditorOpen(false);
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
        reader.onloadend = async () => {
            const base64Audio = reader.result as string;

            try {
                const newRecording = await onRecordingComplete(base64Audio, durationSeconds, title, notes, media, audioBlob);
                setIsRecording(false);

                if (newRecording && typeof newRecording === 'object') {
                    // Sync internal selection state
                    setSelectedId(newRecording.id);
                    onSelectRecording(newRecording.id);
                    // Open editor with the new recording (which is now activeRecording)
                    setIsEditorOpen(true);
                }
            } catch (error) {
                console.error("Error saving recording:", error);
                setIsRecording(false);
            }
        };
    };

    const handleCancelRecording = () => {
        setIsRecording(false);
    };

    const handleCloseEditor = () => {
        setIsEditorOpen(false);
    };

    // --- RENAME SPEAKER Logic ---
    const handleUpdateSpeaker = async (recordingId: string, oldSpeaker: string, newSpeaker: string) => {
        const recording = recordings.find(r => r.id === recordingId);
        if (!recording || !recording.segments) return;

        // Optimistic update
        const updatedSegments = recording.segments.map(s =>
            s.speaker === oldSpeaker ? { ...s, speaker: newSpeaker } : s
        );

        // Notify parent to update state
        onUpdateRecording(recordingId, { segments: updatedSegments });

        // DB Update
        try {
            await databaseService.updateRecording(recordingId, { segments: updatedSegments });
        } catch (error) {
            console.error("Failed to update speaker", error);
            // Revert on error (optional implementation)
        }
    };

    const handleUpdateSummary = (summary: string) => {
        if (!selectedId) return;

        // Update UI
        onUpdateRecording(selectedId, { summary });

        // Update DB
        databaseService.updateRecording(selectedId, { summary })
            .catch(err => console.error("Failed to update summary", err));
    };

    const handleGenerateTranscript = async () => {
        if (!activeRecording || !onUpdateRecording) return;

        try {
            const urlToUse = await getSignedAudioUrl(activeRecording.audioUrl);
            if (!urlToUse) throw new Error("No audio URL available");

            const segments = await transcribeAudio(undefined, undefined, 'es', urlToUse);

            // Check if segments are valid
            if (!segments || segments.length === 0) {
                console.warn("No segments returned");
                return;
            }

            // Cast partial segments to full segments if needed, or rely on TS compatibility
            // Assuming the service returns standard Segment objects

            // Update DB
            await databaseService.updateRecording(activeRecording.id, {
                segments: segments as any, // force cast if types differ slightly
            });

            // Update UI
            onUpdateRecording(activeRecording.id, {
                segments: segments as any
            });

        } catch (error) {
            console.error("Transcription error:", error);
            alert("Error generating transcription: " + (error as any).message);
        }
    };

    const handleNavigateToEditor = () => {
        if (activeRecording) {
            setIsEditorOpen(true);
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

    // Auto-open InlineEditor when activeRecording changes (e.g., from LiveRecording page)
    // This ensures the new editor shows instead of RecordingDetailView (old editor)
    useEffect(() => {
        if (activeRecording && !isEditorOpen && !isRecording) {
            // Only auto-open if we have a recording, editor is closed, and we're not currently recording
            // Check if this recording has a transcript - if yes, open editor directly
            if (activeRecording.segments && activeRecording.segments.length > 0) {
                setIsEditorOpen(true);
            }
            // If no transcript yet, user will see RecordingDetailView with "Generate Transcript" button
            // They can manually open editor by clicking transcript button which calls handleNavigateToEditor
        }
    }, [activeRecording, isEditorOpen, isRecording]);

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
                <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-slate-200 dark:border-slate-800">
                    {/* Left side: Logo (mobile) or Back Button (subscription view) */}
                    <div className="flex items-center gap-3">
                        {/* Mobile Logo */}
                        <div className="md:hidden flex items-center gap-2">
                            <img
                                src={document.documentElement.classList.contains('dark') ? '/logo-diktalo-b.svg' : '/logo-diktalo.svg'}
                                alt="Diktalo"
                                className="h-6 w-auto"
                            />
                        </div>

                        {/* Back Button for Subscription View (Desktop) */}
                        {view === 'subscription' && (
                            <button
                                onClick={() => setView('recordings')}
                                className="hidden md:block p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5" />
                                    <path d="M12 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Right side: Plan badge + User Menu */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setView('subscription')}
                            className="px-2.5 py-1 bg-[#f0f0f0] dark:bg-[#2f2f2f] text-[#444746] dark:text-[#e3e3e3] text-xs font-medium rounded-md hover:opacity-80 transition-opacity"
                        >
                            {formatPlanName(user?.subscription?.planId || 'free')}
                        </button>
                        <ProfileAvatar
                            user={user}
                            onClick={() => setIsSettingsOpen(true)}
                        />
                    </div>
                </div>

                {/* Content Area - Editor, Recorder, Recording Detail, Empty State, or Subscription View */}
                <div className="flex-1 overflow-hidden bg-white dark:bg-[#1a1a1a]">
                    {view === 'subscription' ? (
                        <SubscriptionView user={user} />
                    ) : isEditorOpen && activeRecording ? (
                        <InlineEditor
                            recording={activeRecording}
                            user={user}
                            onUpdateRecording={onUpdateRecording}
                            onClose={handleCloseEditor}
                        />
                    ) : isRecording ? ( // Removed isEditorOpen check here as it's separate
                        <InlineRecorder
                            user={user}
                            onComplete={handleRecordingComplete}
                            onCancel={handleCancelRecording}
                        />
                    ) : activeRecording ? (
                        <RecordingDetailView
                            recording={activeRecording}
                            onGenerateTranscript={handleGenerateTranscript}
                            onRename={(newTitle) => onRenameRecording(activeRecording.id, newTitle)}
                            onUpdateSpeaker={(oldS, newS) => handleUpdateSpeaker(activeRecording.id, oldS, newS)}
                            onUpdateSummary={handleUpdateSummary}
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
