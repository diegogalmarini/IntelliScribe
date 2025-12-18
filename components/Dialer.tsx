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

    // --- DEBUG STATE ---
    const [debugLog, setDebugLog] = useState<string[]>([]);
    const addLog = (msg: string) => setDebugLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

    useEffect(() => {
        if (isOpen && user) {
            addLog('Iniciando Dialer...');
            setStatus('Initializing...');

            callService.initialize(user.email || 'guest')
                .then(success => {
                    if (success) {
                        setStatus('Ready');
                        addLog('✅ Twilio Device Ready');
                    } else {
                        setStatus('Error');
                        addLog('❌ Error al inicializar Device (Revisa Token/Micrófono)');
                    }
                })
                .catch(err => addLog(`❌ Crash Init: ${err.message}`));
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

        // Formato E.164 forzado
        const numberToCall = '+' + number;
        addLog(`📞 Intentando llamar a: ${numberToCall}`);

        setStatus('Calling...');

        try {
            const call = await callService.makeCall(numberToCall, user.email || 'guest');

            if (call) {
                setActiveCall(call);
                setStatus('In Call');
                addLog('📡 Conectando...');

                call.on('accept', () => addLog('✅ Llamada Aceptada (En curso)'));
                call.on('disconnect', () => {
                    setStatus('Ready');
                    setActiveCall(null);
                    addLog('⏹️ Llamada Finalizada');
                });
                call.on('error', (err: any) => {
                    console.error('Twilio Error:', err);
                    setStatus('Error');
                    addLog(`❌ Twilio Error Code: ${err.code} - ${err.message}`);
                });
            } else {
                setStatus('Error');
                addLog('❌ Fallo al crear conexión (call object null)');
                setTimeout(() => setStatus('Ready'), 2000);
            }
        } catch (e: any) {
            addLog(`❌ Excepción al llamar: ${e.message}`);
        }
    };

    const handleHangup = () => {
        addLog('Cortando llamada...');
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
                className={`fixed bottom-6 right-6 w-14 h-14 ${isRestricted ? 'bg-orange-500' : 'bg-brand-green'} text-slate-900 rounded-full shadow-lg flex items-center justify-center z-50`}
            >
                <span className="material-symbols-outlined text-2xl">call</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-80 w-full h-full bg-white dark:bg-card-dark sm:rounded-2xl shadow-2xl flex flex-col z-50">

            {/* Header */}
            <div className="bg-slate-100 dark:bg-surface-dark p-3 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status === 'Ready' || status === 'In Call' ? 'bg-green-500' : 'bg-red-500'} `} />
                    <span className="text-xs font-medium text-slate-500 dark:text-text-secondary">{status}</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            {/* Display */}
            <div className="p-4 flex flex-col items-center justify-center bg-white dark:bg-card-dark shrink-0">
                <div className="flex items-center justify-center w-full mb-2">
                    <span className="text-3xl font-light text-slate-400 mr-1">+</span>
                    <div className="text-3xl font-light text-center text-slate-900 dark:text-white tracking-widest">
                        {number || <span className="opacity-30">...</span>}
                    </div>
                </div>
            </div>

            {/* Keypad */}
            <div className="flex-1 grid grid-cols-3 gap-2 p-4 bg-slate-50 dark:bg-surface-dark/50">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
                    <button key={digit} onClick={() => handleDigit(digit)} className="rounded-xl bg-white dark:bg-white/5 text-2xl font-medium py-3 shadow-sm">
                        {digit}
                    </button>
                ))}
                <div className="col-start-2">
                    <button onClick={() => handleDigit('0')} className="w-full rounded-xl bg-white dark:bg-white/5 text-2xl font-medium py-3 shadow-sm">0</button>
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-white dark:bg-card-dark grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-border-dark shrink-0">
                <button onClick={toggleMute} className={`rounded-full w-14 h-14 mx-auto flex items-center justify-center ${isMuted ? 'bg-slate-200' : 'text-slate-400'}`}>
                    <span className="material-symbols-outlined">{isMuted ? 'mic_off' : 'mic'}</span>
                </button>
                {status === 'In Call' || status === 'Calling...' ? (
                    <button onClick={handleHangup} className="bg-red-500 text-white rounded-full w-16 h-16 mx-auto flex items-center justify-center shadow-lg">
                        <span className="material-symbols-outlined text-3xl">call_end</span>
                    </button>
                ) : (
                    <button onClick={handleCall} className="bg-green-500 text-white rounded-full w-16 h-16 mx-auto flex items-center justify-center shadow-lg">
                        <span className="material-symbols-outlined text-3xl">call</span>
                    </button>
                )}
                <button onClick={() => setNumber(prev => prev.slice(0, -1))} className="rounded-full w-14 h-14 mx-auto flex items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined">backspace</span>
                </button>
            </div>

            {/* --- DEBUG CONSOLE (SOLO PARA QUE ME ENVÍES CAPTURA) --- */}
            <div className="h-32 bg-black text-green-400 text-xs font-mono p-2 overflow-y-auto border-t-2 border-slate-700 shrink-0">
                <div className="font-bold text-white mb-1">--- SYSTEM LOGS ---</div>
                {debugLog.map((log, i) => (
                    <div key={i}>{log}</div>
                ))}
            </div>
        </div>
    );
};
