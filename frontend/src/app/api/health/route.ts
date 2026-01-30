/**
 * Health Check API Endpoint
 * 
 * Simple health check endpoint to verify the application is running.
 * Returns 200 OK if the application is alive.
 * 
 * This endpoint is used by:
 * - Load balancers
 * - Container orchestration (Docker, Kubernetes)
 * - Monitoring systems (Datadog, New Relic)
 * - Uptime monitors (Pingdom, UptimeRobot)
 * 
 * @route GET /api/health
 */

import { NextResponse } from 'next/server'
import { getConfig } from '@/lib/config'
import { logInfo } from '@/lib/logger'

export const dynamic = 'force-dynamic' // Always run dynamically

export async function GET() {
    const config = getConfig()

    const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.env,
        version: config.version,
        service: config.appName,
    }

    // Log health check (only in debug mode to avoid log spam)
    if (config.features.debugMode) {
        logInfo('Health check', healthData)
    }

    return NextResponse.json(healthData, { status: 200 })
}
