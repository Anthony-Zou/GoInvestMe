/**
 * Error Boundary Component
 * 
 * Catches and handles errors in React component tree.
 * Integrates with Sentry for error reporting.
 * 
 * @module ErrorBoundary
 */

'use client'

import React, { Component, ReactNode } from 'react'
import * as Sentry from '@sentry/nextjs'
import { logError } from '@/lib/logger'

interface Props {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
    hasError: boolean
    error: Error | null
}

/**
 * Error Boundary Component
 * 
 * Wraps components to catch and handle errors gracefully.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
        }
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log to Sentry
        Sentry.captureException(error, {
            contexts: {
                react: {
                    componentStack: errorInfo.componentStack,
                },
            },
        })

        // Log to Winston
        logError('React component error', {
            error: error.message,
            errorStack: error.stack,
            componentStack: errorInfo.componentStack,
        })

        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback
            }

            // Default fallback UI
            return (
                <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
                        <div className="mb-4 flex items-center justify-center">
                            <svg
                                className="h-12 w-12 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>

                        <h1 className="mb-2 text-center text-xl font-bold text-gray-900">
                            Oops! Something went wrong
                        </h1>

                        <p className="mb-6 text-center text-gray-600">
                            We encountered an unexpected error. Our team has been notified and is working on a fix.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 rounded-md bg-red-50 p-4">
                                <h3 className="text-sm font-medium text-red-800">
                                    Error Details (Development Only):
                                </h3>
                                <pre className="mt-2 text-xs text-red-700 overflow-auto">
                                    {this.state.error.message}
                                </pre>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition hover:bg-gray-50"
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

/**
 * Higher-order component to wrap a component with error boundary
 * 
 * @param Component - Component to wrap
 * @param fallback - Optional custom fallback UI
 * @returns Wrapped component
 * 
 * @example
 * ```tsx
 * const SafeComponent = withErrorBoundary(MyComponent)
 * ```
 */
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundary(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <Component {...props} />
            </ErrorBoundary>
        )
    }
}
