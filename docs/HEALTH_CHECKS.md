# Health Check Documentation

## Overview

GoInvestMe provides three health check endpoints for monitoring and observability:

1. **`/api/health`** - Simple liveness check
2. **`/api/ready`** - Comprehensive readiness check with dependency validation
3. **`/api/status`** - Detailed system status and metrics

These endpoints follow industry standards and are compatible with container orchestration platforms (Docker, Kubernetes), load balancers, and monitoring systems.

---

## Endpoints

### 1. `/api/health` - Liveness Probe

**Purpose**: Quick health check to verify the application is alive and responding.

**Use Cases**:
- Load balancer health checks
- Kubernetes liveness probes
- Uptime monitoring (Pingdom, UptimeRobot)
- Simple availability monitoring

**Request**:
```bash
GET /api/health
```

**Response** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2026-01-30T11:22:16.902Z",
  "uptime": 1344.467,
  "environment": "development",
  "version": "1.0.0",
  "service": "GoInvestMe"
}
```

**Fields**:
- `status`: Always `"healthy"` if responding
- `timestamp`: Current server time (ISO 8601)
- `uptime`: Process uptime in seconds
- `environment`: Current environment (development/staging/production)
- `version`: Application version
- `service`: Service name

**Response Codes**:
- `200`: Application is healthy

---

### 2. `/api/ready` - Readiness Probe

**Purpose**: Comprehensive readiness check to verify the application is ready to accept traffic.

**Use Cases**:
- Kubernetes readiness probes
- Load balancer traffic routing decisions
- Deployment health verification
- Dependency health monitoring

**Request**:
```bash
GET /api/ready
```

**Response** (200 OK when ready, 503 when not ready):
```json
{
  "ready": true,
  "status": "ready",
  "timestamp": "2026-01-30T11:22:22.294Z",
  "version": "1.0.0",
  "environment": "development",
  "checks": [
    {
      "name": "configuration",
      "status": "healthy",
      "message": "Configuration valid",
      "responseTime": 0
    },
    {
      "name": "rpc",
      "status": "healthy",
      "message": "Using default RPC endpoints",
      "responseTime": 0
    },
    {
      "name": "monitoring",
      "status": "degraded",
      "message": "Error tracking not configured",
      "responseTime": 0
    }
  ],
  "summary": {
    "total": 3,
    "healthy": 2,
    "degraded": 1,
    "unhealthy": 0
  }
}
```

**Fields**:
- `ready`: Boolean indicating if app can accept traffic
- `status`: Overall status (`ready`, `degraded`, `not_ready`)
- `timestamp`: Current server time
- `version`: Application version
- `environment`: Current environment
- `checks`: Array of individual dependency checks
- `summary`: Aggregated check statistics

**Check Statuses**:
- `healthy`: Dependency is fully operational
- `degraded`: Dependency has issues but app can still function
- `unhealthy`: Dependency is down (makes app not ready)

**Response Codes**:
- `200`: Application is ready
- `503`: Application is not ready (unhealthy dependencies)

**Dependency Checks**:

1. **Configuration Check**
   - Validates critical environment variables
   - Checks contract address, network, and chain ID

2. **RPC Check**
   - Verifies RPC configuration
   - Confirms connectivity to blockchain nodes

3. **Monitoring Check**
   - Validates error tracking setup (Sentry)
   - Checks logging configuration

---

### 3. `/api/status` - System Status

**Purpose**: Detailed system information for debugging and monitoring dashboards.

**Use Cases**:
- System administration dashboards
- Detailed monitoring systems (Datadog, New Relic)
- Debugging and troubleshooting
- Performance monitoring

**Request**:
```bash
GET /api/status
```

**Response** (200 OK):
```json
{
  "status": "operational",
  "timestamp": "2026-01-30T11:22:22.594Z",
  "version": "1.0.0",
  "environment": "development",
  "network": {
    "name": "sepolia",
    "chainId": 11155111,
    "contract": "0x8b23a938d1a52588de989a8967a51e2dde0f494f"
  },
  "features": {
    "errorTracking": false,
    "analytics": false,
    "performanceMonitoring": false,
    "debugMode": true
  },
  "system": {
    "nodeVersion": "v24.11.1",
    "platform": "darwin",
    "architecture": "arm64",
    "memory": {
      "total": 294715392,
      "free": 28926360,
      "used": 265789032,
      "usagePercent": 90.18
    },
    "uptime": 1350.159
  }
}
```

**Fields**:
- `status`: Overall system status (`operational`, `degraded`, `down`)
- `timestamp`: Current server time
- `version`: Application version
- `environment`: Current environment
- `network`: Blockchain network configuration
- `features`: Enabled/disabled feature flags
- `system`: Node.js runtime and resource metrics

**Response Codes**:
- `200`: Status retrieved successfully
- `500`: Error retrieving status

---

## Usage Examples

### Kubernetes Configuration

**Liveness Probe**:
```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

**Readiness Probe**:
```yaml
readinessProbe:
  httpGet:
    path: /api/ready
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 2
```

### Docker Healthcheck

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
```

### Load Balancer (NGINX)

```nginx
upstream goinvestme {
  least_conn;
  server app1:3000 max_fails=3 fail_timeout=30s;
  server app2:3000 max_fails=3 fail_timeout=30s;
}

location /api/health {
  proxy_pass http://goinvestme;
  proxy_connect_timeout 3s;
  proxy_send_timeout 3s;
  proxy_read_timeout 3s;
}
```

### Monitoring Scripts

**Simple Uptime Check**:
```bash
#!/bin/bash
# Check if service is up
status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)

if [ $status -eq 200 ]; then
  echo "Service is healthy"
  exit 0
else
  echo "Service is down"
  exit 1
fi
```

**Readiness Check**:
```bash
#!/bin/bash
# Check if service is ready
response=$(curl -s http://localhost:3000/api/ready)
ready=$(echo $response | jq -r '.ready')

if [ "$ready" = "true" ]; then
  echo "Service is ready"
  exit 0
else
echo "Service is not ready"
  echo $response | jq '.checks[] | select(.status != "healthy")'
  exit 1
fi
```

**Status Monitoring**:
```bash
#!/bin/bash
# Get detailed system status
curl -s http://localhost:3000/api/status | jq '
{
  status: .status,
  version: .version,
  memory_usage: .system.memory.usagePercent,
  uptime_hours: (.system.uptime / 3600 | floor)
}'
```

---

## Monitoring Integration

### Datadog

```yaml
init_config:

instances:
  - name: goinvestme
    url: http://localhost:3000/api/health
    timeout: 3
    tags:
      - service:goinvestme
      - env:production
```

### Prometheus

```yaml
- job_name: 'goinvestme'
  metrics_path: '/api/status'
  static_configs:
    - targets: ['localhost:3000']
      labels:
        service: 'goinvestme'
```

### Pingdom/UptimeRobot

- **URL**: `https://your-domain.com/api/health`
- **Check Interval**: 60 seconds
- **Timeout**: 5 seconds
- **Expected Status**: 200

---

## Best Practices

### 1. **Use Different Probes for Different Purposes**
- **Liveness**: Use `/api/health` for fast, simple checks
- **Readiness**: Use `/api/ready` before routing traffic
- **Monitoring**: Use `/api/status` for detailed metrics

### 2. **Set Appropriate Timeouts**
- Health check: 3-5 seconds
- Readiness check: 3-5 seconds
- Status check: 5-10 seconds

### 3. **Configure Retry Logic**
- Allow 3-5 failures before marking as unhealthy
- Use exponential backoff for retries

### 4. **Monitor Trends**
- Track response time trends
- Alert on degraded status
- Monitor memory usage

### 5. **Security**
- Health checks don't require authentication
- Status endpoints may expose system info (consider restricting in production)
- Use HTTPS in production

---

## Troubleshooting

### Service Marked as Unhealthy

1. Check `/api/ready` to see which dependencies are failing
2. Review logs for error messages
3. Verify environment variables are set correctly
4. Check RPC connectivity

### Readiness Check Returns `degraded`

- Service is operational but has non-critical issues
- Review `checks` array to identify degraded components
- Address warnings but traffic routing should continue

### High Memory Usage

- Monitor `/api/status` system.memory.usagePercent
- Consider restarting if above 90%
- Review application for memory leaks

---

## Response Time SLAs

Target response times for health endpoints:

- `/api/health`: < 100ms (p95)
- `/api/ready`: < 500ms (p95)
- `/api/status`: < 1000ms (p95)

If response times exceed these targets, investigate performance issues.

---

## See Also

- [12 Factor App: Disposability](https://12factor.net/disposability)
- [Kubernetes Probes Documentation](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Docker Healthcheck Reference](https://docs.docker.com/engine/reference/builder/#healthcheck)
