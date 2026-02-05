import { Device, Call } from '@twilio/voice-sdk';

// Twilio Error Code Mapper - Convierte códigos técnicos a mensajes amigables
function getTwilioErrorMessage(error: any): string {
    const code = error.code;

    // Errores de SIP (30000-30999)
    if (code >= 30000 && code < 31000) {
        const sipErrorMap: Record<number, string> = {
            30001: 'Cola de llamadas llena. Intente más tarde.',
            30002: 'Configuración inválida de la cuenta.',
            30003: 'Número no verificado. Verifique su teléfono en Configuración.',
            30004: 'Número bloqueado.',
            30005: 'Número inválido o no alcanzable.',
            30006: 'El número está ocupado.',
            30007: 'El teléfono está apagado o fuera de cobertura.',
            30008: 'No se pudo completar la llamada.',
        };

        return sipErrorMap[code] || `Error de red (${code}). Verifique el número.`;
    }

    // Errores del cliente (31000-31999)
    if (code >= 31000 && code < 32000) {
        const clientErrorMap: Record<number, string> = {
            31000: 'Navegador no compatible. Use Chrome o Safari.',
            31001: 'Acceso al micrófono denegado. Habilite permisos.',
            31002: 'Error de conexión. Verifique su internet.',
            31003: 'Error de WebSocket. Recargue la página.',
            31005: 'Error temporal de conexión. Intente de nuevo.',
            31009: 'Token inválido. Recargue la página.',
        };

        return clientErrorMap[code] || `Error de conexión (${code}). Intente recargar.`;
    }

    // Errores de señalización (53000-539 99)
    if (code >= 53000 && code < 54000) {
        const signalErrorMap: Record<number, string> = {
            53000: 'Error de señalización. Intente de nuevo.',
            53001: 'Llamada rechazada por el destinatario.',
            53002: 'Llamada cancelada.',
            53003: 'El número está ocupado.',
            53004: 'El destinatario no responde.',
            53005: 'Llamada rechazada.',
        };

        return signalErrorMap[code] || `No se pudo conectar (${code}).`;
    }

    // Mensaje genérico si no coincide con ningún código conocido
    return error.message || 'Error al conectar la llamada.';
}

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
                    closeProtection: true,
                    // Use standard settings for better PC compatibility
                    edge: ['roaming']
                });

                // --- DIAGNOSTICS FOR PC ISSUES ---
                this.device.on('error', (err: any) => {
                    console.error('[CALL-SERVICE] Twilio Device Error:', err.message, err.code);
                    // Critical for PC debugging: check for 31000/31005
                });

                this.device.on('unregistered', () => {
                    console.warn('[CALL-SERVICE] Device unregistered');
                });

                this.device.on('registered', () => {
                    console.log('[CALL-SERVICE] Device registered successfully');
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
            if (!renewed) throw new Error('No se pudo renovar la sesión. Intente refrescar la página.');
        }

        if (!navigator.onLine) {
            throw new Error('Sin conexión a Internet. Verifique su red.');
        }

        if (!this.device) {
            console.warn('⚠️ Twilio Device not ready, attempting strict reload...');
            const renewed = await this.prepareToken(userId);
            if (!renewed || !this.device) {
                throw new Error('El sistema de llamadas no está listo. Espere unos segundos o recargue.');
            }
        }

        // Clean up any existing connections before making a new call
        // Force disconnect to ensure clean state and avoid 31005 error
        if (this.device) {
            this.device.disconnectAll();
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

            // 31005 usually means a connection error on hangup or setup
            if (error.code === 31005) {
                console.warn('⚠️ Recovering from 31005...');
                this.device.disconnectAll();
                // We could retry here, but for now just tell user to try again
                throw new Error('Error de conexión temporal. Intente llamar de nuevo.');
            }

            // Usar el mapeador de errores amigables
            const friendlyMessage = getTwilioErrorMessage(error);
            throw new Error(friendlyMessage);
        }
    }

    async setInputDevice(deviceId: string): Promise<boolean> {
        if (!this.device) return false;
        try {
            await this.device.audio.setInputDevice(deviceId);
            console.log('[CALL-SERVICE] Input device set to:', deviceId);
            return true;
        } catch (error) {
            console.error('[CALL-SERVICE] Failed to set input device:', error);
            return false;
        }
    }

    disconnect() {
        if (this.device) {
            console.log('📞 Hanging up...');
            this.device.disconnectAll();
        }
    }
}

export const callService = new CallService();
