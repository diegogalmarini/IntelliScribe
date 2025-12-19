import React, { useState } from 'react';

interface PhoneVerificationModalProps {
    userId: string;
    onVerified: () => void;
    onClose: () => void;
}

export const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({ userId, onVerified, onClose }) => {
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
                // Aseguramos que el número tenga formato correcto si el usuario olvidó el +
                body: JSON.stringify({
                    action: 'send',
                    phoneNumber: phone.startsWith('+') ? phone : '+' + phone,
                    channel: 'sms'
                })
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
                body: JSON.stringify({
                    action: 'check',
                    phoneNumber: phone.startsWith('+') ? phone : '+' + phone,
                    code,
                    userId
                })
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {step === 'phone' ? 'Verificar Teléfono' : 'Introducir Código'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                {status === 'success' ? (
                    <div className="text-center py-4">
                        <div className="text-green-500 text-5xl mb-2">✓</div>
                        <p className="font-bold text-slate-800 dark:text-white">¡Verificado!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {step === 'phone' ? (
                            <>
                                <p className="text-sm text-slate-500">Para realizar llamadas, necesitamos verificar tu número una única vez.</p>
                                <input
                                    type="tel"
                                    placeholder="+34 600 000 000"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full p-3 rounded border bg-slate-50 dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                />
                                <button
                                    onClick={handleSendCode}
                                    disabled={status === 'sending' || phone.length < 9}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition-colors disabled:opacity-50"
                                >
                                    {status === 'sending' ? 'Enviando...' : 'Enviar SMS'}
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-slate-500">Introduce el código enviado a {phone}</p>
                                <input
                                    type="text"
                                    placeholder="123456"
                                    maxLength={6}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full p-3 rounded border text-center text-2xl tracking-widest bg-slate-50 dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                />
                                <button
                                    onClick={handleVerifyCode}
                                    disabled={status === 'verifying'}
                                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded font-bold transition-colors disabled:opacity-50"
                                >
                                    {status === 'verifying' ? 'Verificando...' : 'Verificar'}
                                </button>
                            </>
                        )}
                        {errorMsg && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{errorMsg}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};
