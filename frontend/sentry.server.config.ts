// This file configures the initialization of Sentry on the server side.
// The config you add here will be used whenever the server handles a request.
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

    // Server-side integrations
    integrations: [],

    // Filter errors
    beforeSend(event, hint) {
        // Don't send errors in development unless explicitly enabled
        if (appConfig.isDevelopment && !process.env.SENTRY_DEV) {
            return null;
        }

        return event;
    },
});
