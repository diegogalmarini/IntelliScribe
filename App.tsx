
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { LiveRecording } from './pages/LiveRecording';
import { TranscriptEditor } from './pages/TranscriptEditor';
import { Integrations } from './pages/Integrations';
import { Settings } from './pages/Settings';
import { Plans } from './pages/Plans'; // Import Plans
import { Login } from './pages/Login';
import { Manual } from './pages/Manual';
import { AppRoute, Recording, IntegrationState, UserProfile, NoteItem, MediaItem, Folder } from './types';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { uploadAudio } from './services/storageService';
import { Dialer } from './components/Dialer';

const AppContent: React.FC = () => {
    const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.LOGIN);

    // --- PERSISTENCE HELPERS ---
    const loadState = <T,>(key: string, fallback: T): T => {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : fallback;
        } catch (e) {
            console.warn(`Failed to load ${key}`, e);
            return fallback;
        }
    };

    const saveState = (key: string, value: any) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn(`Failed to save ${key}. Storage might be full.`, e);
        }
    };

    // --- STATE INITIALIZATION ---

    const { user: supabaseUser, signOut } = useAuth();

    // User State Template
    const defaultUser: UserProfile = {
        id: '',
        firstName: 'Guest',
        lastName: '',
        email: '',
        phone: '',
        phoneVerified: false,
        avatarUrl: null,
        role: 'Member',
        subscription: {
            planId: 'free',
            status: 'active',
            currentPeriodEnd: new Date().toISOString(),
            minutesUsed: 0,
            minutesLimit: 24,
            storageDaysLimit: 7
        }
    };

    // Keep local user profile state for UI, but hydrate from Supabase or DB
    const [user, setUser] = useState<UserProfile>(() => loadState('user_profile', defaultUser));

    useEffect(() => {
        if (supabaseUser && supabaseUser.email) {
            // In a real app, fetch profile from DB here. 
            // For now, simple hydration
            setUser(prev => ({
                ...prev,
                id: supabaseUser.id, // Critical for Stripe
                email: supabaseUser.email || prev.email,
                role: 'Member', // Default to member for real auth
            }));
            navigate(AppRoute.DASHBOARD);
        } else if (!supabaseUser) {
            navigate(AppRoute.LOGIN);
        }
    }, [supabaseUser]);


    // Recordings State
    const [recordings, setRecordings] = useState<Recording[]>(() => loadState('recordings_data', []));

    // Folders State - Updated to reflect User preference (Empty by default)
    const defaultFolders: Folder[] = [];
    const [folders, setFolders] = useState<Folder[]>(() => loadState('folders_data', defaultFolders));

    // Selected Folder State
    const [selectedFolderId, setSelectedFolderId] = useState<string | 'ALL'>(() => loadState('selected_folder', 'ALL'));

    // Integrations State
    const defaultIntegrations: IntegrationState[] = [
        { id: 'gcal', name: 'Google Calendar', connected: true, icon: 'calendar_today', description: 'Sync meetings automatically.', color: 'white' },
        { id: 'slack', name: 'Slack', connected: true, icon: 'chat', description: 'Send summaries to channels.', color: '#4A154B' },
        { id: 'salesforce', name: 'Salesforce', connected: false, icon: 'cloud', description: 'Update opportunities with insights.', color: 'white' },
    ];
    const [integrations, setIntegrations] = useState<IntegrationState[]>(() => loadState('integrations_data', defaultIntegrations));

    // Active Recording ID
    const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);

    // --- PERSISTENCE EFFECTS ---

    useEffect(() => { saveState('user_profile', user); }, [user]);
    useEffect(() => { saveState('recordings_data', recordings); }, [recordings]);
    useEffect(() => { saveState('selected_folder', selectedFolderId); }, [selectedFolderId]);
    useEffect(() => { saveState('folders_data', folders); }, [folders]);
    useEffect(() => { saveState('integrations_data', integrations); }, [integrations]);


    const navigate = (route: AppRoute) => {
        setCurrentRoute(route);
    };

    const handleLogout = async () => {
        await signOut();
        setCurrentRoute(AppRoute.LOGIN);
    };

    // Handle Google "Social" Login simulation - NOW DEPRECATED BY SUPABASE AUTH
    const handleSocialLoginSuccess = (provider: 'Google' | 'Microsoft') => {
        // Logic moved to Login page
    };

    const handleFolderSelect = (folderId: string) => {
        setSelectedFolderId(folderId);
        navigate(AppRoute.DASHBOARD);
    };

    // --- FOLDER CRUD ---
    const handleAddFolder = (name: string) => {
        const newFolder: Folder = {
            id: `folder_${Date.now()}`,
            name: name,
            type: 'user',
            icon: 'folder'
        };
        setFolders(prev => [...prev, newFolder]);
    };

    const handleDeleteFolder = (id: string) => {
        setFolders(prev => prev.filter(f => f.id !== id));
        if (selectedFolderId === id) setSelectedFolderId('ALL');
    };

    const handleToggleIntegration = (id: string) => {
        setIntegrations(prev => prev.map(int =>
            int.id === id ? { ...int, connected: !int.connected } : int
        ));
    };

    const handleUpdateUser = (updatedUser: Partial<UserProfile>) => {
        setUser(prev => ({ ...prev, ...updatedUser }));
    };

    // Called when LiveRecording finishes
    const handleRecordingComplete = async (url: string, durationSeconds: number, customTitle: string, notes: NoteItem[], media: MediaItem[], audioBlob?: Blob) => {
        // Basic Usage Limit Check (Mocking backend logic)
        const minutesToAdd = Math.ceil(durationSeconds / 60);
        const potentialTotal = user.subscription.minutesUsed + minutesToAdd;

        if (user.subscription.minutesLimit !== -1 && potentialTotal > user.subscription.minutesLimit) {
            alert(`Upgrade required! Your recording (${minutesToAdd}m) exceeds your remaining monthly limit.`);
            // In a real app, we might save as "Locked" or prompt upgrade immediately
            return;
        }

        const newId = Date.now().toString();

        // Format duration helper
        const h = Math.floor(durationSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((durationSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (durationSeconds % 60).toString().padStart(2, '0');
        const durationStr = `${h}:${m}:${s}`;

        const newRecording: Recording = {
            id: newId,
            title: customTitle,
            description: 'Live capture session',
            date: new Date().toLocaleString(),
            duration: durationStr,
            durationSeconds: durationSeconds,
            status: 'Draft',
            tags: ['Live Capture'],
            participants: 1,
            audioUrl: url,
            segments: [],
            // Use selected folder if it's not ALL. If no folders exist, use a default ID (won't filter but preserves data)
            folderId: selectedFolderId === 'ALL' ? (folders[0]?.id || 'general_uploads') : selectedFolderId,
            notes: notes,
            media: media
        };

        // Upload to Supabase Storage if blob is available and user is logged in
        if (audioBlob && user.email) {
            const publicUrl = await uploadAudio(audioBlob, user.email);
            if (publicUrl) {
                newRecording.audioUrl = publicUrl;
            }
        }

        setRecordings(prev => [newRecording, ...prev]);

        // Update usage stats (Mocking backend update)
        setUser(prev => ({
            ...prev,
            subscription: {
                ...prev.subscription,
                minutesUsed: prev.subscription.minutesUsed + minutesToAdd
            }
        }));

        setActiveRecordingId(newId);
        navigate(AppRoute.EDITOR);
    };

    const handleDeleteRecording = (id: string) => {
        setRecordings(prev => prev.filter(r => r.id !== id));
        if (activeRecordingId === id) setActiveRecordingId(null);
    };

    const handleRenameRecording = (id: string, newTitle: string) => {
        setRecordings(prev => prev.map(r => r.id === id ? { ...r, title: newTitle } : r));
    };

    const handleMoveRecording = (id: string, folderId: string) => {
        setRecordings(prev => prev.map(r => r.id === id ? { ...r, folderId: folderId } : r));
    };

    // Called by Dashboard when clicking a row
    const handleSelectRecording = (id: string) => {
        setActiveRecordingId(id);
        navigate(AppRoute.EDITOR);
    };

    // Called by Editor to save transcriptions back to the global state
    const handleUpdateRecording = (id: string, updates: Partial<Recording>) => {
        setRecordings(prev => prev.map(rec =>
            rec.id === id ? { ...rec, ...updates } : rec
        ));
    };

    // Get the actual object for the editor
    const activeRecording = recordings.find(r => r.id === activeRecordingId);

    if (currentRoute === AppRoute.LOGIN) {
        return (
            <ThemeProvider>
                <Login onNavigate={navigate} onSocialLogin={handleSocialLoginSuccess} />
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider>
            <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-200">
                {/* Sidebar */}
                {currentRoute !== AppRoute.RECORDING && currentRoute !== AppRoute.EDITOR && (
                    <Sidebar
                        currentRoute={currentRoute}
                        onNavigate={navigate}
                        activeFolderId={selectedFolderId}
                        onSelectFolder={handleFolderSelect}
                        folders={folders}
                        onAddFolder={handleAddFolder}
                        onDeleteFolder={handleDeleteFolder}
                        user={user}
                    />
                )}

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {currentRoute === AppRoute.DASHBOARD && (
                        <Dashboard
                            user={user}
                            recordings={recordings}
                            onNavigate={navigate}
                            onSelectRecording={handleSelectRecording}
                            onDeleteRecording={handleDeleteRecording}
                            onRenameRecording={handleRenameRecording}
                            onMoveRecording={handleMoveRecording}
                            selectedFolderId={selectedFolderId}
                            folders={folders}
                            onImportRecording={handleRecordingComplete}
                        />
                    )}

                    {currentRoute === AppRoute.RECORDING && (
                        <LiveRecording
                            onNavigate={navigate}
                            onRecordingComplete={handleRecordingComplete}
                        />
                    )}

                    {currentRoute === AppRoute.EDITOR && activeRecording && (
                        <TranscriptEditor
                            onNavigate={navigate}
                            recording={activeRecording}
                            onUpdateRecording={handleUpdateRecording}
                        />
                    )}

                    {currentRoute === AppRoute.EDITOR && !activeRecording && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <p className="text-text-secondary mb-4">No recording selected.</p>
                            <button onClick={() => navigate(AppRoute.DASHBOARD)} className="text-primary hover:underline">Go to Dashboard</button>
                        </div>
                    )}

                    {currentRoute === AppRoute.INTEGRATIONS && (
                        <Integrations
                            integrations={integrations}
                            onToggle={handleToggleIntegration}
                        />
                    )}

                    {currentRoute === AppRoute.SETTINGS && (
                        <Settings
                            user={user}
                            onUpdateUser={handleUpdateUser}
                            onLogout={handleLogout}
                            initialTab="profile"
                        />
                    )}

                    {currentRoute === AppRoute.SUBSCRIPTION && (
                        <Plans
                            user={user}
                            onUpdateUser={handleUpdateUser}
                        />
                    )}

                    {currentRoute === AppRoute.MANUAL && (
                        <Manual />
                    )}
                </div>
            </div>

            {/* Global VoIP Dialer - Only for Business Plus */}
            {user && user.subscription?.planId === 'business_plus' && <Dialer />}
        </ThemeProvider>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <LanguageProvider>
                <AppContent />
            </LanguageProvider>
        </AuthProvider>
    );
};

export default App;
