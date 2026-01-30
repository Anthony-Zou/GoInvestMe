/**
 * Readiness Check API Endpoint
 * 
 * Comprehensive readiness check to verify the application is ready to serve traffic.
 * Checks critical dependencies and configurations.
 * 
 * Returns:
 * - 200 OK if ready to serve traffic
 * - 503 Service Unavailable if not ready
 * 
 * Used by:
 * - Load balancers (before routing traffic)
 * - Container orchestration (readiness probes)
 * - Deployment systems (health verification)
 * 
 * @route GET /api/ready
 */

import { NextResponse } from 'next/server'
import { getConfig } from '@/lib/config'
import { logInfo, logWarning, logError } from '@/lib/logger'

export const dynamic = 'force-dynamic' // Always run dynamically

interface DependencyCheck {
    name: string
    status: 'healthy' | 'degraded' | 'unhealthy'
    message?: string
    responseTime?: number
}

interface ReadinessResponse {
    ready: boolean
    status: 'ready' | 'degraded' | 'not_ready'
    timestamp: string
    version: string
    environment: string
    checks: DependencyCheck[]
    summary: {
        total: number
        healthy: number
        degraded: number
        unhealthy: number
    }
}

/**
 * Check configuration validity
 */
async function checkConfiguration(): Promise<DependencyCheck> {
    const startTime = Date.now()

    try {
        const config = getConfig()

        // Verify critical configuration
        const hasContractAddress = !!config.contracts.current
        const hasNetwork = !!config.network
        const hasChainId = !!config.chainId

        if (!hasContractAddress || !hasNetwork || !hasChainId) {
            return {
                name: 'configuration',
                status: 'unhealthy',
                message: 'Missing critical configuration',
                responseTime: Date.now() - startTime,
            }
        }

        return {
            name: 'configuration',
            status: 'healthy',
            message: 'Configuration valid',
            responseTime: Date.now() - startTime,
        }
    } catch (error) {
        return {
            name: 'configuration',
            status: 'unhealthy',
            message: error instanceof Error ? error.message : 'Configuration error',
            responseTime: Date.now() - startTime,
        }
    }
}

/**
 * Check RPC connectivity (optional, only if configured)
 */
async function checkRPC(): Promise<DependencyCheck> {
    const startTime = Date.now()
    const config = getConfig()

    // Skip if no custom RPC configured
    if (!config.rpc.sepoliaUrl && !config.rpc.mainnetUrl) {
        return {
            name: 'rpc',
            status: 'healthy',
            message: 'Using default RPC endpoints',
            responseTime: Date.now() - startTime,
        }
    }

    try {
        const rpcUrl = config.network === 'sepolia'
            ? config.rpc.sepoliaUrl
            : config.rpc.mainnetUrl

        if (!rpcUrl) {
            return {
                name: 'rpc',
                status: 'healthy',
                message: 'Using default RPC endpoint',
                responseTime: Date.now() - startTime,
            }
        }

        // Simple connectivity check (don't actually call RPC in readiness check)
        // In production, you might want to do a lightweight RPC call
        return {
            name: 'rpc',
            status: 'healthy',
            message: 'Custom RPC configured',
            responseTime: Date.now() - startTime,
        }
    } catch (error) {
        return {
            name: 'rpc',
            status: 'degraded',
            message: 'RPC check failed, will use defaults',
            responseTime: Date.now() - startTime,
        }
    }
}

/**
 * Check monitoring services
 */
async function checkMonitoring(): Promise<DependencyCheck> {
    const startTime = Date.now()
    const config = getConfig()

    // Check if error tracking is configured
    const hasErrorTracking = config.features.errorTracking && !!config.monitoring.sentryDsn

    if (hasErrorTracking) {
        return {
            name: 'monitoring',
            status: 'degraded',
            message: 'Error tracking not configured',
            responseTime: Date.now() - startTime,
        }
    }

    return {
        name: 'monitoring',
        status: 'healthy',
        message: 'Monitoring configured',
        responseTime: Date.now() - startTime,
    }
}

/**
 * Run all readiness checks
 */
async function runReadinessChecks(): Promise<DependencyCheck[]> {
    const checks = await Promise.all([
        checkConfiguration(),
        checkRPC(),
        checkMonitoring(),
    ])

    return checks
}

/**
 * Calculate readiness status
 */
function calculateReadiness(checks: DependencyCheck[]): {
    ready: boolean
    status: 'ready' | 'degraded' | 'not_ready'
} {
    const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length
    const degradedCount = checks.filter(c => c.status === 'degraded').length

    // Not ready if any unhealthy
    if (unhealthyCount > 0) {
        return { ready: false, status: 'not_ready' }
    }

    // Degraded if any degraded
    if (degradedCount > 0) {
        return { ready: true, status: 'degraded' }
    }

    // Ready if all healthy
    return { ready: true, status: 'ready' }
}

export async function GET() {
    const config = getConfig()

    try {
        // Run all checks
        const checks = await runReadinessChecks()

        // Calculate overall status
        const { ready, status } = calculateReadiness(checks)

        // Build response
        const response: ReadinessResponse = {
            ready,
            status,
            timestamp: new Date().toISOString(),
            version: config.version,
            environment: config.env,
            checks,
            summary: {
                total: checks.length,
                healthy: checks.filter(c => c.status === 'healthy').length,
                degraded: checks.filter(c => c.status === 'degraded').length,
                unhealthy: checks.filter(c => c.status === 'unhealthy').length,
            },
        }

        // Log based on status
        if (status === 'not_ready') {
            logError('Readiness check failed', response)
        } else if (status === 'degraded') {
            logWarning('Readiness check degraded', response)
        } else if (config.features.debugMode) {
            logInfo('Readiness check passed', response)
        }

        // Return appropriate status code
        const statusCode = ready ? 200 : 503

        return NextResponse.json(response, { status: statusCode })
    } catch (error) {
        logError('Readiness check error', {
            error: error instanceof Error ? error.message : 'Unknown error',
        })

        return NextResponse.json(
            {
                ready: false,
                status: 'not_ready',
                timestamp: new Date().toISOString(),
                version: config.version,
                environment: config.env,
                checks: [],
                summary: { total: 0, healthy: 0, degraded: 0, unhealthy: 0 },
                error: 'Internal server error',
            } as ReadinessResponse,
            { status: 503 }
        )
    }
}
