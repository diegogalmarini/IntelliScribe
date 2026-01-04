
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import './Popup.css';

// Lucide-like icons (simple SVG components for the extension)
const MicIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>;

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
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} `;
    };

    const handleStartRecording = async () => {
        if (!authToken) {
            setError('Por favor configura tu TOKEN primeramente.');
            return;
        }

        setError(null);
        setStatus('idle');

        // Get the current active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) {
            setError('No se pudo encontrar la pestaña activa');
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
                setError(response?.error || 'Falló al iniciar grabación');
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
                setError(response?.error || 'Falló la subida');
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
                setError(response?.error || 'Falló al cambiar estado');
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
                        handleSaveSuccess('¡Token guardado! Auto-refresh activado.');
                    });
                } else {
                    throw new Error('Configuración JSON inválida.');
                }
            } else {
                // Handle Legacy Token (String)
                chrome.storage.local.set({ authToken: trimmedInput }, () => {
                    handleSaveSuccess('Token guardado correctamente');
                });
            }
        } catch (e: any) {
            console.error('[Popup] Parse error:', e);
            setError('Formato inválido: ' + e.message);
            setStatus('error');
        }
    };

    const handleSaveSuccess = (message: string) => {
        if (chrome.runtime.lastError) {
            console.error('[Popup] Error saving to storage:', chrome.runtime.lastError);
            setError('Error de almacenamiento: ' + chrome.runtime.lastError.message);
            setStatus('error');
            return;
        }

        console.log('[Popup]', message);
        setError(null);
        setStatus('success');

        // Update local state is uploading false
        setTimeout(() => {
            setStatus('idle');
            setIsConfigExpanded(false);
        }, 2000);
    };

    return (
        <div className="popup">
            <header className="popup-header">
                <h1>
                    <img src="icons/diktalo.png" alt="Diktalo" style={{ height: '20px', width: 'auto' }} />
                    Diktalo
                </h1>
                <div className={`status - badge ${isRecording ? 'status-recording' : ''} `}>
                    {isRecording ? (isPaused ? 'PAUSADO' : 'GRABANDO') : 'LISTO'}
                </div>
            </header>

            <div className="popup-body">
                {/* Timer Display */}
                <div className="timer-container">
                    <div className="timer">
                        {formatTime(recordingTime)}
                    </div>
                </div>

                {error && <div className="message error">{error}</div>}

                {status === 'success' && !error && (
                    <div className="message" style={{ color: 'green' }}>¡Guardado!</div>
                )}

                {/* Token Config Expanded Area */}
                {isConfigExpanded && !isRecording && (
                    <div className="token-area">
                        <input
                            type="password"
                            className="input-compact"
                            placeholder="Pegar JSON de TOKEN..."
                            value={authToken}
                            onChange={(e) => setAuthToken(e.target.value)}
                        />
                        <button className="btn-save-compact" onClick={handleSaveToken}>
                            Guardar Token
                        </button>

                        {/* Helper Link */}
                        <div style={{ textAlign: 'center', marginTop: '8px' }}>
                            <a
                                href="https://www.diktalo.com/intelligence"
                                target="_blank"
                                style={{ fontSize: '10px', color: '#ef4444', textDecoration: 'none' }}
                            >
                                ¿Cómo obtener mi token? Ver guía →
                            </a>
                        </div>
                    </div>
                )}

                {/* Main Controls - Redesigned */}
                <div className="controls-group">
                    {!isRecording ? (
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <button
                                className="btn-mic-start"
                                onClick={handleStartRecording}
                                disabled={status === 'processing'}
                            >
                                {status === 'processing' ? <div className="spinner-clean" /> : <MicIcon />}
                            </button>
                            {/* <div className="cancel-text">Cancelar</div> */}
                        </div>
                    ) : (
                        <>
                            {/* Stop Button */}
                            <div className="control-item">
                                <button
                                    className="btn-stop-black"
                                    onClick={handleStopRecording}
                                    disabled={isUploading}
                                    title="Detener"
                                >
                                    {isUploading ? <div className="spinner-clean" /> : (
                                        <div className="btn-icon-square" />
                                    )}
                                </button>
                                <span className="btn-label">
                                    {showStopConfirm ? 'CONFIRMAR' : 'MANTÉN 3S'}
                                </span>
                            </div>

                            {/* Pause Button */}
                            <div className="control-item">
                                <button
                                    className={`btn - pause - grey ${isPaused ? 'active' : ''} `}
                                    onClick={handlePauseResume}
                                    title={isPaused ? "Reanudar" : "Pausar"}
                                >
                                    <div className="btn-icon-pause">
                                        <div className="pause-bar"></div>
                                        <div className="pause-bar"></div>
                                    </div>
                                </button>
                                <span className="btn-label">
                                    {isPaused ? 'REANUDAR' : 'MANTÉN 2S'}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Delicate Footer */}
            <div className="footer">
                <div className="footer-links">
                    <span
                        className="footer-link"
                        onClick={() => !isRecording && setIsConfigExpanded(!isConfigExpanded)}
                        style={{ cursor: isRecording ? 'default' : 'pointer', opacity: isRecording ? 0.5 : 1 }}
                    >
                        Configura Token
                    </span>
                    <span className="divider">|</span>
                    <a href="#" className="footer-link">Politica de Privacidad</a>
                </div>
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
