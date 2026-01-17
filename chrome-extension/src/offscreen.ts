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

        // 1. Capture the tab audio stream
        const tabStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    chromeMediaSourceId: streamId
                }
            },
            video: false
        } as any);

        // 2. Capture the microphone audio stream
        let micStream: MediaStream | null = null;
        try {
            micStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: false
            });
            console.log('[Offscreen] Mic stream captured successfully');
        } catch (micError) {
            console.warn('[Offscreen] Could not capture microphone. Recording tab only.', micError);
        }

        // 3. Mix Streams using AudioContext
        const audioContext = new AudioContext();
        const dest = audioContext.createMediaStreamDestination();

        // Source: Tab
        const tabSource = audioContext.createMediaStreamSource(tabStream);
        tabSource.connect(dest);

        // Source: Mic (if available)
        if (micStream) {
            const micSource = audioContext.createMediaStreamSource(micStream);
            micSource.connect(dest);
        }

        // --- NEW: Audio Monitoring ---
        // Create an audio element to play the stream so the user can hear it
        // We use the tab stream here to avoid echoing the user's own voice
        const audioMonitor = document.createElement('audio');
        audioMonitor.srcObject = tabStream;
        audioMonitor.play().catch(e => console.error('[Offscreen] Audio monitor play failed:', e));
        (window as any).audioMonitor = audioMonitor;

        // 4. Use mixed stream for recorder
        audioStream = dest.stream;

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
            // Cleanup audio context if needed (though we usually stop tracks manualy)
            audioContext.close().catch(() => { });
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
