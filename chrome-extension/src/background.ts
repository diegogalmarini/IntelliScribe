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

        // --- STEP 1: FORCE CLEANUP ---
        // Close any existing offscreen document to release previous captures
        await closeOffscreenDocument();

        // Wait a bit for Chrome to release the stream
        await new Promise(resolve => setTimeout(resolve, 500));

        // Get the media stream ID for the tab (callback-based API)
        chrome.tabCapture.getMediaStreamId({
            targetTabId: tabId
        }, async (streamId) => {
            try {
                if (!streamId) {
                    const error = chrome.runtime.lastError?.message || 'Failed to get stream ID';
                    console.error('[Background] Tab capture error:', error);
                    sendResponse({ success: false, error: error });
                    return;
                }

                console.log('[Background] Got stream ID:', streamId);

                // Create fresh offscreen document
                await createOffscreenDocument();
                console.log('[Background] Offscreen document ready');

                // Send message to offscreen document to start recording
                chrome.runtime.sendMessage({
                    action: 'START_OFFSCREEN_RECORDING',
                    streamId: streamId
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('[Background] Runtime error starting offscreen:', chrome.runtime.lastError);
                        sendResponse({ success: false, error: chrome.runtime.lastError.message });
                        return;
                    }

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
                console.error('[Background] Error in capture callback:', innerError);
                sendResponse({ success: false, error: innerError.message });
            }
        });

    } catch (error: any) {
        console.error('[Background] Error in startRecording flow:', error);
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
                // Attempt cleanup anyway
                await closeOffscreenDocument();
                recordingTabId = null;
                return;
            }

            if (response?.success && response.audioData) {
                try {
                    console.log('[Background] Received audio data length:', response.audioData.length);

                    // Convert base64 to Blob
                    const audioBlob = base64ToBlob(response.audioData, 'audio/webm');
                    console.log('[Background] Re-created Blob size:', audioBlob.size, 'bytes');

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
                    // Cleanup
                    await closeOffscreenDocument();
                    recordingTabId = null;
                }
            } else {
                console.error('[Background] Offscreen stop failed or no data:', response?.error);
                sendResponse({ success: false, error: response?.error || 'No audio data received' });
                // Cleanup
                await closeOffscreenDocument();
                recordingTabId = null;
            }
        });

    } catch (error: any) {
        console.error('[Background] Error in stopRecording flow:', error);
        sendResponse({ success: false, error: error.message });
        await closeOffscreenDocument();
        recordingTabId = null;
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
    // Check if offscreen document already exists
    const existingContexts = await (chrome.runtime as any).getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT']
    });

    if (existingContexts.length > 0) {
        console.log('[Background] Offscreen document already exists');
        return;
    }

    // Create offscreen document
    await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['USER_MEDIA' as any],
        justification: 'Recording audio from tab for transcription'
    });

    console.log('[Background] Offscreen document created');
}

async function closeOffscreenDocument() {
    try {
        // Find if it exists first to avoid errors
        const existingContexts = await (chrome.runtime as any).getContexts({
            contextTypes: ['OFFSCREEN_DOCUMENT']
        });

        if (existingContexts.length > 0) {
            await chrome.offscreen.closeDocument();
            console.log('[Background] Offscreen document closed successfully');
        } else {
            console.log('[Background] No offscreen document to close');
        }
    } catch (error) {
        console.log('[Background] Error or offscreen already closed:', error);
    }
}

async function uploadAudioToDiktalo(audioBlob: Blob): Promise<{ recordingId: string }> {
    try {
        console.log('[Background] Starting upload for blob size:', audioBlob.size);

        // Get auth token from storage
        const { authToken } = await chrome.storage.local.get('authToken');

        if (!authToken) {
            throw new Error('Not authenticated. Please set your API token in settings.');
        }

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('source', 'chrome-extension');
        const timestamp = new Date().toLocaleString();
        formData.append('title', `Tab Recording - ${timestamp}`);

        // USE THE WWW ENDPOINT - Browser subagent confirmed this is working and apex redirects
        const endpoint = 'https://www.diktalo.com/api/upload-audio';
        console.log('[Background] Fetching:', endpoint);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });

        console.log('[Background] Upload response status:', response.status);

        if (!response.ok) {
            // Try to parse error message from JSON or text
            const responseText = await response.text();
            let errorMessage = response.statusText;
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                errorMessage = responseText || errorMessage;
            }
            throw new Error(`Upload failed (${response.status}): ${errorMessage}`);
        }

        const result = await response.json();
        console.log('[Background] Upload successful:', result);

        return { recordingId: result.recordingId || 'unknown' };

    } catch (error: any) {
        console.error('[Background] Final upload error:', error);
        throw error;
    }
}

export { };
