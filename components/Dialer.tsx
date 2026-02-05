import React, { useState, useEffect } from 'react';
import { callService } from '../services/callService';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfile, AppRoute } from '../types';
import { PhoneVerificationModal } from './PhoneVerificationModal';
import * as Analytics from '../utils/analytics';
import { getTierForNumber } from '../utils/voiceRates';


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

    useEffect(() => {
        if (isOpen && user && status === 'Idle') {
            callService.prepareToken(user.email || 'guest');
            if (Analytics && typeof Analytics.trackEvent === 'function') {
                Analytics.trackEvent('dialer_opened');
            }
        }

    }, [isOpen, user]);

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
        const numberToCall = '+' + number;
        setStatus('Calling...');

        // TRACK: Start Call
        if (Analytics && typeof Analytics.trackEvent === 'function') {
            Analytics.trackEvent('start_call', {
                transcription_language: user.transcriptionLanguage || 'es'
            });
        }


        // DEBUG: Check user phone value
        console.log('[DIALER] user.id:', user.id);
        console.log('[DIALER] user.phone:', user.phone);
        console.log('[DIALER] user.phoneVerified:', user.phoneVerified);

        try {
            const call = await callService.makeCall(
                numberToCall,
                user.id,  // Pass user ID for caller ID lookup (now guaranteed to exist)
                user.phone  // Pass verified phone for caller ID
            );
            if (call) {
                setActiveCall(call);
                setStatus('In Call');
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
                className="fixed bottom-6 right-6 w-14 h-14 bg-brand-green hover:bg-brand-green/90 text-slate-900 rounded-full shadow-lg flex items-center justify-center z-50 transition-colors"
                title="Open dialer"
            >
                <span className="material-symbols-outlined text-2xl">call</span>
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
            <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-80 w-full h-full bg-white dark:bg-card-dark sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50">
                {/* Header */}
                <div className="bg-slate-100 dark:bg-surface-dark p-3 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${status === 'In Call' ? 'bg-green-500' : 'bg-slate-400'} `} />
                        <span className="text-xs font-medium text-slate-500">{status}</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {errorMessage && <div className="bg-red-500 text-white text-xs p-2 text-center">{errorMessage}</div>}

                {/* Display */}
                <div className="p-6 flex flex-col items-center justify-center bg-white dark:bg-card-dark shrink-0 relative">

                    {/* Botón Contactos - Visible solo si soportado (Android/Chrome) */}
                    {'contacts' in navigator && 'ContactsManager' in window && (
                        <button
                            onClick={handleContacts}
                            className="absolute top-2 left-4 text-xs font-medium px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-brand-green transition-colors flex items-center gap-1"
                            title="Buscar Contacto"
                        >
                            <span className="material-symbols-outlined text-[14px]">contacts</span>
                        </button>
                    )}

                    <div className="flex items-center justify-center w-full mb-2 px-8">
                        <span className="text-xl font-light text-slate-400 mr-1 select-none">+</span>

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
                            className="text-xl font-light text-center text-slate-900 dark:text-white tracking-wide bg-transparent border-none outline-none w-full placeholder:text-slate-200 dark:placeholder:text-slate-800"
                            placeholder="34..."
                            autoFocus
                        />
                    </div>

                    {/* Tier Badge */}
                    {number.length >= 2 && (
                        <div className="mt-4 flex flex-col gap-2 items-center animate-in fade-in slide-in-from-top-1 w-full max-w-[280px]">
                            <div className="flex flex-col items-center gap-1.5 text-center bg-slate-50 dark:bg-white/5 p-3 rounded-2xl w-full border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                                    <span className="material-symbols-outlined text-[14px]">
                                        {getTierForNumber('+' + number).id === 'BLOCKED' ? 'block' : 'info'}
                                    </span>
                                    <span>{getTierForNumber('+' + number).label} ({getTierForNumber('+' + number).multiplier}x)</span>
                                </div>

                                {getTierForNumber('+' + number).id !== 'BLOCKED' && (
                                    <div className="text-[12px] font-medium text-slate-700 dark:text-slate-200 leading-tight">
                                        {t('creditsRemaining').replace('{minutes}', Math.floor((user.voiceCredits || 0) / getTierForNumber('+' + number).multiplier).toString())}
                                    </div>
                                )}
                            </div>

                            {/* Recharge Link if credits are low */}
                            {getTierForNumber('+' + number).id !== 'BLOCKED' && (user.voiceCredits || 0) / getTierForNumber('+' + number).multiplier < 5 && (
                                <button
                                    onClick={() => onNavigate(AppRoute.SETTINGS)}
                                    className="text-[10px] text-brand-blue hover:underline flex items-center gap-1 self-center px-1 font-bold mt-1"
                                >
                                    <span className="material-symbols-outlined text-[12px]">add_circle</span>
                                    {t('buyMoreCredits')}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Keypad */}
                <div className="flex-1 grid grid-cols-3 gap-3 p-6 bg-slate-50 dark:bg-surface-dark/50">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
                        <button key={digit} onClick={() => handleDigit(digit)} className="h-full rounded-2xl bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 font-medium text-2xl shadow-sm active:scale-95 flex items-center justify-center">
                            {digit}
                        </button>
                    ))}
                    <div className="col-start-2">
                        <button onClick={() => handleDigit('0')} className="h-full w-full rounded-2xl bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 font-medium text-2xl shadow-sm active:scale-95 flex items-center justify-center">0</button>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 bg-white dark:bg-card-dark grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-border-dark shrink-0 mb-safe">
                    <button onClick={toggleMute} className={`rounded-full w-14 h-14 mx-auto flex items-center justify-center ${isMuted ? 'bg-slate-200 text-black' : 'text-slate-400'}`}>
                        <span className="material-symbols-outlined">{isMuted ? 'mic_off' : 'mic'}</span>
                    </button>

                    {status === 'In Call' || status === 'Calling...' ? (
                        <button onClick={handleHangup} className="bg-red-500 text-white rounded-full w-16 h-16 mx-auto flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-3xl">call_end</span>
                        </button>
                    ) : (
                        <button onClick={handleCall} className="bg-green-500 hover:bg-green-600 text-white rounded-full w-16 h-16 mx-auto flex items-center justify-center shadow-lg transition-transform active:scale-90">
                            <span className="material-symbols-outlined text-3xl">call</span>
                        </button>
                    )}

                    <button onClick={() => setNumber(prev => prev.slice(0, -1))} className="rounded-full w-14 h-14 mx-auto flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined">backspace</span>
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
