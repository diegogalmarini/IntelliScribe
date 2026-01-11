const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect';
const MEASUREMENT_ID = 'G-BJTFLEHJXD';
const API_SECRET = 'FALTA_TU_API_SECRET'; // TODO: Necesitas generar un API Secret en GA4 para que los eventos se procesen
const DEFAULT_ENGAGEMENT_TIME_MSEC = 100;
const SESSION_EXPIRATION_IN_MIN = 30;

// Generate a unique client ID
async function getOrCreateClientId(): Promise<string> {
    const result = await chrome.storage.local.get('clientId');
    let clientId = result.clientId;
    if (!clientId) {
        clientId = self.crypto.randomUUID();
        await chrome.storage.local.set({ clientId });
    }
    return clientId;
}

// Manage Session ID (expires after 30 min of inactivity)
async function getOrCreateSessionId(): Promise<string> {
    const NOW_IN_MS = Date.now();
    const result = await chrome.storage.session.get(['sessionId', 'lastActive']);
    let { sessionId, lastActive } = result;

    if (sessionId && lastActive) {
        const timeSinceLastActive = (NOW_IN_MS - lastActive) / 1000 / 60;
        if (timeSinceLastActive < SESSION_EXPIRATION_IN_MIN) {
            await chrome.storage.session.set({ lastActive: NOW_IN_MS });
            return sessionId;
        }
    }

    sessionId = NOW_IN_MS.toString();
    await chrome.storage.session.set({ sessionId, lastActive: NOW_IN_MS });
    return sessionId;
}

// Helper to get User ID safely (from local storage if auth is present)
async function getUserId(): Promise<string | undefined> {
    try {
        // Try to get Supabase user from local storage token
        const { authToken } = await chrome.storage.local.get(['authToken']);
        if (authToken) {
            // Basic JWT decode to get "sub" (subject) which is usually user_id
            const payloadPart = authToken.split('.')[1];
            if (payloadPart) {
                const decoded = JSON.parse(atob(payloadPart));
                if (decoded && decoded.sub) {
                    return decoded.sub;
                }
            }
        }
    } catch (e) {
        // Fail silently for user_id
    }
    return undefined;
}

export async function fireEvent(name: string, params: Record<string, any> = {}) {
    // Silent fail if no API Key (Prevent console errors in dev if not set)
    if (API_SECRET === 'FALTA_TU_API_SECRET') {
        console.warn('GA4 Not Configured: Missing API Secret');
        return;
    }

    try {
        const clientId = await getOrCreateClientId();
        const sessionId = await getOrCreateSessionId();
        const userId = await getUserId();

        const payload: any = {
            client_id: clientId,
            timestamp_micros: (Date.now() * 1000).toString(),
            non_personalized_ads: false,
            events: [
                {
                    name: name,
                    params: {
                        session_id: sessionId,
                        engagement_time_msec: DEFAULT_ENGAGEMENT_TIME_MSEC,
                        ...params,
                    },
                },
            ],
        };

        if (userId) {
            payload.user_id = userId;
        }

        const response = await fetch(
            `${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
            {
                method: 'POST',
                body: JSON.stringify(payload),
            }
        );

        if (!response.ok) {
            console.error('GA Event Failed:', response.statusText);
        }
    } catch (error) {
        console.error('GA Error:', error);
    }
}
