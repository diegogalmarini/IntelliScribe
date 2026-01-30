import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import './Popup.css';
import { fireEvent } from './utils/google-analytics';

// Lucide-like icons (simple SVG components for the extension)
const MicIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /><line x1="8" x2="16" y1="22" y2="22" /></svg>;
const CameraIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>;
const UploadIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
const CheckIcon = ({ size = 12 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;

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
    const [meetingPlatform, setMeetingPlatform] = useState<'MEET' | 'TEAMS' | 'ZOOM' | null>(null);
    const [showAppWarning, setShowAppWarning] = useState(false);

    const timerRef = useRef<number | null>(null);

    // Poll current status on mount
    useEffect(() => {
        // GA Tracking
        fireEvent('page_view', {
            page_title: 'Diktalo Popup',
            page_location: 'popup.html'
        });

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

        // Smart Context Detection
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (tab && tab.url) {
                if (tab.url.includes('meet.google.com')) setMeetingPlatform('MEET');
                else if (tab.url.includes('teams.microsoft.com') || tab.url.includes('teams.live.com')) {
                    setMeetingPlatform('TEAMS');
                    setShowAppWarning(true);
                }
                else if (tab.url.includes('zoom.us')) {
                    setMeetingPlatform('ZOOM');
                    setShowAppWarning(true);
                }
            }
        });

        chrome.storage.local.get(['authToken'], (result) => {
            if (result.authToken) {
                setAuthToken(result.authToken);
                setIsConfigExpanded(false);
                checkSession();
            } else {
                setIsConfigExpanded(true);
            }
        });
    }, []);

    const checkSession = () => {
        chrome.runtime.sendMessage({ action: 'GET_USER' }, (response) => {
            if (response?.success) {
                console.log('[Popup] Session is valid for:', response.user.email);
            } else {
                console.warn('[Popup] Session invalid or expired:', response?.error);
                if (response?.error?.toLowerCase().includes('expired') || response?.error?.toLowerCase().includes('unauthorized')) {
                    setError('Tu sesión no está activa. Por favor abre la Web de Diktalo para sincronizar automáticamente.');
                    setIsConfigExpanded(true);
                }
            }
        });
    };

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
            setError('Extensión no sincronizada. Abre la Web de Diktalo para vincular tu cuenta automáticamente.');
            setIsConfigExpanded(true);
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
                setError(null);
            } else {
                console.error('[Popup] Start Recording failed:', response?.error);
                setError(response?.error || 'Falló al iniciar grabación');
                setStatus('error');
                if (response?.error?.toLowerCase().includes('expired') || response?.error?.toLowerCase().includes('unauthorized')) {
                    setIsConfigExpanded(true);
                }
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

    const handleScreenshot = () => {
        console.log('[Popup] Screenshot requested');
        setStatus('processing');
        chrome.runtime.sendMessage({ action: 'CAPTURE_SCREENSHOT' }, (response) => {
            if (response?.success) {
                console.log('Snapshot saved:', response.path);
                setStatus('success');
                setTimeout(() => setStatus('idle'), 1500);
            } else {
                console.error('Snapshot failed:', response?.error);
                setError(response?.error || 'Error capturando pantalla');
                setStatus('error');
            }
        });
    };

    const handleImport = () => {
        chrome.tabs.create({ url: 'https://www.diktalo.com/intelligence?action=upload' });
    };

    return (
        <div className="popup">
            <header className="popup-header">
                <h1>
                    <img src="icons/diktalo.png" alt="Diktalo" style={{ height: '20px', width: 'auto' }} />
                    Diktalo
                </h1>
                <div className={`status - badge ${isRecording ? 'status-recording' : ''} `}>
                    {isRecording ?
                        (isPaused ? 'PAUSADO' : (meetingPlatform ? `GRABANDO ${meetingPlatform}` : 'GRABANDO'))
                        : 'LISTO'}
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
                        <div style={{ fontSize: '11px', color: '#10b981', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckIcon size={12} /> Autosync Activado
                        </div>
                        <input
                            type="password"
                            className="input-compact"
                            placeholder="Pegar JSON de TOKEN (Manual)..."
                            value={authToken}
                            onChange={(e) => setAuthToken(e.target.value)}
                        />
                        <button className="btn-save-compact" onClick={handleSaveToken}>
                            Guardar Manualmente
                        </button>

                        {/* Helper Link */}
                        <div style={{ textAlign: 'center', marginTop: '8px' }}>
                            <a
                                href="https://www.diktalo.com/intelligence"
                                target="_blank"
                                style={{ fontSize: '10px', color: '#64748b', textDecoration: 'none' }}
                            >
                                ¿Cómo funciona el Auto-sync? Guía →
                            </a>
                        </div>
                    </div>
                )}

                {/* Main Controls - Redesigned */}
                <div className="controls-group">
                    {!isRecording ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>

                            {/* Smart Assistance Warning */}
                            {showAppWarning && (
                                <div style={{
                                    fontSize: '11px',
                                    color: '#f59e0b',
                                    background: '#fffbeb',
                                    padding: '8px',
                                    borderRadius: '6px',
                                    textAlign: 'center',
                                    border: '1px solid #fcd34d',
                                    marginBottom: '8px',
                                    maxWidth: '220px'
                                }}>
                                    💡 <b>¿Usando la App de Escritorio?</b><br />
                                    El audio podría no capturarse. <br />
                                    Usa la opción <b>'Importar Archivo'</b> 👇
                                </div>
                            )}

                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <button
                                    className="btn-mic-start"
                                    title="Iniciar Grabación"
                                    onClick={handleStartRecording}
                                    disabled={status === 'processing'}
                                >
                                    {status === 'processing' ? <div className="spinner-clean" /> : <MicIcon />}
                                </button>
                                {/* <div className="cancel-text">Cancelar</div> */}
                            </div>

                            <button
                                onClick={handleImport}
                                className="flex items-center gap-2 text-xs text-slate-500 hover:text-blue-600 transition-colors"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <UploadIcon />
                                <span>Importar Archivo</span>
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Screenshot Button (New) */}
                            <div className="control-item">
                                <button
                                    className="btn-pause-grey"
                                    onClick={handleScreenshot}
                                    title="Capturar Pantalla"
                                >
                                    <div className="btn-icon-pause" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CameraIcon />
                                    </div>
                                </button>
                                <span className="btn-label">FOTO</span>
                            </div>

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
                                    {showStopConfirm ? 'CONFIRMAR' : ''}
                                </span>
                            </div>

                            {/* Pause Button */}
                            <div className="control-item">
                                <button
                                    className={`btn-pause-grey ${isPaused ? 'active' : ''}`}
                                    onClick={handlePauseResume}
                                    title={isPaused ? "Reanudar" : "Pausar"}
                                >
                                    <div className="btn-icon-pause">
                                        <div className="pause-bar"></div>
                                        <div className="pause-bar"></div>
                                    </div>
                                </button>
                                <span className="btn-label">
                                    {isPaused ? 'REANUDAR' : ''}
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
                        onClick={() => {
                            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                                if (tabs[0]?.id) {
                                    chrome.tabs.sendMessage(tabs[0].id, { action: 'TOGGLE_OVERLAY' });
                                    window.close(); // Close popup
                                }
                            });
                        }}
                    >
                        Modo Flotante
                    </span>
                    <span className="divider">|</span>
                    <span
                        className="footer-link"
                        onClick={() => !isRecording && setIsConfigExpanded(!isConfigExpanded)}
                        style={{ cursor: isRecording ? 'default' : 'pointer', opacity: isRecording ? 0.5 : 1 }}
                    >
                        Configura Token
                    </span>
                    <span className="divider">|</span>
                    <a
                        href="https://www.diktalo.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-link"
                    >
                        Politica de Privacidad
                    </a>
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
