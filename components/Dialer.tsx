import React, { useState, useEffect } from 'react';
import { callService } from '../services/callService';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfile, AppRoute } from '../types';

interface DialerProps {
    user: UserProfile;
    onNavigate: (route: AppRoute) => void;
}

export const Dialer: React.FC<DialerProps> = ({ user, onNavigate }) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [number, setNumber] = useState('');
    const [status, setStatus] = useState('Idle');
    const [activeCall, setActiveCall] = useState<any>(null);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        if (isOpen && user && user.phoneVerified && status === 'Idle') {
            setStatus('Initializing...');
            callService.initialize(user.email || 'guest')
                .then(success => {
                    setStatus(success ? 'Ready' : 'Error');
                });
        }
    }, [isOpen, user]);

    const handleDigit = (digit: string) => {
        setNumber(prev => prev + digit);
        if (activeCall) {
            activeCall.sendDigits(digit);
        }
    };

    const handleCall = async () => {
        if (!number) return;

        // --- UX IMPROVEMENT: AUTO-ADD PREFIX ---
        let numberToCall = number;

        // Logic: If user didn't type '+', assume they want to call.
        // We ensure the backend receives a valid format.
        if (!numberToCall.startsWith('+')) {
            // If it starts with 34 (e.g. 34611...), just add '+'
            if (numberToCall.startsWith('34')) {
                numberToCall = '+' + numberToCall;
            } else {
                // Default: Add +34 for Spain if no prefix is present
                numberToCall = '+34' + numberToCall;
            }
        }

        setStatus('Calling...');

        // Pass userId (email) to the service so api/voice.ts receives it
        const call = await callService.makeCall(numberToCall, user.email || 'guest');

        if (call) {
            setActiveCall(call);
            setStatus('In Call');

            call.on('disconnect', () => {
                setStatus('Ready');
                setActiveCall(null);
            });

            call.on('error', (err: any) => {
                console.error('Call error:', err);
                setStatus('Error');
                setTimeout(() => setStatus('Ready'), 2000);
            });
        } else {
            setStatus('Error');
            setTimeout(() => setStatus('Ready'), 2000);
        }
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

    const isRestricted = !user.phoneVerified;

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 w-14 h-14 ${isRestricted ? 'bg-orange-500 hover:bg-orange-600' : 'bg-brand-green hover:bg-green-400'} text-slate-900 rounded-full shadow-lg flex items-center justify-center transition-all z-50 animate-bounce-message`}
            >
                <span className="material-symbols-outlined text-2xl">{isRestricted ? 'phonelink_erase' : 'call'}</span>
            </button>
        );
    }

    return (
        // UI UPDATE: Full screen on mobile (fixed inset-0), Widget size on desktop
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-80 w-full h-full bg-white dark:bg-card-dark sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-border-dark overflow-hidden flex flex-col z-50 animate-in slide-in-from-bottom-5">

            {/* Header */}
            <div className="bg-slate-100 dark:bg-surface-dark p-4 sm:p-3 flex justify-between items-center border-b border-slate-200 dark:border-border-dark shrink-0">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isRestricted ? 'bg-orange-500' : (status === 'Ready' || status === 'In Call' ? 'bg-green-500' : 'bg-red-500')} `} />
                    <span className="text-xs font-medium text-slate-500 dark:text-text-secondary">
                        {isRestricted ? t('restricted') : status}
                    </span>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                    <span className="material-symbols-outlined text-2xl sm:text-xl">close</span>
                </button>
            </div>

            {/* Content Switch */}
            {isRestricted ? (
                <div className="p-8 flex flex-col items-center text-center justify-center h-full">
                    <div className="w-20 h-20 bg-orange-100 dark:bg-orange-500/20 rounded-full flex items-center justify-center mb-6 text-orange-500">
                        <span className="material-symbols-outlined text-4xl">phonelink_erase</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('callerIdRequiredTitle')}</h3>
                    <p className="text-base text-slate-500 dark:text-slate-400 mb-8">
                        {t('verifyPhoneRecordingMessage')}
                    </p>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            onNavigate(AppRoute.SETTINGS);
                        }}
                        className="w-full py-3 bg-brand-blue text-white rounded-xl font-bold shadow-md hover:bg-brand-blue/90 text-lg"
                    >
                        {t('goToSettings')}
                    </button>
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    {/* Display */}
                    <div className="p-6 flex flex-col items-center justify-center bg-white dark:bg-card-dark shrink-0">
                        <input
                            type="text"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            className="text-5xl sm:text-4xl font-light text-center bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white w-full mb-2 tracking-widest"
                            placeholder="..."
                            readOnly // Prevent mobile keyboard popup, use custom keypad
                        />
                        {status === 'In Call' && <span className="text-sm text-brand-green fade-in">Connected</span>}
                    </div>

                    {/* Keypad - Expanded for touch, no * or # */}
                    <div className="flex-1 grid grid-cols-3 gap-3 p-6 bg-slate-50 dark:bg-surface-dark/50">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
                            <button
                                key={digit}
                                onClick={() => handleDigit(digit)}
                                className="h-full rounded-2xl bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-medium text-3xl sm:text-2xl transition-all shadow-sm active:scale-95 flex items-center justify-center"
                            >
                                {digit}
                            </button>
                        ))}
                        {/* 0 Centered */}
                        <div className="col-start-2">
                            <button
                                onClick={() => handleDigit('0')}
                                className="h-full w-full rounded-2xl bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-medium text-3xl sm:text-2xl transition-all shadow-sm active:scale-95 flex items-center justify-center"
                            >
                                0
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6 bg-white dark:bg-card-dark grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-border-dark shrink-0 mb-safe">
                        <button onClick={toggleMute} disabled={status !== 'In Call'} className={`flex items-center justify-center rounded-full w-16 h-16 sm:w-14 sm:h-14 mx-auto transition-colors ${isMuted ? 'bg-slate-200 dark:bg-white/20 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'} `}>
                            <span className="material-symbols-outlined text-3xl sm:text-2xl">{isMuted ? 'mic_off' : 'mic'}</span>
                        </button>

                        {status === 'In Call' || status === 'Calling...' ? (
                            <button onClick={handleHangup} className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full w-20 h-20 sm:w-16 sm:h-16 mx-auto shadow-xl shadow-red-500/30 active:scale-95 transition-transform">
                                <span className="material-symbols-outlined text-4xl sm:text-3xl">call_end</span>
                            </button>
                        ) : (
                            <button onClick={handleCall} className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-full w-20 h-20 sm:w-16 sm:h-16 mx-auto shadow-xl shadow-green-500/30 active:scale-95 transition-transform">
                                <span className="material-symbols-outlined text-4xl sm:text-3xl">call</span>
                            </button>
                        )}

                        <button onClick={() => setNumber(prev => prev.slice(0, -1))} className="flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-full w-16 h-16 sm:w-14 sm:h-14 mx-auto active:bg-slate-100 dark:active:bg-white/5 transition-colors">
                            <span className="material-symbols-outlined text-3xl sm:text-2xl">backspace</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
