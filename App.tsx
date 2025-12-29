import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import DashboardIntelligence from './pages/DashboardIntelligence';
import IntelligenceDashboard from './pages/intelligence/IntelligenceDashboard';
import { LiveRecording } from './pages/LiveRecording';
import { TranscriptEditor } from './pages/TranscriptEditor';
import { Integrations } from './pages/Integrations';
import { Settings } from './pages/Settings';
import { Plans } from './pages/Plans';
import { Login } from './pages/Login';
import { Manual } from './pages/Manual';
import { ResetPassword } from './pages/ResetPassword';
import { AppRoute, Recording, IntegrationState, UserProfile, NoteItem, MediaItem, Folder } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { uploadAudio } from './services/storageService';
import { Dialer } from './components/Dialer';
import { supabase } from './lib/supabase';
import { databaseService } from './services/databaseService';
import CrispWidget from './components/CrispWidget';
import { Landing } from './pages/Landing';
import { Terms } from './pages/legal/Terms';
import { Privacy } from './pages/legal/Privacy';

// ========== LAZY LOADING FOR ADMIN COMPONENTS ==========
// CRITICAL: Admin components are lazy-loaded to ensure they are NEVER
// bundled in the main app for regular users (chunk splitting)
const AdminRoute = lazy(() => import('./components/AdminRoute').then(m => ({ default: m.AdminRoute })));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminOverview = lazy(() => import('./pages/admin/Overview').then(m => ({ default: m.Overview })));
const AdminUsers = lazy(() => import('./pages/admin/Users').then(m => ({ default: m.Users })));
const AdminFinancials = lazy(() => import('./pages/admin/Financials').then(m => ({ default: m.Financials })));
const AdminPlans = lazy(() => import('./pages/admin/PlansEditor').then(m => ({ default: m.PlansEditor }))); // <--- NUEVO

// --- Wrapper para páginas que necesitan scroll (FIX VISUAL) ---
const ScrollablePage = ({ children }: { children: React.ReactNode }) => (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden relative scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
        {children}
    </div>
);

const AppContent: React.FC = () => {
    // Check path on load
    const isResetPassword = window.location.pathname === '/reset-password' || window.location.hash.includes('type=recovery');
    const getInitialRoute = (): AppRoute => {
        const path = window.location.pathname;
        if (isResetPassword) return AppRoute.RESET_PASSWORD;
        if (path === '/terms') return AppRoute.TERMS;
        if (path === '/privacy') return AppRoute.PRIVACY;
        if (path === '/login') return AppRoute.LOGIN;
        if (path === '/dashboard' || path === '/recordings' || path.startsWith('/transcript/')) return AppRoute.DASHBOARD;
        if (path === '/intelligence') return AppRoute.INTELLIGENCE;
        return AppRoute.LANDING; // Root or any other path defaults to Landing
    };

    const [currentRoute, setCurrentRoute] = useState<AppRoute>(getInitialRoute());
    const location = useLocation();
    const navigateRR = useNavigate();

    // Sync state with URL changes (for browser back/forward and Links)
    useEffect(() => {
        const path = location.pathname;
        const isResetPassword = path === '/reset-password' || location.hash.includes('type=recovery');

        let newRoute: AppRoute = AppRoute.LANDING;
        if (isResetPassword) newRoute = AppRoute.RESET_PASSWORD;
        else if (path === '/terms') newRoute = AppRoute.TERMS;
        else if (path === '/privacy') newRoute = AppRoute.PRIVACY;
        else if (path === '/login') newRoute = AppRoute.LOGIN;
        else if (path === '/dashboard') newRoute = AppRoute.DASHBOARD;
        else if (path === '/intelligence') newRoute = AppRoute.INTELLIGENCE;
        else if (path === '/recording') newRoute = AppRoute.RECORDING;
        else if (path === '/editor' || path.startsWith('/editor/')) newRoute = AppRoute.EDITOR;
        else if (path === '/recordings' || path.startsWith('/transcript/')) newRoute = AppRoute.DASHBOARD;
        else if (path === '/integrations') newRoute = AppRoute.INTEGRATIONS;
        else if (path === '/plans') newRoute = AppRoute.SUBSCRIPTION;
        else if (path === '/settings') newRoute = AppRoute.SETTINGS;
        else if (path === '/manual') newRoute = AppRoute.MANUAL;
        else if (path === '/admin') newRoute = AppRoute.ADMIN_OVERVIEW;
        else if (path === '/admin/users') newRoute = AppRoute.ADMIN_USERS;
        else if (path === '/admin/financials') newRoute = AppRoute.ADMIN_FINANCIALS;
        else if (path === '/admin/plans') newRoute = AppRoute.ADMIN_PLANS;

        if (newRoute !== currentRoute) {
            setCurrentRoute(newRoute);
        }
    }, [location.pathname, location.hash, currentRoute]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --- STATE INITIALIZATION ---
    const { user: supabaseUser, signOut, loading: authLoading } = useAuth();
    const { t } = useLanguage();
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false); // Guard for data fetching loop

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

    const [user, setUser] = useState<UserProfile>(defaultUser);

    // Recordings & Folders State
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [folders, setFolders] = useState<Folder[]>([
        { id: 'all', name: 'All Recordings', type: 'system', icon: 'folder_open' },
        { id: 'favorites', name: 'Favorites', type: 'system', icon: 'star' }
    ]);

    const [selectedFolderId, setSelectedFolderId] = useState<string | 'ALL'>('ALL');

    const defaultIntegrations: IntegrationState[] = [
        { id: 'gcal', name: 'Google Calendar', connected: true, icon: 'calendar_today', description: 'Sync meetings automatically.', color: 'white' },
        { id: 'slack', name: 'Slack', connected: true, icon: 'chat', description: 'Send summaries to channels.', color: '#4A154B' },
        { id: 'salesforce', name: 'Salesforce', connected: false, icon: 'cloud', description: 'Update opportunities with insights.', color: 'white' },
    ];
    const [integrations, setIntegrations] = useState<IntegrationState[]>(defaultIntegrations);

    const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);

    // --- REFRESHABLE FETCHERS ---
    const fetchProfile = React.useCallback(async () => {
        if (!supabaseUser) return;
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();

        if (data && !error) {
            console.log("Profile loaded from DB:", data);
            setUser(prev => ({
                ...prev,
                id: supabaseUser.id,
                email: supabaseUser.email || prev.email,
                firstName: data.first_name || prev.firstName,
                lastName: data.last_name || prev.lastName,
                avatarUrl: data.avatar_url || prev.avatarUrl,
                phone: data.phone || prev.phone,
                phoneVerified: data.phone_verified || false,
                role: data.role || 'Member',
                subscription: {
                    ...prev.subscription,
                    planId: data.plan_id || 'free',
                    status: data.subscription_status || 'active',
                    minutesLimit: data.minutes_limit || 24,
                    minutesUsed: data.minutes_used || 0,
                    usageResetDate: data.usage_reset_date
                }
            }));
        } else if (supabaseUser) {
            setUser(prev => ({
                ...prev,
                id: supabaseUser.id,
                email: supabaseUser.email || prev.email,
            }));
        }
    }, [supabaseUser]);

    const fetchData = React.useCallback(async () => {
        if (!supabaseUser) return;
        setIsLoadingData(true);
        try {
            console.log(`[DEBUG] Fetching data for user: ${supabaseUser.id}`);
            const [dbFolders, dbRecordings] = await Promise.all([
                databaseService.getFolders(supabaseUser.id),
                databaseService.getRecordings(supabaseUser.id)
            ]);

            console.log(`[DEBUG] Data fetched: ${dbRecordings.length} recordings, ${dbFolders.length} folders`);
            setFolders([
                { id: 'ALL', name: t('allRecordings'), icon: 'list', type: 'system' },
                { id: 'FAVORITES', name: t('favorites'), icon: 'star', type: 'system' },
                ...dbFolders
            ]);

            setRecordings(dbRecordings);

        } catch (err) {
            console.error("Failed to load user data:", err);
        } finally {
            setIsLoadingData(false);
        }
    }, [supabaseUser, t]);

    // --- DATA LOADING & AUTH EFFECT ---
    useEffect(() => {
        if (authLoading) return;
        if (isInitialized) return;

        const isRecovery = window.location.hash.includes('type=recovery') || currentRoute === AppRoute.RESET_PASSWORD;

        if (supabaseUser && supabaseUser.email) {
            fetchProfile();
            fetchData();
            setIsInitialized(true);

            // Special Check: If returning from Stripe Payment, poll DB aggressively
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('payment') === 'success') {
                console.log("💳 Payment success detected! Polling for plan upgrade...");
                // Poll multiple times because webhooks can have slight latency
                const pollIntervals = [1000, 3000, 5000, 8000, 12000];
                pollIntervals.forEach(ms => setTimeout(() => fetchProfile(), ms));

                // Clear the URL but keep the information for the user session if needed
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            if (!isRecovery) {
                if (currentRoute === AppRoute.LANDING || currentRoute === AppRoute.LOGIN) {
                    navigate(AppRoute.DASHBOARD);
                }
            } else {
                navigate(AppRoute.RESET_PASSWORD);
            }

        } else if (!supabaseUser && !authLoading) {
            setIsInitialized(true);
            const protectedRoutes = [
                AppRoute.DASHBOARD, AppRoute.RECORDING, AppRoute.EDITOR,
                AppRoute.INTEGRATIONS, AppRoute.SETTINGS, AppRoute.SUBSCRIPTION,
                AppRoute.ADMIN_OVERVIEW, AppRoute.ADMIN_USERS, AppRoute.ADMIN_FINANCIALS,
                AppRoute.ADMIN_PLANS
            ];

            if (protectedRoutes.includes(currentRoute)) {
                if (!isRecovery) {
                    navigate(AppRoute.LANDING);
                }
            }
        }
    }, [supabaseUser, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps


    // --- HANDLERS ---

    const navigate = (route: AppRoute) => {
        // Update URL to match route for cleaner feel
        const pathMap: Record<string, string> = {
            [AppRoute.LANDING]: '/',
            [AppRoute.LOGIN]: '/login',
            [AppRoute.DASHBOARD]: '/dashboard',
            [AppRoute.RECORDING]: '/recording',
            [AppRoute.EDITOR]: '/editor',
            [AppRoute.INTEGRATIONS]: '/integrations',
            [AppRoute.SUBSCRIPTION]: '/plans',
            [AppRoute.SETTINGS]: '/settings',
            [AppRoute.MANUAL]: '/manual',
            [AppRoute.TERMS]: '/terms',
            [AppRoute.PRIVACY]: '/privacy',
            [AppRoute.RESET_PASSWORD]: '/reset-password',
            [AppRoute.ADMIN_OVERVIEW]: '/admin',
            [AppRoute.ADMIN_USERS]: '/admin/users',
            [AppRoute.ADMIN_FINANCIALS]: '/admin/financials',
            [AppRoute.ADMIN_PLANS]: '/admin/plans'
        };

        if (pathMap[route]) {
            navigateRR(pathMap[route]);
        }

        setCurrentRoute(route);
        setIsSidebarOpen(false); // Close sidebar on navigation on mobile
    };

    const handleLogout = async () => {
        await signOut();
        setRecordings([]);
        setIsInitialized(false);
        setCurrentRoute(AppRoute.LOGIN);
    };

    const handleSocialLoginSuccess = (provider: 'Google' | 'Microsoft') => {
        // Logic moved to Login page
    };

    const handleFolderSelect = (folderId: string) => {
        setSelectedFolderId(folderId);
        navigate(AppRoute.DASHBOARD);
    };

    const handleAddFolder = async (name: string) => {
        // Optimistic update
        const tempId = `folder_${Date.now()}`;
        const newFolder: Folder = {
            id: tempId,
            name: name,
            type: 'user',
            icon: 'folder'
        };
        setFolders(prev => [...prev, newFolder]);

        // DB Call
        const created = await databaseService.createFolder(name);
        if (created) {
            setFolders(prev => prev.map(f => f.id === tempId ? created : f));
        } else {
            setFolders(prev => prev.filter(f => f.id !== tempId));
        }
    };

    const handleDeleteFolder = async (id: string) => {
        setFolders(prev => prev.filter(f => f.id !== id));
        if (selectedFolderId === id) setSelectedFolderId('ALL');
        await databaseService.deleteFolder(id);
    };

    const handleToggleIntegration = (id: string) => {
        setIntegrations(prev => prev.map(int =>
            int.id === id ? { ...int, connected: !int.connected } : int
        ));
    };

    const handleUpdateUser = (updatedUser: Partial<UserProfile>) => {
        setUser(prev => ({ ...prev, ...updatedUser }));

        const updates: any = {};
        if (updatedUser.firstName) updates.first_name = updatedUser.firstName;
        if (updatedUser.lastName) updates.last_name = updatedUser.lastName;
        if (updatedUser.avatarUrl) updates.avatar_url = updatedUser.avatarUrl;
        if (updatedUser.phone !== undefined) updates.phone = updatedUser.phone;
        if (updatedUser.phoneVerified !== undefined) updates.phone_verified = updatedUser.phoneVerified;
        if (updatedUser.subscription?.planId) updates.plan_id = updatedUser.subscription.planId;

        if (Object.keys(updates).length > 0) {
            supabase.from('profiles').update(updates).eq('id', user.id).then(({ error }) => {
                if (error) console.error("Profile update failed", error);
            });
        }
    };

    const handleRecordingComplete = async (url: string, durationSeconds: number, customTitle: string, notes: NoteItem[], media: MediaItem[], audioBlob?: Blob) => {
        const minutesToAdd = Math.ceil(durationSeconds / 60);
        const potentialTotal = user.subscription.minutesUsed + minutesToAdd;

        if (user.subscription.minutesLimit !== -1 && potentialTotal > user.subscription.minutesLimit) {
            alert(t('limitReachedTitle') + ": " + t('limitReachedMessage'));
            return;
        }

        const h = Math.floor(durationSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((durationSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(durationSeconds % 60).toString().padStart(2, '0');
        const durationStr = `${h}:${m}:${s}`;

        const newRecPayload: Recording = {
            id: '', // DB assigned
            title: customTitle,
            description: t('liveCaptureSession'),
            date: new Date().toISOString(),
            duration: durationStr,
            durationSeconds: Math.floor(durationSeconds),
            status: 'Draft',
            tags: [t('liveCaptureTag')],
            participants: 1,
            audioUrl: url,
            segments: [],
            folderId: selectedFolderId === 'ALL' ? undefined : selectedFolderId,
            notes: notes,
            media: media
        };

        if (audioBlob && user.email) {
            const publicUrl = await uploadAudio(audioBlob, user.id);
            if (publicUrl) {
                newRecPayload.audioUrl = publicUrl;
            }
        }

        // DB Call - Ensure we never save Base64 strings to the database
        if (newRecPayload.audioUrl?.startsWith('data:')) {
            console.warn('[STORAGE_PROTECTION] Blocking Base64 storage. Setting audioUrl to null.');
            newRecPayload.audioUrl = undefined;
        }

        const createdRec = await databaseService.createRecording(newRecPayload);

        if (createdRec) {
            setRecordings(prev => [createdRec, ...prev]);
            setActiveRecordingId(createdRec.id);
            navigate(AppRoute.EDITOR);

            setUser(prev => ({
                ...prev,
                subscription: {
                    ...prev.subscription,
                    minutesUsed: prev.subscription.minutesUsed + minutesToAdd
                }
            }));
        } else {
            alert("Failed to save recording to database.");
        }
    };

    const handleDeleteRecording = async (id: string) => {
        const recording = recordings.find(r => r.id === id);
        if (!recording || !supabaseUser) return;

        // Note: Confirmation is handled by Dashboard.tsx (custom modal + browser prompt)
        // This function only executes after user has confirmed twice.

        const success = await databaseService.deleteRecording(id);

        if (success) {
            setRecordings(prev => prev.filter(r => r.id !== id));
            if (activeRecordingId === id) setActiveRecordingId(null);

            // Note: minutesUsed is NOT decremented here to prevent infinite replay/delete abuse.
            // Only storage is freed on Supabase (handled by cascade/service).
        } else {
            alert('Failed to delete recording.');
        }
    };

    const handleRenameRecording = async (id: string, newTitle: string) => {
        setRecordings(prev => prev.map(r => r.id === id ? { ...r, title: newTitle } : r));
        await databaseService.updateRecording(id, { title: newTitle });
    };

    const handleMoveRecording = async (id: string, folderId: string) => {
        setRecordings(prev => prev.map(r => r.id === id ? { ...r, folderId: folderId } : r));
        await databaseService.updateRecording(id, { folderId: folderId });
    };

    const handleSelectRecording = async (id: string) => {
        setActiveRecordingId(id);
        navigate(AppRoute.EDITOR);

        // Fetch full details (heavy JSONB fields) only when needed
        const full = await databaseService.getRecordingDetails(id);
        if (full) {
            setRecordings(prev => prev.map(r => r.id === id ? full : r));
        }
    };

    // For Intelligence Dashboard - doesn't navigate, just updates active recording
    const handleSelectRecordingIntelligence = async (id: string) => {
        setActiveRecordingId(id);

        // Fetch full details if not already loaded
        const full = await databaseService.getRecordingDetails(id);
        if (full) {
            setRecordings(prev => prev.map(r => r.id === id ? full : r));
        }
    };

    const handleUpdateRecording = async (id: string, updates: Partial<Recording>) => {
        setRecordings(prev => prev.map(rec =>
            rec.id === id ? { ...rec, ...updates } : rec
        ));
        await databaseService.updateRecording(id, updates);
    };

    // Get the actual object for the editor
    const activeRecording = recordings.find(r => r.id === activeRecordingId);


    // --- RENDER ---

    if (authLoading && (currentRoute === AppRoute.LANDING || currentRoute === AppRoute.LOGIN)) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-background-dark">
                <div className="flex items-center gap-3 mb-4">
                    <img
                        src="/logo-diktalo.svg"
                        alt="Diktalo"
                        className="h-12 w-auto animate-pulse"
                    />
                    <span className="text-4xl font-display font-black text-white tracking-tight">Diktalo</span>
                </div>
                <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>
                <p className="text-slate-500 text-xs mt-8 animate-pulse">Initializing Interface...</p>
            </div>
        );
    }

    if (currentRoute === AppRoute.LANDING) {
        return (
            <ThemeProvider>
                <CrispWidget />
                <Landing />
            </ThemeProvider>
        );
    }

    if (currentRoute === AppRoute.TERMS) {
        return (
            <ThemeProvider>
                <CrispWidget />
                <Terms />
            </ThemeProvider>
        );
    }

    if (currentRoute === AppRoute.PRIVACY) {
        return (
            <ThemeProvider>
                <CrispWidget />
                <Privacy />
            </ThemeProvider>
        );
    }

    if (currentRoute === AppRoute.LOGIN) {
        return (
            <ThemeProvider>
                <CrispWidget />
                <Login onNavigate={navigate} />
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider>
            <CrispWidget />
            <motion.div
                className="relative z-10 flex h-screen w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {/* Sidebar */}
                {/* Hide Sidebar for Intelligence route - it has its own minimal sidebar */}
                {currentRoute !== AppRoute.INTELLIGENCE && currentRoute !== AppRoute.RECORDING && currentRoute !== AppRoute.EDITOR && currentRoute !== AppRoute.RESET_PASSWORD && (
                    <Sidebar
                        currentRoute={currentRoute}
                        onNavigate={navigate}
                        activeFolderId={selectedFolderId}
                        onSelectFolder={setSelectedFolderId}
                        folders={folders}
                        onAddFolder={handleAddFolder}
                        onDeleteFolder={handleDeleteFolder}
                        user={user}
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

                    {/* Mobile Header Toggle */}
                    {currentRoute !== AppRoute.RESET_PASSWORD && (
                        <div className="md:hidden flex items-center p-4 bg-white dark:bg-background-dark border-b border-slate-200 dark:border-border-dark">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg"
                            >
                                <span className="material-symbols-outlined">menu</span>
                            </button>
                            <span className="ml-2 font-bold text-lg text-primary">Diktalo</span>
                        </div>
                    )}
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
                            onRefreshProfile={fetchProfile}
                        />
                    )}

                    {currentRoute === AppRoute.INTELLIGENCE && (
                        <IntelligenceDashboard
                            user={user}
                            recordings={recordings}
                            onNavigate={navigate}
                            onSelectRecording={handleSelectRecording}
                            onDeleteRecording={handleDeleteRecording}
                            onRenameRecording={handleRenameRecording}
                            onMoveRecording={handleMoveRecording}
                            selectedFolderId={selectedFolderId}
                            folders={folders}
                            onLogout={handleLogout}
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
                            user={user}
                        />
                    )}

                    {currentRoute === AppRoute.EDITOR && !activeRecording && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <p className="text-text-secondary mb-4">No recording selected.</p>
                            <button onClick={() => navigate(AppRoute.DASHBOARD)} className="text-primary hover:underline">Go to Dashboard</button>
                        </div>
                    )}

                    {/* WRAPPED IN SCROLLABLE CONTAINER */}
                    {currentRoute === AppRoute.INTEGRATIONS && (
                        <ScrollablePage>
                            <Integrations
                                integrations={integrations}
                                onToggle={handleToggleIntegration}
                            />
                        </ScrollablePage>
                    )}

                    {currentRoute === AppRoute.SETTINGS && (
                        <ScrollablePage>
                            <Settings
                                user={user}
                                onUpdateUser={handleUpdateUser}
                                onLogout={handleLogout}
                                initialTab="profile"
                            />
                        </ScrollablePage>
                    )}

                    {currentRoute === AppRoute.SUBSCRIPTION && (
                        <ScrollablePage>
                            <Plans
                                user={user}
                            // onUpdateUser={handleUpdateUser} // Comentado si el componente Plans no lo usa en la nueva versión
                            />
                        </ScrollablePage>
                    )}

                    {currentRoute === AppRoute.MANUAL && (
                        <ScrollablePage>
                            <Manual />
                        </ScrollablePage>
                    )}

                    {currentRoute === AppRoute.RESET_PASSWORD && (
                        <div className="flex-1 flex flex-col items-center justify-center p-4">
                            <ResetPassword onNavigate={navigate} />
                        </div>
                    )}

                    {/* ========== ADMIN ROUTES ========== */}
                    {/* CRITICAL: Using Suspense for lazy-loaded admin components */}
                    {(currentRoute === AppRoute.ADMIN_OVERVIEW ||
                        currentRoute === AppRoute.ADMIN_USERS ||
                        currentRoute === AppRoute.ADMIN_FINANCIALS ||
                        currentRoute === AppRoute.ADMIN_PLANS) && ( // <--- NUEVO: Condición para Plans
                            <Suspense fallback={
                                <div className="flex items-center justify-center h-full bg-slate-900">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="animate-spin material-symbols-outlined text-4xl text-amber-400">
                                            progress_activity
                                        </div>
                                        <p className="text-white">Loading Admin Dashboard...</p>
                                    </div>
                                </div>
                            }>
                                <AdminRoute onNavigate={navigate}>
                                    <AdminLayout
                                        currentRoute={currentRoute}
                                        onNavigate={navigate}
                                        user={user}
                                    >
                                        {currentRoute === AppRoute.ADMIN_OVERVIEW && <AdminOverview />}
                                        {currentRoute === AppRoute.ADMIN_USERS && <AdminUsers />}
                                        {currentRoute === AppRoute.ADMIN_FINANCIALS && <AdminFinancials />}
                                        {currentRoute === AppRoute.ADMIN_PLANS && <AdminPlans />} {/* <--- NUEVO: Renderizado */}
                                    </AdminLayout>
                                </AdminRoute>
                            </Suspense>
                        )}
                </div>
            </motion.div>

            {/* Global VoIP Dialer - Only for Business Plus */}
            {user && user.subscription?.planId === 'business_plus' && (
                <Dialer
                    user={user}
                    onNavigate={navigate}
                    onUserUpdated={async () => {
                        // Refresh user profile from database after verification
                        const { data, error } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', user.id)
                            .single();

                        if (data && !error) {
                            setUser(prev => ({
                                ...prev,
                                phone: data.phone || prev.phone,
                                phoneVerified: data.phone_verified || false,
                            }));
                        }
                    }}
                />
            )}
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