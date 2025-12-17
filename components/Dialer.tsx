
import React, { useState, useEffect } from 'react';
import { callService } from '../services/callService';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfile, AppRoute } from '../types';

interface DialerProps {
    user: UserProfile;
    onNavigate: (route: AppRoute) => void;
}

export const Dialer: React.FC<DialerProps> = ({ user, onNavigate }) => {
    // Removed useAuth hook, using prop user instead
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [number, setNumber] = useState('');
    const [status, setStatus] = useState('Idle'); // Idle, Ready, Calling, In Call, Error
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
    }, [isOpen, user]); // Re-run if verification status changes

    const handleDigit = (digit: string) => {
        setNumber(prev => prev + digit);
        if (activeCall) {
            activeCall.sendDigits(digit);
        }
    };

    const handleCall = async () => {
        if (!number) return;
        setStatus('Calling...');
        const call = await callService.makeCall(number);
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

    // If phone is not verified, show a restricted state
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
        <div className="fixed bottom-6 right-6 w-80 bg-white dark:bg-card-dark rounded-2xl shadow-2xl border border-slate-200 dark:border-border-dark overflow-hidden flex flex-col z-50 animate-in slide-in-from-bottom-5">
            {/* Header */}
            <div className="bg-slate-100 dark:bg-surface-dark p-3 flex justify-between items-center border-b border-slate-200 dark:border-border-dark">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isRestricted ? 'bg-orange-500' : (status === 'Ready' || status === 'In Call' ? 'bg-green-500' : 'bg-red-500')} `} />
                    <span className="text-xs font-medium text-slate-500 dark:text-text-secondary">
                        {isRestricted ? t('restricted') : status}
                    </span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>
            </div>

            {/* Content Switch */}
            {isRestricted ? (
                <div className="p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-500/20 rounded-full flex items-center justify-center mb-4 text-orange-500">
                        <span className="material-symbols-outlined text-3xl">no_cell</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Caller ID Required</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                        You must verify your mobile number before making outgoing calls.
                    </p>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            onNavigate(AppRoute.SETTINGS);
                        }}
                        className="w-full py-2 bg-brand-blue text-white rounded-lg font-bold shadow-md hover:bg-brand-blue/90"
                    >
                        Go to Settings
                    </button>
                </div>
            ) : (
                <>
                    {/* Display */}
                    <div className="p-6 flex flex-col items-center justify-center bg-white dark:bg-card-dark">
                        <input
                            type="text"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            className="text-3xl font-light text-center bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white w-full mb-1"
                            placeholder="..."
                        />
                        {status === 'In Call' && <span className="text-xs text-brand-green fade-in">Connected</span>}
                    </div>

                    {/* Keypad */}
                    <div className="grid grid-cols-3 gap-1 p-4 bg-slate-50 dark:bg-surface-dark/50">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(digit => (
                            <button
                                key={digit}
                                onClick={() => handleDigit(digit)}
                                className="h-12 w-full rounded hover:bg-slate-200 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-medium text-lg transition-colors"
                            >
                                {digit}
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="p-4 bg-white dark:bg-card-dark grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-border-dark">
                        <button onClick={toggleMute} disabled={status !== 'In Call'} className={`flex items-center justify-center rounded-full w-12 h-12 mx-auto ${isMuted ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-slate-600'} `}>
                            <span className="material-symbols-outlined">{isMuted ? 'mic_off' : 'mic'}</span>
                        </button>

                        {status === 'In Call' || status === 'Calling...' ? (
                            <button onClick={handleHangup} className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full w-14 h-14 mx-auto shadow-lg shadow-red-500/30">
                                <span className="material-symbols-outlined text-2xl">call_end</span>
                            </button>
                        ) : (
                            <button onClick={handleCall} className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 mx-auto shadow-lg shadow-green-500/30">
                                <span className="material-symbols-outlined text-2xl">call</span>
                            </button>
                        )}

                        <button onClick={() => setNumber(prev => prev.slice(0, -1))} className="flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-full w-12 h-12 mx-auto">
                            <span className="material-symbols-outlined">backspace</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
