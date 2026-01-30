// This file configures the initialization of Sentry on the client side.
// The config you add here will be used whenever a user loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { getConfig } from "./src/lib/config";

const appConfig = getConfig();

Sentry.init({
    // Sentry DSN from environment variable
    dsn: appConfig.monitoring.sentryDsn || undefined,

    // Enable Sentry only in production or when explicitly enabled
    enabled: appConfig.features.errorTracking && !!appConfig.monitoring.sentryDsn,

    // Environment
    environment: appConfig.monitoring.sentryEnvironment,

    // Release version
    release: `goinvestme@${appConfig.version}`,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: appConfig.monitoring.sentryTracesSampleRate,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: appConfig.features.debugMode,

    replaysOnErrorSampleRate: 1.0,

    // This sets the sample rate to be 10%.You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: appConfig.isProduction ? 0.1 : 1.0,

    // You can remove this option if you're not planning to use the Sentry Session Replay feature:
    integrations: [
        Sentry.replayIntegration({
            // Additional Replay configuration goes in here, for example:
            maskAllText: true,
            blockAllMedia: true,
        }),
        Sentry.browserTracingIntegration(),
    ],

    // Filter out transactions we don't care about
    beforeSend(event, hint) {
        // Filter out known browser extensions
        if (event.exception?.values?.[0]?.stacktrace?.frames?.some(
            frame => frame.filename?.includes('chrome-extension://')
        )) {
            return null;
        }

        // Filter out network errors from third-party services
        if (event.exception?.values?.[0]?.value?.includes('Failed to fetch')) {
            return null;
        }

        return event;
    },

    // Ignore certain errors
    ignoreErrors: [
        // Browser extension errors
        'top.GLOBALS',
        'MetaMask',
        // Network errors
        'Network request failed',
        'NetworkError',
        // User cancellations
        'User rejected',
        'User denied',
    ],
});
