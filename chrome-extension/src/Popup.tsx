import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import './Popup.css';

// Lucide-like icons (simple SVG components for the extension)
const PlayIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z" /></svg>;
const StopIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>;
const PauseIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h4V4z" /></svg>;
const MicIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>;

const Popup: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'success' | 'error'>('idle');
    const [recordingTime, setRecordingTime] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [authToken, setAuthToken] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);
    const [showStopConfirm, setShowStopConfirm] = useState(false);

    const timerRef = useRef<number | null>(null);

    // Poll current status on mount
    useEffect(() => {
        chrome.runtime.sendMessage({ action: 'GET_STATUS' }, (response) => {
            if (response && response.isRecording) {
                setIsRecording(true);
                setIsPaused(response.isPaused || false);
                setStatus('recording');
                // Calculate time elapsed if start time was stored
                if (response.startTime) {
                    const elapsed = Math.floor((Date.now() - response.startTime) / 1000);
                    setRecordingTime(elapsed);
                }
            }
        });

        chrome.storage.local.get(['authToken'], (result) => {
            if (result.authToken) {
                setAuthToken(result.authToken);
            }
        });
    }, []);

    // Timer logic
    useEffect(() => {
        if (isRecording && !isPaused) {
            timerRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRecording, isPaused]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartRecording = async () => {
        if (!authToken) {
            setError('Please set your API token in settings first.');
            return;
        }

        setError(null);
        setStatus('idle');

        // Get the current active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) {
            setError('Could not find active tab');
            return;
        }

        chrome.runtime.sendMessage({
            action: 'START_RECORDING',
            tabId: tab.id
        }, (response) => {
            if (response?.success) {
                setIsRecording(true);
                setIsPaused(false);
                setRecordingTime(0);
                setStatus('recording');
            } else {
                setError(response?.error || 'Failed to start recording');
                setStatus('error');
            }
        });
    };

    const handleStopRecording = () => {
        console.log('[Popup] Stop recording requested, showStopConfirm:', showStopConfirm, 'recordingTime:', recordingTime);

        if (!showStopConfirm && recordingTime > 5) {
            setShowStopConfirm(true);
            return;
        }

        console.log('[Popup] Stopping recording...');
        setShowStopConfirm(false);
        setIsUploading(true);
        setStatus('processing');

        chrome.runtime.sendMessage({ action: 'STOP_RECORDING' }, (response) => {
            console.log('[Popup] Stop recording response:', response);
            setIsUploading(false);
            if (response?.success) {
                console.log('[Popup] Recording stopped successfully');
                setIsRecording(false);
                setIsPaused(false);
                setStatus('success');
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                console.error('[Popup] Failed to stop recording:', response?.error);
                setError(response?.error || 'Upload failed');
                setStatus('error');
            }
        });
    };

    const handlePauseResume = () => {
        const action = isPaused ? 'RESUME_RECORDING' : 'PAUSE_RECORDING';
        chrome.runtime.sendMessage({ action }, (response) => {
            if (response?.success) {
                setIsPaused(!isPaused);
            } else {
                setError(response?.error || 'Failed to change recording state');
            }
        });
    };

    const handleSaveToken = () => {
        console.log('[Popup] Saving token...');
        chrome.storage.local.set({ authToken }, () => {
            if (chrome.runtime.lastError) {
                console.error('[Popup] Error saving token:', chrome.runtime.lastError);
                setError('Failed to save token: ' + chrome.runtime.lastError.message);
                setStatus('error');
                return;
            }

            console.log('[Popup] Token saved successfully');
            setError(null);
            setStatus('success');

            // Verify it was saved
            chrome.storage.local.get(['authToken'], (result) => {
                console.log('[Popup] Verified saved token:', result.authToken ? 'exists' : 'missing');
            });

            setTimeout(() => setStatus('idle'), 2000);
        });
    };

    if (!authToken && status !== 'success') {
        return (
            <div className="popup">
                <header className="popup-header">
                    <div className="header-glow" />
                    <h1><MicIcon /> Diktalo</h1>
                    <div className="status-badge">Configuración</div>
                </header>
                <div className="popup-body">
                    <div className="token-container">
                        <p className="message info">Inserta tu API Token para empezar a grabar.</p>
                        <input
                            type="password"
                            className="input-glow"
                            placeholder="Supabase API Token..."
                            value={authToken}
                            onChange={(e) => setAuthToken(e.target.value)}
                        />
                        <button className="btn-main btn-start" onClick={handleSaveToken}>
                            Guardar Token
                        </button>
                    </div>
                    <a href="https://www.diktalo.com/settings" target="_blank" className="help-link">
                        ¿Dónde encuentro mi token?
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="popup">
            <header className="popup-header">
                <div className="header-glow" />
                <h1><MicIcon /> Diktalo</h1>
                <div className={`status-badge ${isRecording ? 'status-recording' : ''}`}>
                    {isRecording ? (isPaused ? 'Pausado' : 'Grabando') : 'Listo'}
                </div>
            </header>

            <div className="popup-body">
                <div className="timer">{formatTime(recordingTime)}</div>

                {error && <div className="message error">{error}</div>}

                {status === 'success' && !error && (
                    <div className="message success">¡Grabación subida con éxito!</div>
                )}

                <div className="controls-group">
                    {!isRecording ? (
                        <button
                            className="btn-main btn-start"
                            onClick={handleStartRecording}
                            disabled={status === 'processing'}
                        >
                            {status === 'processing' ? <div className="spinner-clean" /> : <PlayIcon />}
                            Grabar Pestaña
                        </button>
                    ) : (
                        <>
                            <div className="secondary-actions">
                                <button
                                    className={`btn-secondary ${isPaused ? 'btn-resume' : 'btn-pause'}`}
                                    onClick={handlePauseResume}
                                >
                                    {isPaused ? <PlayIcon /> : <PauseIcon />}
                                    {isPaused ? 'Resumir' : 'Pausar'}
                                </button>
                            </div>

                            <button
                                className="btn-main btn-stop"
                                onClick={handleStopRecording}
                                disabled={isUploading}
                            >
                                {isUploading ? <div className="spinner-clean" /> : <StopIcon />}
                                {showStopConfirm ? '¿Confirmar Parada?' : 'Detener Grabación'}
                            </button>
                        </>
                    )}
                </div>

                {!isRecording && (
                    <button
                        className="btn-dashboard"
                        onClick={() => window.open('https://www.diktalo.com/intelligence', '_blank')}
                    >
                        Abrir Dashboard
                    </button>
                )}
            </div>
        </div>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<Popup />);
}

export default Popup;
