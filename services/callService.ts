import { Device, Call } from '@twilio/voice-sdk';

export class CallService {
    private device: Device | null = null;
    private token: string | null = null;
    private tokenTimestamp: number = 0;
    private readonly TOKEN_TTL = 3600 * 1000; // 1 hour in ms

    constructor() { }

    // 1. Pre-Carga (Llamar esto al abrir el componente, no al llamar)
    async prepareToken(userId: string): Promise<boolean> {
        try {
            console.log('🔄 Loading Twilio Token...');
            const response = await fetch('/api/twilio-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Token loading failed:', errorData);
                return false;
            }

            const data = await response.json();
            this.token = data.token;
            this.tokenTimestamp = Date.now();

            // Instanciamos o actualizamos el Device
            if (this.device) {
                this.device.updateToken(this.token!);
            } else {
                this.device = new Device(this.token!, {
                    logLevel: 1,
                    closeProtection: true
                });
            }

            console.log('✅ Twilio Device Ready');
            return true;
        } catch (error) {
            console.error('Token Pre-load failed:', error);
            return false;
        }
    }

    // 2. Llamada Instantánea
    async makeCall(phoneNumber: string, userId: string, verifiedPhone?: string): Promise<Call | null> {
        // Verificar si el token ha expirado o está cerca de hacerlo (margen de 5 min)
        const isExpired = !this.token || (Date.now() - this.tokenTimestamp) > (this.TOKEN_TTL - 300000);

        if (isExpired) {
            console.log('🔄 Token expired or near expiration, renewing before call...');
            const renewed = await this.prepareToken(userId);
            if (!renewed) throw new Error('No se pudo renovar la sesión de llamadas. Intente refrescar la página.');
        }

        if (!this.device) {
            throw new Error('System not ready. Please wait 2 seconds.');
        }

        try {
            console.log('📞 Connecting call...');

            const call = await this.device.connect({
                params: {
                    To: phoneNumber,
                    VerifiedPhone: verifiedPhone || undefined,
                    userId: userId
                }
            });
            return call;
        } catch (error: any) {
            console.error('Connection Failed:', error);

            if (!error) {
                throw new Error('Microphone access denied. Click the lock icon 🔒 in your address bar to allow.');
            }

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
