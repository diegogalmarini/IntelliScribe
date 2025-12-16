
import { Device, Call } from '@twilio/voice-sdk';

export class CallService {
    private device: Device | null = null;
    private token: string | null = null;

    constructor() { }

    async initialize(userId: string) {
        try {
            // Fetch token from our backend
            const response = await fetch('/api/twilio-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (!response.ok) throw new Error('Failed to fetch token');

            const data = await response.json();
            this.token = data.token;

            // Initialize Device
            this.device = new Device(this.token!, {
                // Default codecs are usually fine: Opus, PCMU
                logLevel: 1
            });

            this.device.register();
            console.log('Twilio Device initialized');

            return true;
        } catch (error) {
            console.error('Error initializing Twilio:', error);
            return false;
        }
    }

    async makeCall(phoneNumber: string): Promise<Call | null> {
        if (!this.device) {
            console.error('Device not initialized');
            return null;
        }

        try {
            const call = await this.device.connect({
                params: {
                    To: phoneNumber
                }
            });
            return call;
        } catch (error) {
            console.error('Error making call:', error);
            return null;
        }
    }

    disconnect() {
        if (this.device) {
            this.device.disconnectAll();
        }
    }
}

export const callService = new CallService();
