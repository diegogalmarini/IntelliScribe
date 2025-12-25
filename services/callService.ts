import { Device, Call } from '@twilio/voice-sdk';

export class CallService {
    private device: Device | null = null;
    private token: string | null = null;

    constructor() { }

    // 1. Pre-Carga (Llamar esto al abrir el componente, no al llamar)
    async prepareToken(userId: string): Promise<boolean> {
        try {
            console.log('🔄 Pre-loading Twilio Token...');
            const response = await fetch('/api/twilio-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (!response.ok) return false;

            const data = await response.json();
            this.token = data.token;

            // Instanciamos el Device pero NO registramos ni conectamos aún
            this.device = new Device(this.token!, {
                logLevel: 1,
                // Quitamos preferencias complejas para máxima velocidad
                closeProtection: true
            });

            console.log('✅ Device Ready in Background');
            return true;
        } catch (error) {
            console.error('Token Pre-load failed:', error);
            return false;
        }
    }

    // 2. Llamada Instantánea
    async makeCall(phoneNumber: string, userId: string, verifiedPhone?: string): Promise<Call | null> {
        if (!this.device) {
            throw new Error('System not ready. Please wait 2 seconds.');
        }

        try {
            console.log('📞 Connecting call...');
            console.log('[CALL_SERVICE] userId:', userId);
            console.log('[CALL_SERVICE] verifiedPhone param:', verifiedPhone);

            // Let Twilio Device handle all audio permissions and stream management
            // The browser will prompt for mic access when device.connect() is called
            const call = await this.device.connect({
                params: {
                    To: phoneNumber,
                    VerifiedPhone: verifiedPhone || undefined,  // Pass verified phone for caller ID
                    userId: userId  // userId is now required and validated by caller
                }
            });
            console.log('[CALL_SERVICE] Call initiated with params:', { To: phoneNumber, VerifiedPhone: verifiedPhone, userId });
            return call;
        } catch (error: any) {
            console.error('Connection Failed:', error);

            // Si el error es undefined/null, es un bloqueo de permisos silencioso del navegador
            if (!error) {
                throw new Error('Microphone access denied. Click the lock icon 🔒 in your address bar to allow.');
            }

            // Si falla aquí, suele ser porque el usuario está en un navegador "in-app"
            if (error.code === 31000 || error.name === 'NotSupportedError') {
                throw new Error('Browser not supported. Open in Chrome/Safari.');
            }

            throw new Error(error.message || 'Call failed to connect');
        }
    }

    disconnect() {
        if (this.device) {
            this.device.disconnectAll();
        }
    }
}

export const callService = new CallService();
