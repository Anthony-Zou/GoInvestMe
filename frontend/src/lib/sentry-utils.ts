/**
 * Sentry Error Reporting Utilities
 * 
 * Helper functions for reporting errors and events to Sentry.
 * 
 * @module sentry-utils
 */

import * as Sentry from '@sentry/nextjs'
import { getConfig } from './config'
import { logError, logWarning } from './logger'

const config = getConfig()

/**
 * Check if Sentry is enabled
 */
function isSentryEnabled(): boolean {
    return config.features.errorTracking && !!config.monitoring.sentryDsn
}

/**
 * Capture exception with Sentry and log it
 * 
 * @param error - Error object or message
 * @param context - Additional context
 * @param level - Error level (default: 'error')
 * 
 * @example
 * ```typescript
 * try {
 *   await someOperation()
 * } catch (err) {
 *   captureError(err, {
 *     operation: 'someOperation',
 *     userId: address
 *   })
 * }
 * ```
 */
export function captureError(
    error: Error | string,
    context?: Record<string, any>,
    level: Sentry.SeverityLevel = 'error'
): string | undefined {
    const err = error instanceof Error ? error : new Error(error)

    // Log to Winston
    logError(err.message, {
        error: err.message,
        errorStack: err.stack,
        ...context,
    })

    // Send to Sentry if enabled
    if (isSentryEnabled()) {
        return Sentry.captureException(err, {
            level,
            extra: context,
        })
    }

    return undefined
}

/**
 * Capture message with Sentry
 * 
 * @param message - Message to capture
 * @param level - Severity level
 * @param context - Additional context
 */
export function captureMessage(
    message: string,
    level: Sentry.SeverityLevel = 'info',
    context?: Record<string, any>
): string | undefined {
    // Log appropriately based on level
    if (level === 'error') {
        logError(message, context)
    } else if (level === 'warning') {
        logWarning(message, context)
    }

    // Send to Sentry if enabled
    if (isSentryEnabled()) {
        return Sentry.captureMessage(message, {
            level,
            extra: context,
        })
    }

    return undefined
}

/**
 * Set user context for error tracking
 * 
 * @param address - User's wallet address
 * @param data - Additional user data
 */
export function setUser(address: string, data?: Record<string, any>): void {
    if (isSentryEnabled()) {
        Sentry.setUser({
            id: address,
            username: address,
            ...data,
        })
    }
}

/**
 * Clear user context
 */
export function clearUser(): void {
    if (isSentryEnabled()) {
        Sentry.setUser(null)
    }
}

/**
 * Add breadcrumb for debugging
 * 
 * @param message - Breadcrumb message
 * @param category - Category (e.g., 'navigation', 'transaction')
 * @param data - Additional data
 * @param level - Severity level
 */
export function addBreadcrumb(
    message: string,
    category: string = 'default',
    data?: Record<string, any>,
    level: Sentry.SeverityLevel = 'info'
): void {
    if (isSentryEnabled()) {
        Sentry.addBreadcrumb({
            message,
            category,
            data,
            level,
            timestamp: Date.now() / 1000,
        })
    }
}

/**
 * Set transaction context
 * 
 * @param txHash - Transaction hash
 * @param action - Transaction action
 * @param data - Additional transaction data
 */
export function setTransactionContext(
    txHash: string,
    action: string,
    data?: Record<string, any>
): void {
    if (isSentryEnabled()) {
        Sentry.setContext('transaction', {
            hash: txHash,
            action,
            network: config.network,
            chainId: config.chainId,
            ...data,
        })
    }
}

/**
 * Set contract context
 * 
 * @param address - Contract address
 * @param functionName - Function being called
 * @param args - Function arguments
 */
export function setContractContext(
    address: string,
    functionName: string,
    args?: any[]
): void {
    if (isSentryEnabled()) {
        Sentry.setContext('contract', {
            address,
            functionName,
            args,
            network: config.network,
        })
    }
}

/**
 * Start a performance span
 * 
 * @param name - Span name
 * @param op - Operation type
 * @param callback - Function to execute within span
 * @returns Result of callback
 * 
 * @example
 * ```typescript
 * const data = await startSpan('loadEntrepreneurs', 'query', async (span) => {
 *   const result = await loadData()
 *   span?.setStatus({ code: 1 }) // OK
 *   return result
 * })
 * ```
 */
export function startSpan<T>(
    name: string,
    op: string = 'custom',
    callback: (span?: any) => Promise<T>
): Promise<T> {
    if (isSentryEnabled() && config.features.performanceMonitoring) {
        return Sentry.startSpan(
            {
                name,
                op,
            },
            callback
        )
    }

    return callback(undefined)
}

/**
 * Capture transaction error
 * 
 * @param action - Transaction action that failed
 * @param error - Error object
 * @param txHash - Optional transaction hash
 * @param context - Additional context
 */
export function captureTransactionError(
    action: string,
    error: Error | string,
    txHash?: string,
    context?: Record<string, any>
): string | undefined {
    const err = error instanceof Error ? error : new Error(error)

    // Add breadcrumb
    addBreadcrumb(
        `Transaction ${action} failed`,
        'transaction',
        { txHash, ...context },
        'error'
    )

    // Capture error
    return captureError(err, {
        action,
        transactionHash: txHash,
        network: config.network,
        chainId: config.chainId,
        ...context,
    })
}

/**
 * Capture wallet connection error
 * 
 * @param connector - Wallet connector name
 * @param error - Error object
 * @param context - Additional context
 */
export function captureWalletError(
    connector: string,
    error: Error | string,
    context?: Record<string, any>
): string | undefined {
    return captureError(error, {
        connector,
        category: 'wallet',
        ...context,
    })
}

/**
 * Capture RPC error
 * 
 * @param method - RPC method
 * @param error - Error object
 * @param context - Additional context
 */
export function captureRPCError(
    method: string,
    error: Error | string,
    context?: Record<string, any>
): string | undefined {
    return captureError(error, {
        method,
        category: 'rpc',
        network: config.network,
        ...context,
    })
}

/**
 * Wrap async function with error capturing
 * 
 * @param fn - Function to wrap
 * @param errorContext - Context to add to errors
 * @returns Wrapped function
 * 
 * @example
 * ```typescript
 * const safeFetch = withErrorCapture(
 *   async () => fetch('/api/data'),
 *   { operation: 'fetchData' }
 * )
 * ```
 */
export function withErrorCapture<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    errorContext?: Record<string, any>
): T {
    return (async (...args: any[]) => {
        try {
            return await fn(...args)
        } catch (error) {
            captureError(error as Error, {
                function: fn.name,
                arguments: args,
                ...errorContext,
            })
            throw error
        }
    }) as T
}

/**
 * Show user feedback dialog (Sentry user feedback)
 * 
 * @param eventId - Sentry event ID
 */
export function showFeedbackDialog(eventId?: string): void {
    if (isSentryEnabled() && eventId) {
        const client = Sentry.getClient()
        if (client) {
            Sentry.showReportDialog({
                eventId,
                title: 'It looks like we\'re having issues.',
                subtitle: 'Our team has been notified.',
                subtitle2: 'If you\'d like to help, tell us what happened below.',
                labelComments: 'What happened?',
                labelClose: 'Close',
                labelSubmit: 'Submit',
                errorGeneric: 'An unknown error occurred while submitting your report. Please try again.',
                errorFormEntry: 'Some fields were invalid. Please correct the errors and try again.',
                successMessage: 'Your feedback has been sent. Thank you!',
            })
        }
    }
}

/**
 * Export Sentry instance for advanced usage
 */
export { Sentry }

/**
 * Export default
 */
export default {
    captureError,
    captureMessage,
    setUser,
    clearUser,
    addBreadcrumb,
    setTransactionContext,
    setContractContext,
    startSpan,
    captureTransactionError,
    captureWalletError,
    captureRPCError,
    withErrorCapture,
    showFeedbackDialog,
    Sentry,
}
