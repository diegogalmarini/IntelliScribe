// Background Service Worker for Diktalo Chrome Extension
// Handles tab audio capture and communication with popup

// --- State Management Helpers ---
// Import GA
import { fireEvent } from './utils/google-analytics';

// GA Lifecycle Events
chrome.runtime.onInstalled.addListener(() => {
    fireEvent('app_install');
});

chrome.runtime.onStartup.addListener(() => {
    fireEvent('session_start');
});

async function saveState(state: any) {
    await chrome.storage.session.set(state);
}

async function getState() {
    return await chrome.storage.session.get([
        'recordingTabId',
        'recordingStartTime',
        'isPaused',
        'pauseStartTime',
        'totalPausedTime',
        'capturedScreenshots'
    ]);
}

async function clearState() {
    await chrome.storage.session.remove([
        'recordingTabId',
        'recordingStartTime',
        'isPaused',
        'pauseStartTime',
        'totalPausedTime',
        'capturedScreenshots'
    ]);
}

// Listen for messages from popup
// Toggle Overlay on Icon Click
chrome.action.onClicked.addListener((tab) => {
    if (tab.id) {
        // Ensure content script is ready or inject it if needed (optional optimization, but we rely on manifest injection for now)
        chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_OVERLAY' }).catch(err => {
            console.warn('Could not send toggle message, specific tab might not support content scripts', err);
        });
    }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.log('[Background] Received message:', message);

    const handleMessage = async () => {
        if (message.action === 'START_RECORDING') {
            await startRecording(message.tabId);
            return { success: true };
        }

        if (message.action === 'STOP_RECORDING') {
            return await stopRecording();
        }

        if (message.action === 'PAUSE_RECORDING') {
            return await pauseRecording();
        }

        if (message.action === 'RESUME_RECORDING') {
            return await resumeRecording();
        }

        if (message.action === 'CAPTURE_SCREENSHOT') {
            return await captureAndUploadScreenshot();
        }

        if (message.action === 'GET_STATUS') {
            const state = await getState();
            return {
                isRecording: !!state.recordingTabId,
                isPaused: state.isPaused || false,
                tabId: state.recordingTabId || null,
                startTime: state.recordingStartTime || null,
                totalPausedTime: state.totalPausedTime || 0,
                capturedCount: state.capturedScreenshots?.length || 0
            };
        }

        if (message.action === 'GET_USER') {
            try {
                const user = await getUserDetails();
                return { success: true, user };
            } catch (error: any) {
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'Unknown action' };
    };

    // Async handling for connect/sendResponse
    handleMessage()
        .then(response => sendResponse(response))
        .catch(error => sendResponse({ success: false, error: error.message }));

    return true; // Keep channel open
});

// --- Keep-Alive Logic (Adrenaline) ---
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'keepAlive') {
        console.log('[Background] Heartbeat - Staying alive...');
        // Optional: Send a ping to offscreen to ensure full chain is live
        chrome.runtime.sendMessage({ action: 'PING' }).catch(() => { });
    }
});

// --- Auth State ---
let isRefreshing = false;
let refreshQueue: ((token: string) => void)[] = [];

// INJECTED CONSTANTS - DO NOT EDIT MANUALLY
const INJECTED_SUPABASE_URL = 'https://qnvzofpdrfzchsegooic.supabase.co';
const INJECTED_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudnpvZnBkcmZ6Y2hzZWdvb2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NjUwNDUsImV4cCI6MjA4MjA0MTA0NX0.wVS8xk2r86SS6CD0t221RI1VLJ3roG1BepGtznDZinA';

async function getSupabaseConfig() {
    const { supabaseUrl, supabaseKey } = await chrome.storage.local.get(['supabaseUrl', 'supabaseKey']);

    // cleanup placeholders if they exist (just in case)
    const url = (supabaseUrl && supabaseUrl !== 'undefined') ? supabaseUrl : INJECTED_SUPABASE_URL;
    const key = (supabaseKey && supabaseKey !== 'undefined') ? supabaseKey : INJECTED_SUPABASE_KEY;

    if (url.startsWith('%%') || key.startsWith('%%')) {
        console.warn('[Background] Credentials not injected or configured!');
    }

    return { supabaseUrl: url, supabaseKey: key };
}

async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const { authToken } = await chrome.storage.local.get(['authToken']);
    const { supabaseKey } = await getSupabaseConfig();

    if (!authToken || !supabaseKey) {
        throw new Error('401: Unauthorized - No authentication token or key found.');
    }

    const headers = new Headers(options.headers || {});
    if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${authToken}`);
    }
    if (!headers.has('apikey')) {
        headers.set('apikey', supabaseKey);
    }

    const response = await fetch(url, { ...options, headers });

    // If failed with 401/403, attempt a single refresh
    if (response.status === 401 || response.status === 403) {
        console.warn(`[Background] Auth failed (${response.status}) for ${url}. Attempting refresh...`);

        try {
            const newToken = await getOrRefreshAccessToken();

            // Retry the original request with new token
            headers.set('Authorization', `Bearer ${newToken}`);
            return await fetch(url, { ...options, headers });
        } catch (refreshError: any) {
            console.error('[Background] Could not recover from auth failure:', refreshError.message);
            // Friendly error message
            throw new Error('Tu sesión ha expirado. Por favor actualiza tu token desde el Dashboard.');
        }
    }

    return response;
}

/**
 * Ensures we only have one refresh process at a time
 */
async function getOrRefreshAccessToken(): Promise<string> {
    if (isRefreshing) {
        return new Promise((resolve) => {
            refreshQueue.push(resolve);
        });
    }

    isRefreshing = true;
    try {
        const { refreshToken } = await chrome.storage.local.get(['refreshToken']);
        const { supabaseUrl, supabaseKey } = await getSupabaseConfig();

        if (!refreshToken || !supabaseUrl || !supabaseKey) {
            throw new Error('No refresh token or config available.');
        }

        const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey
            },
            body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Supabase Refresh Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        if (!data.access_token || !data.refresh_token) {
            throw new Error('Invalid refresh response from Supabase.');
        }

        await chrome.storage.local.set({
            authToken: data.access_token,
            refreshToken: data.refresh_token
        });

        const newToken = data.access_token;

        // Resolve the queue
        const currentQueue = [...refreshQueue];
        refreshQueue = [];
        currentQueue.forEach(resolve => resolve(newToken));

        return newToken;
    } finally {
        isRefreshing = false;
    }
}

async function startRecording(tabId: number) {
    console.log('[Background] Starting recording for tab:', tabId);

    // --- STEP 1: FORCE CLEANUP ---
    await closeOffscreenDocument();
    await new Promise(resolve => setTimeout(resolve, 500));

    // --- START HEARTBEAT ---
    chrome.alarms.create('keepAlive', { periodInMinutes: 0.5 }); // Every 30 seconds
    console.log('[Background] Heartbeat started.');

    return new Promise<void>((resolve, reject) => {
        chrome.tabCapture.getMediaStreamId({
            targetTabId: tabId
        }, async (streamId) => {
            try {
                if (!streamId) {
                    const error = chrome.runtime.lastError?.message || 'Failed to get stream ID';
                    reject(new Error(error));
                    return;
                }

                await createOffscreenDocument();
                // Wait for offscreen document to initialize
                await new Promise(resolve => setTimeout(resolve, 200));

                chrome.runtime.sendMessage({
                    action: 'START_OFFSCREEN_RECORDING',
                    streamId: streamId
                }, async (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('[Background] Error communicating with offscreen:', chrome.runtime.lastError);
                        reject(new Error(chrome.runtime.lastError.message));
                        return;
                    }

                    if (response?.success) {
                        // SAVE STATE
                        await saveState({
                            recordingTabId: tabId,
                            recordingStartTime: Date.now(),
                            isPaused: false,
                            totalPausedTime: 0
                        });
                        resolve();
                    } else {
                        reject(new Error(response?.error || 'Failed to start offscreen recording'));
                    }
                });
            } catch (innerError: any) {
                reject(innerError);
            }
        });
    });
}

async function pauseRecording() {
    const state = await getState();
    if (!state.recordingTabId) {
        throw new Error('No active recording');
    }

    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'PAUSE_OFFSCREEN_RECORDING' }, async (response) => {
            if (response?.success) {
                await saveState({
                    isPaused: true,
                    pauseStartTime: Date.now()
                });
                resolve({ success: true });
            } else {
                reject(new Error(response?.error || 'Failed to pause'));
            }
        });
    });
}

async function resumeRecording() {
    const state = await getState();
    if (!state.recordingTabId) {
        throw new Error('No active recording');
    }

    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'RESUME_OFFSCREEN_RECORDING' }, async (response) => {
            if (response?.success) {
                let newTotalPaused = state.totalPausedTime || 0;
                if (state.pauseStartTime) {
                    newTotalPaused += (Date.now() - state.pauseStartTime);
                }

                await saveState({
                    isPaused: false,
                    pauseStartTime: null,
                    totalPausedTime: newTotalPaused
                });
                resolve({ success: true });
            } else {
                reject(new Error(response?.error || 'Failed to resume'));
            }
        });
    });
}

// --- Screenshot Logic ---

async function captureAndUploadScreenshot() {
    console.log('[Background] captureAndUploadScreenshot starting...');

    // 1. Capture Visible Tab
    const dataUrl = await new Promise<string>((resolve, reject) => {
        chrome.tabs.captureVisibleTab(null as any, { format: 'png' }, (dataUrl) => {
            if (chrome.runtime.lastError) {
                return reject(new Error(chrome.runtime.lastError.message));
            }
            resolve(dataUrl || '');
        });
    });

    if (!dataUrl) throw new Error('Failed to capture tab');

    // 2. Prepare Upload
    const blob = base64ToBlob(dataUrl, 'image/png');
    const { supabaseUrl } = await getSupabaseConfig();
    if (!supabaseUrl) throw new Error('Supabase URL not configured.');

    // 3. Perform Authenticated Flow
    try {
        // A. Get User ID (Auto-refreshes if needed)
        const user = await getUserDetails();
        const userId = user.id;

        // B. Upload to Supabase (Auto-refreshes if needed)
        const timestamp = Date.now();
        const filename = `screenshot-${timestamp}.png`;
        const path = `${userId}/screenshots/${filename}`;
        const endpoint = `${supabaseUrl}/storage/v1/object/recordings/${path}`;

        const response = await authenticatedFetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'image/png' },
            body: blob
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Storage Upload failed: ${errorText}`);
        }

        console.log('[Background] Screenshot uploaded:', path);

        // C. Save to Session State
        const state = await getState();
        const currentList = state.capturedScreenshots || [];
        const newScreenshot = {
            path: path,
            timestamp: timestamp,
            url: `${supabaseUrl}/storage/v1/object/public/recordings/${path}`
        };

        await saveState({
            capturedScreenshots: [...currentList, newScreenshot]
        });

        // D. Notify User
        chrome.notifications.create(`screenshot-${timestamp}`, {
            type: 'basic',
            iconUrl: 'icons/diktalo.png',
            title: 'Captura Guardada',
            message: 'La captura de pantalla se ha guardado correctamente.'
        });

        return { success: true, path: path };
    } catch (error: any) {
        console.error('[Background] Screenshot process failed:', error);
        throw error;
    }
}

async function stopRecording() {
    console.log('[Background] stopRecording called');
    const state = await getState();

    // Calculate duration from state logic
    let durationSeconds = 0;
    if (state.recordingStartTime) {
        durationSeconds = Math.floor((Date.now() - state.recordingStartTime - (state.totalPausedTime || 0)) / 1000);
    }

    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'STOP_OFFSCREEN_RECORDING' }, async (response) => {
            if (response?.success && response.audioData) {
                try {
                    const audioBlob = base64ToBlob(response.audioData, 'audio/webm');

                    // Prepare metadata with screenshots
                    const attachments = state.capturedScreenshots || [];
                    const metadata = {
                        attachments: attachments
                    };

                    // Pass calculated duration to upload function
                    const uploadResult = await uploadAudioToDiktalo(audioBlob, durationSeconds, metadata);

                    await clearState();
                    await closeOffscreenDocument();
                    resolve({ success: true, recordingId: uploadResult.recordingId });
                } catch (error: any) {
                    console.error('[Background] Upload failed, returning manual backup data:', error);
                    // CRITICAL: Return audioData to UI for manual save if upload fails
                    // Do NOT lose the data.
                    await clearState();
                    await closeOffscreenDocument();
                    resolve({
                        success: false,
                        error: error.message,
                        backupAudioData: response.audioData // <--- Return data for fallback
                    });
                }
            } else {
                await clearState();
                await closeOffscreenDocument();
                resolve({ success: false, error: response?.error || 'No audio data received' });
            }
        });
    });
}

// Helper function to convert base64 to Blob
function base64ToBlob(base64: string, mimeType: string): Blob {
    const parts = base64.split(',');
    const base64Data = parts.length > 1 ? parts[1] : parts[0];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}

async function createOffscreenDocument() {
    const existingContexts = await (chrome.runtime as any).getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT']
    });
    if (existingContexts.length > 0) return;

    await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['USER_MEDIA' as any],
        justification: 'Recording audio from tab for transcription'
    });
}

async function closeOffscreenDocument() {
    try {
        // Stop Heartbeat
        await chrome.alarms.clear('keepAlive');
        console.log('[Background] Heartbeat stopped.');

        const existingContexts = await (chrome.runtime as any).getContexts({
            contextTypes: ['OFFSCREEN_DOCUMENT']
        });
        if (existingContexts.length > 0) {
            await chrome.offscreen.closeDocument();
        }
    } catch (error) {
        console.log('[Background] Error closing offscreen:', error);
    }
}

async function uploadAudioToDiktalo(audioBlob: Blob, durationSeconds: number, extraMetadata: any = {}): Promise<{ recordingId: string }> {
    console.log('[Background] uploadAudioToDiktalo starting...');

    // NOTIFICATION: Upload Starting
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/diktalo.png',
        title: 'Subiendo Grabación...',
        message: 'Por favor no cierres el navegador hasta que termine.',
        priority: 2
    });

    try {
        // 1. Get User ID (Auto-refreshes if needed)
        const user = await getUserDetails();
        const userId = user.id;

        // 2. Upload to Storage (Auto-refreshes if needed)
        const filePath = await uploadToSupabaseStorage(userId, audioBlob);

        // 3. Register Recording in DB via API (Auto-refreshes if needed)
        const recording = await registerRecording(filePath, durationSeconds, {
            source: 'chrome-extension',
            original_filename: `recording-${Date.now()}.webm`,
            ...extraMetadata
        });

        // NOTIFICATION: Success
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/diktalo.png',
            title: '¡Grabación Guardada!',
            message: 'Tu reunión ya está disponible en Diktalo.',
            priority: 2
        });

        return { recordingId: recording.recordingId };
    } catch (error: any) {
        console.error('[Background] Final upload stage failed:', error);
        throw error;
    }
}

// --- Auth Protected Resource Helpers ---

async function getUserDetails() {
    const { supabaseUrl } = await getSupabaseConfig();
    if (!supabaseUrl || supabaseUrl.startsWith('%%')) throw new Error('Supabase URL missing');

    const response = await authenticatedFetch(`${supabaseUrl}/auth/v1/user`);
    if (!response.ok) {
        throw new Error(`Get User failed: ${response.status}`);
    }
    return await response.json();
}

async function uploadToSupabaseStorage(userId: string, blob: Blob): Promise<string> {
    const { supabaseUrl } = await getSupabaseConfig();
    if (!supabaseUrl) throw new Error('Supabase URL missing');

    const timestamp = Date.now();
    const filename = `${timestamp}.webm`;
    const path = `${userId}/${filename}`;
    const endpoint = `${supabaseUrl}/storage/v1/object/recordings/${path}`;

    const response = await authenticatedFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'audio/webm' },
        body: blob
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Storage Upload failed: ${text}`);
    }

    return path;
}

async function registerRecording(filePath: string, duration: number, metadata: any) {
    const endpoint = 'https://www.diktalo.com/api/upload-audio';

    const payload = {
        filePath: filePath,
        duration: duration,
        metadata: {
            ...metadata,
            title: `Extension Recording - ${new Date().toLocaleString()}`,
        }
    };

    const response = await authenticatedFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Registration failed: ${text}`);
    }

    return await response.json();
}

export { };
