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
import { MultiAudioUploader } from './components/MultiAudioUploader';  // NEW
import { TemplateGallery } from './TemplateGallery'; // NEW
import { transcribeAudio } from '../../services/geminiService';
import { getSignedAudioUrl, uploadAudio } from '../../services/storageService';
import { databaseService } from '../../services/databaseService';
import { concatenateAudios, timeToSeconds } from '../../services/audioConcat';

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
    const [view, setView] = useState<'recordings' | 'subscription' | 'templates'>(initialView); // View state
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

    // Multi-audio upload state
    const [showMultiAudioUploader, setShowMultiAudioUploader] = useState(false);
    const [isProcessingMultiAudio, setIsProcessingMultiAudio] = useState(false);

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
        setIsEditorOpen(false); // Show RecordingDetailView by default
    };

    const handleNewRecording = () => {
        // Open inline recorder instead of navigating to old LiveRecording page
        setIsRecording(true);
        setSelectedId(null); // Clear any selected recording
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Check if user is logged in
            if (!user || !user.id) {
                alert("Debes iniciar sesión para subir archivos.");
                return;
            }

            // Set loading state (reuse multi-audio spinner or a new one?)
            // Using processing state for simpler UI feedback
            setIsProcessingMultiAudio(true); // Reusing this for spinner visibility if shared, or add specific state

            console.log('[Dashboard] Starting single file upload:', file.name);

            // Upload Logic
            const processUpload = async () => {
                // 0. OPTIMISTIC UPDATE: Show immediately
                const now = new Date();
                const tempId = `temp-${Date.now()}`;

                // Create optimistic recording state
                const optimisticRecording: Recording = {
                    id: tempId,
                    folderId: selectedFolderId === 'ALL' ? null : selectedFolderId,
                    title: file.name.replace(/\.[^/.]+$/, ""),
                    description: `Subiendo...`,
                    date: now.toISOString(),
                    duration: '00:00:00',
                    durationSeconds: 0,
                    status: 'Processing', // Shows spinner
                    tags: ['upload', 'manual'],
                    participants: 1,
                    audioUrl: '',
                    summary: null,
                    segments: [],
                    notes: [],
                    media: [],
                    metadata: { type: 'single' }
                };

                // Show it immediately
                setTempRecording(optimisticRecording);
                setView('recordings');
                setSelectedId(tempId);
                // Important: clear any previous editor state so DetailView shows up
                setIsEditorOpen(false);

                try {
                    // 1. Upload to Storage
                    const audioUrl = await uploadAudio(file, user.id!);
                    if (!audioUrl) throw new Error("Error al subir el archivo a storage.");

                    // 2. Prepare Final Metadata
                    const recordingData: Recording = {
                        ...optimisticRecording,
                        id: '', // let DB assign UUID
                        description: `Subido manualmente: ${file.name}`,
                        audioUrl: audioUrl,
                    };

                    // 3. Create in Database
                    const createdRecording = await databaseService.createRecording(recordingData);
                    if (!createdRecording) throw new Error("Error al crear el registro en base de datos.");

                    console.log('[Dashboard] Recording created:', createdRecording.id);

                    // Update local state with REAL ID
                    setTempRecording(createdRecording);
                    setSelectedId(createdRecording.id); // Switch selection to real ID

                    // 4. Trigger Transcription (Auto)
                    const signedUrl = await getSignedAudioUrl(audioUrl);
                    if (signedUrl) {
                        try {
                            const segments = await transcribeAudio(undefined, file.type, 'es', signedUrl);
                            if (segments && segments.length > 0) {
                                await databaseService.updateRecording(createdRecording.id, {
                                    segments: segments as any,
                                    status: 'Completed'
                                });
                                // Update local optimistic view
                                setTempRecording(prev => prev ? ({ ...prev, segments: segments as any, status: 'Completed' }) : null);
                            }
                        } catch (transcribeError) {
                            console.error("Auto-transcription failed (background):", transcribeError);
                        }
                    }

                } catch (error: any) {
                    console.error("Upload failed:", error);
                    alert(`Error al subir el archivo: ${error.message}`);
                    // Revert optimistic update
                    setTempRecording(null);
                    setSelectedId(null);
                } finally {
                    setIsProcessingMultiAudio(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }
            };

            processUpload();
        }
    };

    const handleAction = (type: 'record' | 'upload' | 'multiaudio') => {
        if (type === 'record') {
            // Open inline recorder instead of navigating
            setIsRecording(true);
            setSelectedId(null); // Clear any selected recording
        }
        if (type === 'upload') {
            // Trigger hidden file input click
            fileInputRef.current?.click();
        }
        if (type === 'multiaudio') {
            // Open multi-audio uploader for conversations
            setShowMultiAudioUploader(true);
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

                    // Show RecordingDetailView (default) instead of InlineEditor
                    setIsEditorOpen(false);
                }
            } catch (error) {
                console.error("Error saving recording:", error);
                setIsRecording(false);
            }
        };
    };

    const handleProcessMultiAudio = async (files: any[]) => {
        console.log('[Dashboard] handleProcessMultiAudio called with files:', files);
        try {
            setIsProcessingMultiAudio(true);

            console.log('[Dashboard] Starting audio concatenation...');
            // 1. Concatenate audios into single MP3
            const audioFiles = files.map(f => f.file);
            const { blob, segmentOffsets, totalDuration } = await concatenateAudios(audioFiles);

            console.log('[Dashboard] Uploading WAV to Supabase...');
            // 2. Upload concatenated WAV to Supabase  
            const audioUrl = await uploadAudio(blob, user.id!);
            if (!audioUrl) throw new Error('Failed to upload audio');
            console.log('[Dashboard] Upload complete, URL:', audioUrl);

            // 3. Get signed URL for transcription
            console.log('[Dashboard] Getting signed URL...');
            const signedUrl = await getSignedAudioUrl(audioUrl);
            if (!signedUrl) throw new Error('Failed to get signed URL');
            console.log('[Dashboard] Signed URL obtained');

            // 4. Transcribe the full concatenated audio
            console.log('[Dashboard] Starting transcription...');
            const fullTranscription = await transcribeAudio(undefined, 'audio/wav', 'es', signedUrl);
            console.log('[Dashboard] Transcription complete, segments:', fullTranscription.length);

            // 5. Distribute segments to speakers based on time offsets
            const allSegments: any[] = [];
            fullTranscription.forEach((seg, idx) => {
                const segTime = timeToSeconds(seg.timestamp || '0:00');

                // Find which audio file this segment belongs to
                let speakerIndex = 0;
                for (let j = 0; j < segmentOffsets.length; j++) {
                    if (segTime >= segmentOffsets[j]) {
                        speakerIndex = j;
                    }
                }

                allSegments.push({
                    id: `seg-${idx}`,
                    timestamp: seg.timestamp || '00:00',
                    speaker: files[speakerIndex].assignedSpeaker,
                    text: seg.text || '',
                    speakerColor: getSpeakerColor(files[speakerIndex].assignedSpeaker),
                });
            });

            // 6. Build temporal metadata
            const temporalSegments: any[] = [];
            let currentSegmentStart = 0;

            files.forEach((file: any, idx: number) => {
                const segmentEnd = idx < files.length - 1 ?
                    allSegments.findIndex(s => files[idx + 1] && timeToSeconds(s.timestamp) >= segmentOffsets[idx + 1]) :
                    allSegments.length;

                temporalSegments.push({
                    originalFile: file.filename,
                    recordedAt: file.extractedDate ? new Date(file.extractedDate).toISOString() : new Date().toISOString(),
                    speaker: file.assignedSpeaker,
                    segmentStartIndex: currentSegmentStart,
                    segmentEndIndex: segmentEnd
                });

                currentSegmentStart = segmentEnd;
            });

            console.log('[Dashboard] Temporal metadata:', temporalSegments);

            // 7. Create recording
            const h = Math.floor(totalDuration / 3600).toString().padStart(2, '0');
            const m = Math.floor((totalDuration % 3600) / 60).toString().padStart(2, '0');
            const s = Math.floor(totalDuration % 60).toString().padStart(2, '0');

            const recording: Recording = {
                id: '',
                folderId: selectedFolderId === 'ALL' ? null : selectedFolderId,
                title: `Multi-Audio - ${new Date(files[0].extractedDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`,
                description: `${files.length} audios de conversación`,
                date: new Date().toISOString(),
                duration: `${h}:${m}:${s}`,
                durationSeconds: Math.floor(totalDuration),
                status: 'Completed',
                tags: ['multi-audio', 'conversation'],
                participants: new Set(files.map((f: any) => f.assignedSpeaker)).size,
                audioUrl,
                summary: null,
                segments: allSegments,
                notes: [],
                media: [],
                metadata: {
                    type: 'multi-audio',
                    segments: temporalSegments
                }
            };

            console.log('[Dashboard] Recording with metadata:', recording);

            // 8. Save to database
            const createdRecording = await databaseService.createRecording(recording);
            if (!createdRecording) throw new Error('Failed to create recording');

            // 8. Update state and navigate
            console.log('[Dashboard] Recording created:', createdRecording.id);
            console.log('[Dashboard] Opening InlineEditor...');

            // Set temp recording to ensure immediate availability with fresh metadata
            setTempRecording(createdRecording);

            setShowMultiAudioUploader(false);
            setView('recordings');
            setSelectedId(createdRecording.id);
            // onSelectRecording(createdRecording.id); // Removed to avoid overriding with stale parent data
            setIsEditorOpen(false); // Show RecordingDetailView
            console.log('[Dashboard] Multi-audio process complete!');

        } catch (error: any) {
            console.error('[Multi-Audio] Processing failed:', error);
            alert(`Error al procesar audios: ${error.message}`);
        } finally {
            setIsProcessingMultiAudio(false);
        }
    };

    // Helper to assign colors to speakers
    const getSpeakerColor = (speaker: string): string => {
        const colors = [
            'from-blue-400 to-purple-500',
            'from-green-400 to-emerald-500',
            'from-orange-400 to-red-500',
            'from-pink-400 to-rose-500',
            'from-cyan-400 to-teal-500'
        ];

        // Hash speaker name to consistent color
        let hash = 0;
        for (let i = 0; i < speaker.length; i++) {
            hash = speaker.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const handleCancelRecording = () => {
        setIsRecording(false);
    };

    const handleCloseEditor = () => {
        setIsEditorOpen(false);
    };

    // --- RENAME SPEAKER Logic --- (Specific helper)
    const handleUpdateSpeaker = async (oldSpeaker: string, newSpeaker: string) => {
        if (!activeRecording || !activeRecording.segments) return;

        const updatedSegments = activeRecording.segments.map(s =>
            s.speaker === oldSpeaker ? { ...s, speaker: newSpeaker } : s
        );

        handleUpdateSegmentBatch(activeRecording.id, updatedSegments);
    };

    // --- UPDATE SEGMENT Utility ---
    const handleUpdateSegment = async (index: number, updates: Partial<{ speaker: string; text: string }>) => {
        if (!activeRecording || !activeRecording.segments) return;

        const updatedSegments = [...activeRecording.segments];
        updatedSegments[index] = { ...updatedSegments[index], ...updates };

        handleUpdateSegmentBatch(activeRecording.id, updatedSegments);
    };

    const handleUpdateSegmentBatch = async (recordingId: string, updatedSegments: any[]) => {
        // Optimistic update
        onUpdateRecording(recordingId, { segments: updatedSegments });

        // DB Update
        try {
            await databaseService.updateRecording(recordingId, { segments: updatedSegments });
        } catch (error) {
            console.error("Failed to update segments", error);
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

    // Temporary recording state to show immediately after creation/update while waiting for backend sync
    const [tempRecording, setTempRecording] = useState<Recording | null>(null);

    // Use search results when searching, otherwise use all recordings
    // Fix: Include tempRecording (optimistic update) in the list if not already present
    const displayedRecordings = React.useMemo(() => {
        const base = searchQuery.trim() ? searchResults : recordings;
        if (tempRecording && !base.find(r => r.id === tempRecording.id)) {
            return [tempRecording, ...base];
        }
        return base;
    }, [searchQuery, searchResults, recordings, tempRecording]);

    // Find active recording - check temp, then search results, then full recordings
    const activeRecording = (selectedId && tempRecording && tempRecording.id === selectedId)
        ? tempRecording
        : selectedId
            ? (searchResults.find(r => r.id === selectedId) || recordings.find(r => r.id === selectedId))
            : null;


    // DISABLED: Auto-open InlineEditor - User wants RecordingDetailView as default
    // useEffect(() => {
    //     if (activeRecording && !isEditorOpen && !isRecording) {
    //         if (activeRecording.segments && activeRecording.segments.length > 0) {
    //             console.log('[Dashboard] Auto-opening editor for', activeRecording.id);
    //             setIsEditorOpen(true);
    //         }
    //     }
    // }, [activeRecording, isEditorOpen, isRecording]);

    // Check if user has Business+ plan for call button
    const showCallButton = user?.subscription?.planId === 'business_plus';

    console.log('[Dashboard Render] ActiveRec:', activeRecording?.id, 'IsEditorOpen:', isEditorOpen, 'TempRec:', tempRecording?.id, 'View:', view);

    return (
        <div className="flex h-screen bg-white dark:bg-background-dark overflow-hidden">
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
                onLogoClick={() => {
                    setView('recordings');
                    setSelectedId(null);
                    setIsEditorOpen(false);
                    setIsRecording(false);
                    setSearchQuery('');
                }}
                currentView={view}
                onViewChange={setView}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
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
                            className="px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-md border border-blue-100 dark:border-blue-500/20 hover:opacity-80 transition-opacity"
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
                <div className="flex-1 overflow-hidden bg-white dark:bg-background-dark">
                    {showMultiAudioUploader ? (
                        <MultiAudioUploader
                            user={user}
                            onProcess={handleProcessMultiAudio}
                            onCancel={() => setShowMultiAudioUploader(false)}
                        />
                    ) : view === 'subscription' ? (
                        <SubscriptionView user={user} />
                    ) : view === 'templates' ? (
                        <TemplateGallery
                            onUseTemplate={(templateId) => {
                                console.log("Using template:", templateId);
                                setView('recordings');
                                handleNewRecording(); // Go to recorder
                                // TODO: Pass templateId to recorder context or state
                            }}
                        />
                    ) : isEditorOpen && activeRecording ? (
                        <InlineEditor
                            recording={activeRecording}
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
                            onGenerateTranscript={handleGenerateTranscript}
                            onRename={(newTitle) => onRenameRecording(activeRecording?.id, newTitle)}
                            onUpdateSpeaker={handleUpdateSpeaker}
                            onUpdateSummary={handleUpdateSummary}
                            onUpdateSegment={handleUpdateSegment}
                            onUpdateRecording={onUpdateRecording}
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
