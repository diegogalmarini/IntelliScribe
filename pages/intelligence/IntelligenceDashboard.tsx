import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Recording, AppRoute, Folder, UserProfile, NoteItem, MediaItem } from '../../types';
import { MinimalSidebar } from './components/MinimalSidebar';
import { ProfileAvatar } from './components/ProfileAvatar';
import { EmptyStateClean } from './components/EmptyStateClean';
import { SettingsModal } from './components/SettingsModal';
import { RecordingDetailView } from './components/RecordingDetailView';
import { InlineRecorder } from './components/InlineRecorder';
import { InlineEditor } from './components/InlineEditor';
import { SubscriptionView } from './components/SubscriptionView';
import { MultiAudioUploader } from './components/MultiAudioUploader';
import { TemplateGallery } from './TemplateGallery';
import { ChatModal } from './components/ChatModal';
import { ConfirmModal } from './components/ConfirmModal'; // Added Import
import { AlertModal, AlertType } from '../../components/AlertModal';
import { MessageSquare, LayoutTemplate } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { transcribeAudio } from '../../services/geminiService';
import { getSignedAudioUrl, uploadAudio } from '../../services/storageService';
import { databaseService } from '../../services/databaseService';
import { notifyNewRecording } from '../../services/emailService';
import { useToast } from '../../components/Toast';
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
    activeRecordingId?: string | null; // NEW: Pass external selection
    initialSearchQuery?: string; // NEW: Trigger search from outside
    onSelectFolder?: (folderId: string | null) => void;
    onAppStateChange?: (state: { isRecording: boolean; isViewingRecording: boolean; isUploading: boolean }) => void;
    // Folder Actions
    onAddFolder?: (name: string) => Promise<void>;
    onRenameFolder?: (id: string, name: string) => Promise<void>;
    onDeleteFolder?: (id: string) => Promise<void>;
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
    initialView = 'recordings', // Default value
    activeRecordingId,
    initialSearchQuery,
    initialSettingsOpen, // NEW
    onSelectFolder,
    onAppStateChange,
    onAddFolder,
    onRenameFolder,
    onDeleteFolder
}) => {
    const { t } = useLanguage();
    const [view, setView] = useState<'recordings' | 'subscription' | 'templates'>(initialView); // View state
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { showToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();

    // Sync view with prop changes (e.g. navigation trigger)
    useEffect(() => {
        if (initialView) setView(initialView);
    }, [initialView]);

    // Sync external activeRecordingId selection (for SupportBot)
    useEffect(() => {
        if (activeRecordingId && activeRecordingId !== selectedId) {
            console.log(`[Dashboard] External selection trigger: ${activeRecordingId}`);
            handleSelectRecording(activeRecordingId);
        }
    }, [activeRecordingId]);

    // Sync external search query (from SupportBot)
    useEffect(() => {
        if (initialSearchQuery) {
            console.log(`[Dashboard] External search trigger: ${initialSearchQuery}`);
            setSearchQuery(initialSearchQuery);
            setView('recordings');
        }
    }, [initialSearchQuery]);

    // Sync external settings toggle (from SupportBot/Navigate)
    useEffect(() => {
        if (initialSettingsOpen !== undefined) {
            setIsSettingsOpen(initialSettingsOpen);
        }
    }, [initialSettingsOpen]);

    const [showMultiAudioUploader, setShowMultiAudioUploader] = useState(false); // MOVED UP
    const [isProcessingMultiAudio, setIsProcessingMultiAudio] = useState(false); // MOVED UP

    // Handle Deep Linking (e.g. from Extension)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const action = params.get('action');
        if (action === 'upload') {
            console.log('[Dashboard] Deep link detected: upload');
            setShowMultiAudioUploader(true);
            // Clean URL without refresh
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    // editorRecording removed - using activeRecording source of truth
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Recording[]>([]);

    // Sync Dashboard State to Parent (App.tsx) for Dialer visibility
    useEffect(() => {
        onAppStateChange?.({
            isRecording: isRecording,
            isViewingRecording: !!selectedId && !isRecording, // Viewing detail or editor
            isUploading: showMultiAudioUploader || isProcessingMultiAudio
        });
    }, [isRecording, selectedId, showMultiAudioUploader, isProcessingMultiAudio]);
    const [isSearching, setIsSearching] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);



    // Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Handle Mobile Resize Logic
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setIsSidebarOpen(false); // Default close on mobile
            } else {
                setIsSidebarOpen(true); // Default open on desktop
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    // Alert State
    const [alertState, setAlertState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: AlertType;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    // Navigation Guard State
    // Navigation Guard State
    const [recorderStatus, setRecorderStatus] = useState<'idle' | 'recording' | 'paused'>('idle');
    const [showNavConfirm, setShowNavConfirm] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    // Chat State
    const [chatState, setChatState] = useState<{
        isOpen: boolean;
        recordings: Recording[];
        title?: string;
    }>({
        isOpen: false,
        recordings: []
    });

    const handleAskDiktalo = (contextRecordings: Recording[], title?: string) => {
        setChatState({
            isOpen: true,
            recordings: contextRecordings,
            title
        });
    };


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

    const handleSelectRecording = async (id: string) => {
        // Guard: Check if recording
        if (recorderStatus !== 'idle') {
            setPendingAction(() => () => handleSelectRecording(id));
            setShowNavConfirm(true);
            return;
        }

        setView('recordings'); // Switch back to recordings view

        // Check if recording exists in current lists
        const existing = recordings.find(r => r.id === id) || searchResults.find(r => r.id === id);

        if (existing) {
            setSelectedId(id);
        } else {
            // Not found locally (maybe paginated), fetch it
            try {
                // Determine if we need to show loading? For now just try fetch
                const { databaseService } = await import('../../services/databaseService');
                const rec = await databaseService.getRecordingDetails(id);
                if (rec) {
                    // We need to inject this recording into view so activeRecording selection works
                    setSearchResults(prev => [...prev, rec]); // Hack: push to search results to make it visible
                    setSelectedId(id);
                } else {
                    setAlertState({
                        isOpen: true,
                        title: t('recordingNotFoundTitle') || 'Grabación no encontrada',
                        message: t('recordingNotFoundDesc') || 'No se pudo encontrar la grabación.',
                        type: 'error'
                    });
                }
            } catch (err) {
                setAlertState({
                    isOpen: true,
                    title: t('connectionErrorTitle') || 'Error de conexión',
                    message: t('connectionErrorDesc') || 'Hubo un problema al intentar recuperar la grabación.',
                    type: 'error'
                });
            }
        }
        onSelectRecording(id);
        setIsEditorOpen(false); // Show RecordingDetailView by default
        setIsRecording(false); // Close recorder since we are navigating to an existing recording

        // Auto-close sidebar on mobile when selecting
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    };

    const handleNewRecording = () => {
        // Guard: Check if recording
        if (recorderStatus !== 'idle') {
            setPendingAction(() => () => handleNewRecording());
            setShowNavConfirm(true);
            return;
        }

        // Open inline recorder instead of navigating to old LiveRecording page
        setIsRecording(true);
        setSearchParams({ action: 'record' }); // Sync URL for App.tsx visibility check
        setSelectedId(null); // Clear any selected recording
        if (isMobile) setIsSidebarOpen(false);
    };

    const handleSelectFolder = (folderId: string | null) => {
        // Guard: Check if recording
        if (recorderStatus !== 'idle') {
            setPendingAction(() => () => handleSelectFolder(folderId));
            setShowNavConfirm(true);
            return;
        }

        if (onSelectFolder) onSelectFolder(folderId);

        // Auto-close sidebar ONLY on mobile
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    };

    const handleLogoClick = () => {
        // Guard: Check if recording
        if (recorderStatus !== 'idle') {
            setShowNavConfirm(true);
            return;
        }

        // Reset view to Dashboard Home
        setView('recordings');
        setSelectedId(null);
        setIsEditorOpen(false);
        setIsRecording(false); // EXIT RECORDER
        setShowMultiAudioUploader(false); // EXIT MULTI-AUDIO
        // Clean deep link params if any
        setSearchParams({});
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Check if user is logged in
            if (!user || !user.id) {
                alert(t('upload_auth_alert'));
                return;
            }

            // Set loading state (reuse multi-audio spinner or a new one?)
            // Using processing state for simpler UI feedback
            setIsProcessingMultiAudio(true); // Reusing this for spinner visibility if shared, or add specific state


            // Upload Logic
            const processUpload = async () => {
                // 0. OPTIMISTIC UPDATE: Show immediately
                const now = new Date();
                const tempId = `temp-${Date.now()}`;

                // Create optimistic recording state
                const optimisticRecording: Recording = {
                    id: tempId,
                    folderId: selectedFolderId === 'ALL' ? null : selectedFolderId, // Assign folder if selected
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
                if (isMobile) setIsSidebarOpen(false);

                try {
                    // 0.5. COMPRESS LARGE FILES (>10MB)
                    const LARGE_FILE_THRESHOLD = 10 * 1024 * 1024; // 10MB
                    let fileToUpload: Blob = file;
                    let finalFileName = file.name;

                    if (file.size > LARGE_FILE_THRESHOLD) {
                        showToast('Optimizando audio para mejor rendimiento...', 'info');

                        const { compressAudioFile } = await import('../../services/audioConcat');
                        fileToUpload = await compressAudioFile(file);

                        // Update filename to .wav since compression outputs WAV
                        finalFileName = file.name.replace(/\.[^/.]+$/, "") + '.wav';
                    }

                    // TRACK: Single Upload Start
                    trackEvent('upload_single_audio_start', {
                        file_size: file.size,
                        transcription_language: user.transcriptionLanguage || 'es'
                    });

                    // 1. Upload to Storage (use compressed blob if applicable)
                    const audioUrl = await uploadAudio(fileToUpload as File, user.id!);
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


                    // Update local state with REAL ID
                    setTempRecording(createdRecording);
                    setSelectedId(createdRecording.id); // Switch selection to real ID

                    // Notify user via email (async)
                    notifyNewRecording(user, createdRecording).catch(err => console.error('[Notification] Failed to send email:', err));

                    // 4. Trigger Transcription (Auto)
                    const signedUrl = await getSignedAudioUrl(audioUrl);
                    if (signedUrl) {
                        try {
                            const targetLang = user.transcriptionLanguage || 'es';
                            const segments = await transcribeAudio(undefined, file.type, targetLang, signedUrl);
                            if (segments && segments.length > 0) {
                                await databaseService.updateRecording(createdRecording.id, {
                                    segments: segments as any,
                                    status: 'Completed'
                                });
                                // Update local optimistic view
                                setTempRecording(prev => prev ? ({ ...prev, segments: segments as any, status: 'Completed' }) : null);

                                // TRACK: Single Upload/Transcription Success
                                trackEvent('upload_single_audio_success', {
                                    duration_seconds: createdRecording.durationSeconds,
                                    transcription_language: targetLang
                                });
                            }
                        } catch (transcribeError) {
                            console.error("Auto-transcription failed (background):", transcribeError);
                        }
                    }

                } catch (error: any) {
                    console.error("Upload failed:", error);
                    showToast(`Error al subir el archivo: ${error.message}`, 'error');
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

    const handleAction = (type: 'record' | 'upload' | 'multiaudio' | 'extension') => {
        if (type === 'record') {
            // Open inline recorder instead of navigating
            setIsRecording(true);
            setSearchParams({ action: 'record' });
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
        if (type === 'extension') {
            trackEvent('click_chrome_ext', { location: 'dashboard' });
            window.open('https://chromewebstore.google.com/detail/gamgfdgjlmnohikeicknbdplagigoeml?utm_source=item-share-cb', '_blank');
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
            } catch (error: any) {
                console.error("Error saving recording:", error);
                alert(`Error al guardar la grabación: ${error.message || 'Error desconocido'}`);
                setIsRecording(false);
            }
        };
    };

    const handleProcessMultiAudio = async (files: any[]) => {
        try {
            setIsProcessingMultiAudio(true);

            // TRACK: Multi-Audio Processing Start
            trackEvent('process_multi_audio_start', {
                file_count: files.length,
                transcription_language: user.transcriptionLanguage || 'es'
            });

            // 1. Concatenate audios into single MP3
            const audioFiles = files.map(f => f.file);
            const { blob, segmentOffsets, totalDuration } = await concatenateAudios(audioFiles);

            // 2. Upload concatenated WAV to Supabase  
            const audioUrl = await uploadAudio(blob, user.id!);
            if (!audioUrl) throw new Error('Failed to upload audio');

            // 3. Get signed URL for transcription
            const signedUrl = await getSignedAudioUrl(audioUrl);
            if (!signedUrl) throw new Error('Failed to get signed URL');

            // 4. Transcribe the full concatenated audio
            const targetLang = user.transcriptionLanguage || 'es';
            const fullTranscription = await transcribeAudio(undefined, 'audio/wav', targetLang, signedUrl);

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

            // 8. Save to database
            const createdRecording = await databaseService.createRecording(recording);
            if (!createdRecording) throw new Error('Failed to create recording');

            // 8. Update state and navigate

            // Set temp recording to ensure immediate availability with fresh metadata
            setTempRecording(createdRecording);

            // TRACK: Multi-Audio Processing Success
            trackEvent('process_multi_audio_success', {
                duration_seconds: Math.floor(totalDuration),
                file_count: files.length,
                transcription_language: targetLang
            });

            // Notify user via email (async)
            notifyNewRecording(user, createdRecording).catch(err => console.error('[Notification] Failed to send email:', err));

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
        setSearchParams({});
    };

    const handleCloseEditor = () => {
        setIsEditorOpen(false);
    };

    // --- RENAME SPEAKER Logic --- (Specific helper)
    const handleUpdateSpeaker = async (oldSpeaker: string, newSpeaker: string, currentSegments?: any[]) => {
        const segmentsToUse = currentSegments || activeRecording?.segments;
        if (!activeRecording || !segmentsToUse) {
            console.warn("[Dashboard] Cannot update speaker: No segments available", { activeRecording: !!activeRecording, hasCurrentSegments: !!currentSegments });
            return;
        }

        const updatedSegments = segmentsToUse.map((s: any) =>
            s.speaker === oldSpeaker ? { ...s, speaker: newSpeaker } : s
        );

        handleUpdateSegmentBatch(activeRecording.id, updatedSegments);
    };

    // --- UPDATE SEGMENT Utility ---
    const handleUpdateSegment = async (index: number, updates: Partial<{ speaker: string; text: string }>, currentSegments?: any[]) => {
        const segmentsToUse = currentSegments || activeRecording?.segments;
        if (!activeRecording || !segmentsToUse) {
            console.warn("[Dashboard] Cannot update segment: No segments available");
            return;
        }

        const updatedSegments = [...segmentsToUse];
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

            const targetLang = user.transcriptionLanguage || 'es';
            const segments = await transcribeAudio(undefined, undefined, targetLang, urlToUse);

            // Check if segments are valid
            if (!segments || segments.length === 0) {
                console.warn("No segments returned");
                showToast("No se pudo generar la transcripción. Intenta de nuevo.", 'warning');
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
            showToast("Error generating transcription: " + (error as any).message, 'error');
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
    // Use search results when searching, otherwise use all recordings
    const displayedRecordings = React.useMemo(() => {
        let base = searchQuery.trim() ? searchResults : recordings;

        // Filter by Folder
        if (selectedFolderId) {
            if (selectedFolderId === 'ALL') {
                // Show all
            } else if (selectedFolderId === 'FAVORITES') {
                // TODO: Implement favorites filtering if field exists
            } else {
                base = base.filter(r => r.folderId === selectedFolderId);
            }
        }

        if (tempRecording && !base.find(r => r.id === tempRecording.id)) {
            // Include temp recording regardless of folder for visibility during processing
            return [tempRecording, ...base];
        }
        return base;
    }, [searchQuery, searchResults, recordings, tempRecording, selectedFolderId]);

    // Find active recording - check temp, then search results (which includes externally fetched), then full recordings
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

    // console.log('[Dashboard Render] ActiveRec:', activeRecording?.id, 'IsEditorOpen:', isEditorOpen, 'TempRec:', tempRecording?.id, 'View:', view);

    return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-background-dark relative">
            {/* Hidden file input for upload */}
            <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.webm"
                onChange={handleFileUpload}
                className="hidden"
            />

            {/* --- SIDEBAR CONTAINER --- */}
            {/* MOBILE: Off-canvas Overlay */}
            <div
                className={`
                    fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-surface-dark shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
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
                    onDeleteRecording={(id) => {
                        onDeleteRecording(id);
                        if (selectedId === id) setSelectedId(null);
                    }}
                    onMoveRecording={(id, folderId) => {
                        onMoveRecording(id, folderId === 'root' ? '' : folderId);
                    }}
                    folders={folders}
                    selectedFolderId={selectedFolderId}
                    onSelectFolder={handleSelectFolder}
                    onLogoClick={handleLogoClick}
                    currentView={view}
                    onViewChange={setView}
                    isOpen={isSidebarOpen}
                    onToggle={() => setIsSidebarOpen(false)}
                    isRecording={isRecording}
                    onAddFolder={onAddFolder}
                    onRenameFolder={onRenameFolder}
                    onDeleteFolder={onDeleteFolder}
                />
            </div>

            {/* Mobile Backdrop */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* DESKTOP: Push/Collapse Transition */}
            <div
                className={`
                    hidden md:block relative h-full bg-white dark:bg-surface-dark border-r border-black/[0.05] dark:border-white/[0.05] transition-all duration-300 ease-in-out overflow-hidden
                    ${isSidebarOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 border-r-0'}
                `}
            >
                <div className="w-64 h-full"> {/* Inner wrapper to prevent content squishing */}
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
                        onDeleteRecording={(id) => {
                            onDeleteRecording(id);
                            if (selectedId === id) setSelectedId(null);
                        }}
                        onMoveRecording={(id, folderId) => {
                            onMoveRecording(id, folderId === 'root' ? '' : folderId);
                        }}
                        folders={folders}
                        selectedFolderId={selectedFolderId}
                        onSelectFolder={handleSelectFolder}
                        onLogoClick={handleLogoClick}
                        currentView={view}
                        onViewChange={setView}
                        isOpen={isSidebarOpen}
                        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                        isRecording={isRecording}
                    />
                </div>
            </div>


            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">

                {/* Top Bar */}
                <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 flex-shrink-0 z-10 bg-white dark:bg-background-dark border-b border-gray-100 dark:border-white/5">
                    {/* Left side: Toggle Button & Back Button */}
                    <div className="flex items-center gap-3">
                        {/* Toggle Button (Visible when sidebar is closed) */}
                        {!isSidebarOpen && (
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <LayoutTemplate size={20} />
                            </button>
                        )}

                        {/* Mobile Refresh Button */}
                        <button
                            onClick={() => window.location.reload()}
                            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors md:hidden"
                            title="Refrescar aplicación"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21.5 2v6h-6"></path>
                                <path d="M2.5 22v-6h6"></path>
                                <path d="M2 11.5a10 10 0 0 1 18.8-4.3L21.5 8"></path>
                                <path d="M22 12.5a10 10 0 0 1-18.8 4.3L2.5 16"></path>
                            </svg>
                        </button>

                        {/* Back Button for Subscription View */}
                        {view === 'subscription' && (
                            <button
                                onClick={() => setView('recordings')}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5" />
                                    <path d="M12 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Right side: Actions & Profile */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                const folderName = folders.find(f => f.id === selectedFolderId)?.name;
                                const title = selectedFolderId === 'ALL' || !selectedFolderId
                                    ? (t('allRecordings') || 'Todas las grabaciones')
                                    : `Carpeta: ${folderName || 'Carpeta'}`;
                                handleAskDiktalo(displayedRecordings, title);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                        >
                            <MessageSquare className="w-3.5 h-3.5" />

                            <div className="h-full pt-12 md:pt-0 overflow-y-auto">
                                <SubscriptionView user={user} />
                            </div>
                            ) : view === 'templates' ? (
                            <div className="h-full pt-12 md:pt-0">
                                <TemplateGallery
                                    onUseTemplate={(templateId) => {
                                        console.log("Using template:", templateId);
                                        setView('recordings');
                                        handleNewRecording();
                                    }}
                                />
                            </div>
                            ) : view === 'integrations' ? (
                            <div className="h-full pt-12 md:pt-0 overflow-y-auto">
                                <Integrations
                                    integrations={user.integrations || []}
                                    onToggle={(id) => onUpdateUser?.({ integrations: (user.integrations || []).map(int => int.id === id ? { ...int, connected: !int.connected } : int) })}
                                />
                            </div>
                            ) : isEditorOpen && activeRecording ? (
                            <div className="flex-1 h-full overflow-hidden flex flex-col relative">
                                <InlineEditor
                                    recording={activeRecording}
                                    user={user}
                                    onUpdateRecording={onUpdateRecording}
                                    onClose={handleCloseEditor}
                                />
                            </div>
                            ) : isRecording ? (
                            <div className="h-full pt-12 md:pt-0">
                                <InlineRecorder
                                    user={user}
                                    onComplete={handleRecordingComplete}
                                    onCancel={() => {
                                        handleCancelRecording();
                                        if (isMobile) setIsSidebarOpen(true);
                                    }}
                                    onStateChange={setRecorderStatus}
                                />
                            </div>
                            ) : activeRecording ? (
                            <div className="h-full pt-12 md:pt-0">
                                <RecordingDetailView
                                    recording={activeRecording} // Use activeRecording from hook/find
                                    user={user}
                                    onGenerateTranscript={!activeRecording.segments || activeRecording.segments.length === 0 ? handleGenerateTranscript : undefined}
                                    onRename={(newTitle) => onRenameRecording(activeRecording.id, newTitle)}
                                    onUpdateSpeaker={handleUpdateSpeaker}
                                    onUpdateSummary={(summary) => onUpdateRecording(activeRecording.id, { summary })}
                                    onUpdateSegment={(idx, updates, segs) => handleUpdateSegment(idx, updates, segs)}
                                    onUpdateRecording={onUpdateRecording}
                                    onAskDiktalo={() => handleAskDiktalo([activeRecording])}
                                />
                            </div>
                            ) : (
                            <div className="h-full pt-12 md:pt-0">
                                <EmptyStateClean
                                    userName={user?.firstName || 'Usuario'}
                                    onAction={handleAction}
                                />
                            </div>
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

                {/* Chat Modal */}
                <ChatModal
                    isOpen={chatState.isOpen}
                    onClose={() => setChatState(prev => ({ ...prev, isOpen: false }))}
                    recordings={chatState.recordings}
                    title={chatState.title}
                    onOpenRecording={(id) => {
                        setChatState(prev => ({ ...prev, isOpen: false }));
                        handleSelectRecording(id);
                    }}
                />

                {/* Alert Modal */}
                <AlertModal
                    isOpen={alertState.isOpen}
                    onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
                    title={alertState.title}
                    message={alertState.message}
                    type={alertState.type}
                />
                {/* Navigation Confirm Modal */}
                <ConfirmModal
                    isOpen={showNavConfirm}
                    onClose={() => setShowNavConfirm(false)}
                    onConfirm={() => {
                        // Force reset
                        setIsRecording(false);
                        setRecorderStatus('idle'); // Force idle
                        setIsEditorOpen(false);
                        setShowMultiAudioUploader(false);

                        if (pendingAction) {
                            pendingAction();
                            setPendingAction(null);
                        } else {
                            // Default fallback (Logo Click behavior)
                            setView('recordings');
                            setSelectedId(null);
                            window.history.replaceState({}, '', window.location.pathname);
                        }
                    }}
                    title={t('confirmExitTitle')}
                    message={t('confirmExitDesc')}
                    confirmText={t('confirmExitBtn')}
                    cancelText={t('cancel')}
                    isDestructive={true}
                />

            </div>
            );
};

            export default IntelligenceDashboard;
