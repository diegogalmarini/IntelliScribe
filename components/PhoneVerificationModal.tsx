import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface PhoneVerificationModalProps {
    userId: string;
    onVerified: () => void;
    onClose: () => void;
}

export const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({ userId, onVerified, onClose }) => {
    const { t } = useLanguage();
    const [step, setStep] = useState<'phone' | 'code'>('phone');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'verifying' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSendCode = async () => {
        if (!phone) return;
        setStatus('sending');
        setErrorMsg('');

        try {
            const res = await fetch('/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'send', phoneNumber: phone, channel: 'sms' })
            });

            const data = await res.json();

            if (res.ok) {
                setStep('code');
                setStatus('idle');
            } else {
                setStatus('error');
                setErrorMsg(data.error || 'Failed to send SMS');
            }
        } catch (e) {
            setStatus('error');
            setErrorMsg('Network error');
        }
    };

    const handleVerifyCode = async () => {
        if (!code) return;
        setStatus('verifying');
        setErrorMsg('');

        try {
            const res = await fetch('/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'check', phoneNumber: phone, code, userId })
            });

            const data = await res.json();

            if (res.ok && data.status === 'approved') {
                setStatus('success');
                setTimeout(() => {
                    onVerified();
                }, 1500);
            } else {
                setStatus('error');
                setErrorMsg(data.error || 'Invalid code');
            }
        } catch (e) {
            setStatus('error');
            setErrorMsg('Verification failed');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-card-dark rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-border-dark animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="bg-slate-50 dark:bg-surface-dark px-6 py-4 border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {step === 'phone' ? 'Verify your Phone' : 'Enter Code'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 flex flex-col items-center">
                    {status === 'success' ? (
                        <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4">
                            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-4xl">check_circle</span>
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Verified!</h4>
                            <p className="text-slate-500">Your Caller ID is now active.</p>
                        </div>
                    ) : (
                        <>
                            {step === 'phone' ? (
                                <div className="w-full space-y-4">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4">
                                        To make calls with your own number, we need to verify it via SMS once.
                                    </p>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Mobile Number (with +CountryCode)</label>
                                        <input
                                            type="tel"
                                            placeholder="+34 600..."
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-lg font-mono focus:ring-2 focus:ring-brand-blue outline-none"
                                        />
                                    </div>

                                    <button
                                        onClick={handleSendCode}
                                        disabled={status === 'sending' || !phone.includes('+')}
                                        className="w-full py-3 bg-brand-blue hover:bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                    >
                                        {status === 'sending' ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <span>Send SMS</span>
                                                <span className="material-symbols-outlined text-sm">send</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full space-y-4">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4">
                                        Enter the code sent to <span className="font-mono font-bold text-slate-900 dark:text-white">{phone}</span>
                                    </p>

                                    <div className="flex justify-center gap-2 mb-4">
                                        <input
                                            type="text"
                                            maxLength={6}
                                            placeholder="123456"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-2xl font-mono text-center tracking-[0.5em] focus:ring-2 focus:ring-brand-blue outline-none"
                                        />
                                    </div>

                                    <button
                                        onClick={handleVerifyCode}
                                        disabled={status === 'verifying' || code.length < 4}
                                        className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold shadow-lg shadow-green-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {status === 'verifying' ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <span>Verify Code</span>
                                                <span className="material-symbols-outlined text-sm">check</span>
                                            </>
                                        )}
                                    </button>

                                    <button onClick={() => setStep('phone')} className="w-full text-xs text-slate-400 hover:underline">
                                        Wrong number? Go back
                                    </button>
                                </div>
                            )}

                            {errorMsg && (
                                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2 animate-bounce-short">
                                    <span className="material-symbols-outlined text-lg">error</span>
                                    {errorMsg}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
