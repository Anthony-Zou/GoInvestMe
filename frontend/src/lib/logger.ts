/**
 * Centralized Logging Module
 * 
 * This module provides structured logging following 12 Factor App methodology.
 * All logs are written to stdout/stderr as event streams, suitable for aggregation.
 * 
 * Features:
 * - Structured JSON logging
 * - Multiple log levels (error, warn, info, debug)
 * - Contextual metadata
 * - Daily log rotation (server-side only)
 * - Environment-aware configuration
 * 
 * @module logger
/**
 * @module logger
 */

// Only import winston on server-side
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let winston: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let DailyRotateFile: any

if (typeof window === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    winston = require('winston')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    DailyRotateFile = require('winston-daily-rotate-file')
}

import { getConfig } from './config'

const config = getConfig()

/**
 * Log levels (from highest to lowest priority)
 */
export enum LogLevel {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug',
}

/**
 * Log context interface for structured logging
 */
export interface LogContext {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
    userId?: string
    transactionHash?: string
    contractAddress?: string
    network?: string
    duration?: number
    error?: Error | string
}

/**
 * Custom log format for development (human-readable)
 */
 
const developmentFormat = winston?.format?.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...metadata }: { timestamp: string; level: string; message: string;[key: string]: unknown }) => {
        let msg = `${timestamp} [${level}]: ${message}`

        // Add metadata if present
        if (Object.keys(metadata).length > 0) {
            msg += `\n${JSON.stringify(metadata, null, 2)}`
        }

        return msg
    })
)

/**
 * Custom log format for production (JSON)
 */
 
const productionFormat = winston?.format?.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
)

/**
 * Determine log level based on environment
 */
function getLogLevel(): string {
    if (config.isProduction) {
        return LogLevel.INFO
    }

    if (config.features.debugMode) {
        return LogLevel.DEBUG
    }

    return LogLevel.INFO
}

/**
 * Create console transport
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createConsoleTransport(): any {
     
    return new winston.transports.Console({
        format: config.isDevelopment ? developmentFormat : productionFormat,
        stderrLevels: [LogLevel.ERROR],
    })
}

/**
 * Create file transport for errors
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createErrorFileTransport(): any {
     
    return new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: LogLevel.ERROR,
        maxFiles: '14d', // Keep 14 days
        maxSize: '20m',
        format: productionFormat,
    })
}

/**
 * Create file transport for all logs
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createCombinedFileTransport(): any {
     
    return new DailyRotateFile({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: '14d', // Keep 14 days
        maxSize: '20m',
        format: productionFormat,
    })
}

/**
 * Create Winston logger instance (server-side only)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createLogger(): any | null {
    // Only create logger on server-side
    if (typeof window !== 'undefined') {
        return null
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transports: any[] = [createConsoleTransport()]

    // Add file transports in Node.js environment
    transports.push(createErrorFileTransport())
    transports.push(createCombinedFileTransport())

     
    return winston.createLogger({
        level: getLogLevel(),
        format: config.isProduction ? productionFormat : productionFormat,
        defaultMeta: {
            service: config.appName,
            environment: config.env,
            version: config.version,
            network: config.network,
        },
        transports,
        // Don't exit on uncaught exceptions, let the app handle them
        exitOnError: false,
    })
}

/**
 * Singleton logger instance (server-side only)
 */
const logger = createLogger()

/**
 * Client-safe logging fallback
 */
 
function clientLog(level: string, message: string, context?: LogContext) {
    if (typeof window !== 'undefined') {
        const ctx = context ? ` ${JSON.stringify(context)}` : ''
        const logFn = (console as any)[level] || console.log
        logFn(`[${level.toUpperCase()}] ${message}${ctx}`)
    }
}

/**
 * Log error message with context
 * 
 * @param message - Error message
 * @param context - Additional context
 * 
 * @example
 * ```typescript
 * logError('Transaction failed', {
 *   transactionHash: '0x123...',
 *   error: err,
 *   userId: address
 * })
 * ```
 */
export function logError(message: string, context?: LogContext): void {
    if (logger) {
        logger.error(message, context)
    } else {
        clientLog('error', message, context)
    }
}

/**
 * Log warning message with context
 * 
 * @param message - Warning message
 * @param context - Additional context
 */
export function logWarning(message: string, context?: LogContext): void {
    if (logger) {
        logger.warn(message, context)
    } else {
        clientLog('warn', message, context)
    }
}

/**
 * Log info message with context
 * 
 * @param message - Info message
 * @param context - Additional context
 */
export function logInfo(message: string, context?: LogContext): void {
    if (logger) {
        logger.info(message, context)
    } else {
        clientLog('info', message, context)
    }
}

/**
 * Log debug message with context
 * Only logged if debug mode is enabled
 * 
 * @param message - Debug message
 * @param context - Additional context
 */
export function logDebug(message: string, context?: LogContext): void {
    if (config.features.debugMode || config.features.verboseLogs) {
        if (logger) {
            logger.debug(message, context)
        } else {
            clientLog('debug', message, context)
        }
    }
}

/**
 * Export logger instance for advanced usage (server-side only)
 */
export { logger }

/**
 * Export for default import
 */
const loggerExport = {
    error: logError,
    warn: logWarning,
    info: logInfo,
    debug: logDebug,
    logger,
}

export default loggerExport
