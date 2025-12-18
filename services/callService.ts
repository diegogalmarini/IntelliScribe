import { Device, Call } from '@twilio/voice-sdk';

export class CallService {
    private device: Device | null = null;
    private token: string | null = null;

    constructor() { }

    async initialize(userId: string): Promise<boolean> {
        try {
            console.log('🔄 Fetching Twilio Token...');
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
            console.log('🔑 Token received');

            // Initialize Device
            this.device = new Device(this.token!, {
                logLevel: 1,
                codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU]
            });

            this.device.on('registered', () => console.log('✅ Twilio Registered'));
            this.device.on('error', (err) => console.error('❌ Device Error:', err));

            await this.device.register();
            return true;
        } catch (error: any) {
            console.error('Error initializing Twilio:', error);
            return false;
        }
    }

    async makeCall(phoneNumber: string, userId?: string): Promise<Call | null> {
        if (!this.device) {
            throw new Error('Device not initialized. (Refresh page)');
        }

        try {
            console.log(`📡 Connecting to ${phoneNumber}...`);
            const call = await this.device.connect({
                params: {
                    To: phoneNumber,
                    userId: userId || 'guest'
                }
            });
            return call;
        } catch (error: any) {
            console.error('Error making call raw:', error);

            // --- PROTECCIÓN CONTRA EL ERROR "UNDEFINED" ---
            let errorMessage = 'Unknown Error';

            if (error) {
                errorMessage = error.message || error.code || JSON.stringify(error);
            } else {
                // Si el error es undefined, suele ser bloqueo de permisos
                errorMessage = 'Microphone Access Denied (Check Browser Permissions)';
            }

            throw new Error(errorMessage);
        }
    }

    disconnect() {
        if (this.device) {
            this.device.disconnectAll();
        }
    }
}

export const callService = new CallService();
