// Offscreen Document for MediaRecorder
// This runs in a hidden page context where we CAN use MediaRecorder
// (Service Workers don't support MediaRecorder in Manifest V3)

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let recordingStartTime: number = 0;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.log('[Offscreen] Received message:', message);

    if (message.action === 'START_OFFSCREEN_RECORDING') {
        startRecording(message.streamId, sendResponse);
        return true; // Async
    }

    if (message.action === 'STOP_OFFSCREEN_RECORDING') {
        stopRecording(sendResponse);
        return true; // Async
    }

    return false;
});

async function startRecording(streamId: string, sendResponse: (response: any) => void) {
    try {
        console.log('[Offscreen] Starting recording with stream ID:', streamId);

        // Get the MediaStream using the stream ID
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    chromeMediaSourceId: streamId
                }
            } as any
        });

        console.log('[Offscreen] Got MediaStream:', stream);

        // --- CRITICAL: Restoration of sound for the user ---
        // When capturing a tab, Chrome mutes it. We must play it back in this page.
        const audio = new Audio();
        audio.srcObject = stream;
        audio.play();
        console.log('[Offscreen] Audio playback started for monitoring');

        // Create MediaRecorder
        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm;codecs=opus',
            audioBitsPerSecond: 128000
        });

        audioChunks = [];
        recordingStartTime = Date.now();

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
                console.log('[Offscreen] Audio chunk received:', event.data.size, 'bytes');
            }
        };

        mediaRecorder.onstop = () => {
            console.log('[Offscreen] Recording stopped, chunks collected:', audioChunks.length);
        };

        mediaRecorder.onerror = (event: any) => {
            console.error('[Offscreen] MediaRecorder error:', event);
        };

        // Start recording (collect chunks every second)
        mediaRecorder.start(1000);

        console.log('[Offscreen] MediaRecorder started');

        sendResponse({ success: true });

    } catch (error: any) {
        console.error('[Offscreen] Error starting recording:', error);
        sendResponse({ success: false, error: error.message });
    }
}

function stopRecording(sendResponse: (response: any) => void) {
    try {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            sendResponse({ success: false, error: 'No active recording' });
            return;
        }

        console.log('[Offscreen] Stopping MediaRecorder');

        mediaRecorder.onstop = () => {
            console.log('[Offscreen] Creating final blob from', audioChunks.length, 'chunks');

            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const duration = Math.floor((Date.now() - recordingStartTime) / 1000);

            console.log('[Offscreen] Blob created:', audioBlob.size, 'bytes,', duration, 'seconds');

            // Convert Blob to Base64 string for message passing
            // ArrayBuffer doesn't work in sendResponse on all Chrome versions
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                console.log('[Offscreen] Data ready as Base64 string, length:', base64.length);
                sendResponse({
                    success: true,
                    audioData: base64, // Use audioData instead of audioBuffer
                    size: audioBlob.size,
                    duration: duration
                });
            };
            reader.onerror = (e) => {
                console.error('[Offscreen] FileReader error:', e);
                sendResponse({ success: false, error: 'Failed to read audio blob' });
            };
            reader.readAsDataURL(audioBlob);
        };

        mediaRecorder.stop();

        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach(track => track.stop());

    } catch (error: any) {
        console.error('[Offscreen] Error stopping recording:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Export for TypeScript
export { };
