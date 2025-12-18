import { Device, Call } from '@twilio/voice-sdk';

export class CallService {
    private device: Device | null = null;
    private token: string | null = null;

    constructor() { }

    async initialize(userId: string): Promise<boolean> {
        try {
            const response = await fetch('/api/twilio-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (!response.ok) {
                const err = await response.json();
                console.error('Token Error:', err);
                return false;
            }

            const data = await response.json();
            this.token = data.token;

            this.device = new Device(this.token!, {
                logLevel: 1,
                codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
            });

            // Registro silencioso para no ensuciar consola
            await this.device.register();
            return true;
        } catch (error) {
            console.error('Error initializing Twilio:', error);
            return false;
        }
    }

    async makeCall(phoneNumber: string, userId?: string): Promise<Call | null> {
        if (!this.device) {
            throw new Error('Device not initialized. Reload the page.');
        }

        try {
            const call = await this.device.connect({
                params: {
                    To: phoneNumber,
                    userId: userId || 'guest'
                }
            });
            return call;
        } catch (error: any) {
            console.error('Connection Error:', error);

            // Detección inteligente de error de micrófono
            if (error.code === 31208 || (error.message && error.message.includes('Permission'))) {
                throw new Error('Microphone access denied. Please allow microphone access in your browser settings.');
            }

            throw new Error(error.message || 'Call failed due to connection error.');
        }
    }

    disconnect() {
        if (this.device) {
            this.device.disconnectAll();
        }
    }
}

export const callService = new CallService();
