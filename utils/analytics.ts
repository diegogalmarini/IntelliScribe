/**
 * Centralized Google Analytics (GA4) Utility
 * 
 * Handles initialization, route tracking, and custom event reporting.
 * Respects user consent provided via CookieConsentBanner.
 */

const GA_MEASUREMENT_ID = 'G-H50QCZL8CS';

// Declare gtag for TypeScript
declare global {
    interface Window {
        dataLayer: any[];
        gtag?: (...args: any[]) => void;
    }
}

let isInitialized = false;

/**
 * Initializes GA4 dynamically.
 * Should be called when user grants analytics consent.
 */
export const initGA = () => {
    if (typeof window === 'undefined' || isInitialized) return;

    console.log("📊 [Analytics] Initializing GA4...");

    // 1. Ensure dataLayer exists
    window.dataLayer = window.dataLayer || [];

    // 2. Define gtag function
    if (!window.gtag) {
        window.gtag = function () {
            window.dataLayer.push(arguments);
        };
    }

    // 3. Configure basic settings
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
        send_page_view: false // We will handle page views manually to support SPA routing
    });

    // 4. Load the script tag if not exists
    if (!document.querySelector(`script[src*="${GA_MEASUREMENT_ID}"]`)) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        document.head.appendChild(script);
    }

    isInitialized = true;
};

/**
 * Tracks a page view event.
 * @param path The relative path (e.g., '/dashboard')
 * @param title Optional page title
 */
export const trackPageView = (path: string, title?: string) => {
    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title || document.title,
        send_to: GA_MEASUREMENT_ID
    });

    if (process.env.NODE_ENV === 'development') {
        console.log(`📊 [Analytics] PageView: ${path}`);
    }
};

/**
 * Tracks a custom event.
 * @param eventName Name of the event (snake_case recommended)
 * @param params Additional event parameters
 */
export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('event', eventName, {
        ...params,
        send_to: GA_MEASUREMENT_ID
    });

    if (process.env.NODE_ENV === 'development') {
        console.log(`📊 [Analytics] Event: ${eventName}`, params);
    }
};

/**
 * Sets user properties in GA4.
 * @param properties Key-value pairs of user properties
 */
export const setUserProperties = (properties: Record<string, any>) => {
    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('set', 'user_properties', properties);

    if (process.env.NODE_ENV === 'development') {
        console.log("📊 [Analytics] UserProperties:", properties);
    }
};
