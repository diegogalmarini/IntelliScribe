import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchView } from './components/SearchView';
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
import { ConfirmModal } from './components/ConfirmModal';
import { AlertModal, AlertType } from '../../components/AlertModal';
import { MessageSquare, LayoutTemplate, Search } from 'lucide-react'; // Added Search import
import { useLanguage } from '../../contexts/LanguageContext';
import { transcribeAudio } from '../../services/geminiService';
import { getSignedAudioUrl, uploadAudio } from '../../services/storageService';
import { databaseService } from '../../services/databaseService';
import { notifyNewRecording } from '../../services/emailService';
import { useToast } from '../../components/Toast';
import * as Analytics from '../../utils/analytics';
import { concatenateAudios, timeToSeconds } from '../../services/audioConcat';
import { Integrations } from '../Integrations';

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
    onUpdateRecording: (id: string, updates: Partial<Recording>) => Promise<void>;
    activeRecordingId?: string | null;
    initialSearchQuery?: string;
    onSelectFolder?: (folderId: string | null) => void;
    onAppStateChange?: (state: { isRecording: boolean; isViewingRecording: boolean; isUploading: boolean }) => void;
    onAddFolder?: (name: string) => Promise<void>;
    onRenameFolder?: (id: string, name: string) => Promise<void>;
    onDeleteFolder?: (id: string) => Promise<void>;
    onAction?: (type: string, payload?: any) => void;
    initialView?: 'recordings' | 'subscription' | 'integrations' | 'templates'; // ADDED
}

const IntelligenceDashboard: React.FC<IntelligenceDashboardProps> = ({
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
    activeRecordingId,
    initialSearchQuery = '',
    onSelectFolder,
    onAppStateChange,
    onAddFolder,
    onRenameFolder,
    onDeleteFolder,
    onAction,
    initialView // ADDED
}) => {
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for local views
    // Priority: SearchParams > initialView > default 'recordings'
    const [view, setView] = useState<'recordings' | 'subscription' | 'integrations' | 'templates' | 'search'>(
        (searchParams.get('view') as any) || initialView || 'recordings'
    );

    // Sync view if initialView changes (e.g. when navigating from /dashboard to /plans via App routing)
    useEffect(() => {
        if (initialView) {
            setView(initialView);
        }
    }, [initialView]);

    const [selectedId, setSelectedId] = useState<string | null>(activeRecordingId || null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(searchParams.get('action') === 'record');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [searchResults, setSearchResults] = useState<Recording[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [useSemanticSearch, setUseSemanticSearch] = useState(false);
    const [isMobile] = useState(window.innerWidth < 768);
    const [showMultiAudioUploader, setShowMultiAudioUploader] = useState(false);
    const [isProcessingMultiAudio, setIsProcessingMultiAudio] = useState(false);
    const [recorderStatus, setRecorderStatus] = useState<'idle' | 'recording' | 'paused'>('idle');
    const [showNavConfirm, setShowNavConfirm] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [chatState, setChatState] = useState<{ isOpen: boolean; recordings: Recording[]; title: string }>({
        isOpen: false,
        recordings: [],
        title: ''
    });

    const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string; type: AlertType }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    // Handle deep linking from search params
    useEffect(() => {
        const action = searchParams.get('action');
        const viewParam = searchParams.get('view');
        const id = searchParams.get('id');

        if (action === 'record') setIsRecording(true);
        if (viewParam) setView(viewParam as any);
        if (id) {
            setSelectedId(id);
            onSelectRecording(id);
        }
    }, [searchParams]);

    // Lift state to App.tsx
    useEffect(() => {
        onAppStateChange?.({
            isRecording,
            isViewingRecording: selectedId !== null && !isEditorOpen,
            isUploading: isProcessingMultiAudio
        });
    }, [isRecording, selectedId, isEditorOpen, isProcessingMultiAudio]);

    const handleSelectRecording = (id: string) => {
        setSelectedId(id);
        onSelectRecording(id);
        setIsEditorOpen(false); // Reset to detail view
        setView('recordings'); // FORCE VIEW SWITCH
        onNavigate(AppRoute.DASHBOARD); // Navigate to /dashboard
        if (isMobile) setIsSidebarOpen(false);
    };

    const handleNewRecording = () => {
        setIsRecording(true);
        setSelectedId(null);
    };

    const handleSelectFolder = (folderId: string | null) => {
        onSelectFolder?.(folderId);
        setView('recordings');
        onNavigate(AppRoute.DASHBOARD); // Navigate to /dashboard
        if (isMobile) setIsSidebarOpen(false);
    };

    const handleAskDiktalo = (recs: Recording[], title: string = t('askDiktalo') || 'Preguntar a Diktalo') => {
        setChatState({ isOpen: true, recordings: recs, title });
    };

    const handleLogoClick = () => {
        if (recorderStatus !== 'idle') {
            setShowNavConfirm(true);
            return;
        }
        setView('recordings');
        setSelectedId(null);
        setIsEditorOpen(false);
        setIsRecording(false);
        setShowMultiAudioUploader(false);
        setSearchParams({});
        onNavigate(AppRoute.DASHBOARD); // Navigate to /dashboard
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!user || !user.id) {
                showToast(t('upload_auth_alert'), 'error');
                return;
            }
            setIsProcessingMultiAudio(true);

            const processUpload = async () => {
                const now = new Date();
                const tempId = `temp-${Date.now()}`;
                const originalName = file.name.replace(/\.[^/.]+$/, "");
                const optimisticRecording: Recording = {
                    id: tempId,
                    folderId: selectedFolderId === 'ALL' ? null : selectedFolderId,
                    title: originalName,
                    description: `Procesando audio...`,
                    date: now.toISOString(),
                    duration: '00:00:00', durationSeconds: 0,
                    status: 'Processing',
                    tags: ['upload', 'manual'],
                    participants: 1,
                    audioUrl: '', summary: null, segments: [], notes: [], media: [],
                    metadata: { type: 'single' }
                };

                setTempRecording(optimisticRecording);
                setView('recordings');
                setSelectedId(tempId);
                setIsEditorOpen(false);
                if (isMobile) setIsSidebarOpen(false);

                try {
                    // Always compress and convert to MP3 for consistency
                    showToast('Optimizando audio...', 'info');
                    const { compressAudioFile } = await import('../../services/audioConcat');
                    const mp3Blob = await compressAudioFile(file);

                    // Create a new File object with .mp3 extension for storage
                    const mp3File = new File([mp3Blob], `${originalName}.mp3`, { type: 'audio/mp3' });

                    if (Analytics && typeof Analytics.trackEvent === 'function') {
                        Analytics.trackEvent('upload_single_audio_start', {
                            file_name: file.name,
                            file_size: file.size,
                            compressed_size: mp3Blob.size,
                            transcription_language: user.transcriptionLanguage || 'es'
                        });
                    }

                    const audioUrl = await uploadAudio(mp3File, user.id!);
                    if (!audioUrl) throw new Error("Error al subir el archivo.");

                    const recordingData: Recording = {
                        ...optimisticRecording,
                        id: '',
                        description: `Subido: ${file.name}`,
                        audioUrl,
                        metadata: {
                            audioFileSize: mp3Blob.size
                        }
                    };
                    const createdRecording = await databaseService.createRecording(recordingData);
                    if (!createdRecording) throw new Error("Error al crear el registro.");

                    setTempRecording(createdRecording);
                    setSelectedId(createdRecording.id);
                    notifyNewRecording(user, createdRecording).catch(e => console.error(e));

                    const signedUrl = await getSignedAudioUrl(audioUrl);
                    if (signedUrl) {
                        const targetLang = user.transcriptionLanguage || 'es';
                        const segments = await transcribeAudio(undefined, file.type, targetLang, signedUrl);
                        if (segments && segments.length > 0) {
                            await databaseService.updateRecording(createdRecording.id, { segments: segments as any, status: 'Completed' });
                            setTempRecording(prev => prev ? ({ ...prev, segments: segments as any, status: 'Completed' }) : null);

                            if (Analytics && typeof Analytics.trackEvent === 'function') {
                                Analytics.trackEvent('upload_single_audio_success', {
                                    id: createdRecording.id,
                                    duration_seconds: createdRecording.durationSeconds,
                                    transcription_language: targetLang
                                });
                            }
                        }
                    }
                } catch (error: any) {
                    showToast(`Error: ${error.message}`, 'error');
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
        if (type === 'record') { setIsRecording(true); setSearchParams({ action: 'record' }); setSelectedId(null); }
        if (type === 'upload') fileInputRef.current?.click();
        if (type === 'multiaudio') setShowMultiAudioUploader(true);
        if (type === 'extension') {
            if (Analytics && typeof Analytics.trackEvent === 'function') {
                Analytics.trackEvent('click_chrome_ext', { location: 'dashboard' });
            }
            window.open('https://chromewebstore.google.com/detail/gamgfdgjlmnohikeicknbdplagigoeml?utm_source=item-share-cb', '_blank');
        }
    };

    const handleRecordingComplete = (audioBlob: Blob, durationSeconds: number, title: string, notes: NoteItem[], media: MediaItem[]) => {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            try {
                showToast(t('uploadingAudio') || 'Subiendo grabación...', 'info');
                const newRecording = await onRecordingComplete(base64Audio, durationSeconds, title, notes, media, audioBlob);
                setIsRecording(false);
                if (newRecording && typeof newRecording === 'object') {
                    setSelectedId(newRecording.id);
                    onSelectRecording(newRecording.id);
                    setIsEditorOpen(false);
                }
            } catch (error: any) {
                showToast(`Error: ${error.message}`, 'error');
                setIsRecording(false);
            }
        };
    };

    const handleProcessMultiAudio = async (files: any[]) => {
        try {
            setIsProcessingMultiAudio(true);
            if (Analytics && typeof Analytics.trackEvent === 'function') {
                Analytics.trackEvent('process_multi_audio_start', {
                    file_count: files.length,
                    transcription_language: user.transcriptionLanguage || 'es'
                });
            }

            showToast(t('concatenatingAudio') || 'Concatenando...', 'info');
            const { blob, segmentOffsets, totalDuration } = await concatenateAudios(files.map(f => f.file));

            showToast(t('uploadingAudio') || 'Subiendo...', 'info');
            const audioUrl = await uploadAudio(blob, user.id!);
            if (!audioUrl) throw new Error('Failed to upload audio');

            const signedUrl = await getSignedAudioUrl(audioUrl);
            const targetLang = user.transcriptionLanguage || 'es';
            const fullTranscription = await transcribeAudio(undefined, 'audio/mp3', targetLang, signedUrl!);

            const allSegments: any[] = (fullTranscription.segments || []).map((seg: any, idx: number) => {
                const segTime = timeToSeconds(seg.timestamp || '0:00');
                let speakerIndex = 0;
                for (let j = 0; j < segmentOffsets.length; j++) { if (segTime >= segmentOffsets[j]) speakerIndex = j; }
                return {
                    id: `seg-${idx}`,
                    timestamp: seg.timestamp || '00:00',
                    speaker: files[speakerIndex].assignedSpeaker,
                    text: seg.text || '',
                    speakerColor: getSpeakerColor(files[speakerIndex].assignedSpeaker),
                };
            });

            const currentRecording: Recording = {
                id: '', folderId: selectedFolderId === 'ALL' ? null : selectedFolderId,
                title: `Multi-Audio - ${new Date(files[0].extractedDate).toLocaleDateString()}`,
                description: `${files.length} audios`, date: new Date().toISOString(),
                duration: `${Math.floor(totalDuration / 3600).toString().padStart(2, '0')}:${Math.floor((totalDuration % 3600) / 60).toString().padStart(2, '0')}:${Math.floor(totalDuration % 60).toString().padStart(2, '0')}`,
                durationSeconds: Math.floor(totalDuration), status: 'Completed', tags: ['multi-audio'], participants: new Set(files.map(f => f.assignedSpeaker)).size,
                audioUrl, summary: null, segments: allSegments, notes: [], media: []
            };

            const createdRecording = await databaseService.createRecording(currentRecording);
            setTempRecording(createdRecording);
            if (Analytics && typeof Analytics.trackEvent === 'function') {
                Analytics.trackEvent('process_multi_audio_success', { duration_seconds: Math.floor(totalDuration), file_count: files.length, transcription_language: targetLang });
            }
            setShowMultiAudioUploader(false); setView('recordings'); setSelectedId(createdRecording.id); setIsEditorOpen(false);
        } catch (error: any) {
            showToast(`Error: ${error.message}`, 'error');
        } finally {
            setIsProcessingMultiAudio(false);
            setShowMultiAudioUploader(false);
        }
    };

    const getSpeakerColor = (speaker: string): string => {
        const colors = ['from-blue-400 to-purple-500', 'from-green-400 to-emerald-500', 'from-orange-400 to-red-500', 'from-pink-400 to-rose-500', 'from-cyan-400 to-teal-500'];
        let hash = 0; for (let i = 0; i < speaker.length; i++) { hash = speaker.charCodeAt(i) + ((hash << 5) - hash); }
        return colors[Math.abs(hash) % colors.length];
    };

    const handleCancelRecording = () => { setIsRecording(false); setSearchParams({}); };
    const handleCloseEditor = () => setIsEditorOpen(false);

    const handleUpdateSpeaker = async (oldSpeaker: string, newSpeaker: string, currentSegments?: any[]) => {
        const segmentsToUse = currentSegments || activeRecording?.segments;
        if (!activeRecording || !Array.isArray(segmentsToUse)) return;
        const updatedSegments = segmentsToUse.map((s: any) => s.speaker === oldSpeaker ? { ...s, speaker: newSpeaker } : s);
        onUpdateRecording(activeRecording.id, { segments: updatedSegments });
        await databaseService.updateRecording(activeRecording.id, { segments: updatedSegments });
    };

    const handleUpdateSegment = async (index: number, updates: any, currentSegments?: any[]) => {
        const segmentsToUse = currentSegments || activeRecording?.segments;
        if (!activeRecording || !Array.isArray(segmentsToUse)) return;
        const updatedSegments = [...segmentsToUse];
        updatedSegments[index] = { ...updatedSegments[index], ...updates };
        onUpdateRecording(activeRecording.id, { segments: updatedSegments });
        await databaseService.updateRecording(activeRecording.id, { segments: updatedSegments });
    };

    const handleUpdateSummary = (summary: string) => {
        if (!selectedId) return;
        onUpdateRecording(selectedId, { summary });
        databaseService.updateRecording(selectedId, { summary }).catch(e => console.error(e));
    };

    const handleGenerateTranscript = async () => {
        if (!activeRecording) return;
        try {
            const urlToUse = await getSignedAudioUrl(activeRecording.audioUrl);
            const { segments: rawSegments } = await transcribeAudio(undefined, undefined, user.transcriptionLanguage || 'es', urlToUse!);

            // Defensive validation
            const segments = Array.isArray(rawSegments) ? rawSegments : [];
            if (segments.length === 0) return;

            await databaseService.updateRecording(activeRecording.id, { segments: segments as any });
            onUpdateRecording(activeRecording.id, { segments: segments as any });
        } catch (error: any) {
            showToast("Error: " + error.message, 'error');
        }
    };

    useEffect(() => {
        if (!onSearch || !searchQuery.trim()) { setSearchResults([]); setIsSearching(false); return; }
        setIsSearching(true);
        const timer = setTimeout(async () => {
            try {
                if (useSemanticSearch) {
                    // Trigger vector search
                    const results = await databaseService.semanticLibrarySearch(searchQuery);
                    // Map back to temporary Recording objects for display
                    const mapped: Recording[] = results.map(r => ({
                        id: r.recording_id,
                        title: r.recording_title,
                        date: r.recording_date,
                        status: 'Completed',
                        folderId: null,
                        durationSeconds: 0,
                        participants: 0,
                        audioUrl: '',
                        summary: r.content, // Show matching chunk snippet as summary
                        segments: [],
                        notes: [],
                        media: []
                    }));
                    setSearchResults(mapped);
                } else {
                    setSearchResults(await onSearch(searchQuery));
                }
            } catch (error) {
                console.error('Search failed:', error);
            } finally { setIsSearching(false); }
        }, useSemanticSearch ? 500 : 300);
        return () => clearTimeout(timer);
    }, [searchQuery, onSearch, useSemanticSearch]);

    const [tempRecording, setTempRecording] = useState<Recording | null>(null);
    const displayedRecordings = React.useMemo(() => {
        // ALWAYS use recordings as base for sidebar, ignoring search
        // The Search functions via the SearchModal, which maintains its own filtered list (searchResults)
        let base = recordings;
        if (selectedFolderId && selectedFolderId !== 'ALL' && selectedFolderId !== 'FAVORITES') {
            base = base.filter(r => r.folderId === selectedFolderId);
        }
        if (tempRecording && !base.find(r => r.id === tempRecording.id)) return [tempRecording, ...base];
        return base;
    }, [recordings, tempRecording, selectedFolderId]); // REMOVED searchQuery, searchResults

    const activeRecording = (selectedId && tempRecording?.id === selectedId) ? tempRecording : recordings.find(r => r.id === selectedId) || searchResults.find(r => r.id === selectedId);

    return (
        <div id="intelligence-hub" className="flex h-screen overflow-hidden bg-white dark:bg-background-dark relative">
            <input ref={fileInputRef} type="file" accept="audio/*,.mp3,.wav,.m4a,.webm" onChange={handleFileUpload} className="hidden" />
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-surface-dark shadow-2xl transform transition-transform duration-300 md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <MinimalSidebar
                    recordings={displayedRecordings}
                    selectedId={selectedId}
                    onSelectRecording={handleSelectRecording}
                    onNewRecording={handleNewRecording}
                    userFirstName={user?.firstName || t('guestUser')}
                    user={user}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    useSemanticSearch={useSemanticSearch}
                    onSemanticToggle={() => setUseSemanticSearch(!useSemanticSearch)}
                    onRenameRecording={onRenameRecording}
                    onDeleteRecording={(id) => { onDeleteRecording(id); if (selectedId === id) setSelectedId(null); }}
                    onMoveRecording={(id, fid) => onMoveRecording(id, fid === 'root' ? '' : fid)}
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
            {isMobile && isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
            <div className={`hidden md:block relative h-full bg-white dark:bg-surface-dark border-r border-black/[0.05] dark:border-white/[0.05] transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
                <div className="w-64 h-full">
                    <MinimalSidebar
                        recordings={displayedRecordings}
                        selectedId={selectedId}
                        onSelectRecording={handleSelectRecording}
                        onNewRecording={handleNewRecording}
                        userFirstName={user?.firstName || t('guestUser')}
                        user={user}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        useSemanticSearch={useSemanticSearch}
                        onSemanticToggle={() => setUseSemanticSearch(!useSemanticSearch)}
                        onRenameRecording={onRenameRecording}
                        onDeleteRecording={(id) => { onDeleteRecording(id); if (selectedId === id) setSelectedId(null); }}
                        onMoveRecording={(id, fid) => onMoveRecording(id, fid === 'root' ? '' : fid)}
                        folders={folders}
                        selectedFolderId={selectedFolderId}
                        onSelectFolder={handleSelectFolder}
                        onLogoClick={handleLogoClick}
                        currentView={view}
                        onViewChange={setView}
                        isOpen={isSidebarOpen}
                        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                        isRecording={isRecording}
                        onOpenSearch={() => { setView('search'); if (isMobile) setIsSidebarOpen(false); }}
                        onAddFolder={onAddFolder}
                        onRenameFolder={onRenameFolder}
                        onDeleteFolder={onDeleteFolder}
                    />
                </div>
            </div>
            <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
                <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-background-dark">
                    <div className="flex items-center gap-4">
                        {/* 1. Hamburger Menu (Collapse Toggle) - Only visible when sidebar is CLOSED */}
                        {!isSidebarOpen && (
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                            >
                                <span className="material-symbols-outlined">menu</span>
                            </button>
                        )}

                        {/* 2. Logo (Diktalo) */}
                        <div
                            onClick={handleLogoClick}
                            className="flex items-center gap-2 cursor-pointer opacity-90 hover:opacity-100 transition-opacity select-none"
                        >
                            <span className="text-xl font-medium tracking-tight text-slate-700 dark:text-slate-200">Diktalo</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3">

                        <button
                            onClick={() => handleAskDiktalo(displayedRecordings)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                            <img src="/sparkle_icon.svg" alt="AI" className="w-4 h-4" onError={(e) => e.currentTarget.style.display = 'none'} />
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">{t('askDiktalo') || 'Preguntar a Diktalo'}</span>
                        </button>

                        <button
                            onClick={() => onNavigate(AppRoute.SUBSCRIPTION)}
                            className="flex items-center gap-2 px-2.5 py-1.5 md:px-3 bg-slate-50 dark:bg-slate-800/50 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors group"
                            title="Ver planes"
                        >
                            <span className={`size-2 rounded-full ${user.subscription.planId === 'pro' ? 'bg-purple-500' : user.subscription.planId === 'business' ? 'bg-blue-500' : user.subscription.planId === 'business_plus' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                            <span className="text-[10px] md:text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                                {user.subscription.planId === 'pro' ? t('planPro') || 'Pro' : user.subscription.planId === 'business' ? t('planBiz') || 'Business' : user.subscription.planId === 'business_plus' ? t('planBizPlus') || 'Business+' : t('planFree') || 'Free'}
                            </span>
                        </button>

                        <div id="user-profile-button">
                            <ProfileAvatar user={user} onClick={() => setIsSettingsOpen(true)} />
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden bg-white dark:bg-background-dark">
                    {showMultiAudioUploader ? <MultiAudioUploader user={user} onProcess={handleProcessMultiAudio} onCancel={() => setShowMultiAudioUploader(false)} /> : view === 'search' ? <SearchView searchQuery={searchQuery} onSearchChange={setSearchQuery} searchResults={searchResults} onSelectResult={(id) => { onSelectRecording(id); setSelectedId(id); setView('recordings'); }} isSearching={isSearching} useSemanticSearch={useSemanticSearch} onToggleSemantic={() => setUseSemanticSearch(!useSemanticSearch)} /> : view === 'subscription' ? <div className="h-full overflow-y-auto"><SubscriptionView user={user} /></div> : view === 'templates' ? <TemplateGallery onUseTemplate={() => { setView('recordings'); handleNewRecording(); }} /> : view === 'integrations' ? <div className="h-full overflow-y-auto"><Integrations integrations={user.integrations || []} user={user} onUpdateProfile={onUpdateUser} onToggle={(id) => onUpdateUser?.({ integrations: (user.integrations || []).map(int => int.id === id ? { ...int, connected: !int.connected } : int) })} /></div> : isEditorOpen && activeRecording ? <InlineEditor recording={activeRecording} user={user} onUpdateRecording={onUpdateRecording} onClose={handleCloseEditor} /> : isRecording ? <InlineRecorder user={user} onComplete={handleRecordingComplete} onCancel={handleCancelRecording} onStateChange={setRecorderStatus} /> : activeRecording ? <RecordingDetailView recording={activeRecording} user={user} onGenerateTranscript={!activeRecording.segments?.length ? handleGenerateTranscript : undefined} onRename={(title) => onRenameRecording(activeRecording.id, title)} onUpdateSpeaker={handleUpdateSpeaker} onUpdateSummary={handleUpdateSummary} onUpdateSegment={handleUpdateSegment} onUpdateRecording={onUpdateRecording} onAskDiktalo={() => handleAskDiktalo([activeRecording])} onDelete={(id) => { onDeleteRecording(id); setSelectedId(null); }} /> : <EmptyStateClean userName={user?.firstName || t('guestUser')} onAction={handleAction} />}
                </div>
            </div>
            <SettingsModal user={user} isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onUpdateUser={onUpdateUser} onNavigate={onNavigate} onLogout={onLogout} onAction={onAction} />
            <ChatModal isOpen={chatState.isOpen} onClose={() => setChatState(prev => ({ ...prev, isOpen: false }))} recordings={chatState.recordings} title={chatState.title} onOpenRecording={handleSelectRecording} />
            <AlertModal isOpen={alertState.isOpen} onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))} title={alertState.title} message={alertState.message} type={alertState.type} />
            <ConfirmModal isOpen={showNavConfirm} onClose={() => setShowNavConfirm(false)} onConfirm={() => { setIsRecording(false); setRecorderStatus('idle'); setView('recordings'); setSelectedId(null); }} title={t('confirmExitTitle')} message={t('confirmExitDesc')} confirmText={t('confirmExitBtn')} cancelText={t('cancel')} isDestructive={true} />
        </div>
    );
};

export default IntelligenceDashboard;
