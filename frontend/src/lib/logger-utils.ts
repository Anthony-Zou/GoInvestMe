/**
 * Logging Utilities
 * 
 * Helper functions for common logging scenarios in the GoInvestMe application.
 * 
 * @module logger-utils
 */

import { logInfo, logError, logWarning, logDebug, type LogContext } from './logger'

/**
 * Log a blockchain transaction
 * 
 * @param action - Transaction action (e.g., 'buyCoin', 'createCoin')
 * @param txHash - Transaction hash
 * @param context - Additional context
 * 
 * @example
 * ```typescript
 * logTransaction('buyCoin', tx.hash, {
 *   entrepreneur: '0x123...',
 *   amount: '10',
 *   value: '0.001 ETH'
 * })
 * ```
 */
export function logTransaction(
    action: string,
    txHash: string,
    context?: LogContext
): void {
    logInfo(`Transaction ${action}`, {
        action,
        transactionHash: txHash,
        ...context,
    })
}

/**
 * Log a transaction error
 * 
 * @param action - Transaction action that failed
 * @param error - Error object or message
 * @param context - Additional context
 */
export function logTransactionError(
    action: string,
    error: Error | string,
    context?: LogContext
): void {
    const errorMessage = error instanceof Error ? error.message : error
    const errorStack = error instanceof Error ? error.stack : undefined

    logError(`Transaction ${action} failed`, {
        action,
        error: errorMessage,
        errorStack,
        ...context,
    })
}

/**
 * Log a transaction confirmation
 * 
 * @param action - Transaction action
 * @param txHash - Transaction hash
 * @param blockNumber - Block number where tx was mined
 * @param context - Additional context
 */
export function logTransactionConfirmation(
    action: string,
    txHash: string,
    blockNumber: number,
    context?: LogContext
): void {
    logInfo(`Transaction ${action} confirmed`, {
        action,
        transactionHash: txHash,
        blockNumber,
        ...context,
    })
}

/**
 * Log a user action
 * 
 * @param action - User action (e.g., 'connectWallet', 'viewProject')
 * @param userAddress - User's wallet address
 * @param context - Additional context
 */
export function logUserAction(
    action: string,
    userAddress?: string,
    context?: LogContext
): void {
    logInfo(`User action: ${action}`, {
        action,
        userId: userAddress,
        ...context,
    })
}

/**
 * Log a wallet connection event
 * 
 * @param address - Connected wallet address
 * @param connector - Connector name (e.g., 'MetaMask', 'WalletConnect')
 */
export function logWalletConnected(address: string, connector?: string): void {
    logInfo('Wallet connected', {
        userId: address,
        connector,
        action: 'connectWallet',
    })
}

/**
 * Log a wallet disconnection event
 * 
 * @param address - Disconnected wallet address
 */
export function logWalletDisconnected(address?: string): void {
    logInfo('Wallet disconnected', {
        userId: address,
        action: 'disconnectWallet',
    })
}

/**
 * Log an error with enhanced context
 * 
 * @param message - Error message
 * @param error - Error object
 * @param context - Additional context
 * 
 * @example
 * ```typescript
 * try {
 *   await someOperation()
 * } catch (err) {
 *   logErrorWithContext('Operation failed', err, {
 *     operation: 'someOperation',
 *     userId: address
 *   })
 * }
 * ```
 */
export function logErrorWithContext(
    message: string,
    error: Error | unknown,
    context?: LogContext
): void {
    const err = error instanceof Error ? error : new Error(String(error))

    logError(message, {
        error: err.message,
        errorStack: err.stack,
        errorName: err.name,
        ...context,
    })
}

/**
 * Log a performance metric
 * 
 * @param operation - Operation name
 * @param durationMs - Duration in milliseconds
 * @param context - Additional context
 */
export function logPerformance(
    operation: string,
    durationMs: number,
    context?: LogContext
): void {
    const level = durationMs > 3000 ? logWarning : logDebug

    level(`Performance: ${operation}`, {
        operation,
        duration: durationMs,
        durationFormatted: `${durationMs}ms`,
        ...context,
    })
}

/**
 * Create a performance timer
 * 
 * @param operation - Operation name
 * @returns Function to call when operation completes
 * 
 * @example
 * ```typescript
 * const endTimer = startPerformanceTimer('loadEntrepreneurs')
 * await loadEntrepreneurs()
 * endTimer({ count: entrepreneurs.length })
 * ```
 */
export function startPerformanceTimer(
    operation: string
): (context?: LogContext) => void {
    const startTime = Date.now()

    return (context?: LogContext) => {
        const duration = Date.now() - startTime
        logPerformance(operation, duration, context)
    }
}

/**
 * Log RPC call
 * 
 * @param method - RPC method name
 * @param params - RPC parameters
 * @param context - Additional context
 */
export function logRPCCall(
    method: string,
    params?: any[],
    context?: LogContext
): void {
    logDebug(`RPC call: ${method}`, {
        method,
        params,
        ...context,
    })
}

/**
 * Log RPC error
 * 
 * @param method - RPC method name
 * @param error - Error object or message
 * @param context - Additional context
 */
export function logRPCError(
    method: string,
    error: Error | string,
    context?: LogContext
): void {
    const errorMessage = error instanceof Error ? error.message : error

    logError(`RPC error: ${method}`, {
        method,
        error: errorMessage,
        ...context,
    })
}

/**
 * Log contract interaction
 * 
 * @param functionName - Contract function name
 * @param contractAddress - Contract address
 * @param args - Function arguments
 * @param context - Additional context
 */
export function logContractCall(
    functionName: string,
    contractAddress: string,
    args?: any[],
    context?: LogContext
): void {
    logDebug(`Contract call: ${functionName}`, {
        functionName,
        contractAddress,
        args,
        ...context,
    })
}

/**
 * Log navigation event
 * 
 * @param from - Previous page
 * @param to - New page
 * @param userAddress - User's wallet address
 */
export function logNavigation(
    from: string,
    to: string,
    userAddress?: string
): void {
    logDebug('Navigation', {
        from,
        to,
        userId: userAddress,
        action: 'navigate',
    })
}

/**
 * Log API call (for future backend)
 * 
 * @param endpoint - API endpoint
 * @param method - HTTP method
 * @param context - Additional context
 */
export function logAPICall(
    endpoint: string,
    method: string,
    context?: LogContext
): void {
    logDebug(`API call: ${method} ${endpoint}`, {
        endpoint,
        method,
        ...context,
    })
}

/**
 * Log API error (for future backend)
 * 
 * @param endpoint - API endpoint
 * @param method - HTTP method
 * @param error - Error object or message
 * @param statusCode - HTTP status code
 * @param context - Additional context
 */
export function logAPIError(
    endpoint: string,
    method: string,
    error: Error | string,
    statusCode?: number,
    context?: LogContext
): void {
    const errorMessage = error instanceof Error ? error.message : error

    logError(`API error: ${method} ${endpoint}`, {
        endpoint,
        method,
        error: errorMessage,
        statusCode,
        ...context,
    })
}

/**
 * Log application startup
 */
export function logAppStartup(): void {
    logInfo('Application started', {
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    })
}

/**
 * Log configuration loaded
 * 
 * @param config - Configuration summary (non-sensitive data only)
 */
export function logConfigLoaded(config: Record<string, any>): void {
    logDebug('Configuration loaded', config)
}

/**
 * Log feature flag usage
 * 
 * @param flagName - Feature flag name
 * @param enabled - Whether flag is enabled
 */
export function logFeatureFlag(flagName: string, enabled: boolean): void {
    logDebug(`Feature flag: ${flagName}`, {
        flagName,
        enabled,
    })
}
