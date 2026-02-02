/**
 * api/_utils/sentry.ts
 * 
 * Centralized Sentry initialization for Vercel Functions.
 */

import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

let initialized = false;

export function initSentry() {
    if (initialized) return;

    if (process.env.VITE_SENTRY_DSN) {
        console.log("[SENTRY] Initializing Backend Tracking...");
        Sentry.init({
            dsn: process.env.VITE_SENTRY_DSN,
            integrations: [
                nodeProfilingIntegration(),
            ],
            // Performance Monitoring
            tracesSampleRate: 1.0, // Backend logic is critical, track all for now
            // Set sampling rate for profiling - this is relative to tracesSampleRate
            profilesSampleRate: 1.0,
            environment: process.env.VERCEL_ENV || 'development',
        });
        initialized = true;
    } else {
        console.warn("[SENTRY] VITE_SENTRY_DSN missing in environment.");
    }
}

export { Sentry };
