// Offscreen script for Diktalo Chrome Extension
// Handles the actual MediaRecorder in a background document context

let recorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let audioStream: MediaStream | null = null;

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.log('[Offscreen] Received message:', message.action);

    if (message.action === 'START_OFFSCREEN_RECORDING') {
        startRecording(message.streamId, sendResponse);
        return true;
    }

    if (message.action === 'STOP_OFFSCREEN_RECORDING') {
        stopRecording(sendResponse);
        return true;
    }

    if (message.action === 'PAUSE_OFFSCREEN_RECORDING') {
        if (recorder && recorder.state === 'recording') {
            recorder.pause();
            console.log('[Offscreen] Recording paused');
            sendResponse({ success: true });
        } else {
            sendResponse({ success: false, error: 'Not recording' });
        }
    }

    if (message.action === 'RESUME_OFFSCREEN_RECORDING') {
        if (recorder && recorder.state === 'paused') {
            recorder.resume();
            console.log('[Offscreen] Recording resumed');
            sendResponse({ success: true });
        } else {
            sendResponse({ success: false, error: 'Not paused' });
        }
    }
});

async function startRecording(streamId: string, sendResponse: (response: any) => void) {
    try {
        console.log('[Offscreen] Starting recording with streamId:', streamId);

        audioChunks = [];

        // Capture the tab audio stream
        audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    chromeMediaSourceId: streamId
                }
            },
            video: false
        } as any);

        // --- NEW: Audio Monitoring ---
        // Create an audio element to play the stream so the user can hear it
        const audioMonitor = document.createElement('audio');
        audioMonitor.srcObject = audioStream;
        audioMonitor.play().catch(e => console.error('[Offscreen] Audio monitor play failed:', e));
        (window as any).audioMonitor = audioMonitor; // Keep reference

        recorder = new MediaRecorder(audioStream, {
            mimeType: 'audio/webm;codecs=opus'
        });

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        recorder.onstop = async () => {
            console.log('[Offscreen] Recorder stopped');
        };

        recorder.start(1000); // Collect data every 1s
        sendResponse({ success: true });

    } catch (error: any) {
        console.error('[Offscreen] Start error:', error);
        sendResponse({ success: false, error: error.message });
    }
}

async function stopRecording(sendResponse: (response: any) => void) {
    if (!recorder) {
        sendResponse({ success: false, error: 'No active recorder' });
        return;
    }

    recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

        // Convert to base64 to send back to background
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
            const base64Data = reader.result as string;

            // --- Cleanup ---
            if (audioStream) {
                audioStream.getTracks().forEach(track => track.stop());
                audioStream = null;
            }
            if ((window as any).audioMonitor) {
                (window as any).audioMonitor.srcObject = null;
            }
            recorder = null;
            audioChunks = [];

            sendResponse({ success: true, audioData: base64Data });
        };
    };

    recorder.stop();
}
