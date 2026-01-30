/**
 * Status API Endpoint
 * 
 * Comprehensive application status endpoint providing detailed
 * system information, metrics, and health indicators.
 * 
 * This is more detailed than /health and /ready - useful for:
 * - Dashboards
 * - System administrators
 * - Debugging
 * - Monitoring systems
 * 
 * @route GET /api/status
 */

import { NextResponse } from 'next/server'
import { getConfig } from '@/lib/config'
import { logDebug } from '@/lib/logger'

export const dynamic = 'force-dynamic'

interface SystemInfo {
    nodeVersion: string
    platform: string
    architecture: string
    memory: {
        total: number
        free: number
        used: number
        usagePercent: number
    }
    uptime: number
}

interface StatusResponse {
    status: 'operational' | 'degraded' | 'down'
    timestamp: string
    version: string
    environment: string
    network: {
        name: string
        chainId: number
        contract: string
    }
    features: {
        errorTracking: boolean
        analytics: boolean
        performanceMonitoring: boolean
        debugMode: boolean
    }
    system: SystemInfo
}

/**
 * Get system information
 */
function getSystemInfo(): SystemInfo {
    const totalMemory = process.memoryUsage().heapTotal
    const usedMemory = process.memoryUsage().heapUsed
    const freeMemory = totalMemory - usedMemory

    return {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        memory: {
            total: totalMemory,
            free: freeMemory,
            used: usedMemory,
            usagePercent: (usedMemory / totalMemory) * 100,
        },
        uptime: process.uptime(),
    }
}

export async function GET() {
    const config = getConfig()

    try {
        const response: StatusResponse = {
            status: 'operational',
            timestamp: new Date().toISOString(),
            version: config.version,
            environment: config.env,
            network: {
                name: config.network,
                chainId: config.chainId,
                contract: config.contracts.current,
            },
            features: {
                errorTracking: config.features.errorTracking,
                analytics: config.features.analytics,
                performanceMonitoring: config.features.performanceMonitoring,
                debugMode: config.features.debugMode,
            },
            system: getSystemInfo(),
        }

        logDebug('Status check', {
            status: response.status,
            version: response.version,
            environment: response.environment,
        })

        return NextResponse.json(response, { status: 200 })
    } catch {
        return NextResponse.json(
            {
                error: 'Failed to retrieve system status',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        )
    }
}
