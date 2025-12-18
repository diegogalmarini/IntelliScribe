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
                console.error('Token fetch failed');
                return false;
            }

            const data = await response.json();
            this.token = data.token;

            // 2. Preparar el dispositivo (SIN REGISTRAR)
            // Esto no pide micro todavía, solo carga la librería
            this.device = new Device(this.token!, {
                logLevel: 1,
                // Quitamos preferencias de codec para máxima compatibilidad
            });

            // Monitor de errores silencioso
            this.device.on('error', (err) => {
                console.warn('Twilio Warning:', err);
            });

            console.log('Twilio Device Validated (Standby)');
            return true;
        } catch (error) {
            console.error('Error initializing Twilio:', error);
            return false;
        }
    }

    async makeCall(phoneNumber: string, userId?: string): Promise<Call | null> {
        if (!this.device) {
            // Intento de recuperación automático si no estaba inicializado
            if (userId && await this.initialize(userId)) {
                // Retry success
            } else {
                throw new Error('System not ready. Please refresh.');
            }
        }

        try {
            // 3. AHORA pedimos el micro (al hacer click)
            // El navegador verá que es un gesto del usuario y lo permitirá
            const call = await this.device.connect({
                params: {
                    To: phoneNumber,
                    userId: userId || 'guest'
                }
            });
            return call;
        } catch (error: any) {
            console.error('Call Connection Failed:', error);

            // Si falla aquí, suele ser porque el usuario está en un navegador "in-app"
            // (Como el de LinkedIn o Gmail) que bloquea todo.
            if (error.code === 31000 || error.name === 'NotSupportedError') {
                throw new Error('Browser not supported. Please open in Chrome or Safari.');
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
