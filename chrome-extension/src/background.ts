// Background Service Worker for Diktalo Chrome Extension
// Handles tab audio capture and communication with popup

// --- State Management Helpers ---
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
    const { authToken, supabaseUrl, supabaseKey } = await chrome.storage.local.get(['authToken', 'supabaseUrl', 'supabaseKey']);

    if (!authToken || !supabaseUrl || !supabaseKey) {
        throw new Error('No auth token found');
    }

    // 3. Get User ID (Cache this in real app)
    const user = await getUserDetails(authToken, supabaseUrl, supabaseKey);
    const userId = user.id;

    // 4. Upload to Supabase
    const timestamp = Date.now();
    const filename = `screenshot-${timestamp}.png`;
    const path = `${userId}/screenshots/${filename}`;
    const endpoint = `${supabaseUrl}/storage/v1/object/recordings/${path}`; // Storing in 'recordings' bucket for now

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'apikey': supabaseKey,
            'Content-Type': 'image/png'
        },
        body: blob
    });

    if (!response.ok) {
        throw new Error('Failed to upload screenshot to Storage');
    }

    console.log('[Background] Screenshot uploaded:', path);

    // 5. Save to Session State
    const state = await getState();
    const currentList = state.capturedScreenshots || [];
    const newScreenshot = {
        path: path,
        timestamp: timestamp,
        url: `${supabaseUrl}/storage/v1/object/public/recordings/${path}` // Public URL assumption or signed url needed later
    };

    await saveState({
        capturedScreenshots: [...currentList, newScreenshot]
    });

    // 6. Notify User
    chrome.notifications.create(`screenshot-${timestamp}`, {
        type: 'basic',
        iconUrl: 'icons/diktalo.png',
        title: 'Captura Guardada',
        message: 'La captura de pantalla se ha guardado correctamente.'
    });

    return { success: true, path: path };
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
                    await clearState();
                    await closeOffscreenDocument();
                    resolve({ success: false, error: error.message });
                }
            } else {
                await clearState();
                await closeOffscreenDocument();
                resolve({ success: false, error: response?.error || 'No audio data' });
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

async function refreshSession(): Promise<string> {
    console.log('[Background] Attempting to refresh session...');
    const { refreshToken, supabaseUrl, supabaseKey } = await chrome.storage.local.get(['refreshToken', 'supabaseUrl', 'supabaseKey']);

    if (!refreshToken || !supabaseUrl || !supabaseKey) {
        throw new Error('Missing refresh token or Supabase configuration.');
    }

    try {
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
            throw new Error(`Refresh failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        if (!data.access_token || !data.refresh_token) {
            throw new Error('Invalid refresh response');
        }

        console.log('[Background] Session refreshed successfully.');

        // Update storage with new tokens
        await chrome.storage.local.set({
            authToken: data.access_token,
            refreshToken: data.refresh_token
        });

        return data.access_token;
    } catch (error: any) {
        console.error('[Background] Refresh session error:', error);
        throw error;
    }
}

async function uploadAudioToDiktalo(audioBlob: Blob, durationSeconds: number, extraMetadata: any = {}): Promise<{ recordingId: string }> {
    console.log('[Background] uploadAudioToDiktalo called (Direct-to-Cloud), blob size:', audioBlob.size);

    let { authToken, supabaseUrl, supabaseKey } = await chrome.storage.local.get(['authToken', 'supabaseUrl', 'supabaseKey']);

    if (!authToken || !supabaseUrl || !supabaseKey) {
        throw new Error('Not authenticated. Please set your API token in settings.');
    }

    // Helper to perform the full upload flow
    const performFullUpload = async (token: string): Promise<{ recordingId: string }> => {
        // 1. Get User ID (needed for storage path)
        console.log('[Background] Step 1: Getting User Details...');

        // NOTIFICATION: Upload Starting
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/diktalo.png', // Ensure icon exists or use generic
            title: 'Subiendo Grabación...',
            message: 'Por favor no cierres el navegador hasta que termine.',
            priority: 2
        });

        const user = await getUserDetails(token, supabaseUrl, supabaseKey);
        const userId = user.id;

        // 2. Upload to Storage
        console.log('[Background] Step 2: Uploading to Supabase Storage...');
        const filePath = await uploadToSupabaseStorage(token, supabaseUrl, supabaseKey, userId, audioBlob);
        console.log('[Background] Storage upload complete. Path:', filePath);

        // 3. Register Recording in DB via API
        console.log('[Background] Step 3: Registering with API...');

        const recording = await registerRecording(token, filePath, durationSeconds, {
            source: 'chrome-extension', // Hardcoded for now, could be dynamic
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
    };

    try {
        return await performFullUpload(authToken);
    } catch (error: any) {
        console.warn('[Background] Upload flow failed, checking if 401/Refresh needed:', error);

        // If error suggests auth failure (401 or 403), try refresh
        if (error.message.includes('401') || error.message.includes('403') || error.message.includes('Unauthorized')) {
            console.log('[Background] Attempting token refresh due to 401/403...');
            try {
                const newToken = await refreshSession();
                console.log('[Background] Token refreshed. Retrying flow...');
                return await performFullUpload(newToken);
            } catch (refreshError) {
                console.error('[Background] Refresh failed:', refreshError);
                throw new Error('Session expired and auto-refresh failed.');
            }
        }

        throw error;
    }
}

// --- Direct Cloud Helpers ---

async function getUserDetails(token: string, supabaseUrl: string, supabaseKey: string) {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': supabaseKey
        }
    });

    if (!response.ok) {
        throw new Error(`Get User failed: ${response.status} ${response.statusText}`);
    }
    return await response.json();
}

async function uploadToSupabaseStorage(token: string, supabaseUrl: string, supabaseKey: string, userId: string, blob: Blob): Promise<string> {
    const timestamp = Date.now();
    const filename = `${timestamp}.webm`;
    const path = `${userId}/${filename}`; // RLS requires {userId}/* prefix

    const endpoint = `${supabaseUrl}/storage/v1/object/recordings/${path}`;

    console.log('[Background] Uploading to:', endpoint);

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': supabaseKey,
            'Content-Type': 'audio/webm',
            // 'x-upsert': 'false' // Optional
        },
        body: blob
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Storage Upload failed (${response.status}): ${text}`);
    }

    return path;
}

async function registerRecording(token: string, filePath: string, duration: number, metadata: any) {
    const endpoint = 'https://www.diktalo.com/api/upload-audio'; // We keep the same endpoint name but change payload

    const payload = {
        filePath: filePath,
        duration: duration,
        metadata: {
            ...metadata,
            title: `Tab Recording - ${new Date().toLocaleString()}`,
            tabUrl: 'Confirmed Direct Upload' // We can't easily access tab URL here without passing it down, simplifying for now
        }
    };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' // Instructs API to treat as registration
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Registration failed (${response.status}): ${text}`);
    }

    return await response.json();
}

export { };
