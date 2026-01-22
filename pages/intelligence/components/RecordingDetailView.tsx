import React, { useState } from 'react';
import { Recording, UserProfile, NoteItem, MediaItem } from '../../../types';
import { Play, Pause, Download, FileText, Share2, MoreVertical, Calendar, Clock, Lock, Mic, Sparkles, Sun, Moon, BarChart3, MessageCircle, Loader2, Pencil, Check, X, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { AnalysisModal } from './AnalysisModal';
import { ExportModal } from './ExportModal';
import { generateMeetingSummary, transcribeAudio } from '../../../services/geminiService';
import { getSignedAudioUrl } from '../../../services/storageService';
import * as exportUtils from '../../../utils/exportUtils';
import { supabase } from '../../../lib/supabase';
import { databaseService } from '../../../services/databaseService';
import { saveAs } from 'file-saver';
import { useToast } from '../../../components/Toast';
import { Image as ImageIcon } from 'lucide-react';
import { UpgradeModal } from '../../../components/UpgradeModal';
import { RecordingActions } from './RecordingActions';
import { PremiumFeatureButton } from './PremiumFeatureButton';
import * as Analytics from '../../../utils/analytics';



interface RecordingDetailViewProps {
    recording: Recording;
    user: UserProfile;
    onGenerateTranscript?: () => Promise<void>;
    onRename?: (newTitle: string) => void;
    onUpdateSpeaker?: (oldSpeaker: string, newSpeaker: string, currentSegments?: any[]) => void;
    onUpdateSummary?: (summary: string) => void;
    onUpdateSegment?: (index: number, updates: Partial<{ speaker: string; text: string }>, currentSegments?: any[]) => void;
    onUpdateRecording?: (recordingId: string, updates: Partial<Recording>) => void;
    onAskDiktalo?: () => void;
    onDelete?: (recordingId: string) => void;
}

// Subcomponent to handle individual image signing
const AttachmentThumbnail = ({ attachment, timeLabel, onTimestampClick, onImageClick }: { attachment: any, timeLabel: string, onTimestampClick: (t: string) => void, onImageClick?: (e: React.MouseEvent, url: string) => void }) => {
    const { t } = useLanguage();
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const sign = async () => {
            if (attachment.path) {
                const url = await getSignedAudioUrl(attachment.path); // Reusing getSignedAudioUrl as it works for storage paths
                setSignedUrl(url);
            } else {
                setSignedUrl(attachment.url); // Fallback to raw URL
            }
            setLoading(false);
        };
        sign();
    }, [attachment.path, attachment.url]);

    if (loading) return <div className="w-full h-32 bg-gray-100 dark:bg-white/5 animate-pulse rounded-lg" />;
    if (!signedUrl) return null;

    return (
        <div className="group relative rounded-lg overflow-hidden border border-black/10 dark:border-white/10 cursor-pointer" onClick={() => onTimestampClick(timeLabel)}>
            <img src={signedUrl} alt={`Screenshot at ${timeLabel}`} className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300" />

            {/* Overlay on hover with "View" action */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                {/* Pointer events auto for the icon/button if we wanted a separate button, 
                 but for now we are making the whole card click seek, and we need a way to VIEW.
                 Let's split user intent: Click card -> Seek. Click "Eye" icon -> Open Modal.
                 */}
                <button
                    onClick={(e) => {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        if (onImageClick) onImageClick(e, signedUrl);
                    }}
                    className="pointer-events-auto p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 text-white transition-colors"
                    title={t('viewImage')}
                >
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </div>
                </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-1 px-2 flex items-center justify-between">
                <span>{timeLabel}</span>
            </div>
        </div>
    );
};

export const RecordingDetailView = ({ recording, user, onGenerateTranscript, onRename, onUpdateSpeaker, onUpdateSummary, onUpdateSegment, onUpdateRecording, onAskDiktalo, onDelete }: RecordingDetailViewProps) => {
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');

    // Speaker/Segment Editing State
    const [editingSpeaker, setEditingSpeaker] = useState<string | null>(null);
    const [editedSpeakerName, setEditedSpeakerName] = useState('');
    const [editingSegmentIndex, setEditingSegmentIndex] = useState<number | null>(null);
    const [editedSegmentText, setEditedSegmentText] = useState('');

    const [analysisOpen, setAnalysisOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null); // For Image Modal
    const [signedAudioUrl, setSignedAudioUrl] = useState<string | null>(null);
    const [isTranscribing, setIsTranscribing] = useState(false);

    // Upgrade Modal State
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const [upgradeFeatureName, setUpgradeFeatureName] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // CRITICAL: Local state for data that often goes missing in lightweight props
    const [fullRecording, setFullRecording] = useState<Recording | null>(null);
    const [segments, setSegments] = useState<any[]>(recording.segments || []);
    const [summary, setSummary] = useState<string>(recording.summary || '');
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const audioRef = React.useRef<HTMLAudioElement>(null);

    // Check if user is on FREE plan
    const isFreeUser = !user || !user.subscription || user.subscription.planId === 'free';

    // Upgrade gate helper
    const requiresPremium = (featureName: string, action: () => void) => {
        if (isFreeUser) {
            setUpgradeFeatureName(featureName);
            setUpgradeModalOpen(true);
        } else {
            action();
        }
    };

    // Simple markdown cleaner
    const cleanMarkdown = (text: string | undefined) => {
        if (!text) return '';
        return text.replace(/```markdown/g, '').replace(/```/g, '').trim();
    };

    // CRITICAL: Load full details from DB and prevent data loss on parent refresh
    React.useEffect(() => {
        const loadFullDetails = async () => {
            if (!recording.id || recording.id.startsWith('temp-')) return;

            console.log(`[RecordingDetailView] Loading full details for: ${recording.id}`);
            setIsLoadingDetails(true);

            try {
                // ALWAYS fetch from DB to get segments and summary, even if props are lightweight
                const detailedRec = await databaseService.getRecordingDetails(recording.id);
                if (detailedRec) {
                    console.log(`[RecordingDetailView] Loaded full recording:`, {
                        id: detailedRec.id,
                        hasSegments: !!detailedRec.segments?.length,
                        hasSummary: !!detailedRec.summary
                    });
                    setFullRecording(detailedRec);
                    setSegments(detailedRec.segments || []);
                    setSummary(detailedRec.summary || '');
                    setEditedTitle(detailedRec.title);
                }
            } catch (err) {
                console.error("[RecordingDetailView] Error loading details:", err);
            } finally {
                setIsLoadingDetails(false);
            }
        };

        loadFullDetails();
    }, [recording.id]);

    React.useEffect(() => {
        const loadSignedUrl = async () => {
            const urlSource = fullRecording?.audioUrl || recording.audioUrl;
            if (urlSource) {
                const url = await getSignedAudioUrl(urlSource);
                setSignedAudioUrl(url);
            } else {
                setSignedAudioUrl(null);
            }
        };
        loadSignedUrl();
    }, [recording.audioUrl, fullRecording?.audioUrl]);

    // Update duration when saving to DB
    React.useEffect(() => {
        if (audioRef.current && recording.id && !recording.durationSeconds) {
            const audio = audioRef.current;
            const updateDuration = () => {
                if (audio.duration && isFinite(audio.duration)) {
                    databaseService.updateRecording(recording.id, {
                        durationSeconds: Math.floor(audio.duration)
                    }).catch(err => console.error("Failed to sync duration", err));
                }
            };
            audio.addEventListener('loadedmetadata', updateDuration);
            return () => audio.removeEventListener('loadedmetadata', updateDuration);
        }
    }, [recording.id, recording.durationSeconds]);

    // CRITICAL: Sync local state when props update (to handle parent updates like speaker renames or title changes)
    React.useEffect(() => {
        if (recording.segments && recording.segments.length > 0) {
            setSegments(recording.segments);
        }
    }, [recording.segments]);

    React.useEffect(() => {
        if (recording.summary) {
            setSummary(recording.summary);
        }
    }, [recording.summary]);

    React.useEffect(() => {
        if (recording.title && !isEditingTitle) {
            setEditedTitle(recording.title);
        }
    }, [recording.title, isEditingTitle]);

    React.useEffect(() => {
        const durationSource = fullRecording?.durationSeconds || recording.durationSeconds;
        if (durationSource) {
            setDuration(durationSource);
        }
    }, [recording.durationSeconds, fullRecording?.durationSeconds]);

    // Reset duration state when recording changes to prevent sticky duration
    React.useEffect(() => {
        // Initialize with saved duration or 0 if not present
        const initialDuration = fullRecording?.durationSeconds || recording.durationSeconds || 0;
        setDuration(initialDuration);
        setCurrentTime(0);
        setIsPlaying(false);
    }, [recording.id]);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Convert timestamp string (MM:SS or HH:MM:SS) to seconds
    const timestampToSeconds = (timestamp: string): number => {
        const parts = timestamp.split(':').map(p => parseInt(p, 10));
        if (parts.length === 2) {
            // MM:SS
            return parts[0] * 60 + parts[1];
        } else if (parts.length === 3) {
            // HH:MM:SS
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
        return 0;
    };

    // Handle timestamp click to seek audio
    const handleTimestampClick = (timestamp: string) => {
        if (audioRef.current) {
            const seconds = timestampToSeconds(timestamp);
            audioRef.current.currentTime = seconds;
            setCurrentTime(seconds);
            // Optionally start playing
            if (!isPlaying) {
                audioRef.current.play();
                setIsPlaying(true);
                if (Analytics && typeof Analytics.trackEvent === 'function') {
                    Analytics.trackEvent('play_from_transcript', { recording_id: recording.id, timestamp });
                }
            }

        }
    };

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
                if (Analytics && typeof Analytics.trackEvent === 'function') {
                    Analytics.trackEvent('play_audio_toggle', { recording_id: recording.id });
                }
            }

            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            // Fallback: if duration is still 0, try to get it from audio element
            if (duration === 0 && audioRef.current.duration && isFinite(audioRef.current.duration)) {
                const audioDuration = audioRef.current.duration;
                setDuration(audioDuration);

                // Also save to DB if needed
                if ((!recording.durationSeconds || recording.durationSeconds === 0) && onUpdateRecording) {
                    onUpdateRecording(recording.id, { durationSeconds: Math.round(audioDuration) });
                }
            }
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current && audioRef.current.duration && isFinite(audioRef.current.duration)) {
            const audioDuration = audioRef.current.duration;
            setDuration(audioDuration);

            // If DB doesn't have duration, save it automatically
            if ((!recording.durationSeconds || recording.durationSeconds === 0) && onUpdateRecording) {
                console.log('[RecordingDetailView] Saving audio duration to DB:', Math.round(audioDuration));
                onUpdateRecording(recording.id, { durationSeconds: Math.round(audioDuration) });
            }
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = parseFloat(e.target.value);
        setVolume(vol);
        if (audioRef.current) {
            audioRef.current.volume = vol;
        }
        setIsMuted(vol === 0);
    };

    const toggleMute = () => {
        if (audioRef.current) {
            const newMuteState = !isMuted;
            setIsMuted(newMuteState);
            audioRef.current.muted = newMuteState;
            if (newMuteState) {
                setVolume(0);
            } else {
                setVolume(1);
                audioRef.current.volume = 1;
            }
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return t('no_date_label');
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return t('no_date_label');
        }
        return date.toLocaleString(language === 'es' ? 'es-ES' : 'en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const handleStartEdit = () => {
        setEditedTitle(recording.title);
        setIsEditingTitle(true);
    };

    const handleSaveTitle = () => {
        if (onRename && editedTitle.trim()) {
            onRename(editedTitle.trim());
        }
        setIsEditingTitle(false);
    };

    const handleCancelEdit = () => {
        setIsEditingTitle(false);
    };

    // Speaker Edit Handlers
    const handleStartEditSpeaker = (currentName: string) => {
        setEditingSpeaker(currentName);
        setEditedSpeakerName(currentName);
    };

    const handleSaveSpeaker = (oldName: string) => {
        if (onUpdateSpeaker && editedSpeakerName.trim() && editedSpeakerName !== oldName) {
            onUpdateSpeaker(oldName, editedSpeakerName.trim(), segments);
        }
        setEditingSpeaker(null);
    };

    const handleCancelEditSpeaker = () => {
        setEditingSpeaker(null);
    };

    // Segment Text Edit Handlers
    const handleStartEditSegment = (index: number, currentText: string) => {
        setEditingSegmentIndex(index);
        setEditedSegmentText(currentText);
    };

    const handleSaveSegment = (index: number) => {
        if (onUpdateSegment && segments && segments[index] && editedSegmentText.trim() !== segments[index].text) {
            onUpdateSegment(index, { text: editedSegmentText.trim() }, segments);
        }
        setEditingSegmentIndex(null);
    };

    const handleCancelEditSegment = () => {
        setEditingSegmentIndex(null);
    };

    const hasTranscript = segments && segments.length > 0;
    const hasSummary = summary && summary.trim().length > 0;

    const handleTranscribeAudio = async () => {
        let currentSignedUrl = signedAudioUrl;

        // RETRY LOGIC: If signedUrl is missing, try to generate it now
        if (!currentSignedUrl) {
            const urlSource = fullRecording?.audioUrl || recording.audioUrl;
            if (urlSource) {
                console.log('[RecordingDetail] Audio URL missing, attempting to generate signed URL...');
                const url = await getSignedAudioUrl(urlSource);
                if (url) {
                    currentSignedUrl = url;
                    setSignedAudioUrl(url);
                }
            }
        }

        if (!currentSignedUrl) {
            showToast("Audio URL not available. Please wait or refresh.", 'error');
            return;
        }

        setIsTranscribing(true);

        // CRITICAL: Store backup of existing segments in case regeneration fails
        const backupSegments = [...segments];

        try {
            let mimeType = 'audio/mp3';
            const audioUrlSource = fullRecording?.audioUrl || recording.audioUrl;
            if (audioUrlSource?.endsWith('.webm')) mimeType = 'audio/webm';
            else if (audioUrlSource?.endsWith('.wav')) mimeType = 'audio/wav';
            else if (audioUrlSource?.endsWith('.m4a')) mimeType = 'audio/x-m4a';

            // Transcribe using Gemini service
            const targetLang = user.transcriptionLanguage || 'es';
            const result = await transcribeAudio(undefined, mimeType, targetLang, currentSignedUrl);

            // CRITICAL: Only update if we got valid results
            if (!result || result.length === 0) {
                console.warn('[RecordingDetailView] Regeneration returned empty, preserving original transcription');
                showToast(t('transcriptionRegenerateEmpty'), 'warning');
                return; // Exit without modifying anything
            }

            const newSegments = result.map((s, index) => ({
                id: Date.now().toString() + index,
                timestamp: s.timestamp || "00:00",
                speaker: s.speaker || "Speaker",
                text: s.text || "",
                speakerColor: index % 2 === 0 ? 'from-blue-400 to-purple-500' : 'from-orange-400 to-red-500'
            }));

            // Only update now that we have confirmed valid data
            setSegments(newSegments);
            if (onUpdateRecording) {
                onUpdateRecording(recording.id, { segments: newSegments, status: 'Completed' });
            }

            // Also update internal fullRecording if it exists
            if (fullRecording) {
                setFullRecording({ ...fullRecording, segments: newSegments, status: 'Completed' });
            }

            showToast(t('transcriptionRegeneratedSuccess'), 'success');

        } catch (error) {
            console.error('Failed to transcribe', error);
            showToast(t('transcriptionRegenerateError'), 'error');
            // IMPORTANT: Do NOT modify segments state on error - they stay as they were
        } finally {
            setIsTranscribing(false);
        }
    };

    const handleAnalyze = () => {
        setAnalysisOpen(true);
    };

    const handleGenerateSummary = async (template: string, language: string) => {
        if (!segments || segments.length === 0) return;

        setIsGenerating(true);
        try {
            // Reconstruct full transcript from LOCAL state (which has renames/edits)
            const fullTranscriptArr = segments
                .map(s => `${s.speaker}: ${s.text}`)
                .join('\n');

            // Prepare attachments with relative timestamps AND SIGNED URLS
            let preparedAttachments: any[] = [];
            if (fullRecording?.metadata?.attachments && fullRecording.date) {
                const startTime = new Date(fullRecording.date).getTime();

                // Process attachments in parallel to sign URLs
                preparedAttachments = await Promise.all(fullRecording.metadata.attachments.map(async (att) => {
                    const diffMs = att.timestamp - startTime;
                    const diffSec = Math.max(0, Math.floor(diffMs / 1000));
                    const h = Math.floor(diffSec / 3600).toString().padStart(2, '0');
                    const m = Math.floor((diffSec % 3600) / 60).toString().padStart(2, '0');
                    const s = (diffSec % 60).toString().padStart(2, '0');

                    // Sign the URL if path exists
                    let finalUrl = att.url;
                    if (att.path) {
                        const signed = await getSignedAudioUrl(att.path);
                        if (signed) finalUrl = signed;
                    }

                    return {
                        time: `${h}:${m}:${s}`,
                        url: finalUrl
                    };
                }));
            }

            // Map language code if needed, but 'es' and 'en' match. 
            const summary = await generateMeetingSummary(fullTranscriptArr, language as any, template, preparedAttachments);

            if (onUpdateSummary) {
                onUpdateSummary(summary);
            }
            setSummary(summary); // Update local state immediately
            if (fullRecording) {
                setFullRecording({ ...fullRecording, summary });
            }
            setAnalysisOpen(false);
        } catch (error) {
            console.error(error);
            showToast(t('summaryGenerationError'), 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAskDiktalo = () => {
        if (onAskDiktalo) onAskDiktalo();
    };

    const handleExport = () => {
        requiresPremium('Exportar', () => {
            setExportOpen(true);
            if (Analytics && typeof Analytics.trackEvent === 'function') {
                Analytics.trackEvent('open_export_modal', { recording_id: recording.id });
            }
        });
    };

    const handleSaveNotes = () => {
        console.log("handleSaveNotes: To be implemented");
    };

    const handleDelete = async () => {
        if (!recording.id) return;
        try {
            if (onDelete) {
                onDelete(recording.id);
                // No need for toast here as parent likely handles it or we can keep it
                showToast(t('recordingDeleted'), 'success');
            } else {
                // Fallback soft-delete if onDelete is missing
                await onUpdateRecording?.(recording.id, { status: 'Draft' });
                showToast(t('recordingDeleted'), 'success');
            }
        } catch (error) {
            showToast(t('errorDeletingRecording'), 'error');
        } finally {
            setShowDeleteConfirm(false);
        }
    };

    const handleDownloadAudio = async () => {
        requiresPremium('Descargar Audio', async () => {
            const audioUrlSource = fullRecording?.audioUrl || recording.audioUrl;
            if (!audioUrlSource) return;

            if (Analytics && typeof Analytics.trackEvent === 'function') {
                Analytics.trackEvent('download_audio', { recording_id: recording.id });
            }


            try {
                // Extract file extension from the original audio URL
                const urlParts = audioUrlSource.split('.');
                const fileExtension = urlParts.length > 1 ? urlParts[urlParts.length - 1] : 'mp3';
                const fileName = `${(fullRecording?.title || recording.title) || 'audio'}.${fileExtension}`;

                // Use the already signed URL if available (best for private files)
                // or fetch a new one if expired/missing
                let downloadUrl = signedAudioUrl;

                if (!downloadUrl) {
                    console.log('[RecordingDetailView] Generating new signed URL for download...');
                    downloadUrl = await getSignedAudioUrl(audioUrlSource);
                }

                if (!downloadUrl) throw new Error('Could not generate download URL');

                // Fetch the file
                const response = await fetch(downloadUrl);
                if (!response.ok) throw new Error('Failed to fetch audio file');

                const blob = await response.blob();

                // Use file-saver for reliable download with correct filename
                saveAs(blob, fileName);
                console.log('[RecordingDetailView] Download initiated successfully');
            } catch (err) {
                console.error('Failed to download audio:', err);
                // Replace ugly alert with proper error logging/handling
                // Ideally use a toast here, but for now we suppress the alert to avoid UX disruption
            }
        });
    };

    const handleImageClick = (e: React.MouseEvent, url: string | null) => {
        e.stopPropagation(); // Prevent timestamp seek if clicked on specific view button
        if (url) setSelectedImage(url);
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-background-dark">
            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Full View"
                            className="rounded-lg shadow-2xl max-w-full max-h-[85vh] object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="px-4 md:px-6 py-3 border-b border-black/[0.05] dark:border-white/[0.05] shrink-0">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        {isEditingTitle ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    className="text-xl font-medium text-[#1f1f1f] dark:text-white bg-transparent border-b border-blue-500 focus:outline-none w-full"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveTitle();
                                        if (e.key === 'Escape') handleCancelEdit();
                                    }}
                                />
                                <button onClick={handleSaveTitle} className="p-1 hover:bg-green-500/10 rounded-md text-green-600">
                                    <Check size={18} />
                                </button>
                                <button onClick={handleCancelEdit} className="p-1 hover:bg-red-500/10 rounded-md text-red-600">
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 group">
                                <h1 className="text-lg md:text-xl font-medium text-[#1f1f1f] dark:text-white truncate" title={recording.title}>
                                    {recording.title || t('untitledRecording')}
                                </h1>
                                {onRename && (
                                    <button
                                        onClick={handleStartEdit}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-md text-[#8e8e8e]"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                )}
                            </div>
                        )}
                        <p className="text-[11px] text-[#8e8e8e] mt-1">
                            {formatDate(recording.date)}
                        </p>
                    </div>

                    {/* Action Buttons - Refactored with Premium Gates */}
                    <RecordingActions
                        isTranscribing={isTranscribing}
                        isGeneratingSummary={isGenerating}
                        canTranscribe={!!(fullRecording?.audioUrl || recording.audioUrl)}
                        onTranscribe={handleTranscribeAudio}
                        onGenerateSummary={handleAnalyze}
                        onSaveNotes={handleSaveNotes}
                        onExport={handleExport}
                        onDelete={() => setShowDeleteConfirm(true)}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    {isLoadingDetails && !fullRecording && (
                        <div className="flex items-center gap-2 text-[12px] text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg animate-pulse mb-4">
                            <Loader2 size={14} className="animate-spin" />
                            Actualizando detalles completos...
                        </div>
                    )}

                    {/* Audio Player Card */}
                    <div className="bg-white dark:bg-card-dark rounded-xl border border-black/[0.05] dark:border-white/[0.05] p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText size={16} className="text-[#8e8e8e]" />
                            <h2 className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-wider">
                                {t('audioOriginal')}
                            </h2>
                        </div>

                        {(fullRecording?.audioUrl || recording.audioUrl) ? (
                            <div className="space-y-4">
                                <div className="bg-[#f7f7f8] dark:bg-black/20 rounded-lg p-3 flex items-center gap-4">
                                    {/* Play/Pause Button */}
                                    <button
                                        onClick={togglePlay}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors flex-shrink-0"
                                    >
                                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                                    </button>

                                    {/* Time and Slider */}
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between text-[11px] text-[#8e8e8e] font-medium">
                                            <span>{formatTime(currentTime)}</span>
                                            <span>{formatTime(duration || 0)}</span>
                                        </div>
                                        <div className="relative h-1 bg-black/10 dark:bg-white/10 rounded-full cursor-pointer group">
                                            <input
                                                type="range"
                                                min="0"
                                                max={duration || 100}
                                                value={currentTime}
                                                onChange={handleSeek}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div
                                                className="absolute top-0 left-0 h-full bg-blue-600 rounded-full pointer-events-none transition-all duration-100"
                                                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                                            />
                                            {/* Thumb handle visual */}
                                            <div
                                                className="absolute top-1/2 -mt-1.5 h-3 w-3 bg-white border-2 border-blue-600 rounded-full shadow-sm pointer-events-none transition-all duration-100 opacity-0 group-hover:opacity-100"
                                                style={{ left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 6px)` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Volume */}
                                    <div className="flex items-center gap-2 group relative w-8 hover:w-24 transition-all duration-300">
                                        <button onClick={toggleMute} className="text-[#8e8e8e] hover:text-[#1f1f1f] dark:hover:text-white transition-colors">
                                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                        </button>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={volume}
                                            onChange={handleVolumeChange}
                                            className="w-0 group-hover:w-16 h-1 bg-black/10 dark:bg-white/10 rounded-full cursor-pointer transition-all duration-300 opacity-0 group-hover:opacity-100 accent-blue-600"
                                        />
                                    </div>
                                </div>

                                <audio
                                    ref={audioRef}
                                    src={signedAudioUrl || undefined}
                                    onTimeUpdate={handleTimeUpdate}
                                    onLoadedMetadata={handleLoadedMetadata}
                                    onDurationChange={handleLoadedMetadata}
                                    onEnded={handleEnded}
                                    className="hidden"
                                />

                                {/* Download Button - Premium Feature */}
                                <PremiumFeatureButton
                                    onClick={handleDownloadAudio}
                                    isFreeUser={isFreeUser}
                                    onUpgradeClick={() => {
                                        setUpgradeFeatureName('Descargar Audio');
                                        setUpgradeModalOpen(true);
                                    }}
                                    icon={<Download size={14} />}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#f7f7f8] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-[12px] text-[#0d0d0d] dark:text-[#ececec] hover:bg-[#ebebeb] dark:hover:bg-[#33343d] transition-colors"
                                >
                                    {t('downloadAudio')}
                                </PremiumFeatureButton>
                            </div>
                        ) : (
                            <p className="text-[12px] text-[#8e8e8e]">
                                {t('audioNotReady')}
                            </p>
                        )}
                    </div>

                    {/* Attachments Gallery */}
                    {fullRecording?.metadata?.attachments && fullRecording.metadata.attachments.length > 0 && (
                        <div className="bg-white dark:bg-card-dark rounded-xl border border-black/[0.05] dark:border-white/[0.05] p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <ImageIcon size={16} className="text-[#8e8e8e]" />
                                <h2 className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-wider">
                                    {t('galleryAttachments')}
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {fullRecording.metadata.attachments.map((att, idx) => {
                                    const diffMs = att.timestamp - new Date(fullRecording.date).getTime();
                                    const diffSec = Math.max(0, Math.floor(diffMs / 1000));
                                    const h = Math.floor(diffSec / 3600).toString().padStart(2, '0');
                                    const m = Math.floor((diffSec % 3600) / 60).toString().padStart(2, '0');
                                    const s = (diffSec % 60).toString().padStart(2, '0');
                                    const timeLabel = `${h}:${m}:${s}`;

                                    return (
                                        <AttachmentThumbnail
                                            key={idx}
                                            attachment={att}
                                            timeLabel={timeLabel}
                                            onTimestampClick={handleTimestampClick}
                                            onImageClick={handleImageClick}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Transcription Card */}
                    {hasTranscript ? (
                        <div className="bg-white dark:bg-card-dark rounded-xl border border-black/[0.05] dark:border-white/[0.05] p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <FileText size={16} className="text-[#8e8e8e]" />
                                    <h2 className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-wider">
                                        {t('transcription') || 'Transcripción'}
                                    </h2>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => exportUtils.exportAsPDF(recording, { includeTranscript: true, includeSummary: false })}
                                        className="text-[11px] font-medium text-[#8e8e8e] hover:text-[#0d0d0d] dark:hover:text-[#ececec] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-2 py-1 rounded transition-colors"
                                    >
                                        PDF
                                    </button>
                                    <button
                                        onClick={() => exportUtils.exportAsDoc(recording, { includeTranscript: true, includeSummary: false })}
                                        className="text-[11px] font-medium text-[#8e8e8e] hover:text-[#0d0d0d] dark:hover:text-[#ececec] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-2 py-1 rounded transition-colors"
                                    >
                                        DOC
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {segments.map((segment, idx) => {
                                    // Check for temporal metadata matches
                                    const temporalMeta = recording.metadata?.segments?.find(
                                        meta => meta.segmentStartIndex === idx
                                    );

                                    // Calculate time gap from previous segment
                                    let timeGapDisplay = null;
                                    if (temporalMeta && idx > 0 && recording.metadata?.segments) {
                                        const prevMeta = recording.metadata.segments.find(m => m.segmentEndIndex === idx);
                                        if (prevMeta) {
                                            const prevDate = new Date(prevMeta.recordedAt);
                                            const currDate = new Date(temporalMeta.recordedAt);
                                            const diffHours = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60);

                                            if (diffHours > 24) {
                                                const diffDays = Math.floor(diffHours / 24);
                                                timeGapDisplay = `${diffDays} día${diffDays > 1 ? 's' : ''} después`;
                                            } else if (diffHours > 1) {
                                                timeGapDisplay = `${Math.floor(diffHours)} horas después`;
                                            }
                                        }
                                    }

                                    return (
                                        <React.Fragment key={idx}>
                                            {/* Date Separator */}
                                            {temporalMeta && (
                                                <div className="relative py-6 flex items-center justify-center">
                                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                                        <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
                                                    </div>
                                                    <div className="relative flex flex-col items-center gap-1 bg-white dark:bg-card-dark px-4">
                                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 flex items-center gap-1.5 shadow-sm">
                                                            <Calendar size={14} />
                                                            {new Date(temporalMeta.recordedAt).toLocaleDateString('es-ES', {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                        {timeGapDisplay && (
                                                            <span className="text-[10px] text-orange-600 dark:text-orange-400 italic flex items-center gap-1">
                                                                <Clock size={12} />
                                                                {timeGapDisplay}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Segment Content */}
                                            <div
                                                className="flex gap-4"
                                                onMouseUp={() => {
                                                    try {
                                                        const selection = window.getSelection();
                                                        if (selection && !selection.isCollapsed && selection.anchorNode && selection.focusNode) {
                                                            // Valid selection
                                                        }
                                                    } catch (e) {
                                                        console.warn('Selection error suppressed:', e);
                                                    }
                                                }}
                                            >
                                                <button
                                                    onClick={() => handleTimestampClick(segment.timestamp)}
                                                    className="text-[11px] text-[#8e8e8e] hover:text-blue-600 dark:hover:text-blue-400 font-mono shrink-0 w-16 text-left cursor-pointer hover:underline transition-colors"
                                                    title="Click para saltar a este momento"
                                                >
                                                    {segment.timestamp}
                                                </button>
                                                <div className="flex-1">
                                                    <p className="text-[13px] text-[#0d0d0d] dark:text-[#ececec] leading-relaxed">
                                                        {editingSpeaker === segment.speaker ? (
                                                            <span className="inline-flex items-center gap-1 mr-2">
                                                                <input
                                                                    type="text"
                                                                    value={editedSpeakerName}
                                                                    onChange={(e) => setEditedSpeakerName(e.target.value)}
                                                                    className="text-blue-600 dark:text-blue-400 font-semibold bg-transparent border-b border-blue-500 focus:outline-none w-32"
                                                                    autoFocus
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') handleSaveSpeaker(segment.speaker!);
                                                                        if (e.key === 'Escape') handleCancelEditSpeaker();
                                                                    }}
                                                                />
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleSaveSpeaker(segment.speaker!); }}
                                                                    className="p-0.5 hover:bg-green-500/10 rounded text-green-600"
                                                                >
                                                                    <Check size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleCancelEditSpeaker(); }}
                                                                    className="p-0.5 hover:bg-red-500/10 rounded text-red-600"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </span>
                                                        ) : (
                                                            <span
                                                                className="font-semibold text-blue-600 dark:text-blue-400 mr-1 cursor-pointer hover:underline decoration-blue-400/50"
                                                                onClick={() => onUpdateSpeaker && handleStartEditSpeaker(segment.speaker!)}
                                                                title="Clic para cambiar nombre"
                                                            >
                                                                {segment.speaker}:
                                                            </span>
                                                        )}
                                                        {editingSegmentIndex === idx ? (
                                                            <span className="inline-flex flex-col gap-2 w-full mt-1">
                                                                <textarea
                                                                    value={editedSegmentText}
                                                                    onChange={(e) => setEditedSegmentText(e.target.value)}
                                                                    className="text-[13px] text-[#0d0d0d] dark:text-[#ececec] leading-relaxed bg-black/5 dark:bg-white/5 border border-blue-500 rounded p-2 focus:outline-none w-full min-h-[60px]"
                                                                    autoFocus
                                                                />
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        onClick={() => handleSaveSegment(idx)}
                                                                        className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-[11px] hover:bg-green-700"
                                                                    >
                                                                        <Check size={12} /> Guardar
                                                                    </button>
                                                                    <button
                                                                        onClick={handleCancelEditSegment}
                                                                        className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded text-[11px] hover:bg-red-700"
                                                                    >
                                                                        <X size={12} /> Cancelar
                                                                    </button>
                                                                </div>
                                                            </span>
                                                        ) : (
                                                            <span
                                                                className="cursor-pointer hover:bg-blue-500/5 transition-colors rounded px-1 -mx-1"
                                                                onClick={() => handleStartEditSegment(idx, segment.text)}
                                                                title="Clic para editar texto"
                                                            >
                                                                {segment.text}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-card-dark rounded-xl border border-black/[0.05] dark:border-white/[0.05] p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText size={16} className="text-[#8e8e8e]" />
                                <h2 className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-wider">
                                    {t('transcription') || 'Transcripción'}
                                </h2>
                            </div>
                            <div className="flex flex-col items-center justify-center py-8">
                                <Mic size={48} className="text-[#8e8e8e]/30 mb-4" />
                                <p className="text-[13px] text-[#8e8e8e] mb-6">{t('transcriptionNotAvailable')}</p>
                                {onGenerateTranscript && (
                                    <button
                                        onClick={async () => {
                                            setIsGenerating(true);
                                            try {
                                                await onGenerateTranscript();
                                            } finally {
                                                setIsGenerating(false);
                                            }
                                        }}
                                        disabled={isGenerating}
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/70 text-white text-[13px] font-medium rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        {isGenerating ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Sparkles size={16} />
                                        )}
                                        {isGenerating ? t('regenerating') : t('generateTranscription')}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Summary Card */}
                    {hasSummary && (
                        <div className="bg-white dark:bg-card-dark rounded-xl border border-black/[0.05] dark:border-white/[0.05] p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={16} className="text-[#8e8e8e]" />
                                    <h2 className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-wider">
                                        {t('aiSummary')}
                                    </h2>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => exportUtils.exportAsPDF({ ...recording, segments, summary }, { includeSummary: true, includeTranscript: false })}
                                        className="text-[11px] font-medium text-[#8e8e8e] hover:text-[#0d0d0d] dark:hover:text-[#ececec] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-2 py-1 rounded transition-colors"
                                    >
                                        PDF
                                    </button>
                                    <button
                                        onClick={() => exportUtils.exportAsDoc({ ...recording, segments, summary }, { includeSummary: true, includeTranscript: false })}
                                        className="text-[11px] font-medium text-[#8e8e8e] hover:text-[#0d0d0d] dark:hover:text-[#ececec] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-2 py-1 rounded transition-colors"
                                    >
                                        DOC
                                    </button>
                                </div>
                            </div>

                            <div className="prose prose-sm dark:prose-invert max-w-none text-[13px] text-[#0d0d0d] dark:text-[#ececec] leading-relaxed">
                                <ReactMarkdown
                                    components={{
                                        h1: ({ ...props }) => <h1 className="text-[16px] font-bold mb-3 mt-4" {...props} />,
                                        h2: ({ ...props }) => <h2 className="text-[15px] font-semibold mb-2 mt-3" {...props} />,
                                        h3: ({ ...props }) => <h3 className="text-[14px] font-semibold mb-2 mt-3" {...props} />,
                                        p: ({ ...props }) => <p className="mb-2" {...props} />,
                                        ul: ({ ...props }) => <ul className="list-disc pl-5 mb-2" {...props} />,
                                        ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                                        li: ({ ...props }) => <li className="mb-1" {...props} />,
                                        strong: ({ ...props }) => <strong className="font-semibold" {...props} />,
                                    }}
                                >
                                    {cleanMarkdown(summary)}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}


                </div>
            </div>

            {/* Modals */}
            <AnalysisModal
                isOpen={analysisOpen}
                onClose={() => setAnalysisOpen(false)}
                onGenerate={handleGenerateSummary}
                isGenerating={isGenerating}
                defaultLanguage={user.transcriptionLanguage || 'es'}
            />
            {/* ChatModal moved to Dashboard level */}
            <ExportModal
                isOpen={exportOpen}
                onClose={() => setExportOpen(false)}
                recording={fullRecording || recording}
            />

            <UpgradeModal
                isOpen={upgradeModalOpen}
                onClose={() => setUpgradeModalOpen(false)}
                featureName={upgradeFeatureName}
            />

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1a1a1b] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-white/10">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            ¿Eliminar grabación?
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Esta acción moverá la grabación a borradores y no se podrá ver en el panel principal.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
