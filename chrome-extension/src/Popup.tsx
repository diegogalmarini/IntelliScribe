import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import './Popup.css';

// Lucide-like icons (simple SVG components for the extension)
const PlayIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z" /></svg>;
const StopIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>;
const PauseIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h4V4z" /></svg>;

const Popup: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'success' | 'error'>('idle');
    const [recordingTime, setRecordingTime] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [authToken, setAuthToken] = useState<string>('');
    const [isConfigExpanded, setIsConfigExpanded] = useState(true);
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
                setIsConfigExpanded(false);
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
        console.log('[Popup] Saving configuration...');
        const trimmedInput = authToken.trim();

        try {
            if (trimmedInput.startsWith('{')) {
                // Handle JSON Configuration (Set & Forget)
                const config = JSON.parse(trimmedInput);
                if (config.access_token && config.refresh_token && config.url && config.key) {
                    chrome.storage.local.set({
                        authToken: config.access_token,
                        refreshToken: config.refresh_token,
                        supabaseUrl: config.url,
                        supabaseKey: config.key
                    }, () => {
                        handleSaveSuccess('Configuration saved! Auto-refresh enabled.');
                    });
                } else {
                    throw new Error('Invalid configuration JSON. Missing required fields.');
                }
            } else {
                // Handle Legacy Token (String)
                chrome.storage.local.set({ authToken: trimmedInput }, () => {
                    handleSaveSuccess('Token saved successfully');
                });
            }
        } catch (e: any) {
            console.error('[Popup] Parse error:', e);
            setError('Invalid format: ' + e.message);
            setStatus('error');
        }
    };

    const handleSaveSuccess = (message: string) => {
        if (chrome.runtime.lastError) {
            console.error('[Popup] Error saving to storage:', chrome.runtime.lastError);
            setError('Storage error: ' + chrome.runtime.lastError.message);
            setStatus('error');
            return;
        }

        console.log('[Popup]', message);
        setError(null);
        setStatus('success');

        // Update local state is uploading false
        // Update local state is uploading false
        setTimeout(() => {
            setStatus('idle');
            setIsConfigExpanded(false);
        }, 2000);
    };

    return (
        <div className="popup">
            <header className="popup-header">
                <div className="header-glow" />
                <h1>
                    <img src="icons/diktalo.png" alt="Diktalo" style={{ height: '28px', width: 'auto', marginRight: '8px' }} />
                    Diktalo
                </h1>
                <div className={`status-badge ${isRecording ? 'status-recording' : ''}`}>
                    {isRecording ? (isPaused ? 'Pausado' : 'Grabando') : 'Listo'}
                </div>
            </header>

            <div className="popup-body">
                <div className="timer">{formatTime(recordingTime)}</div>

                {error && <div className="message error">{error}</div>}

                {status === 'success' && !error && (
                    <div className="message success">¡Configuración guardada!</div>
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
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                        {isConfigExpanded ? (
                            <div className="token-container">
                                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
                                    Configuración {authToken && '(Lista)'}
                                </label>
                                <input
                                    type="password"
                                    className="input-glow"
                                    placeholder="Pega el JSON de configuración..."
                                    value={authToken}
                                    onChange={(e) => setAuthToken(e.target.value)}
                                    style={{ fontSize: '12px' }}
                                />
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                    <button
                                        className="btn-main btn-start"
                                        onClick={handleSaveToken}
                                        style={{ flex: 1 }}
                                    >
                                        Guardar
                                    </button>
                                    {authToken && (
                                        <button
                                            className="btn-secondary"
                                            onClick={() => setIsConfigExpanded(false)}
                                            style={{ width: 'auto', padding: '0 12px' }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                                <a href="https://www.diktalo.com/intelligence" target="_blank" className="help-link" style={{ marginTop: '12px', display: 'block' }}>
                                    Obtener configuración del dashboard →
                                </a>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <button
                                    className="help-link"
                                    onClick={() => setIsConfigExpanded(true)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--muted-foreground)' }}
                                >
                                    ⚙️ Configuración Guardada
                                </button>
                            </div>
                        )}
                    </div>
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
