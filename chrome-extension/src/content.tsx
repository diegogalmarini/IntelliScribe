
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// Icons
const MicIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /><line x1="8" x2="16" y1="22" y2="22" /></svg>;
const CameraIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>;
const UploadIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;

// Styles
const css = `
:host { all: initial; }
.popup { width: 250px; min-height: 320px; background-color: #ffffff; color: #020817; font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); border: 1px solid #e2e8f0; overflow: hidden; }
.popup-header { padding: 12px 16px; background: #ffffff; display: flex; align-items: center; justify-content: space-between; cursor: move; border-bottom: 1px solid #f1f5f9; user-select: none; }
.popup-header h1 { margin: 0; font-size: 14px; font-weight: 600; color: #020817; display: flex; align-items: center; gap: 6px; }
.status-badge { font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em; background: #f1f5f9; color: #0f172a; }
.popup-body { padding: 12px; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; position: relative; }
.timer { font-size: 42px; font-weight: 600; color: #ef4444; font-variant-numeric: tabular-nums; letter-spacing: -1px; line-height: 1; margin-bottom: 20px; text-align: center; }
.controls-group { display: flex; align-items: center; justify-content: center; gap: 20px; width: 100%; }
.btn-mic-start { width: 72px; height: 72px; border-radius: 50%; background: #ef4444; color: white; border: 4px solid #fee2e2; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.3); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); margin-top: 10px; }
.btn-mic-start:hover { transform: scale(1.05); background: #dc2626; box-shadow: 0 20px 25px -5px rgba(239, 68, 68, 0.4); }
.btn-stop-black { width: 56px; height: 56px; border-radius: 50%; background: #1f2937; border: 3px solid #e5e7eb; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; padding: 0; }
.btn-stop-black:hover { transform: scale(1.05); }
.btn-pause-grey { width: 56px; height: 56px; border-radius: 50%; background: #9ca3af; border: 3px solid #e5e7eb; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; padding: 0; }
.btn-pause-grey.active { background: #ef4444; }
.btn-icon-square { width: 20px; height: 20px; border: 2px solid white; border-radius: 3px; }
.btn-icon-pause { display: flex; gap: 4px; }
.pause-bar { width: 5px; height: 20px; background: white; border-radius: 2px; }
.footer { margin-top: auto; padding: 12px 0; width: 100%; text-align: center; background: #f8fafc; border-top: 1px solid #e2e8f0; }
.footer-links { display: flex; justify-content: center; align-items: center; gap: 8px; font-size: 10px; color: #64748b; }
.footer-link { color: #64748b; text-decoration: none; cursor: pointer; transition: color 0.2s; }
.footer-link:hover { color: #0f172a; }
.token-area { width: 100%; padding: 10px; background: #f8fafc; border-radius: 6px; margin-bottom: 16px; box-sizing: border-box;}
.input-compact { width: 100%; border: 1px solid #e2e8f0; padding: 8px; border-radius: 4px; font-size: 11px; margin-bottom: 6px; box-sizing: border-box; }
.btn-save-compact { width: 100%; background: #0f172a; color: white; border: none; padding: 6px; border-radius: 4px; font-size: 11px; cursor: pointer; font-weight: 500; }
.status-recording { background: #fef2f2; color: #dc2626; border-color: #fecaca; animation: pulse 2s infinite; }
@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
.spinner-clean { width: 16px; height: 16px; border: 2px solid rgba(255, 255, 255, 0.3); border-top: 2px solid currentColor; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.message { padding: 8px; font-size: 12px; line-height: 1.4; text-align: center; border-radius: 4px; background: #f1f5f9; width: 100%; box-sizing: border-box; margin-bottom: 12px; color: #64748b; }
.message.error { background: #fef2f2; color: #b91c1c; }
.control-item { display: flex; flex-direction: column; align-items: center; }
.btn-label { margin-top: 8px; font-size: 10px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; text-align: center; }
`;

const DraggableOverlay: React.FC = () => {
    // --- STATE ---
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'success' | 'error'>('idle');
    const [recordingTime, setRecordingTime] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [authToken, setAuthToken] = useState<string>('');
    const [isConfigExpanded, setIsConfigExpanded] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showStopConfirm, setShowStopConfirm] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Drag State
    const [position, setPosition] = useState({ x: window.innerWidth - 320, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const timerRef = useRef<number | null>(null);

    // --- EFFECTS ---

    useEffect(() => {
        // Init: Load Token
        chrome.storage.local.get(['authToken'], (result) => {
            if (result.authToken) {
                setAuthToken(result.authToken);
                setIsConfigExpanded(false);
            } else {
                setIsConfigExpanded(true);
            }
        });

        // Listen: Global Messages
        const listener = (message: any, _sender: any, _sendResponse: any) => {
            if (message.action === 'TOGGLE_OVERLAY') {
                setIsVisible(prev => !prev);
            }
            if (message.action === 'STATUS_UPDATE') {
                setIsRecording(message.isRecording);
                setIsPaused(message.isPaused || false);
                setStatus(message.status || 'idle');
            }
        };
        chrome.runtime.onMessage.addListener(listener);

        // Poll Status
        chrome.runtime.sendMessage({ action: 'GET_STATUS' }, (response) => {
            if (response && response.isRecording) {
                setIsRecording(true);
                setIsPaused(response.isPaused || false);
                setStatus('recording');
                setIsVisible(true); // Auto-show if recording
                if (response.startTime) {
                    setRecordingTime(Math.floor((Date.now() - response.startTime) / 1000));
                }
            }
        });

        return () => chrome.runtime.onMessage.removeListener(listener);
    }, []);

    // Timer Logic
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

    // Drag Logic
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragOffset.current.x,
                    y: e.clientY - dragOffset.current.y
                });
            }
        };
        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleMouseDown = (e: React.MouseEvent) => {
        // Only allow dragging from header
        setIsDragging(true);
        dragOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    // --- HANDLERS ---

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} `;
    };

    const handleStartRecording = async () => {
        if (!authToken) { setError('Configura tu TOKEN'); return; }
        setError(null);

        // Note: content script cannot inspect tabs directly like popup, 
        // need to tell background to target active tab
        chrome.runtime.sendMessage({ action: 'START_RECORDING' }, (response) => {
            if (response?.success) {
                setIsRecording(true);
                setIsPaused(false);
                setRecordingTime(0);
                setStatus('recording');
            } else {
                setError(response?.error || 'Error al iniciar');
            }
        });
    };

    const handleStopRecording = () => {
        if (!showStopConfirm && recordingTime > 5) {
            setShowStopConfirm(true);
            return;
        }
        setIsUploading(true);
        setStatus('processing');
        setShowStopConfirm(false);

        chrome.runtime.sendMessage({ action: 'STOP_RECORDING' }, (response) => {
            setIsUploading(false);
            if (response?.success) {
                setIsRecording(false);
                setStatus('success');
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                // Check if we have backup data to save
                if (response?.backupAudioData) {
                    console.warn('Upload failed but audio saved. Offering download.');

                    // Trigger download
                    const link = document.createElement('a');
                    link.href = response.backupAudioData; // Data URL
                    link.download = `diktalo-recording-${Date.now()}.webm`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    setError(`${response.error}\n\nSE HA GUARDADO EN TU PC.`);
                    setStatus('error');
                    setIsRecording(false);
                } else {
                    setError(response?.error);
                    setStatus('error');
                }
            }
        });
    };

    const handlePauseResume = () => {
        const action = isPaused ? 'RESUME_RECORDING' : 'PAUSE_RECORDING';
        chrome.runtime.sendMessage({ action }, (response) => {
            if (response?.success) setIsPaused(!isPaused);
        });
    };

    const handleScreenshot = () => {
        // Hide overlay to avoid capturing it
        setIsVisible(false);

        // Wait for render cycle (50ms is usually enough)
        setTimeout(() => {
            setStatus('processing');
            chrome.runtime.sendMessage({ action: 'CAPTURE_SCREENSHOT' }, (resp) => {
                // Restore visibility immediately after capture logic initiates (or after callback)
                setIsVisible(true);

                if (resp?.success) {
                    setStatus('success');
                    setTimeout(() => setStatus('idle'), 1500);
                } else {
                    setError('Error captura');
                    setStatus('error');
                }
            });
        }, 50);
    };

    const handleSaveToken = () => {
        let val = authToken.trim();
        let refreshVal = '';

        try {
            // Smart Parse: If user pastes JSON, extract the tokens
            if (val.startsWith('{') || val.includes('access_token')) {
                const json = JSON.parse(val);
                if (json.access_token) val = json.access_token;
                if (json.refresh_token) refreshVal = json.refresh_token;

                // Also handle Supervisor/GoTrue format just in case
                if (json.session) {
                    if (json.session.access_token) val = json.session.access_token;
                    if (json.session.refresh_token) refreshVal = json.session.refresh_token;
                }
            }
        } catch (e) {
            // Not valid JSON, assume it's just the raw token string
            console.log('Token input is raw string');
        }

        const updates: any = { authToken: val };
        if (refreshVal) updates.refreshToken = refreshVal;

        chrome.storage.local.set(updates, () => {
            setError(null);
            setIsConfigExpanded(false);

            // Visual feedback
            const originalStatus = status;
            setStatus('success');
            setTimeout(() => setStatus(originalStatus), 1000);
        });
    };

    if (!isVisible) return null;

    return (
        <div className="popup" style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            zIndex: 2147483647 // Max Z-Index
        }}>
            {/* Header - Drag Handle */}
            <header className="popup-header" onMouseDown={handleMouseDown} title="Arrastrar ventana">
                <h1>
                    <img src={chrome.runtime.getURL('icons/diktalo.png')} alt="Diktalo" style={{ height: '24px', width: 'auto' }} />
                </h1>
                <div className={`status-badge ${isRecording ? 'status-recording' : ''}`}>
                    {isRecording ? (isPaused ? 'PAUSADO' : 'GRABANDO') : 'LISTO'}
                </div>
            </header>

            <div className="popup-body">
                {/* Timer */}
                <div className="timer-container">
                    <div className="timer">{formatTime(recordingTime)}</div>
                </div>

                {error && <div className="message error">{error}</div>}
                {status === 'success' && !error && <div className="message" style={{ color: 'green' }}>¡Guardado!</div>}

                {/* Token Config */}
                {isConfigExpanded && !isRecording && (
                    <div className="token-area">
                        <input
                            type="password"
                            className="input-compact"
                            placeholder="Token..."
                            value={authToken}
                            onChange={e => setAuthToken(e.target.value)}
                        />
                        <button className="btn-save-compact" onClick={handleSaveToken}>Guardar</button>
                    </div>
                )}

                {/* Controls */}
                <div className="controls-group">
                    {!isRecording ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                            <button className="btn-mic-start" onClick={handleStartRecording} disabled={status === 'processing'}>
                                {status === 'processing' ? <div className="spinner-clean" /> : <MicIcon />}
                            </button>
                            <button
                                onClick={() => window.open('https://www.diktalo.com/intelligence?action=upload', '_blank')}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '12px' }}
                            >
                                <UploadIcon /> Importar Archivo
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Screenshot */}
                            <div className="control-item">
                                <button className="btn-pause-grey" onClick={handleScreenshot} title="FOTO">
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CameraIcon /></div>
                                </button>
                                <span className="btn-label">FOTO</span>
                            </div>

                            {/* Stop */}
                            <div className="control-item">
                                <button className="btn-stop-black" onClick={handleStopRecording} disabled={isUploading} title="Detener">
                                    {isUploading ? <div className="spinner-clean" /> : <div className="btn-icon-square" />}
                                </button>
                                <span className="btn-label">{showStopConfirm ? 'CONFIRMAR' : ''}</span>
                            </div>

                            {/* Pause */}
                            <div className="control-item">
                                <button className={`btn-pause-grey ${isPaused ? 'active' : ''}`} onClick={handlePauseResume} title="Pausa">
                                    <div className="btn-icon-pause"><div className="pause-bar" /><div className="pause-bar" /></div>
                                </button>
                                <span className="btn-label">{isPaused ? 'REANUDAR' : ''}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="footer">
                <div className="footer-links">
                    <span className="footer-link" onClick={() => setIsVisible(false)}>Ocultar</span>
                    <span className="divider">|</span>
                    <span className="footer-link" onClick={() => !isRecording && setIsConfigExpanded(!isConfigExpanded)}>Token</span>
                    <span className="divider">|</span>
                    <a href="https://www.diktalo.com/privacy" target="_blank" className="footer-link">Privacidad</a>
                </div>
            </div>
        </div>
    );
};

// Injection
const rootId = 'diktalo-overlay-root';
let rootElement = document.getElementById(rootId);
if (!rootElement) {
    rootElement = document.createElement('div');
    rootElement.id = rootId;
    document.body.appendChild(rootElement);
    const shadow = rootElement.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = css;
    shadow.appendChild(style);
    const mountPoint = document.createElement('div');
    shadow.appendChild(mountPoint);
    const root = createRoot(mountPoint);
    root.render(<DraggableOverlay />);
}
