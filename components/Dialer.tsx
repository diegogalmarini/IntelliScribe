import React, { useState, useEffect } from 'react';
import { callService } from '../services/callService';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfile, AppRoute } from '../types';
import { PhoneVerificationModal } from './PhoneVerificationModal'; // <--- IMPORTANTE

interface DialerProps {
    user: UserProfile;
    onNavigate: (route: AppRoute) => void;
    // Callback para actualizar el usuario en App.tsx cuando se verifique
    onUserUpdated?: () => void;
}

export const Dialer: React.FC<DialerProps> = ({ user, onNavigate, onUserUpdated }) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [number, setNumber] = useState('');
    const [status, setStatus] = useState('Idle');
    const [activeCall, setActiveCall] = useState<any>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Estado para el modal de verificación
    const [showVerification, setShowVerification] = useState(false);

    useEffect(() => {
        if (isOpen && user && status === 'Idle') {
            callService.prepareToken(user.email || 'guest');
        }
    }, [isOpen, user]);

    const handleCall = async () => {
        // 1. CHEQUEO DE VERIFICACIÓN
        if (!user.phoneVerified) {
            setShowVerification(true);
            return;
        }

        if (!number) return;
        setErrorMessage('');
        const numberToCall = '+' + number;
        setStatus('Calling...');

        // DEBUG: Check user phone value
        console.log('[DIALER] user.phone:', user.phone);
        console.log('[DIALER] user.phoneVerified:', user.phoneVerified);

        try {
            const call = await callService.makeCall(
                numberToCall,
                user.id || 'guest',  // Pass user ID for caller ID lookup
                user.phone  // Pass verified phone for caller ID
            );
            if (call) {
                setActiveCall(call);
                setStatus('In Call');
                call.on('disconnect', () => {
                    setStatus('Ready');
                    setActiveCall(null);
                });
                call.on('error', (err: any) => setErrorMessage(err.message));
            }
        } catch (e: any) {
            setStatus('Error');
            setErrorMessage(e.message);
        }
    };

    // ... (Resto de funciones: handleHangup, toggleMute, handleDigit igual que antes)
    const handleDigit = (digit: string) => {
        setNumber(prev => prev + digit);
        if (activeCall) activeCall.sendDigits(digit);
    };

    const handleHangup = () => {
        callService.disconnect();
        setStatus('Ready');
        setActiveCall(null);
    };

    const toggleMute = () => {
        if (activeCall) {
            activeCall.mute(!isMuted);
            setIsMuted(!isMuted);
        }
    };

    if (!isOpen) {
        // If user is not verified, show ORANGE button that opens verification modal
        if (!user.phoneVerified) {
            return (
                <>
                    <button
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
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-brand-green hover:bg-brand-green/90 text-slate-900 rounded-full shadow-lg flex items-center justify-center z-50 transition-colors"
                title="Open dialer"
            >
                <span className="material-symbols-outlined text-2xl">call</span>
            </button>
        );
    }


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
                <div className="p-6 flex flex-col items-center justify-center bg-white dark:bg-card-dark shrink-0">
                    <div className="flex items-center justify-center w-full mb-2">
                        <span className="text-3xl font-light text-slate-400 mr-1">+</span>
                        <div className="text-3xl font-light text-center text-slate-900 dark:text-white tracking-widest break-all">
                            {number || <span className="opacity-30">34...</span>}
                        </div>
                    </div>
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
