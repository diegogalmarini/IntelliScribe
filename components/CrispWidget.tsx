import { useEffect } from 'react';

const CrispWidget = () => {
    useEffect(() => {
        const crispId = import.meta.env.VITE_CRISP_WEBSITE_ID;
        if (!crispId) {
            console.warn('[Crisp] No VITE_CRISP_WEBSITE_ID found.');
            return;
        }

        const initCrisp = () => {
            if (window.$crisp) return; // Already initialized

            console.log('[Crisp] Initializing via Consent...');
            window.$crisp = [];
            window.CRISP_WEBSITE_ID = crispId;

            (function () {
                const d = document;
                const s = d.createElement("script");
                s.src = "https://client.crisp.chat/l.js";
                s.async = true;
                d.getElementsByTagName("head")[0].appendChild(s);
            })();
        };

        // Check if consent is already stored and allowed
        const savedConsent = localStorage.getItem('diktalo_cookie_consent');
        if (savedConsent) {
            const parsed = JSON.parse(savedConsent);
            if (parsed.functional) {
                initCrisp();
            }
        }

        // Listen for new consent event
        const handleConsent = () => initCrisp();
        window.addEventListener('diktalo-consent-functional-granted', handleConsent);

        return () => {
            window.removeEventListener('diktalo-consent-functional-granted', handleConsent);
        };
    }, []);

    return null;
};

export default CrispWidget;

// Add type definition for global window object
declare global {
    interface Window {
        $crisp: any[];
        CRISP_WEBSITE_ID: string;
    }
}
