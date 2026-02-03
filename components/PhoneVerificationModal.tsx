import React, { useState, useEffect } from 'react';

interface PhoneVerificationModalProps {
    userId: string;
    onVerified: () => void;
    onClose: () => void;
}

export const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({ userId, onVerified, onClose }) => {
    const [step, setStep] = useState<'phone' | 'code' | 'caller-id'>('phone');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [validationCode, setValidationCode] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'verifying' | 'success' | 'error' | 'waiting-call'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [callSid, setCallSid] = useState('');

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

            const text = await res.text();
            console.log('Raw API Response:', text);

            let data;
            try {
                data = JSON.parse(text);
            } catch (jsonError) {
                console.error('JSON Parse Error:', jsonError);
                throw new Error(`Invalid JSON Response: ${text.substring(0, 150)}...`);
            }

            if (res.ok) {
                setStep('code');
                setStatus('idle');
            } else {
                setStatus('error');
                // Enhanced error message display
                const errorDetails = data.details ? ` (${data.details})` : '';
                const twilioCode = data.twilioCode ? ` [${data.twilioCode}]` : '';
                setErrorMsg(data.error + errorDetails + twilioCode || 'Failed to send SMS');
            }
        } catch (e: any) {
            console.error('Send error:', e);
            setStatus('error');
            // Show the exact raw error to the user
            setErrorMsg(`Error: ${e.message}`);
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
                // OTP verified! Now move to caller ID verification
                console.log('✅ OTP verified, starting caller ID verification...');
                await initiateCallerIdVerification();
            } else {
                setStatus('error');
                // Enhanced error message display
                const errorDetails = data.details ? ` (${data.details})` : '';
                const twilioCode = data.twilioCode ? ` [${data.twilioCode}]` : '';
                setErrorMsg(data.error + errorDetails + twilioCode || 'Invalid code');
            }
        } catch (e: any) {
            console.error('Verify error:', e);
            setStatus('error');
            setErrorMsg('Error: ' + (e.message || 'Network verification failed'));
        }
    };

    const initiateCallerIdVerification = async () => {
        setStatus('sending');
        setErrorMsg('');

        try {
            const res = await fetch('/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'verify-caller-id',
                    phoneNumber: phone.startsWith('+') ? phone : '+' + phone,
                    userId
                })
            });

            const data = await res.json();

            if (res.ok && data.status === 'initiated') {
                // Success! Show validation code and wait for call
                setValidationCode(data.validationCode);
                setCallSid(data.callSid);
                setStep('caller-id');
                setStatus('waiting-call');
                console.log('📞 Caller ID verification initiated:', data);

                // Start polling for verification status
                startStatusPolling();
            } else {
                setStatus('error');
                const errorDetails = data.details ? ` (${data.details})` : '';
                const twilioCode = data.twilioCode ? ` [${data.twilioCode}]` : '';
                setErrorMsg(data.error + errorDetails + twilioCode || 'Failed to initiate caller ID verification');
            }
        } catch (e: any) {
            console.error('Caller ID verification error:', e);
            setStatus('error');
            setErrorMsg('Error: ' + (e.message || 'Network error'));
        }
    };

    const startStatusPolling = () => {
        const intervalId = setInterval(async () => {
            try {
                // Query Supabase to check if caller_id_verified has been updated
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                if (!supabaseUrl) return;

                const res = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=phone_verified`, {
                    headers: {
                        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.length > 0 && data[0].phone_verified === true) {
                        // Verification complete!
                        clearInterval(intervalId);
                        setStatus('success');
                        setTimeout(() => {
                            onVerified();
                        }, 1500);
                    }
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 3000); // Poll every 3 seconds

        // Stop polling after 2 minutes
        setTimeout(() => {
            clearInterval(intervalId);
            if (status === 'waiting-call') {
                setStatus('error');
                setErrorMsg('Verification timeout. Please try again.');
            }
        }, 120000);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {step === 'phone' && 'Paso 1: Verificar Teléfono'}
                        {step === 'code' && 'Paso 2: Código SMS'}
                        {step === 'caller-id' && 'Paso 3: Verificar Caller ID'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-6">
                    <div className={`flex-1 h-2 rounded-full ${step === 'phone' || step === 'code' || step === 'caller-id' ? 'bg-blue-500' : 'bg-slate-200'}`} />
                    <div className={`flex-1 h-2 rounded-full mx-2 ${step === 'code' || step === 'caller-id' ? 'bg-blue-500' : 'bg-slate-200'}`} />
                    <div className={`flex-1 h-2 rounded-full ${step === 'caller-id' ? 'bg-blue-500' : 'bg-slate-200'}`} />
                </div>

                {status === 'success' ? (
                    <div className="text-center py-8">
                        <div className="text-green-500 text-6xl mb-4">✓</div>
                        <p className="font-bold text-xl text-slate-800 dark:text-white mb-2">¡Verificación Completa!</p>
                        <p className="text-sm text-slate-500">Ahora puedes usar tu número para llamadas</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {step === 'phone' ? (
                            <>
                                <p className="text-sm text-slate-500">Para realizar llamadas con tu propio número, necesitamos verificarlo en 2 pasos:</p>
                                <ul className="text-xs text-slate-400 list-disc list-inside space-y-1">
                                    <li>Paso 1: Código por SMS (rápido)</li>
                                    <li>Paso 2: Llamada de verificación de Twilio (en inglés)</li>
                                </ul>
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
                        ) : step === 'code' ? (
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
                                    disabled={status === 'verifying' || code.length < 6}
                                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded font-bold transition-colors disabled:opacity-50"
                                >
                                    {status === 'verifying' ? 'Verificando...' : 'Verificar Código'}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                        📞 Twilio te llamará ahora
                                    </p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                                        La llamada será <strong>en inglés</strong> y desde un <strong>número +1 (Estados Unidos)</strong>. Cuando contestes, introduce este código en tu teléfono:
                                    </p>
                                    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center border-2 border-blue-500">
                                        <div className="text-4xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-widest">
                                            {validationCode}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-2 text-sm text-slate-500">
                                    {status === 'waiting-call' && (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                <span>Esperando confirmación...</span>
                                            </div>
                                            <button
                                                onClick={initiateCallerIdVerification}
                                                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded font-medium transition-colors"
                                            >
                                                🔄 Reintentar
                                            </button>
                                        </>
                                    )}
                                </div>

                                <div className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-900 rounded p-3">
                                    <p className="font-semibold mb-1">💡 Instrucciones:</p>
                                    <ol className="list-decimal list-inside space-y-1">
                                        <li>Espera la llamada de Twilio (puede tardar 10-30 segundos)</li>
                                        <li>Contesta el teléfono</li>
                                        <li>Escucha las instrucciones en inglés</li>
                                        <li>Introduce el código de arriba cuando te lo pidan</li>
                                        <li>Espera la confirmación aquí</li>
                                    </ol>
                                </div>
                            </>
                        )}
                        {errorMsg && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{errorMsg}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};
