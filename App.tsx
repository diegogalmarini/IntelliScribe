import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './components/Sidebar';

import IntelligenceDashboard from './pages/intelligence/IntelligenceDashboard';
import { LiveRecording } from './pages/LiveRecording';
import { TranscriptEditor } from './pages/TranscriptEditor';
import { Integrations } from './pages/Integrations';
import { Settings } from './pages/Settings';

import { Login } from './pages/Login';
import { Manual } from './pages/Manual';
import { ResetPassword } from './pages/ResetPassword';
import { ManualViewer } from './components/Manual';
import { AppRoute, Recording, IntegrationState, UserProfile, NoteItem, MediaItem, Folder } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { uploadAudio } from './services/storageService';
import { Dialer } from './components/Dialer';
import { supabase } from './lib/supabase';
import { databaseService } from './services/databaseService';
import { notifyNewRecording } from './services/emailService';
import CrispWidget from './components/CrispWidget';
import { SupportBot } from './components/SupportBot/SupportBot';
import { Landing } from './pages/Landing';
import { Terms } from './pages/legal/Terms';
import { Privacy } from './pages/legal/Privacy';
import { TrustCenter } from './pages/legal/TrustCenter';
import { Cookies } from './pages/legal/Cookies';
import { useIdleTimer } from './hooks/useIdleTimer';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { PublicLayout } from './layouts/PublicLayout';

// ========== LAZY LOADING FOR ADMIN COMPONENTS ==========
// CRITICAL: Admin components are lazy-loaded to ensure they are NEVER
// bundled in the main app for regular users (chunk splitting)
const AdminRoute = lazy(() => import('./components/AdminRoute').then(m => ({ default: m.AdminRoute })));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminOverview = lazy(() => import('./pages/admin/Overview').then(m => ({ default: m.Overview })));
const AdminUsers = lazy(() => import('./pages/admin/Users').then(m => ({ default: m.Users })));
const AdminFinancials = lazy(() => import('./pages/admin/Financials').then(m => ({ default: m.Financials })));
const AdminPlans = lazy(() => import('./pages/admin/PlansEditor').then(m => ({ default: m.PlansEditor })));

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
        if (path === '/trust') return AppRoute.TRUST;
        if (path === '/cookies') return AppRoute.COOKIES;
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
        else if (path === '/trust') newRoute = AppRoute.TRUST;
        else if (path === '/cookies') newRoute = AppRoute.COOKIES;
        else if (path === '/login') newRoute = AppRoute.LOGIN;
        else if (path === '/dashboard') newRoute = AppRoute.DASHBOARD;
        else if (path === '/intelligence') newRoute = AppRoute.INTELLIGENCE;
        else if (path === '/recording') newRoute = AppRoute.RECORDING;
        // Old editor removed - redirect to dashboard to use InlineEditor
        else if (path === '/editor' || path.startsWith('/editor/')) newRoute = AppRoute.DASHBOARD;
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
        {
            id: 'ALL',
            name: 'All Recordings',
            type: 'system',
            icon: 'folder_open',
            color: '#64748b',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'FAVORITES',
            name: 'Favorites',
            type: 'system',
            icon: 'star',
            color: '#eab308',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ]);

    // Handle Logout defined early for useIdleTimer
    const handleLogout = async () => {
        await signOut();
        setRecordings([]);
        setIsInitialized(false);
        // Force immediate redirect to landing page
        window.location.href = '/';
    };

    // --- AUTO LOGOUT PROTECTION ---
    // 30 minutes = 30 * 60 * 1000 = 1,800,000 ms
    // Only active if user is logged in
    useIdleTimer({
        timeout: 1800000,
        onIdle: () => {
            if (supabaseUser) {
                console.warn("User inactive for 30mins. Auto-logging out for security.");
                handleLogout();
            }
        },
        debounce: 500
    });

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
                // Fallback to localStorage if DB fields are missing
                timezone: data.timezone || localStorage.getItem(`diktalo_settings_timezone_${supabaseUser.id}`) || prev.timezone,
                transcriptionLanguage: data.transcription_language || localStorage.getItem(`diktalo_settings_transcription_lang_${supabaseUser.id}`) || prev.transcriptionLanguage,
                notificationSettings: data.notification_settings || JSON.parse(localStorage.getItem(`diktalo_settings_notifications_${supabaseUser.id}`) || 'null') || prev.notificationSettings,
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
                {
                    id: 'ALL',
                    name: t('allRecordings'),
                    type: 'system',
                    icon: 'list',
                    color: '#64748b',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'FAVORITES',
                    name: t('favorites'),
                    type: 'system',
                    icon: 'star',
                    color: '#eab308',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                ...dbFolders
            ]);

            setRecordings(dbRecordings);

        } catch (err) {
            console.error("Failed to load user data:", err);
        } finally {
            setIsLoadingData(false);
        }
    }, [supabaseUser, t]);

    // --- RECORDING HANDLERS ---
    const handleRecordingComplete = async (
        audioDataUrl: string,
        durationSeconds: number,
        customTitle: string,
        notes: NoteItem[],
        media: MediaItem[],
        audioBlob?: Blob
    ): Promise<Recording> => {
        if (!supabaseUser) throw new Error('No user logged in');

        // Check limits
        const minutesToAdd = Math.ceil(durationSeconds / 60);
        const potentialTotal = (user.subscription ? user.subscription.minutesUsed : 0) + minutesToAdd;

        if (user.subscription?.minutesLimit !== -1 && potentialTotal > (user.subscription?.minutesLimit || 0)) {
            const msg = t('limitReachedMessage') || 'Has alcanzado el límite de minutos.';
            alert(msg);
            throw new Error(msg);
        }

        // Upload audio to storage if we have a blob
        let audioUrl = audioDataUrl;
        if (audioBlob) {
            const uploadedUrl = await uploadAudio(audioBlob, supabaseUser.id);
            if (uploadedUrl) audioUrl = uploadedUrl;
        }

        if (audioUrl?.startsWith('data:')) {
            console.warn('[STORAGE_PROTECTION] Blocking Base64 storage.');
            audioUrl = undefined;
        }

        // Create new recording object
        const h = Math.floor(durationSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((durationSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(durationSeconds % 60).toString().padStart(2, '0');

        const newRecording: Recording = {
            id: '',
            folderId: (selectedFolderId === 'ALL' || selectedFolderId === 'FAVORITES') ? null : selectedFolderId,
            title: customTitle || 'Nueva Grabación',
            description: t('liveCaptureSession') || 'Live Capture',
            date: new Date().toISOString(),
            duration: `${h}:${m}:${s}`,
            durationSeconds,
            status: 'Completed',
            tags: [t('liveCaptureTag') || 'Live Capture'],
            participants: 1,
            audioUrl,
            summary: null,
            segments: [],
            notes,
            media
        };

        // Save to database
        const createdRecording = await databaseService.createRecording(newRecording);
        if (!createdRecording) throw new Error('Failed to create recording');

        // Update usage
        if (user.subscription) {
            setUser(prev => ({
                ...prev,
                subscription: { ...prev.subscription!, minutesUsed: potentialTotal }
            }));
        }

        // Update recordings
        setRecordings(prev => [createdRecording, ...prev]);
        setActiveRecordingId(createdRecording.id);

        // Navigate to dashboard to show the new recording in InlineEditor
        navigate(AppRoute.DASHBOARD);

        // Notify user via email (async, don't block UI)
        notifyNewRecording(user, createdRecording).catch(err => console.error('[Notification] Failed to send email:', err));

        fetchData();
        return createdRecording;
    };

    const handleUpdateRecording = async (id: string, updates: Partial<Recording>): Promise<void> => {
        await databaseService.updateRecording(id, updates);

        //CRITICAL FIX: Re-fetch from DB instead of merging partial data
        // Merging loses fields not in 'updates' when base recording is incomplete
        const fullRecording = await databaseService.getRecordingDetails(id);
        if (fullRecording) {
            setRecordings(prev =>
                prev.map(rec => rec.id === id ? fullRecording : rec)
            );
        }
    };

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
                // Remove automatic redirection from LANDING/LOGIN
                // if (currentRoute === AppRoute.LANDING || currentRoute === AppRoute.LOGIN) {
                //     navigate(AppRoute.DASHBOARD);
                // }
                if (currentRoute === AppRoute.LOGIN) {
                    window.location.href = '/dashboard';
                }
            } else {
                navigate(AppRoute.RESET_PASSWORD);
            }

        } else if (!supabaseUser && !authLoading) {
            setIsInitialized(true);
            const protectedRoutes = [
                AppRoute.DASHBOARD, AppRoute.RECORDING,
                AppRoute.INTEGRATIONS, AppRoute.SETTINGS, AppRoute.SUBSCRIPTION,
                AppRoute.ADMIN_OVERVIEW, AppRoute.ADMIN_USERS, AppRoute.ADMIN_FINANCIALS,
                AppRoute.ADMIN_PLANS,
                // FIX: Add Intelligence route to protected list
                AppRoute.INTELLIGENCE
            ];

            if (protectedRoutes.includes(currentRoute)) {
                if (!isRecovery) {
                    navigate(AppRoute.LANDING);
                }
            }
        }
    }, [supabaseUser, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

    // Polling for Auto-Refresh (every 30s)
    useEffect(() => {
        if (!supabaseUser) return;
        const intervalId = setInterval(() => {
            fetchData();
        }, 30000); // 30 seconds

        return () => clearInterval(intervalId);
    }, [supabaseUser, fetchData]);


    // --- HANDLERS ---

    const navigate = (route: AppRoute) => {
        // Update URL to match route for cleaner feel
        const pathMap: Record<string, string> = {
            [AppRoute.LANDING]: '/',
            [AppRoute.LOGIN]: '/login',
            [AppRoute.DASHBOARD]: '/dashboard',
            [AppRoute.RECORDING]: '/recording',
            [AppRoute.INTEGRATIONS]: '/integrations',
            [AppRoute.SUBSCRIPTION]: '/plans',
            [AppRoute.SETTINGS]: '/settings',
            [AppRoute.MANUAL]: '/manual',
            [AppRoute.TERMS]: '/terms',
            [AppRoute.PRIVACY]: '/privacy',
            [AppRoute.TRUST]: '/trust',
            [AppRoute.COOKIES]: '/cookies',
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
            icon: 'folder',
            color: '#3b82f6',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
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

    const handleUpdateUser = async (updatedUser: Partial<UserProfile>) => {
        setUser(prev => ({ ...prev, ...updatedUser }));

        // Use supabaseUser.id if user.id is not yet available in state
        const targetUserId = user.id || supabaseUser?.id;

        // Persist to LocalStorage as fallback
        if (targetUserId) {
            if (updatedUser.timezone) {
                localStorage.setItem(`diktalo_settings_timezone_${targetUserId}`, updatedUser.timezone);
            }
            if (updatedUser.notificationSettings) {
                localStorage.setItem(`diktalo_settings_notifications_${targetUserId}`, JSON.stringify(updatedUser.notificationSettings));
            }
            if (updatedUser.transcriptionLanguage) {
                localStorage.setItem(`diktalo_settings_transcription_lang_${targetUserId}`, updatedUser.transcriptionLanguage);
            }
            // Attempt DB update
            await databaseService.updateUserProfile(targetUserId, updatedUser);
        }
    };

    const handleDeleteRecording = async (id: string) => {
        const recording = recordings.find(r => r.id === id);
        if (!recording || !supabaseUser) return;

        const success = await databaseService.deleteRecording(id);

        if (success) {
            setRecordings(prev => prev.filter(r => r.id !== id));
            if (activeRecordingId === id) setActiveRecordingId(null);
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

    // Old editor removed - use IntelligenceDashboard's InlineEditor instead
    const handleSelectRecording = async (id: string) => {
        setActiveRecordingId(id);
        // Stay in dashboard, IntelligenceDashboard will handle editor view
        navigate(AppRoute.DASHBOARD);

        const full = await databaseService.getRecordingDetails(id);
        if (full) {
            setRecordings(prev => prev.map(r => r.id === id ? full : r));
        }
    };

    const handleSelectRecordingIntelligence = async (id: string) => {
        setActiveRecordingId(id);

        const full = await databaseService.getRecordingDetails(id);
        if (full) {
            setRecordings(prev => prev.map(r => r.id === id ? full : r));
        }
    };

    const handleSearch = async (query: string): Promise<Recording[]> => {
        if (!supabaseUser) return [];
        return await databaseService.searchRecordings(supabaseUser.id, query);
    };

    // Get the actual object for the editor
    const activeRecording = recordings.find(r => r.id === activeRecordingId);


    // --- RENDER ---

    if (authLoading && (currentRoute === AppRoute.LANDING || currentRoute === AppRoute.LOGIN)) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-[#1a1a1a] transition-colors duration-200">
                <div className="flex flex-col items-center gap-6 mb-8">
                    <img
                        src="/logo-diktalo.svg"
                        alt="Diktalo"
                        className="h-20 w-auto animate-pulse dark:brightness-0 dark:invert"
                    />
                    {/* Text Removed per request */}
                </div>

                {/* Minimalist Loader */}
                <div className="w-32 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-black dark:bg-white"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>
                <p className="text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-wider mt-4 font-medium animate-pulse">Initializing...</p>
            </div>
        );
    }

    if (currentRoute === AppRoute.LANDING) {
        return (
            <>
                <CrispWidget />
                <SupportBot />
                <Landing user={user} />
            </>
        );
    }

    if (currentRoute === AppRoute.TERMS) {
        return (
            <>
                <CrispWidget />
                <Terms />
            </>
        );
    }

    if (currentRoute === AppRoute.PRIVACY) {
        return (
            <>
                <CrispWidget />
                <Privacy />
            </>
        );
    }

    if (currentRoute === AppRoute.TRUST) {
        return (
            <>
                <CrispWidget />
                <TrustCenter />
            </>
        );
    }

    if (currentRoute === AppRoute.COOKIES) {
        return (
            <>
                <CrispWidget />
                <Cookies />
            </>
        );
    }

    if (currentRoute === AppRoute.LOGIN) {
        return (
            <>
                <CrispWidget />
                <Login onNavigate={navigate} />
            </>
        );
    }

    // ========== ADMIN ROUTES (Top Level) ==========
    const isAdminRoute =
        currentRoute === AppRoute.ADMIN_OVERVIEW ||
        currentRoute === AppRoute.ADMIN_USERS ||
        currentRoute === AppRoute.ADMIN_FINANCIALS ||
        currentRoute === AppRoute.ADMIN_PLANS;

    if (isAdminRoute) {
        class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
            constructor(props: any) { super(props); this.state = { hasError: false }; }
            static getDerivedStateFromError(error: any) { return { hasError: true }; }
            render() {
                if (this.state.hasError) return <div className="p-4 text-red-500">Failed to load Admin module. Refresh page.</div>;
                return this.props.children;
            }
        }

        return (
            <ErrorBoundary>
                <Suspense fallback={
                    <div className="flex items-center justify-center h-screen w-full bg-slate-50 dark:bg-[#050505] transition-colors">
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                            </div>
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
                            {currentRoute === AppRoute.ADMIN_PLANS && <AdminPlans />}
                        </AdminLayout>
                    </AdminRoute>
                </Suspense>
            </ErrorBoundary>
        );
    }

    return (
        <>
            <CrispWidget />
            <motion.div
                className="relative z-10 flex h-screen w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {/* Sidebar */}
                {/* Hide Sidebar for Intelligence route and others */}
                {currentRoute !== AppRoute.INTELLIGENCE &&
                    currentRoute !== AppRoute.RECORDING &&
                    currentRoute !== AppRoute.RESET_PASSWORD &&
                    currentRoute !== AppRoute.DASHBOARD &&
                    currentRoute !== AppRoute.SUBSCRIPTION &&
                    currentRoute !== AppRoute.MANUAL &&
                    !currentRoute.startsWith('admin_') && ( // Generic check for admin routes to avoid type overlap errors
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
                    {currentRoute !== AppRoute.RESET_PASSWORD &&
                        currentRoute !== AppRoute.DASHBOARD &&
                        currentRoute !== AppRoute.INTELLIGENCE &&
                        currentRoute !== AppRoute.SUBSCRIPTION && (
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
                    {(currentRoute === AppRoute.DASHBOARD || currentRoute === AppRoute.INTELLIGENCE) && (
                        <IntelligenceDashboard
                            user={user}
                            recordings={recordings}
                            onNavigate={navigate}
                            onSelectRecording={handleSelectRecordingIntelligence}
                            onDeleteRecording={handleDeleteRecording}
                            onRenameRecording={handleRenameRecording}
                            onMoveRecording={handleMoveRecording}
                            selectedFolderId={selectedFolderId}
                            folders={folders}
                            onLogout={handleLogout}
                            onSearch={handleSearch}
                            onRecordingComplete={handleRecordingComplete}
                            onUpdateRecording={handleUpdateRecording}
                            initialView="recordings"
                            onSelectFolder={setSelectedFolderId}
                        />
                    )}



                    {currentRoute === AppRoute.RECORDING && (
                        <LiveRecording
                            onNavigate={navigate}
                            onRecordingComplete={handleRecordingComplete}
                        />
                    )}

                    {/* Old TranscriptEditor removed - all editing happens in IntelligenceDashboard */}

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
                        <IntelligenceDashboard
                            user={user}
                            recordings={recordings}
                            onNavigate={navigate}
                            onSelectRecording={handleSelectRecordingIntelligence}
                            onDeleteRecording={handleDeleteRecording}
                            onRenameRecording={handleRenameRecording}
                            onMoveRecording={handleMoveRecording}
                            selectedFolderId={selectedFolderId}
                            folders={folders}
                            onLogout={handleLogout}
                            onSearch={handleSearch}
                            onRecordingComplete={handleRecordingComplete}
                            onUpdateRecording={handleUpdateRecording}
                            initialView="subscription"
                        />
                    )}

                    {currentRoute === AppRoute.MANUAL && (
                        <ScrollablePage>
                            <SupportBot />
                            <Manual />
                        </ScrollablePage>
                    )}

                    {currentRoute === AppRoute.RESET_PASSWORD && (
                        <div className="flex-1 flex flex-col items-center justify-center p-4">
                            <ResetPassword onNavigate={navigate} />
                        </div>
                    )}


                </div>
            </motion.div>

            {/* Global VoIP Dialer - Only for Business Plus */}
            {user && user.subscription?.planId === 'business_plus' && (
                <Dialer
                    user={user}
                    onNavigate={navigate}
                    onCallFinished={() => {
                        console.log("📞 Call finished. Refreshing recordings...");
                        // Aggressive polling to ensure recording appears (backend processing might take time)
                        fetchData();
                        setTimeout(fetchData, 2000);
                        setTimeout(fetchData, 5000);
                        setTimeout(fetchData, 8000);
                        setTimeout(fetchData, 12000);
                    }}
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
        </>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <LanguageProvider>
                <ThemeProvider>
                    <AppContent />
                    <CookieConsentBanner />
                </ThemeProvider>
            </LanguageProvider>
        </AuthProvider>
    );
};

export default App;