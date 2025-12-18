import { Device, Call } from '@twilio/voice-sdk';

export class CallService {
    private device: Device | null = null;
    private token: string | null = null;

    constructor() { }

    async initialize(userId: string): Promise<boolean> {
        try {
            // 1. Obtener Token
            const response = await fetch('/api/twilio-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(`Token Error: ${err.error || response.statusText}`);
            }

            const data = await response.json();
            this.token = data.token;

            // 2. Inicializar Device con depuración
            this.device = new Device(this.token!, {
                logLevel: 1,
                // Opcional: forzar códec para estabilidad
                codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU]
            });

            // 3. Listeners Críticos (Para saber si el registro falla después)
            this.device.on('registered', () => console.log('✅ Twilio Registered'));
            this.device.on('error', (err) => {
                console.error('❌ Twilio Device Error:', err);
                // Si tienes un sistema de logs global, úsalo aquí
            });

            // 4. Registrar
            this.device.register();
            console.log('Twilio Device initialized');

            return true;
        } catch (error) {
            console.error('Error initializing Twilio:', error);
            // Lanzamos el error para que el UI lo vea si quiere
            return false;
        }
    }

    async makeCall(phoneNumber: string, userId?: string): Promise<Call | null> {
        if (!this.device) {
            throw new Error('Device not initialized (Check Token)');
        }

        try {
            // Sintaxis correcta para v2.0+
            // params: Parámetros personalizados que viajan a tu backend (voice.ts)
            const callOptions = {
                params: {
                    To: phoneNumber,
                    userId: userId || 'guest'
                }
            };

            // ⚠️ AQUÍ OCURRE EL ERROR, ahora lo lanzaremos
            const call = await this.device.connect(callOptions);
            return call;
        } catch (error: any) {
            console.error('Error making call:', error);
            // 🔥 CLAVE: Lanzar el error real para verlo en el Dialer
            throw new Error(error.message || 'Unknown Twilio Connect Error');
        }
    }

    disconnect() {
        if (this.device) {
            this.device.disconnectAll();
        }
    }
}

export const callService = new CallService();
