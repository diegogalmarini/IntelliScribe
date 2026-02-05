import React, { useState, useEffect } from 'react';
import { callService } from '../services/callService';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfile, AppRoute } from '../types';
import { PhoneVerificationModal } from './PhoneVerificationModal';
import * as Analytics from '../utils/analytics';
import { getTierForNumber } from '../utils/voiceRates';
import {
    Phone,
    X,
    Mic,
    MicOff,
    ChevronDown,
    Delete,
    Settings2,
    Search,
    PhoneOff,
    Info,
    AlertCircle,
    PlusCircle
} from 'lucide-react';


interface DialerProps {
    user: UserProfile;
    onNavigate: (route: AppRoute) => void;
    // Callback para actualizar el usuario en App.tsx cuando se verifique
    onUserUpdated?: () => void;
    // NEW: Callback when call finishes to refresh recordings
    onCallFinished?: () => void;
    // NEW: Control visibility of the floating button
    showMinimized?: boolean;
}

export const Dialer: React.FC<DialerProps> = ({ user, onNavigate, onUserUpdated, onCallFinished, showMinimized = true }) => {
    const { t } = useLanguage();
    // ... (rest of state)
    const [isOpen, setIsOpen] = useState(false);
    const [number, setNumber] = useState('');
    const [status, setStatus] = useState('Idle');
    const [activeCall, setActiveCall] = useState<any>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isPasting, setIsPasting] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [visualizerData, setVisualizerData] = useState<number[]>(new Array(15).fill(2));
    const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
    const [showDeviceSelector, setShowDeviceSelector] = useState(false);

    // REFS for audio management
    const audioContextRef = React.useRef<AudioContext | null>(null);
    const monitorStreamRef = React.useRef<MediaStream | null>(null);
    const requestRef = React.useRef<number | null>(null);
    const analyserRef = React.useRef<AnalyserNode | null>(null);
    const volumeLevelRef = React.useRef<number>(0);

    // 1. DEDICATED ANIMATION LOOP (Independent of status)
    useEffect(() => {
        if (!isOpen) return;

        let lastFrameTime = 0;
        const animate = (time: number) => {
            // Limits to ~30fps for UI stability
            if (time - lastFrameTime < 33) {
                requestRef.current = requestAnimationFrame(animate);
                return;
            }
            lastFrameTime = time;

            // Take data from analyser (Local Monitor)
            // We now keep the monitor alive during calls for stable UI
            let rawLevel = 0;
            if (analyserRef.current) {
                const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                analyserRef.current.getByteFrequencyData(dataArray);
                // Extract low-mid frequencies (most voice energy)
                const subset = dataArray.slice(0, 32);
                rawLevel = subset.reduce((a, b) => a + b, 0) / subset.length;
            } else if (volumeLevelRef.current > 0) {
                // Fallback to Twilio sample data if monitor fails
                rawLevel = volumeLevelRef.current;
            }

            // --- BOOST SENSITIVITY ---
            // SQRT scaling: Linear 0.1 -> 10%, SQRT 0.1 -> 31%
            const normalized = rawLevel / 255;
            const sensitiveLevel = Math.sqrt(normalized) * 100;

            // Generate dancing bars
            const barCount = 15;
            const newData = [];
            for (let i = 0; i < barCount; i++) {
                const base = Math.max(2, sensitiveLevel);
                const jitter = (Math.random() - 0.5) * (base * 0.3);
                newData.push(Math.min(100, Math.max(2, base + jitter)));
            }
            setVisualizerData(newData);
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isOpen, status]);

    // 2. TOKEN & MONITORING EFFECT
    useEffect(() => {
        const isIdleOrReady = status === 'Idle' || status === 'Ready';
        if (isOpen && user?.id && isIdleOrReady) {
            callService.prepareToken(user.id);
            if (Analytics && typeof Analytics.trackEvent === 'function') {
                Analytics.trackEvent('dialer_opened');
            }
        }

        // --- REAL-TIME MIC MONITORING ---
        // Enhanced: Keep monitor alive during 'In Call' and 'Calling...' for stable UI
        const isOperational = status === 'Idle' || status === 'Ready' || status === 'In Call' || status === 'Calling...';
        if (isOpen && isOperational) {
            const startMonitor = async () => {
                try {
                    // Enumerate devices first if not done
                    if (availableDevices.length === 0) {
                        try {
                            const bootstrapStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                            bootstrapStream.getTracks().forEach(t => t.stop());
                        } catch (e) {
                            console.warn('[DIALER] Could not bootstrap mic labels:', e);
                        }

                        const devices = await navigator.mediaDevices.enumerateDevices();
                        const mics = devices.filter(d => d.kind === 'audioinput');
                        setAvailableDevices(mics);
                        if (mics.length > 0 && !selectedDeviceId) {
                            setSelectedDeviceId(mics[0].deviceId);
                        }
                    }

                    const constraints = {
                        audio: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true
                    };

                    const stream = await navigator.mediaDevices.getUserMedia(constraints);
                    monitorStreamRef.current = stream;

                    if (!audioContextRef.current) {
                        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
                        audioContextRef.current = new Ctx();
                    }
                    const audioContext = audioContextRef.current;

                    const analyser = audioContext.createAnalyser();
                    analyser.smoothingTimeConstant = 0.7; // Brisk and fluid
                    analyser.fftSize = 256;
                    analyserRef.current = analyser;

                    const microphone = audioContext.createMediaStreamSource(stream);
                    microphone.connect(analyser);

                    // Resume if suspended
                    if (audioContext.state === 'suspended') {
                        await audioContext.resume();
                    }

                } catch (err) {
                    console.error('[DIALER] Mic monitoring failed:', err);
                }
            };
            startMonitor();
        }

        return () => {
            // Only stop tracks if the dialer is closing or in terminal Error
            const isClosing = !isOpen || status === 'Error';
            if (isClosing) {
                if (monitorStreamRef.current) {
                    monitorStreamRef.current.getTracks().forEach(t => {
                        t.stop();
                        t.enabled = false;
                    });
                    monitorStreamRef.current = null;
                }
                analyserRef.current = null;
                volumeLevelRef.current = 0;
            }
        };
    }, [isOpen, user?.id, status, selectedDeviceId]);

    // 3. HOT-SWAP MIC DURING CALL
    useEffect(() => {
        if (activeCall && selectedDeviceId) {
            console.log('[DIALER] Hotswapping mic during call to:', selectedDeviceId);
            callService.setInputDevice(selectedDeviceId);
        }
    }, [selectedDeviceId, activeCall]);

    // Resume audio context on interaction for PC compatibility
    const ensureAudioIsLive = () => {
        if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume();
        }
    };

    const handleCall = async () => {
        // 1. CHEQUEO DE VERIFICACIÓN
        if (!user.phoneVerified) {
            setShowVerification(true);
            return;
        }

        if (!number) return;

        // Ensure we have a valid user ID before making a call
        if (!user.id) {
            setErrorMessage('User authentication required. Please refresh the page.');
            setStatus('Error');
            return;
        }

        setErrorMessage('');
        setStatus('Calling...');

        // 🟢 FIX: CRITICAL NUMBER SANITIZATION
        // Ensure we don't end up with '++34...' if number already has '+'
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const numberToCall = '+' + sanitizedNumber;

        // ...

        try {
            // Keep monitor running for visual stability
            // Only ensure we set the device for Twilio
            if (selectedDeviceId) {
                try {
                    await callService.setInputDevice(selectedDeviceId);
                } catch (devErr) {
                    console.warn('[DIALER] Could not set input device pre-call:', devErr);
                }
            }

            // 2. WAIT FOR HARDWARE RELEASE
            // Increased delay to 500ms for robust handoff on problematic Windows drivers
            await new Promise(resolve => setTimeout(resolve, 500));

            const call = await callService.makeCall(
                numberToCall,
                user.id,
                user.phone
            );
            if (call) {
                setActiveCall(call);
                setStatus('In Call');

                // Monitor volume to debug one-way audio
                call.on('sample', (sample: any) => {
                    // Twilio returns volume values between 0 and 32767
                    const inputLevel = Math.floor((sample.inputVolume / 32767) * 255);
                    const outputLevel = Math.floor((sample.outputVolume / 32767) * 255);
                    const maxLevel = Math.max(inputLevel, outputLevel);

                    // Update ref for animation loop
                    volumeLevelRef.current = maxLevel;

                    if (inputLevel > 40) {
                        console.log(`[DIALER] Call Mic Active: ${Math.floor(inputLevel / 2.55)}%`);
                    }
                });

                call.on('disconnect', () => {
                    setStatus('Ready');
                    setActiveCall(null);
                    if (onCallFinished) onCallFinished(); // Validate recordings refresh
                });
                call.on('error', (err: any) => setErrorMessage(err.message));
            }
        } catch (e: any) {
            setStatus('Ready');
            setActiveCall(null);
            setErrorMessage(e.message);
        }
    };

    const handleDigit = (digit: string) => {
        setNumber(prev => prev + digit);
        if (activeCall) activeCall.sendDigits(digit);
    };

    const handleHangup = () => {
        callService.disconnect();
        setStatus('Ready');
        setActiveCall(null);
        if (onCallFinished) onCallFinished();
    };

    const toggleMute = () => {
        if (activeCall) {
            activeCall.mute(!isMuted);
            setIsMuted(!isMuted);
        }
    };
    if (!isOpen) {
        // If hidden explicitly by parent
        if (!showMinimized) return null;

        // If user is not verified, show ORANGE button that opens verification modal
        if (!user.phoneVerified) {
            return (
                <>
                    <button
                        id="dialer-button"
                        onClick={() => setShowVerification(true)}
                        className="fixed bottom-6 right-6 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-colors"
                        title="Verify phone to make calls"
                    >
                        <span className="material-symbols-outlined text-2xl text-white">call</span>
                    </button>

                    {/* Verification Modal */}
                    {showVerification && (
                        <PhoneVerificationModal
                            userId={user.id}
                            onClose={() => setShowVerification(false)}
                            onVerified={() => {
                                setShowVerification(false);
                                if (onUserUpdated) {
                                    onUserUpdated();
                                }
                            }}
                        />
                    )}
                </>
            );
        }

        // If verified, show GREEN button that opens dialer
        return (
            <button
                id="dialer-button"
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] hover:bg-[#25D366]/90 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-all hover:scale-105 active:scale-95"
                title="Open dialer"
            >
                <Phone size={24} strokeWidth={1.5} fill="currentColor" />
            </button>
        );
    }


    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            // FIX: Remove '+' because the UI already adds one. Keep only digits.
            const cleaned = text.replace(/[^0-9]/g, '');
            if (cleaned) {
                setNumber(cleaned);
                setIsPasting(true);
                setTimeout(() => setIsPasting(false), 1000);
            }
        } catch (err) {
            console.error('Failed to read clipboard:', err);
            setErrorMessage('Permiso de portapapeles denegado o no disponible.');
        }
    };

    const handleContacts = async () => {
        try {
            // @ts-ignore - Experimental API
            if ('contacts' in navigator && 'ContactsManager' in window) {
                const props = ['tel'];
                const opts = { multiple: false };
                // @ts-ignore
                const contacts = await navigator.contacts.select(props, opts);
                if (contacts[0] && contacts[0].tel && contacts[0].tel[0]) {
                    const cleanTel = contacts[0].tel[0].replace(/[^0-9+]/g, '');
                    setNumber(cleanTel);
                }
            } else {
                setErrorMessage('Selector de contactos no soportado en este dispositivo.');
            }
        } catch (err) {
            console.error('Contact picker error:', err);
        }
    };

    return (
        <>
            {/* El Dialer Visual */}
            <div
                onClick={ensureAudioIsLive}
                className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[340px] w-full h-full sm:h-auto sm:min-h-[580px] bg-white dark:bg-[#1a1a1a] sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50 animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="bg-slate-50 dark:bg-[#2a2a2a] px-5 py-4 flex justify-between items-center shrink-0 border-b border-black/[0.05] dark:border-white/[0.05]">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${status === 'In Call' ? 'bg-[#25D366]' : 'bg-slate-400'} `} />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#8e8e8e]">{status}</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 text-[#8e8e8e] hover:text-[#1f1f1f] dark:hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {errorMessage && <div className="bg-red-500 text-white text-xs p-2 text-center">{errorMessage}</div>}

                {/* Top Actions Row */}
                <div className="px-5 py-4 flex items-center justify-between border-b border-black/[0.03] dark:border-white/[0.03]">
                    {/* Botón Contactos */}
                    <div className="flex gap-2">
                        {'contacts' in navigator && 'ContactsManager' in window && (
                            <button
                                onClick={handleContacts}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f5f5f5] dark:bg-[#2f2f2f] text-[11px] font-medium text-[#444746] dark:text-[#e3e3e3] hover:text-[#0055FF] transition-colors"
                                title="Buscar Contacto"
                            >
                                <Search size={16} strokeWidth={1.5} />
                                <span>Contactos</span>
                            </button>
                        )}
                    </div>

                    {/* Selector de Micrófono (Fino) */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDeviceSelector(!showDeviceSelector)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f8fafc] dark:bg-[#2a2a2a] text-[11px] font-medium text-[#64748b] dark:text-[#94a3b8] hover:bg-[#f1f5f9] dark:hover:bg-[#3c3c3c] transition-all border border-slate-200 dark:border-white/5 active:scale-95"
                            title="Seleccionar Micrófono"
                        >
                            <Mic size={14} strokeWidth={1.2} className={selectedDeviceId ? 'text-[#0055FF]' : ''} />
                            <span className="max-w-[120px] truncate">
                                {availableDevices.find(d => d.deviceId === selectedDeviceId)?.label || 'Micrófono'}
                            </span>
                            <ChevronDown size={14} strokeWidth={1.2} />
                        </button>

                        {showDeviceSelector && availableDevices.length > 0 && (
                            <div className="absolute top-full right-0 mt-2 w-64 max-h-60 overflow-y-auto bg-white dark:bg-[#2a2a2a] border border-black/10 dark:border-white/10 rounded-xl shadow-2xl z-[70] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#8e8e8e] border-b border-black/[0.05] dark:border-white/[0.05] mb-1">
                                    Dispositivos de Entrada
                                </div>
                                {availableDevices.map(device => (
                                    <button
                                        key={device.deviceId}
                                        onClick={() => {
                                            setSelectedDeviceId(device.deviceId);
                                            setShowDeviceSelector(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-[#f8fafc] dark:hover:bg-white/5 flex items-center gap-3 ${selectedDeviceId === device.deviceId ? 'text-[#0055FF] font-bold' : 'text-[#1f1f1f] dark:text-[#e3e3e3]'
                                            }`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${selectedDeviceId === device.deviceId ? 'bg-[#0055FF]' : 'bg-transparent'}`} />
                                        <span className="truncate">{device.label || `Mic ${device.deviceId.slice(0, 5)}...`}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 flex flex-col items-center justify-center bg-white dark:bg-[#1a1a1a] shrink-0 relative">

                    <div className="flex items-center justify-center w-full mb-4 px-8">
                        <span className="text-lg font-light text-slate-300 dark:text-slate-700 mr-2 select-none">+</span>

                        {/* Native Input for Cursor & Editing */}
                        <input
                            type="tel"
                            value={number}
                            onChange={(e) => {
                                // Strip non-digit characters to avoid errors
                                // Also handles pasting '+34...' -> '34...'
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                setNumber(val);
                            }}
                            className="text-xl font-light text-center text-slate-900 dark:text-white tracking-wider bg-transparent border-none outline-none w-full placeholder:text-slate-100 dark:placeholder:text-white/5"
                            placeholder="34..."
                            autoFocus
                        />
                    </div>

                    {/* Volume Indicator (Subtle - Dancing Bars) */}
                    <div className="w-full flex flex-col items-center gap-2 mb-4 h-6 justify-center">
                        <div className="flex items-end gap-1 h-4 w-full justify-center">
                            {visualizerData.map((h, i) => (
                                <div
                                    key={i}
                                    className="w-1 rounded-full bg-[#0055FF] transition-all duration-75"
                                    style={{
                                        height: `${h}%`,
                                        opacity: 0.2 + (h / 120)
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Tier Badge */}
                    {number.length >= 2 && (
                        <div className="mt-4 flex flex-col gap-2 items-center animate-in fade-in slide-in-from-top-1 w-full max-w-[280px]">
                            <div className="flex flex-col items-center gap-1.5 text-center bg-slate-50 dark:bg-white/5 p-3 rounded-2xl w-full border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <Info size={14} className={getTierForNumber('+' + number).id === 'BLOCKED' ? 'text-red-500' : ''} />
                                    <span>{getTierForNumber('+' + number).label} ({getTierForNumber('+' + number).multiplier}x)</span>
                                </div>

                                {getTierForNumber('+' + number).id !== 'BLOCKED' && (
                                    <div className="text-[12px] font-medium text-slate-700 dark:text-slate-200 leading-tight">
                                        {(() => {
                                            const remainingPlanMinutes = Math.max(0, (user.subscription.callLimit || 0) - (user.subscription.callMinutesUsed || 0));
                                            const tierMultiplier = getTierForNumber('+' + number).multiplier;
                                            const totalEffectiveCredits = remainingPlanMinutes + (user.subscription?.voiceCredits || 0);
                                            const minutesAvailable = Math.floor(totalEffectiveCredits / tierMultiplier);
                                            return t('creditsRemaining').replace('{minutes}', minutesAvailable.toString());
                                        })()}
                                    </div>
                                )}
                            </div>

                            {/* Recharge Link if credits are low */}
                            {getTierForNumber('+' + number).id !== 'BLOCKED' && (
                                (() => {
                                    const remainingPlanMinutes = Math.max(0, (user.subscription.callLimit || 0) - (user.subscription.callMinutesUsed || 0));
                                    const totalEffectiveCredits = remainingPlanMinutes + (user.subscription?.voiceCredits || 0);
                                    const tierMultiplier = getTierForNumber('+' + number).multiplier;
                                    const minutesAvailable = totalEffectiveCredits / tierMultiplier;

                                    if (minutesAvailable < 5) {
                                        return (
                                            <button
                                                onClick={() => onNavigate(AppRoute.SUBSCRIPTION)}
                                                className="text-[10px] text-brand-blue hover:underline flex items-center gap-1 self-center px-1 font-bold mt-1"
                                            >
                                                <PlusCircle size={12} />
                                                {t('buyMoreCredits')}
                                            </button>
                                        );
                                    }
                                    return null;
                                })()
                            )}
                        </div>
                    )}
                </div>

                {/* Keypad */}
                <div className="flex-1 grid grid-cols-3 gap-2 px-8 py-4 bg-slate-50 dark:bg-surface-dark/30">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
                        <button key={digit} onClick={() => handleDigit(digit)} className="h-14 rounded-xl bg-white dark:bg-white/5 text-slate-600 dark:text-slate-200 font-medium text-xl shadow-sm active:scale-95 flex items-center justify-center hover:bg-slate-100 transition-colors">
                            {digit}
                        </button>
                    ))}
                    <div className="col-start-2">
                        <button onClick={() => handleDigit('0')} className="h-14 w-full rounded-xl bg-white dark:bg-white/5 text-slate-600 dark:text-slate-200 font-medium text-xl shadow-sm active:scale-95 flex items-center justify-center hover:bg-slate-100 transition-colors">0</button>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-8 bg-white dark:bg-[#1a1a1a] flex justify-around items-center border-t border-black/[0.05] dark:border-white/[0.05] shrink-0">
                    <button onClick={toggleMute} className={`rounded-full w-12 h-12 flex items-center justify-center transition-all active:scale-90 ${isMuted ? 'bg-red-50 text-[#ef4444]' : 'bg-slate-50 dark:bg-white/5 text-slate-400'}`}>
                        {isMuted ? <MicOff size={20} strokeWidth={1.2} /> : <Mic size={20} strokeWidth={1.2} />}
                    </button>

                    {status === 'In Call' || status === 'Calling...' ? (
                        <button onClick={handleHangup} className="bg-[#ef4444] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg active:scale-95 transition-all">
                            <PhoneOff size={26} strokeWidth={1.2} />
                        </button>
                    ) : (
                        <button onClick={handleCall} className="bg-[#25D366] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg active:scale-95 transition-all">
                            <Phone size={26} strokeWidth={1.2} fill="currentColor" />
                        </button>
                    )}

                    <button onClick={() => setNumber(prev => prev.slice(0, -1))} className="rounded-full w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-white/5 text-slate-400 active:scale-90 transition-all">
                        <Delete size={20} strokeWidth={1.2} />
                    </button>
                </div>
            </div>

            {/* MODAL DE VERIFICACIÓN */}
            {showVerification && (
                <PhoneVerificationModal
                    userId={user.id}
                    onClose={() => setShowVerification(false)}
                    onVerified={() => {
                        // Close modal first
                        setShowVerification(false);
                        // Refresh user data to get phone_verified = true
                        if (onUserUpdated) {
                            onUserUpdated();
                        }
                        // Set status to show user can now call
                        setStatus('Ready');
                    }}
                />
            )}
        </>
    );
};
