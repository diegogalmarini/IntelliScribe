// Background Service Worker for Diktalo Chrome Extension
// Handles tab audio capture and communication with popup

let recordingTabId: number | null = null;

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

    if (message.action === 'GET_STATUS') {
        sendResponse({
            isRecording: recordingTabId !== null,
            tabId: recordingTabId
        });
    }
});

async function startRecording(tabId: number, sendResponse: (response: any) => void) {
    try {
        console.log('[Background] Starting recording for tab:', tabId);

        // Get the media stream ID for the tab (callback-based API)
        chrome.tabCapture.getMediaStreamId({
            targetTabId: tabId
        }, async (streamId) => {
            try {
                if (!streamId) {
                    console.error('[Background] Failed to get stream ID');
                    sendResponse({ success: false, error: 'Failed to get stream ID' });
                    return;
                }

                console.log('[Background] Got stream ID:', streamId);

                // Create offscreen document to handle MediaRecorder
                await createOffscreenDocument();
                console.log('[Background] Offscreen document ready');

                // Send message to offscreen document to start recording
                chrome.runtime.sendMessage({
                    action: 'START_OFFSCREEN_RECORDING',
                    streamId: streamId
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('[Background] Runtime error:', chrome.runtime.lastError);
                        sendResponse({ success: false, error: chrome.runtime.lastError.message });
                        return;
                    }

                    console.log('[Background] Offscreen start response:', response);

                    if (response?.success) {
                        recordingTabId = tabId;
                        console.log('[Background] Recording started successfully');
                        sendResponse({ success: true });
                    } else {
                        console.error('[Background] Offscreen failed to start:', response?.error);
                        sendResponse({ success: false, error: response?.error || 'Failed to start offscreen recording' });
                    }
                });
            } catch (innerError: any) {
                console.error('[Background] Error in callback:', innerError);
                sendResponse({ success: false, error: innerError.message });
            }
        });

    } catch (error: any) {
        console.error('[Background] Error starting recording:', error);
        sendResponse({ success: false, error: error.message });
    }
}

async function stopRecording(sendResponse: (response: any) => void) {
    try {
        console.log('[Background] Stopping recording');

        // Send message to offscreen document to stop
        chrome.runtime.sendMessage({
            action: 'STOP_OFFSCREEN_RECORDING'
        }, async (response) => {
            if (chrome.runtime.lastError) {
                console.error('[Background] Runtime error on stop:', chrome.runtime.lastError);
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                return;
            }

            console.log('[Background] Offscreen stop response received');

            if (response?.success && response.audioData) {
                try {
                    console.log('[Background] Received audio data length:', response.audioData.length);

                    // Convert base64 to Blob
                    const audioBlob = base64ToBlob(response.audioData, 'audio/webm');
                    console.log('[Background] Final Blob for upload:', audioBlob.size, 'bytes');

                    // Upload the blob to Diktalo
                    const uploadResult = await uploadAudioToDiktalo(audioBlob);

                    recordingTabId = null;

                    sendResponse({
                        success: true,
                        recordingId: uploadResult.recordingId
                    });

                    // Close offscreen document
                    await closeOffscreenDocument();
                } catch (uploadError: any) {
                    console.error('[Background] Upload process failed:', uploadError);
                    sendResponse({ success: false, error: uploadError.message });
                }
            } else {
                console.error('[Background] Offscreen stop failed or no data:', response?.error);
                sendResponse({ success: false, error: response?.error || 'No audio data received' });
            }
        });

    } catch (error: any) {
        console.error('[Background] Error stopping recording:', error);
        sendResponse({ success: false, error: error.message });
    }
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
        await chrome.offscreen.closeDocument();
        console.log('[Background] Offscreen closed');
    } catch {
        console.log('[Background] Offscreen already closed');
    }
}

async function uploadAudioToDiktalo(audioBlob: Blob): Promise<{ recordingId: string }> {
    try {
        console.log('[Background] Starting upload...');
        const { authToken } = await chrome.storage.local.get('authToken');
        if (!authToken) throw new Error('Not authenticated. Set API token in settings.');

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('source', 'chrome-extension');
        formData.append('title', `Tab Recording - ${new Date().toLocaleString()}`);

        const endpoint = 'https://www.diktalo.com/api/upload-audio';
        console.log('[Background] POSTing to:', endpoint);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });

        console.log('[Background] Status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
            throw new Error(`Upload error (${response.status}): ${errorData.error || response.statusText}`);
        }

        const result = await response.json();
        console.log('[Background] Success!', result);
        return { recordingId: result.recordingId || 'unknown' };

    } catch (error: any) {
        console.error('[Background] Upload error detail:', error);
        throw error;
    }
}

export { };
