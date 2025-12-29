import React, { useState, useEffect } from 'react';
import { Recording, AppRoute, Folder, UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Search, Filter, ChevronLeft } from 'lucide-react';
import { RecordingCard } from '../components/dashboard/RecordingCard';
import { EmptyState } from '../components/dashboard/EmptyState';

interface DashboardIntelligenceProps {
    onNavigate: (route: AppRoute) => void;
    recordings: Recording[];
    onSelectRecording: (id: string) => void;
    onDeleteRecording: (id: string) => void;
    onRenameRecording: (id: string, newTitle: string) => void;
    onMoveRecording: (id: string, folderId: string) => void;
    selectedFolderId: string;
    folders: Folder[];
    user: UserProfile;
}

export const DashboardIntelligence: React.FC<DashboardIntelligenceProps> = ({
    onNavigate,
    recordings,
    onSelectRecording,
    onDeleteRecording,
    onRenameRecording,
    onMoveRecording,
    selectedFolderId,
    folders,
    user
}) => {
    const { t } = useLanguage();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter recordings by folder and search
    const filteredRecordings = recordings
        .filter(r => selectedFolderId === 'ALL' || r.folderId === selectedFolderId)
        .filter(r =>
            r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.transcription_text?.toLowerCase().includes(searchQuery.toLowerCase())
        );

    // Get active recording details
    const activeRecording = selectedId ? recordings.find(r => r.id === selectedId) : null;

    const handleAction = (type: string) => {
        if (type === 'mic') onNavigate(AppRoute.RECORDING);
        if (type === 'call') onNavigate(AppRoute.RECORDING); // Could pass param for call mode
        if (type === 'upload') {
            // Trigger file upload - could emit event or navigate
            console.log('Upload action triggered');
        }
    };

    const handleRecordingClick = (id: string) => {
        setSelectedId(id);
        onSelectRecording(id);
    };

    // Get folder name for header
    const getFolderTitle = () => {
        const folder = folders.find(f => f.id === selectedFolderId);
        return folder ? folder.name : t('allRecordings') || 'Todas las grabaciones';
    };

    return (
        <div className="flex h-screen bg-white dark:bg-background-dark overflow-hidden">
            {/* SIMPLIFIED VERSION - No sidebar initially, just the two-panel layout */}

            {/* 1. Master Panel: Recording List */}
            <div className="w-80 flex flex-col border-r border-border-light dark:border-border-dark bg-white dark:bg-surface-dark h-full shrink-0">
                {/* Header */}
                <div className="p-4 border-b border-border-light dark:border-border-dark">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                            {getFolderTitle()}
                        </h2>
                        <button
                            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
                            title={t('filter') || 'Filtrar'}
                        >
                            <Filter size={18} />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder={t('searchConversations') || 'Buscar en tus conversaciones...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                        />
                    </div>
                </div>

                {/* Recording List */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                    {filteredRecordings.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                            {searchQuery ? t('noResultsFound') || 'No se encontraron resultados' : t('noRecordingsYet') || 'No hay grabaciones aún'}
                        </div>
                    ) : (
                        filteredRecordings.map(rec => (
                            <RecordingCard
                                key={rec.id}
                                recording={rec}
                                isActive={selectedId === rec.id}
                                onClick={() => handleRecordingClick(rec.id)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* 3. Detail Panel: Content Stage */}
            <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-background-dark overflow-hidden">
                {activeRecording ? (
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                        {/* Header with back button (mobile-friendly) */}
                        <div className="flex items-center gap-3 p-4 border-b border-border-light dark:border-border-dark bg-white dark:bg-surface-dark">
                            <button
                                onClick={() => setSelectedId(null)}
                                className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
                            </button>
                            <div className="flex-1">
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                                    {activeRecording.title || t('untitledRecording') || 'Grabación sin título'}
                                </h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {new Date(activeRecording.date).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Audio Player Card */}
                            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-border-light dark:border-border-dark p-6">
                                <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                                    {t('audioPlayback') || 'Reproducción'}
                                </h3>
                                <audio
                                    controls
                                    src={activeRecording.file_url}
                                    className="w-full"
                                    controlsList="nodownload"
                                />
                            </div>

                            {/* Transcription Card */}
                            {activeRecording.segments && activeRecording.segments.length > 0 && (
                                <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-border-light dark:border-border-dark p-6">
                                    <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                                        Transcripción
                                    </h3>
                                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-3">
                                        {activeRecording.segments.map((segment, idx) => (
                                            <div key={idx} className="flex gap-3">
                                                <span className="text-xs text-slate-400 font-mono shrink-0">{segment.timestamp}</span>
                                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                                    <span className="font-semibold text-blue-600 dark:text-blue-400">{segment.speaker}:</span> {segment.text}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Summary Card */}
                            {activeRecording.summary && (
                                <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-border-light dark:border-border-dark p-6">
                                    <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                                        {t('aiSummary') || 'Resumen IA'}
                                    </h3>
                                    <div className="prose prose-slate dark:prose-invert max-w-none">
                                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                            {activeRecording.summary}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Loading state for pending transcription */}
                            {(!activeRecording.segments || activeRecording.segments.length === 0) && activeRecording.status === 'Processing' && (
                                <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-border-light dark:border-border-dark p-6">
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-center">
                                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                                {t('processingTranscription') || 'Procesando transcripción...'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <EmptyState onCreate={handleAction} userName={user?.firstName || 'Usuario'} />
                )}
            </div>
        </div>
    );
};

export default DashboardIntelligence;
