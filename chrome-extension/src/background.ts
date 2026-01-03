// Background Service Worker for Diktalo Chrome Extension
// Handles tab audio capture and communication with popup

let recordingTabId: number | null = null;
let recordingStartTime: number | null = null;
let isPaused: boolean = false;
let pauseStartTime: number | null = null;
let totalPausedTime: number = 0;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.log('[Background] Received message:', message);

    if (message.action === 'START_RECORDING') {
        startRecording(message.tabId, sendResponse);
        return true; // Async response
    }

    if (message.action === 'STOP_RECORDING') {
        stopRecording(sendResponse);
        return true; // Async response
    }

    if (message.action === 'PAUSE_RECORDING') {
        pauseRecording(sendResponse);
        return true;
    }

    if (message.action === 'RESUME_RECORDING') {
        resumeRecording(sendResponse);
        return true;
    }

    if (message.action === 'GET_STATUS') {
        sendResponse({
            isRecording: recordingTabId !== null,
            isPaused: isPaused,
            tabId: recordingTabId,
            startTime: recordingStartTime,
            totalPausedTime: totalPausedTime
        });
    }
});

async function startRecording(tabId: number, sendResponse: (response: any) => void) {
    try {
        console.log('[Background] Starting recording for tab:', tabId);

        // --- STEP 1: FORCE CLEANUP ---
        await closeOffscreenDocument();
        await new Promise(resolve => setTimeout(resolve, 500));

        chrome.tabCapture.getMediaStreamId({
            targetTabId: tabId
        }, async (streamId) => {
            try {
                if (!streamId) {
                    const error = chrome.runtime.lastError?.message || 'Failed to get stream ID';
                    sendResponse({ success: false, error: error });
                    return;
                }

                await createOffscreenDocument();
                // Wait for offscreen document to initialize
                await new Promise(resolve => setTimeout(resolve, 200));

                chrome.runtime.sendMessage({
                    action: 'START_OFFSCREEN_RECORDING',
                    streamId: streamId
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('[Background] Error communicating with offscreen:', chrome.runtime.lastError);
                        sendResponse({ success: false, error: chrome.runtime.lastError.message });
                        return;
                    }

                    if (response?.success) {
                        recordingTabId = tabId;
                        recordingStartTime = Date.now();
                        isPaused = false;
                        totalPausedTime = 0;
                        sendResponse({ success: true });
                    } else {
                        sendResponse({ success: false, error: response?.error || 'Failed to start offscreen recording' });
                    }
                });
            } catch (innerError: any) {
                sendResponse({ success: false, error: innerError.message });
            }
        });

    } catch (error: any) {
        sendResponse({ success: false, error: error.message });
    }
}

async function pauseRecording(sendResponse: (response: any) => void) {
    if (!recordingTabId) {
        sendResponse({ success: false, error: 'No active recording' });
        return;
    }

    chrome.runtime.sendMessage({ action: 'PAUSE_OFFSCREEN_RECORDING' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('[Background] Pause error:', chrome.runtime.lastError);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
            return;
        }

        if (response?.success) {
            isPaused = true;
            pauseStartTime = Date.now();
            sendResponse({ success: true });
        } else {
            sendResponse({ success: false, error: response?.error || 'Failed to pause' });
        }
    });
}

async function resumeRecording(sendResponse: (response: any) => void) {
    if (!recordingTabId) {
        sendResponse({ success: false, error: 'No active recording' });
        return;
    }

    chrome.runtime.sendMessage({ action: 'RESUME_OFFSCREEN_RECORDING' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('[Background] Resume error:', chrome.runtime.lastError);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
            return;
        }

        if (response?.success) {
            isPaused = false;
            if (pauseStartTime) {
                totalPausedTime += (Date.now() - pauseStartTime);
                pauseStartTime = null;
            }
            sendResponse({ success: true });
        } else {
            sendResponse({ success: false, error: response?.error || 'Failed to resume' });
        }
    });
}

async function stopRecording(sendResponse: (response: any) => void) {
    console.log('[Background] stopRecording called');
    try {
        chrome.runtime.sendMessage({ action: 'STOP_OFFSCREEN_RECORDING' }, async (response) => {
            console.log('[Background] STOP_OFFSCREEN_RECORDING response:', response);

            if (chrome.runtime.lastError) {
                console.error('[Background] Error from offscreen:', chrome.runtime.lastError);
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                await closeOffscreenDocument();
                resetState();
                return;
            }

            if (response?.success && response.audioData) {
                console.log('[Background] Received audio data, size:', response.audioData.length, 'bytes');
                try {
                    const audioBlob = base64ToBlob(response.audioData, 'audio/webm');
                    console.log('[Background] Created blob, size:', audioBlob.size, 'bytes');
                    console.log('[Background] Starting upload...');
                    const uploadResult = await uploadAudioToDiktalo(audioBlob);
                    console.log('[Background] Upload successful:', uploadResult);
                    resetState();
                    sendResponse({ success: true, recordingId: uploadResult.recordingId });
                    await closeOffscreenDocument();
                } catch (uploadError: any) {
                    console.error('[Background] Upload failed:', uploadError);
                    sendResponse({ success: false, error: uploadError.message });
                    await closeOffscreenDocument();
                    resetState();
                }
            } else {
                console.error('[Background] No audio data in response');
                sendResponse({ success: false, error: response?.error || 'No audio data received' });
                await closeOffscreenDocument();
                resetState();
            }
        });
    } catch (error: any) {
        console.error('[Background] stopRecording error:', error);
        sendResponse({ success: false, error: error.message });
        await closeOffscreenDocument();
        resetState();
    }
}

function resetState() {
    recordingTabId = null;
    recordingStartTime = null;
    isPaused = false;
    pauseStartTime = null;
    totalPausedTime = 0;
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

async function uploadAudioToDiktalo(audioBlob: Blob): Promise<{ recordingId: string }> {
    console.log('[Background] uploadAudioToDiktalo called, blob size:', audioBlob.size);
    try {
        const { authToken } = await chrome.storage.local.get('authToken');
        console.log('[Background] Auth token retrieved:', authToken ? 'exists' : 'missing');

        if (!authToken) {
            throw new Error('Not authenticated. Please set your API token in settings.');
        }

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('source', 'chrome-extension');
        formData.append('title', `Tab Recording - ${new Date().toLocaleString()}`);

        const endpoint = 'https://www.diktalo.com/api/upload-audio';
        console.log('[Background] Uploading to:', endpoint);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });

        console.log('[Background] Upload response status:', response.status);

        if (!response.ok) {
            const responseText = await response.text();
            console.error('[Background] Upload failed:', response.status, responseText);
            throw new Error(`Upload failed (${response.status}): ${responseText}`);
        }

        const result = await response.json();
        console.log('[Background] Upload result:', result);
        return { recordingId: result.recordingId || 'unknown' };
    } catch (error: any) {
        console.error('[Background] uploadAudioToDiktalo error:', error);
        throw error;
    }
}

export { };
