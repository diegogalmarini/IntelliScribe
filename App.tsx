import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import { ToastProvider } from './components/Toast';

import IntelligenceDashboard from './pages/intelligence/IntelligenceDashboard';
import { LiveRecording } from './pages/LiveRecording';
import { TranscriptEditor } from './pages/TranscriptEditor';
import { Integrations } from './pages/Integrations';
import { Settings } from './pages/Settings';

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
import { notifyNewRecording } from './services/emailService';
import { SupportBot } from './components/SupportBot/SupportBot';
import { WelcomeTour } from './components/GuidedTour/WelcomeTour';
import { VisualHighlighter } from './components/GuidedTour/VisualHighlighter';
import { Navbar } from './components/Landing/Navbar';
import { Footer } from './components/Footer';
import { Landing } from './pages/Landing';
import { Terms } from './pages/legal/Terms';
import { Privacy } from './pages/legal/Privacy';
import { PricingComparison } from './pages/PricingComparison'; // NEW
import { TrustCenter } from './pages/legal/TrustCenter';
import { Cookies } from './pages/legal/Cookies';
import { Contact } from './pages/Contact';
import { About } from './pages/About';
import { Roadmap } from './pages/Roadmap';
import { Blog } from './pages/Blog';
import { Affiliates } from './pages/Affiliates'; // NEW
import { SubscriptionConfirm } from './pages/SubscriptionConfirm';
import { useIdleTimer } from './hooks/useIdleTimer';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import * as Analytics from './utils/analytics';
import { PublicLayout } from './layouts/PublicLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
const AdminRoute = lazy(() => import('./components/AdminRoute').then(m => ({ default: m.AdminRoute })));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminOverview = lazy(() => import('./pages/admin/Overview').then(m => ({ default: m.Overview })));
const AdminUsers = lazy(() => import('./pages/admin/Users').then(m => ({ default: m.Users })));
const AdminFinancials = lazy(() => import('./pages/admin/Financials').then(m => ({ default: m.Financials })));
const AdminPlans = lazy(() => import('./pages/admin/PlansEditor').then(m => ({ default: m.PlansEditor })));
const AdminMinutePacks = lazy(() => import('./pages/admin/MinuteSalesEditor').then(m => ({ default: m.MinuteSalesEditor }))); // NEW
const AdminCallCredits = lazy(() => import('./pages/admin/CallCreditsEditor').then(m => ({ default: m.CallCreditsEditor }))); // NEW
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics').then(m => ({ default: m.Analytics }))); // NEW IMPORT

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
        if (path === '/comparar-planes' || path === '/pricing') return AppRoute.PRICING_COMPARISON;
        if (path === '/contact') return AppRoute.CONTACT;
        if (path === '/about') return AppRoute.ABOUT;
        if (path === '/roadmap') return AppRoute.ROADMAP;
        if (path === '/affiliates') return AppRoute.AFFILIATES; // NEW
        if (path === '/blog' || path.startsWith('/blog/')) return path.includes('/', 6) ? AppRoute.BLOG_POST : AppRoute.BLOG;
        if (path === '/confirm-subscription') return AppRoute.CONFIRM_SUBSCRIPTION;
        if (path === '/dashboard' || path === '/recordings' || path.startsWith('/transcript/')) return AppRoute.DASHBOARD;
        if (path === '/intelligence') return AppRoute.INTELLIGENCE;
        return AppRoute.LANDING; // Root or any other path defaults to Landing
    };

    const [currentRoute, setCurrentRoute] = useState<AppRoute>(getInitialRoute());
    const location = useLocation();
    const navigateRR = useNavigate();

    // --- STATE INITIALIZATION ---
    // Moved to top to avoid ReferenceError
    const { user: supabaseUser, signOut, loading: authLoading } = useAuth();
    const { t, setLanguage, language } = useLanguage();
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false); // Guard for data fetching loop
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isTourOpen, setIsTourOpen] = useState(false);
    const [tourInitialStep, setTourInitialStep] = useState(0);
    const [isBotForceOpen, setIsBotForceOpen] = useState(false);
    const [highlightId, setHighlightId] = useState<string | null>(null);

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
            storageDaysLimit: 7,
            voiceCredits: 0,
            callLimit: 0,
            callMinutesUsed: 0
        },
        integrations: [], // NEW
    };

    const [user, setUser] = useState<UserProfile>(defaultUser);

    // Google Analytics Integration
    useEffect(() => {
        // 1. Initial Check: If user already consented, initialize GA
        const savedConsent = localStorage.getItem('diktalo_cookie_consent');
        if (savedConsent) {
            try {
                const parsed = JSON.parse(savedConsent);
                if (parsed.analytics) {
                    Analytics.initGA();
                }
            } catch (e) { /* ignore */ }
        }
    }, []);

    useEffect(() => {
        // 2. Track Route Changes & Update Title
        const routeTitles: Record<string, string> = {
            [AppRoute.LANDING]: 'Diktalo - AI Meeting Assistant',
            [AppRoute.LOGIN]: `${language === 'en' ? 'Log In' : 'Iniciar Sesión'} | Diktalo`,
            [AppRoute.DASHBOARD]: 'Dashboard | Diktalo',
            [AppRoute.INTELLIGENCE]: 'Intelligence Hub | Diktalo',
            [AppRoute.PRICING_COMPARISON]: `${language === 'en' ? 'Plans & Pricing' : 'Planes y Precios'} | Diktalo`,
            [AppRoute.ABOUT]: `${language === 'en' ? 'About Us' : 'Sobre Nosotros'} | Diktalo`,
            [AppRoute.CONTACT]: `${language === 'en' ? 'Contact' : 'Contacto'} | Diktalo`,
            [AppRoute.TERMS]: `${language === 'en' ? 'Terms of Service' : 'Términos de Servicio'} | Diktalo`,
            [AppRoute.PRIVACY]: `${language === 'en' ? 'Privacy' : 'Privacidad'} | Diktalo`,
            [AppRoute.RESET_PASSWORD]: `${language === 'en' ? 'Reset Password' : 'Restablecer Contraseña'} | Diktalo`,
            [AppRoute.ROADMAP]: `Roadmap | Diktalo`,
            [AppRoute.BLOG]: `Blog | Diktalo`,
            [AppRoute.BLOG_POST]: `Artículos | Diktalo`,
        };

        const newTitle = routeTitles[currentRoute] || 'Diktalo';
        document.title = newTitle;

        Analytics.trackPageView(location.pathname, newTitle);
    }, [location.pathname, currentRoute]);

    // Sync User Properties to GA4
    useEffect(() => {
        if (supabaseUser && supabaseUser.id) {
            Analytics.setUserProperties({
                interface_language: supabaseUser.language || 'es',
                transcription_language: supabaseUser.transcriptionLanguage || 'es',
                user_role: supabaseUser.role || 'Member',
                plan_id: supabaseUser.subscription?.planId || 'free'
            });
        }
    }, [supabaseUser?.id, supabaseUser?.language, supabaseUser?.transcriptionLanguage, supabaseUser?.role, supabaseUser?.subscription?.planId]);

    // Sync state with URL changes (for browser back/forward and Links)
    useEffect(() => {
        const path = location.pathname;
        const isResetPassword = path === '/reset-password' || location.hash.includes('type=recovery');

        let newRoute: AppRoute = AppRoute.LANDING;
        if (isResetPassword) newRoute = AppRoute.RESET_PASSWORD;
        else if (path === '/terms') newRoute = AppRoute.TERMS;
        else if (path === '/privacy') newRoute = AppRoute.PRIVACY;
        else if (path === '/comparar-planes' || path === '/pricing') newRoute = AppRoute.PRICING_COMPARISON;
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
        else if (path === '/about') newRoute = AppRoute.ABOUT;
        else if (path === '/admin') newRoute = AppRoute.ADMIN_OVERVIEW;
        else if (path === '/admin/users') newRoute = AppRoute.ADMIN_USERS;
        else if (path === '/admin/financials') newRoute = AppRoute.ADMIN_FINANCIALS;
        else if (path === '/admin/plans') newRoute = AppRoute.ADMIN_PLANS;
        else if (path === '/admin/minute-packs' || path === '/admin/minute_packs') newRoute = AppRoute.ADMIN_MINUTE_PACKS; // NEW
        else if (path === '/admin/call-credits' || path === '/admin/call_credits') newRoute = AppRoute.ADMIN_CALL_CREDITS; // NEW
        else if (path === '/admin/analytics') newRoute = AppRoute.ADMIN_ANALYTICS; // NEW ROUTE
        else if (path === '/contact') newRoute = AppRoute.CONTACT;
        else if (path === '/roadmap') newRoute = AppRoute.ROADMAP;
        else if (path === '/blog' || path.startsWith('/blog/')) newRoute = path.includes('/', 6) ? AppRoute.BLOG_POST : AppRoute.BLOG;
        else if (path === '/affiliates') newRoute = AppRoute.AFFILIATES; // NEW

        if (newRoute !== currentRoute) {
            setCurrentRoute(newRoute);
        }
    }, [location.pathname, location.hash, currentRoute]);

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
        if (Analytics && typeof Analytics.trackEvent === 'function') {
            Analytics.trackEvent('logout', { user_id: user.id });
        }
        await signOut();
        setRecordings([]);
        setIsInitialized(false);
        // Force immediate redirect to landing page
        window.location.href = '/';
    };

    // Track detailed state from Dashboard to control Dialer visibility
    const [dashboardState, setDashboardState] = useState({
        isRecording: false,
        isViewingRecording: false,
        isUploading: false
    });

    const handleAppStateChange = (state: { isRecording: boolean; isViewingRecording: boolean; isUploading: boolean }) => {
        setDashboardState(prev => {
            if (prev.isRecording === state.isRecording &&
                prev.isViewingRecording === state.isViewingRecording &&
                prev.isUploading === state.isUploading) {
                return prev;
            }
            return state;
        });
    };

    // --- AUTO LOGOUT PROTECTION ---
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
        { id: 'zapier', name: 'Zapier', connected: false, icon: 'bolt', description: 'Connect with 5,000+ apps. Automate your workflow.', color: '#FF4A00' },
        { id: 'salesforce', name: 'Salesforce', connected: false, icon: 'cloud', description: 'Update opportunities with insights.', color: 'white' },
    ];
    const [integrations, setIntegrations] = useState<IntegrationState[]>(defaultIntegrations);

    const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
    const [activeSearchQuery, setActiveSearchQuery] = useState<string>('');

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

            // Sync UI Language
            const storedLang = localStorage.getItem(`diktalo_settings_language_${supabaseUser.id}`);
            if (storedLang) {
                setLanguage(storedLang as 'en' | 'es');
            }

            // AUTO-HEAL: If name is generic "User" or missing, try to patch it from Auth Metadata (Google)
            const currentFirstName = data.first_name;
            const metaFullName = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name;

            if ((!currentFirstName || currentFirstName === 'User') && metaFullName) {
                const parts = metaFullName.split(' ');
                const realFirstName = parts[0];
                const realLastName = parts.slice(1).join(' ');

                if (realFirstName && realFirstName !== 'User') {
                    console.log(`[App] Auto-healing generic name '${currentFirstName}' to '${realFirstName}'`);
                    databaseService.updateUserProfile(supabaseUser.id, {
                        firstName: realFirstName,
                        lastName: realLastName || data.last_name
                    }).catch(e => console.error("[App] Auto-heal failed", e));

                    data.first_name = realFirstName;
                    if (realLastName) data.last_name = realLastName;
                }
            }

            setUser(prev => ({
                ...prev,
                id: supabaseUser.id,
                email: supabaseUser.email || prev.email,
                firstName: data.first_name || supabaseUser.user_metadata?.full_name?.split(' ')[0] || supabaseUser.user_metadata?.first_name || prev.firstName,
                lastName: data.last_name || supabaseUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || supabaseUser.user_metadata?.last_name || prev.lastName,
                avatarUrl: data.avatar_url || supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || prev.avatarUrl,
                phone: data.phone || prev.phone,
                phoneVerified: data.phone_verified || false,
                timezone: data.timezone || localStorage.getItem(`diktalo_settings_timezone_${supabaseUser.id}`) || prev.timezone,
                language: (data.language || localStorage.getItem(`diktalo_settings_language_${supabaseUser.id}`) || 'es') as 'en' | 'es',
                transcriptionLanguage: data.transcription_language || localStorage.getItem(`diktalo_settings_transcription_lang_${supabaseUser.id}`) || prev.transcriptionLanguage,
                notificationSettings: data.notification_settings || JSON.parse(localStorage.getItem(`diktalo_settings_notifications_${supabaseUser.id}`) || 'null') || prev.notificationSettings,
                role: data.role || 'Member',
                createdAt: data.created_at,
                subscription: {
                    ...prev.subscription,
                    planId: (data.plan_id?.toLowerCase().trim().replace(/\s+/g, '_') || 'free') as any,
                    status: data.subscription_status || 'active',
                    currentPeriodEnd: data.current_period_end,
                    minutesLimit: data.minutes_limit || 24,
                    minutesUsed: data.minutes_used || 0,
                    usageResetDate: data.usage_reset_date,
                    extraMinutes: data.extra_minutes || 0,
                    storageUsed: data.storage_used || 0,
                    storageLimit: data.storage_limit || 0,
                    trialEndsAt: data.trial_ends_at,
                    voiceCredits: data.voice_credits || 0,
                    callLimit: data.call_limit || 0,
                    callMinutesUsed: data.call_minutes_used || 0
                },
                hasCompletedTour: data.has_completed_tour || false,
                integrations: (data.integrations as IntegrationState[]) || defaultIntegrations,

                // ZAPIER PERSISTENCE FIX
                zapier_webhook_url: data.zapier_webhook_url || null,
                auto_sync_enabled: data.auto_sync_enabled || false,
            }));

            // TRIGGER TOUR: If user is new and hasn't completed the tour (and hasn't dismissed it in this browser)
            const tourSeen = localStorage.getItem(`diktalo_tour_seen_${supabaseUser.id}`);
            if (!data.has_completed_tour && !isTourOpen && !tourSeen) {
                // Wait a bit for the UI to settle before showing the tour
                setTimeout(() => setIsTourOpen(true), 2000);
            }

            // Sync storage usage if it currently shows 0
            if (data.storage_used === 0) {
                databaseService.syncStorageUsage(supabaseUser.id).then(newSize => {
                    if (newSize > 0) {
                        setUser(prev => prev ? ({
                            ...prev,
                            subscription: prev.subscription ? { ...prev.subscription, storageUsed: newSize } : prev.subscription
                        }) : null);
                    }
                });
            }
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

            // CHECK FOR UNFINISHED RECORDINGS IN INDEXEDDB
            const { recordingStorage } = await import('./services/recordingStorage');
            const unfinished = await recordingStorage.getUnfinishedRecordings();
            if (unfinished.length > 0) {
                console.log(`[App] Found ${unfinished.length} unfinished recordings. Attempting recovery...`);
                // For now, we just log it and perhaps we could show a toast or automatic recovery
                // In a future phase, we could show a modal to the user
            }

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
        let finalAudioSize = 0;
        if (audioBlob) {
            try {
                // Dynamic import to avoid circular dependencies
                const { convertAudioBlobToMp3 } = await import('./services/audioConcat');

                console.log(`[App] Converting recording to MP3... (Original type: ${audioBlob.type})`);
                const mp3Blob = await convertAudioBlobToMp3(audioBlob);
                finalAudioSize = mp3Blob.size;
                console.log(`[App] Conversion complete. MP3 Size: ${(mp3Blob.size / 1024 / 1024).toFixed(2)}MB`);

                const uploadedUrl = await uploadAudio(mp3Blob, supabaseUser.id);
                if (uploadedUrl) audioUrl = uploadedUrl;
            } catch (convErr) {
                console.error("[App] MP3 Conversion failed, falling back to original blob", convErr);
                finalAudioSize = audioBlob.size;
                const uploadedUrl = await uploadAudio(audioBlob, supabaseUser.id);
                if (uploadedUrl) audioUrl = uploadedUrl;
            }
        }

        if (audioUrl?.startsWith('data:')) {
            console.warn('[STORAGE_PROTECTION] Blocking Base64 storage.');
            audioUrl = undefined;
        }

        // Calculate total size including media attachments
        const mediaSize = (media || []).reduce((sum, item) => sum + (item.size || 0), 0);
        const totalStorageSize = finalAudioSize + mediaSize;

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
            media,
            metadata: {
                audioFileSize: totalStorageSize
            }
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
        // Optimistically update local state first
        setRecordings(prev => prev.map(rec => rec.id === id ? { ...rec, ...updates } : rec));

        // Then update database
        await databaseService.updateRecording(id, updates);

        // ZAPIER AUTO-SYNC: Trigger if summary is updated and auto-sync is enabled
        if (updates.summary && user.auto_sync_enabled && user.zapier_webhook_url) {
            console.log(`[Zapier] Triggering auto-sync for recording ${id}...`);
            fetch('/api/zapier-sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recordingId: id, userId: user.id })
            })
                .then(res => res.ok ? console.log('[Zapier] Auto-sync success') : res.json().then(e => console.error('[Zapier] Auto-sync failed:', e)))
                .catch(err => console.error('[Zapier] Auto-sync error:', err));
        }

        // Semantic Search Indexing (Phase 4): Sync embeddings if content changed
        if (updates.summary || updates.segments) {
            console.log(`[App] Syncing semantic embedding for recording ${id}...`);
            databaseService.syncRecordingEmbedding(id).catch(err =>
                console.error('[App] Failed to sync embedding:', err)
            );
        }

        // Note: We DON'T refetch here to avoid race conditions with Supabase replication lag
        // The optimistic update above ensures UI stays consistent
    };

    // --- DATA LOADING & AUTH EFFECT ---
    useEffect(() => {
        if (authLoading) return;
        if (isInitialized) return;

        const isRecovery = window.location.hash.includes('type=recovery') || currentRoute === AppRoute.RESET_PASSWORD;

        if (supabaseUser && supabaseUser.email) {
            fetchProfile();
            fetchData();
            if (!isInitialized) {
                if (Analytics && typeof Analytics.trackEvent === 'function') {
                    Analytics.trackEvent('login_success', { user_id: supabaseUser.id });
                }
            }
            setIsInitialized(true);

            // Special Check: If returning from Stripe Payment, poll DB aggressively
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('payment') === 'success') {
                console.log("\ud83d\udcb3 Payment success detected! Polling for plan upgrade...");
                const pollIntervals = [1000, 3000, 5000, 8000, 12000];
                pollIntervals.forEach(ms => setTimeout(() => fetchProfile(), ms));
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            if (!isRecovery) {
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
                AppRoute.ADMIN_PLANS, AppRoute.ADMIN_MINUTE_PACKS, AppRoute.ADMIN_ANALYTICS, // NEW ROUTE
                AppRoute.INTELLIGENCE
            ];

            if (protectedRoutes.includes(currentRoute)) {
                if (!isRecovery) {
                    navigate(AppRoute.LANDING);
                }
            }
        }
    }, [supabaseUser, authLoading]);

    // --- Supabase Realtime Subscription ---
    const userId = supabaseUser?.id; // Extract ID to prevent reconnections on object reference changes

    useEffect(() => {
        if (!userId) return;

        console.log(`[App] Subscribing to Realtime changes for user: ${userId}`);
        const channel = supabase
            .channel('realtime-recordings')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'recordings',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    console.log('[App] New recording detected via Realtime:', payload.new.id);
                    fetchData(); // Trigger full refresh to get all relations correctly
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'recordings',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    console.log('[App] Recording update detected via Realtime:', payload.new.id);
                    // Update local state directly without full refetch to avoid race conditions
                    setRecordings(prev => prev.map(rec => rec.id === payload.new.id ? { ...rec, ...payload.new } : rec));
                }
            )
            .subscribe((status) => {
                console.log(`[App] Realtime subscription status: ${status}`);
            });

        return () => {
            console.log('[App] Cleaning up Realtime subscription');
            supabase.removeChannel(channel);
        };
    }, [userId]); // Only reconnect when actual user ID changes, not on object reference changes

    // Polling for Auto-Refresh - DISABLED since Realtime is now stable
    // If Realtime fails, users can manually refresh
    /*
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    
    useEffect(() => {
        // Clear any existing interval first
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }

        if (!supabaseUser) return;
        
        const isAdminRoute = currentRoute === AppRoute.ADMIN_OVERVIEW ||
            currentRoute === AppRoute.ADMIN_USERS ||
            currentRoute === AppRoute.ADMIN_FINANCIALS ||
            currentRoute === AppRoute.ADMIN_PLANS ||
            currentRoute === AppRoute.ADMIN_ANALYTICS;

        if (isAdminRoute) return;

        // Set up interval with ref to prevent premature resets
        pollingIntervalRef.current = setInterval(() => {
            fetchData();
        }, 60000); // 1 minute fallback

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [supabaseUser, currentRoute]); // Keep minimal dependencies
    */

    // --- HANDLERS ---
    const navigate = (route: AppRoute) => {
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
            [AppRoute.PRICING_COMPARISON]: '/comparar-planes',
            [AppRoute.COOKIES]: '/cookies',
            [AppRoute.RESET_PASSWORD]: '/reset-password',
            [AppRoute.ADMIN_OVERVIEW]: '/admin',
            [AppRoute.ADMIN_USERS]: '/admin/users',
            [AppRoute.ADMIN_FINANCIALS]: '/admin/financials',
            [AppRoute.ADMIN_PLANS]: '/admin/plans',
            [AppRoute.ADMIN_MINUTE_PACKS]: '/admin/minute-packs', // NEW
            [AppRoute.ADMIN_CALL_CREDITS]: '/admin/call-credits', // NEW
            [AppRoute.ADMIN_ANALYTICS]: '/admin/analytics', // NEW ROUTE
            [AppRoute.CONTACT]: '/contact',
            [AppRoute.ABOUT]: '/about',
            [AppRoute.ROADMAP]: '/roadmap',
            [AppRoute.BLOG]: '/blog',
            [AppRoute.BLOG_POST]: '/blog' // Detail is handled by params
        };

        if (pathMap[route]) {
            // Special handling for settings credits button in Dialer
            if (route === AppRoute.SETTINGS && user.subscription?.planId?.includes('business')) {
                navigateRR('/settings?tab=credits');
            } else {
                navigateRR(pathMap[route]);
            }
        }

        setCurrentRoute(route);
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    const handleFolderSelect = (folderId: string) => {
        setSelectedFolderId(folderId);
        navigate(AppRoute.DASHBOARD);
    };

    const handleAddFolder = async (name: string) => {
        const tempId = `folder_${Date.now()}`;
        const newFolder: Folder = {
            id: tempId,
            name: name,
            type: 'user', icon: 'folder', color: '#3b82f6',
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        };
        setFolders(prev => [...prev, newFolder]);
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

    const handleRenameFolder = async (id: string, newName: string) => {
        setFolders(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
        await databaseService.renameFolder(id, newName);
    };

    const handleUpdateUser = async (updatedUser: Partial<UserProfile>) => {
        setUser(prev => {
            if (!prev) return prev;

            // Special handling for nested subscription object to prevent overwriting missing fields
            if (updatedUser.subscription && prev.subscription) {
                return {
                    ...prev,
                    ...updatedUser,
                    subscription: {
                        ...prev.subscription,
                        ...updatedUser.subscription
                    }
                };
            }

            return { ...prev, ...updatedUser };
        });
        const targetUserId = user.id || supabaseUser?.id;
        if (targetUserId) {
            if (updatedUser.timezone) localStorage.setItem(`diktalo_settings_timezone_${targetUserId}`, updatedUser.timezone);
            if (updatedUser.notificationSettings) localStorage.setItem(`diktalo_settings_notifications_${targetUserId}`, JSON.stringify(updatedUser.notificationSettings));
            if (updatedUser.transcriptionLanguage) localStorage.setItem(`diktalo_settings_transcription_lang_${targetUserId}`, updatedUser.transcriptionLanguage);
            if (updatedUser.language) localStorage.setItem(`diktalo_settings_language_${targetUserId}`, updatedUser.language);
            if (updatedUser.hasCompletedTour) localStorage.setItem(`diktalo_tour_seen_${targetUserId}`, 'true');
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

    const activeRecording = recordings.find(r => r.id === activeRecordingId);

    const handleTourComplete = () => {
        setIsTourOpen(false);
        setIsBotForceOpen(false);
        if (user.id) {
            localStorage.setItem(`diktalo_tour_seen_${user.id}`, 'true');
            handleUpdateUser({ hasCompletedTour: true });
        }
    };

    const renderPageContent = () => {
        if (authLoading && (currentRoute === AppRoute.LANDING || currentRoute === AppRoute.LOGIN)) {
            return (
                <div className="h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-[#1a1a1a] transition-colors duration-200">
                    <div className="flex flex-col items-center gap-6 mb-8">
                        <img src="/logo-diktalo.svg" alt="Diktalo" className="h-20 w-auto animate-pulse dark:brightness-0 dark:invert" />
                    </div>
                    <div className="w-32 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-black dark:bg-white" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} />
                    </div>
                </div>
            );
        }

        if (currentRoute === AppRoute.LANDING) return <Landing user={user} onUpdateUser={handleUpdateUser} />;
        if (currentRoute === AppRoute.TERMS) return <Terms />;
        if (currentRoute === AppRoute.PRIVACY) return <Privacy />;
        if (currentRoute === AppRoute.TRUST) return <TrustCenter />;
        if (currentRoute === AppRoute.COOKIES) return <Cookies />;
        if (currentRoute === AppRoute.PRICING_COMPARISON) return <ScrollablePage><PricingComparison /></ScrollablePage>; // MOVED HERE
        if (currentRoute === AppRoute.ABOUT) return <About user={user} />;
        if (currentRoute === AppRoute.ROADMAP) return <Roadmap user={user} />;
        if (currentRoute === AppRoute.BLOG || currentRoute === AppRoute.BLOG_POST) {
            return (
                <ErrorBoundary>
                    <Blog user={user} />
                </ErrorBoundary>
            );
        }
        if (currentRoute === AppRoute.CONFIRM_SUBSCRIPTION) return <SubscriptionConfirm />;
        if (currentRoute === AppRoute.CONTACT) return <><Navbar user={user} onUpdateUser={handleUpdateUser} onNavigate={navigate} /><Contact /><Footer /></>;
        if (currentRoute === AppRoute.LOGIN) return <Login onNavigate={navigate} />;

        const isAdminRoute = currentRoute === AppRoute.ADMIN_OVERVIEW || currentRoute === AppRoute.ADMIN_USERS || currentRoute === AppRoute.ADMIN_FINANCIALS || currentRoute === AppRoute.ADMIN_PLANS || currentRoute === AppRoute.ADMIN_MINUTE_PACKS || currentRoute === AppRoute.ADMIN_CALL_CREDITS || currentRoute === AppRoute.ADMIN_ANALYTICS; // NEW ROUTE

        if (isAdminRoute) {
            return (
                <Suspense fallback={<div>Loading...</div>}>
                    <AdminRoute onNavigate={navigate}>
                        <AdminLayout currentRoute={currentRoute} onNavigate={navigate} user={user}>
                            {currentRoute === AppRoute.ADMIN_OVERVIEW && <AdminOverview />}
                            {currentRoute === AppRoute.ADMIN_USERS && <AdminUsers />}
                            {currentRoute === AppRoute.ADMIN_ANALYTICS && <AdminAnalytics />}
                            {currentRoute === AppRoute.ADMIN_FINANCIALS && <AdminFinancials />}
                            {currentRoute === AppRoute.ADMIN_PLANS && <AdminPlans />}
                            {currentRoute === AppRoute.ADMIN_MINUTE_PACKS && <AdminMinutePacks />}
                            {currentRoute === AppRoute.ADMIN_CALL_CREDITS && <AdminCallCredits />}
                        </AdminLayout>
                    </AdminRoute>
                </Suspense>
            );
        }

        return (
            <motion.div className="relative z-10 flex h-screen w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-200" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {currentRoute !== AppRoute.INTELLIGENCE && currentRoute !== AppRoute.RECORDING && currentRoute !== AppRoute.RESET_PASSWORD && currentRoute !== AppRoute.DASHBOARD && currentRoute !== AppRoute.SUBSCRIPTION && currentRoute !== AppRoute.SETTINGS && currentRoute !== AppRoute.INTEGRATIONS && currentRoute !== AppRoute.MANUAL && currentRoute !== AppRoute.AFFILIATES && (
                    <Sidebar currentRoute={currentRoute} onNavigate={navigate} activeFolderId={selectedFolderId} onSelectFolder={setSelectedFolderId} folders={folders} user={user} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onAddFolder={handleAddFolder} onDeleteFolder={handleDeleteFolder} />
                )}

                <div id="tour-welcome" className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    {(currentRoute === AppRoute.DASHBOARD || currentRoute === AppRoute.INTELLIGENCE || currentRoute === AppRoute.SETTINGS || currentRoute === AppRoute.INTEGRATIONS || currentRoute === AppRoute.SUBSCRIPTION) && (
                        <IntelligenceDashboard
                            user={user} recordings={recordings} onNavigate={navigate} activeRecordingId={activeRecordingId} initialSearchQuery={activeSearchQuery} onSelectRecording={handleSelectRecordingIntelligence} onDeleteRecording={handleDeleteRecording} onRenameRecording={handleRenameRecording} onMoveRecording={handleMoveRecording} selectedFolderId={selectedFolderId} folders={folders} onLogout={handleLogout} onSearch={handleSearch} onRecordingComplete={handleRecordingComplete} onUpdateRecording={handleUpdateRecording} initialView={currentRoute === AppRoute.SUBSCRIPTION ? 'subscription' : currentRoute === AppRoute.INTEGRATIONS ? 'integrations' : 'recordings'} initialSettingsOpen={currentRoute === AppRoute.SETTINGS} onSelectFolder={setSelectedFolderId} onUpdateUser={handleUpdateUser} onAppStateChange={handleAppStateChange}
                            onAction={(type, payload) => {
                                if (type === 'START_TOUR') {
                                    setTourInitialStep(payload?.stepIndex || 0);
                                    setIsTourOpen(true);
                                }
                            }}
                        />
                    )}

                    {currentRoute === AppRoute.MANUAL && <ScrollablePage><Manual /></ScrollablePage>}
                    {currentRoute === AppRoute.AFFILIATES && <ScrollablePage><Affiliates user={user} onUpdateUser={handleUpdateUser} /></ScrollablePage>}
                    {currentRoute === AppRoute.RESET_PASSWORD && <div className="flex-1 flex flex-col items-center justify-center p-4"><ResetPassword onNavigate={navigate} /></div>}
                </div>
            </motion.div>
        );
    };

    return (
        <>
            {renderPageContent()}
            {user && user.subscription?.planId === 'business_plus' && (
                <Dialer user={user} showMinimized={(currentRoute === AppRoute.DASHBOARD || currentRoute === AppRoute.INTELLIGENCE || currentRoute === AppRoute.SUBSCRIPTION) && !dashboardState.isRecording && !dashboardState.isViewingRecording && !dashboardState.isUploading && !new URLSearchParams(location.search).has('action')} onNavigate={navigate} onCallFinished={() => fetchData()} onUserUpdated={() => fetchProfile()} />
            )}
            {(() => {
                const isPaidPlan = user && user.subscription && ['pro', 'business', 'business_plus'].includes(user.subscription.planId);
                const isPublicPage = [AppRoute.LANDING, AppRoute.LOGIN, AppRoute.TERMS, AppRoute.PRIVACY, AppRoute.TRUST, AppRoute.COOKIES, AppRoute.CONTACT, AppRoute.ABOUT, AppRoute.PRICING_COMPARISON, AppRoute.AFFILIATES].includes(currentRoute);
                const isDashboardArea = [AppRoute.DASHBOARD, AppRoute.INTELLIGENCE, AppRoute.SUBSCRIPTION, AppRoute.SETTINGS, AppRoute.INTEGRATIONS, AppRoute.MANUAL].includes(currentRoute);

                if (isPublicPage) return <SupportBot recordings={[]} folders={folders} user={user} position="right" onAction={(type, payload) => navigate(AppRoute.DASHBOARD)} />;
                if (isDashboardArea && isPaidPlan) return (
                    <SupportBot
                        recordings={recordings}
                        folders={folders}
                        user={user}
                        activeRecording={activeRecording}
                        position="left"
                        initialOffset="left-[280px]"
                        isForceOpen={isBotForceOpen}
                        onAction={(type, payload) => {
                            if (type === 'OPEN_RECORDING') {
                                setActiveRecordingId(payload.id);
                            } else if (type === 'DELETE_RECORDING') {
                                handleDeleteRecording(payload.id);
                            } else if (type === 'RENAME_RECORDING') {
                                handleRenameRecording(payload.id, payload.title);
                            } else if (type === 'CREATE_FOLDER') {
                                handleAddFolder(payload.name);
                            } else if (type === 'MOVE_TO_FOLDER') {
                                handleMoveRecording(payload.recordingId, payload.folderId);
                            } else if (type === 'START_TOUR') {
                                setTourInitialStep(payload?.stepIndex || 0);
                                setIsTourOpen(true);
                            } else if (type === 'HIGHLIGHT') {
                                setHighlightId(payload.id);
                            } else {
                                navigate(AppRoute.DASHBOARD);
                            }
                        }}
                    />
                );
                return null;
            })()}
            {isTourOpen && (
                <WelcomeTour
                    onComplete={handleTourComplete}
                    onStartBot={() => setIsBotForceOpen(true)}
                    language={user?.language || 'es'}
                    initialStep={tourInitialStep}
                />
            )}
            <VisualHighlighter targetId={highlightId} onClose={() => setHighlightId(null)} />
        </>
    );
};

const App: React.FC = () => {
    return (
        <ToastProvider>
            <AuthProvider>
                <LanguageProvider>
                    <ThemeProvider>
                        <AppContent />
                        <CookieConsentBanner />
                    </ThemeProvider>
                </LanguageProvider>
            </AuthProvider>
        </ToastProvider>
    );
};

export default App;