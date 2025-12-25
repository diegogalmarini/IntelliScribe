import { useEffect } from 'react';

const CrispWidget = () => {
    useEffect(() => {
        const crispId = import.meta.env.VITE_CRISP_WEBSITE_ID;

        if (crispId) {
            console.log('[Crisp] Initializing with ID:', crispId);
            window.$crisp = [];
            window.CRISP_WEBSITE_ID = crispId;

            (function () {
                const d = document;
                const s = d.createElement("script");
                s.src = "https://client.crisp.chat/l.js";
                s.async = true;
                d.getElementsByTagName("head")[0].appendChild(s);
            })();
        } else {
            console.warn('[Crisp] No VITE_CRISP_WEBSITE_ID found, skipping initialization.');
        }
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
