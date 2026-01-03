import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './Popup.css';

type RecordingStatus = 'idle' | 'recording' | 'processing' | 'uploading' | 'success' | 'error';

export const Popup: React.FC = () => {
    console.log('[Diktalo Popup] Component initialization');
    const [status, setStatus] = useState<RecordingStatus>('idle');
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [apiToken, setApiToken] = useState('');

    useEffect(() => {
        // Check if user has API token saved
        chrome.storage.local.get('authToken', (result) => {
            if (result.authToken) {
                setIsAuthenticated(true);
            }
        });
    }, []);

    useEffect(() => {
        let interval: number | null = null;

        if (status === 'recording') {
            const startTime = Date.now();
            interval = window.setInterval(() => {
                setDuration(Math.floor((Date.now() - startTime) / 1000));
            }, 100);
        } else {
            setDuration(0);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [status]);

    const handleStartRecording = async () => {
        try {
            setStatus('processing');
            setError(null);

            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab.id) {
                throw new Error('No active tab found');
            }

            // Send message to background to start recording
            chrome.runtime.sendMessage({
                action: 'START_RECORDING',
                tabId: tab.id
            }, (response) => {
                if (response?.success) {
                    setStatus('recording');
                } else {
                    setStatus('error');
                    setError(response?.error || 'Failed to start recording');
                }
            });

        } catch (err: any) {
            setStatus('error');
            setError(err.message);
        }
    };

    const handleStopRecording = async () => {
        try {
            setStatus('uploading');

            // Send message to background to stop
            chrome.runtime.sendMessage({
                action: 'STOP_RECORDING'
            }, (response) => {
                if (response?.success) {
                    setStatus('success');
                    // Optionally open the recording in Diktalo
                    setTimeout(() => {
                        chrome.tabs.create({
                            url: `https://www.diktalo.com/intelligence/recordings/${response.recordingId}`
                        });
                    }, 1500);
                } else {
                    setStatus('error');
                    setError(response?.error || 'Failed to stop recording');
                }
            });

        } catch (err: any) {
            setStatus('error');
            setError(err.message);
        }
    };

    const handleSaveToken = () => {
        chrome.storage.local.set({ authToken: apiToken }, () => {
            setIsAuthenticated(true);
        });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isAuthenticated) {
        return (
            <div className="popup">
                <div className="popup-header">
                    <h1>🎙️ Diktalo</h1>
                </div>
                <div className="popup-body">
                    <p className="auth-message">Necesitas configurar tu token de API</p>
                    <input
                        type="password"
                        placeholder="Pega tu API token"
                        value={apiToken}
                        onChange={(e) => setApiToken(e.target.value)}
                        className="token-input"
                    />
                    <button onClick={handleSaveToken} className="btn-primary">
                        Guardar Token
                    </button>
                    <p className="help-text">
                        Obtén tu token en: <a href="https://www.diktalo.com/settings" target="_blank">diktalo.com/settings</a>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="popup">
            <div className="popup-header">
                <h1>🎙️ Diktalo</h1>
                <div className={`status-indicator status-${status}`}>
                    {status === 'idle' && '✅ Listo'}
                    {status === 'recording' && '🔴 Grabando'}
                    {status === 'processing' && '⏳ Procesando'}
                    {status === 'uploading' && '📤 Subiendo'}
                    {status === 'success' && '✅ Completado'}
                    {status === 'error' && '❌ Error'}
                </div>
            </div>

            <div className="popup-body">
                {status === 'recording' && (
                    <div className="timer">{formatTime(duration)}</div>
                )}

                {error && (
                    <div className="error-message">{error}</div>
                )}

                {status === 'success' && (
                    <div className="success-message">
                        ¡Grabación guardada! Abriendo en Diktalo...
                    </div>
                )}

                {(status === 'idle' || status === 'error') && (
                    <button
                        onClick={handleStartRecording}
                        className="btn-record btn-start"
                        disabled={status !== 'idle' && status !== 'error'}
                    >
                        🔴 Grabar Pestaña
                    </button>
                )}

                {status === 'recording' && (
                    <button
                        onClick={handleStopRecording}
                        className="btn-record btn-stop"
                    >
                        ⏹️ Detener Grabación
                    </button>
                )}

                {(status === 'processing' || status === 'uploading') && (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>{status === 'processing' ? 'Iniciando...' : 'Subiendo a Diktalo...'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <Popup />
        </React.StrictMode>
    );
}
