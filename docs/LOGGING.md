# Logging Guide - GoInvestMe

## Overview

GoInvestMe implements structured logging following the [12 Factor App](https://12factor.net/logs) methodology. Logs are treated as event streams, written to stdout/stderr, and suitable for aggregation by external log management systems.

## Quick Start

### Basic Logging

```typescript
import { logInfo, logError, logWarning, logDebug } from '@/lib/logger'

// Log information
logInfo('User connected wallet', { userId: address })

// Log errors
logError('Transaction failed', { 
  transactionHash: tx.hash,
  error: err.message 
})

// Log warnings
logWarning('Slow RPC response', { duration: 5000 })

// Log debug info (only in development)
logDebug('Contract call details', { functionName: 'buyCoin', args })
```

### Using Logging Utilities

```typescript
import { 
  logTransaction,
  logTransactionError,
  logWalletConnected,
  startPerformanceTimer
} from '@/lib/logger-utils'

// Log transactions
logTransaction('buyCoin', tx.hash, {
  entrepreneur: '0x123...',
  amount: '10'
})

// Log wallet connection
logWalletConnected(address, 'MetaMask')

// Performance monitoring
const endTimer = startPerformanceTimer('loadEntrepreneurs')
await loadEntrepreneurs()
endTimer({ count: entrepreneurs.length })
```

## Log Levels

Logs are categorized by severity:

| Level | When to Use | Example |
|-------|-------------|---------|
| **ERROR** | Application errors, failed transactions, exceptions | Transaction reverted, Network error |
| **WARN** | Warning conditions, degraded performance, recoverable issues | Slow response time, Deprecated API usage |
| **INFO** | Normal application flow, user actions, important events | Wallet connected, Transaction confirmed |
| **DEBUG** | Detailed diagnostic information | RPC calls, Contract interactions, State changes |

### Log Level Configuration

Log level is automatically set based on environment:

- **Production**: `INFO` and above (ERROR, WARN, INFO)
- **Development**: `DEBUG` and above (all levels)
- **Debug Mode**: `DEBUG` and above (controlled by `NEXT_PUBLIC_DEBUG_MODE`)

## Log Format

### Development Format

Human-readable format with colors:

```
2026-01-30 19:00:00 [info]: Wallet connected
{
  "userId": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "connector": "MetaMask"
}
```

### Production Format

Structured JSON for log aggregation:

```json
{
  "timestamp": "2026-01-30T11:00:00.000Z",
  "level": "info",
  "message": "Wallet connected",
  "service": "GoInvestMe",
  "environment": "production",
  "version": "1.0.0",
  "network": "mainnet",
  "userId": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "connector": "MetaMask"
}
```

## Log Storage

### File Locations

| File Pattern | Description | Retention |
|--------------|-------------|-----------|
| `logs/combined-YYYY-MM-DD.log` | All logs (INFO and above) | 14 days |
| `logs/error-YYYY-MM-DD.log` | Error logs only | 14 days |

### Log Rotation

- **Rotation**: Daily at midnight
- **Retention**: 14 days
- **Max Size**: 20MB per file
- **Compression**: Old files are compressed

### Example

```
logs/
├── combined-2026-01-30.log     (today's logs)
├── combined-2026-01-29.log     (yesterday)
├── combined-2026-01-28.log.gz  (compressed)
├── error-2026-01-30.log
├── error-2026-01-29.log
└── .gitignore
```

## Logging Best Practices

### 1. Include Context

Always include relevant context with logs:

```typescript
// ❌ Bad: No context
logError('Transaction failed')

// ✅ Good: With context
logError('Transaction failed', {
  transactionHash: tx.hash,
  entrepreneur: entrepreneurAddress,
  amount: amount.toString(),
  error: err.message,
  errorStack: err.stack
})
```

### 2. Use Structured Data

Log data as structured objects, not strings:

```typescript
// ❌ Bad: String interpolation
logInfo(`User ${address} purchased ${amount} tokens`)

// ✅ Good: Structured data
logInfo('Token purchase', {
  userId: address,
  amount: amount.toString(),
  action: 'purchase'
})
```

### 3. Log User Actions

Track important user interactions:

```typescript
import { logUserAction } from '@/lib/logger-utils'

// User connects wallet
logUserAction('connectWallet', address, { connector: 'MetaMask' })

// User views project
logUserAction('viewProject', address, { 
  projectId: entrepreneurAddress 
})

// User initiates purchase
logUserAction('initiatePurchase', address, { 
  entrepreneur: entrepreneurAddress,
  amount: amount.toString()
})
```

### 4. Log Transactions

Track all blockchain interactions:

```typescript
import { 
  logTransaction,
  logTransactionConfirmation,
  logTransactionError
} from '@/lib/logger-utils'

try {
  // Initiate transaction
  const tx = await contract.buyCoin(entrepreneur, amount, { value })
  logTransaction('buyCoin', tx.hash, {
    entrepreneur,
    amount: amount.toString(),
    value: value.toString()
  })
  
  // Wait for confirmation
  const receipt = await tx.wait()
  logTransactionConfirmation('buyCoin', tx.hash, receipt.blockNumber, {
    gasUsed: receipt.gasUsed.toString()
  })
} catch (err) {
  logTransactionError('buyCoin', err, {
    entrepreneur,
    amount: amount.toString()
  })
}
```

### 5. Monitor Performance

Track operation duration:

```typescript
import { startPerformanceTimer } from '@/lib/logger-utils'

async function loadAllEntrepreneurs() {
  const endTimer = startPerformanceTimer('loadEntrepreneurs')
  
  try {
    const entrepreneurs = await contract.getAllEntrepreneurs()
    endTimer({ count: entrepreneurs.length })
    return entrepreneurs
  } catch (err) {
    endTimer({ error: true })
    throw err
  }
}
```

### 6. Don't Log Sensitive Data

**Never log**:
- Private keys
- Seed phrases
- Passwords
- Full wallet mnemonics
- Personal information (email, phone)

```typescript
// ❌ Bad: Logging sensitive data
logDebug('User details', { 
  address,
  privateKey: user.privateKey  // NEVER DO THIS
})

// ✅ Good: Only log public data
logDebug('User details', { 
  address,
  connector: user.connector
})
```

## Utility Functions Reference

### Transaction Logging

```typescript
// Log transaction initiated
logTransaction(action, txHash, context?)

// Log transaction error
logTransactionError(action, error, context?)

// Log transaction confirmation
logTransactionConfirmation(action, txHash, blockNumber, context?)
```

### User Action Logging

```typescript
// Log generic user action
logUserAction(action, userAddress?, context?)

// Log wallet connection
logWalletConnected(address, connector?)

// Log wallet disconnection
logWalletDisconnected(address?)
```

### Error Logging

```typescript
// Log error with enhanced context
logErrorWithContext(message, error, context?)

// Log RPC error
logRPCError(method, error, context?)

// Log API error (future)
logAPIError(endpoint, method, error, statusCode?, context?)
```

### Performance Logging

```typescript
// Log performance metric
logPerformance(operation, durationMs, context?)

// Create performance timer
const endTimer = startPerformanceTimer(operation)
// ... do work ...
endTimer(context?)
```

### Contract Logging

```typescript
// Log contract call
logContractCall(functionName, contractAddress, args?, context?)

// Log RPC call
logRPCCall(method, params?, context?)
```

### Application Logging

```typescript
// Log app startup
logAppStartup()

// Log configuration loaded
logConfigLoaded(config)

// Log feature flag usage
logFeatureFlag(flagName, enabled)

// Log navigation
logNavigation(from, to, userAddress?)
```

## Integration Examples

### In React Components

```typescript
'use client'

import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { logWalletConnected, logWalletDisconnected } from '@/lib/logger-utils'

export function WalletButton() {
  const { address, connector, isConnected } = useAccount()
  
  useEffect(() => {
    if (isConnected && address) {
      logWalletConnected(address, connector?.name)
    } else if (!isConnected && address) {
      logWalletDisconnected(address)
    }
  }, [isConnected, address, connector])
  
  return <button>...</button>
}
```

### In API Routes (Future)

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { logAPICall, logAPIError } from '@/lib/logger-utils'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    logAPICall('/api/users', 'GET')
    
    const users = await getUsers()
    const duration = Date.now() - startTime
    
    return NextResponse.json(users, {
      headers: { 'X-Response-Time': `${duration}ms` }
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logAPIError('/api/users', 'GET', error, 500, { duration })
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### In Custom Hooks

```typescript
import { useBuyCoin } from '@/lib/hooks'
import { 
  logTransaction,
  logTransactionConfirmation,
  logTransactionError 
} from '@/lib/logger-utils'

export function useBuyCoinWithLogging() {
  const { buyCoin, hash, isConfirming, isSuccess, error } = useBuyCoin()
  
  useEffect(() => {
    if (hash) {
      logTransaction('buyCoin', hash)
    }
  }, [hash])
  
  useEffect(() => {
    if (isSuccess && hash) {
      logTransactionConfirmation('buyCoin', hash, 0)  // Block number from receipt
    }
  }, [isSuccess, hash])
  
  useEffect(() => {
    if (error) {
      logTransactionError('buyCoin', error)
    }
  }, [error])
  
  return { buyCoin, hash, isConfirming, isSuccess, error }
}
```

## Log Aggregation

### Local Development

Logs are written to:
- **Console**: Colored, human-readable
- **Files**: `logs/combined-*.log` and `logs/error-*.log`

### Production (Future)

Integrate with log aggregation services:

#### Option 1: Cloud Services
- **Datadog**: Full-featured APM and logging
- **New Relic**: Application monitoring with logs
- **LogDNA (IBM)**: Dedicated log management

#### Option 2: Self-Hosted
- **ELK Stack**: Elasticsearch + Logstash + Kibana
- **Loki**: Grafana's log aggregation system
- **Graylog**: Open-source log management

#### Option 3: Serverless
- **AWS CloudWatch Logs**: Integrated with AWS
- **Google Cloud Logging**: For GCP deployments
- **Azure Monitor**: For Azure deployments

### Example: Datadog Integration

```typescript
// Add Datadog transport (future enhancement)
import { transports } from 'winston'
import DatadogWinston from 'datadog-winston'

const datadogTransport = new DatadogWinston({
  apiKey: process.env.DATADOG_API_KEY,
  service: 'goinvestme',
  ddsource: 'nodejs',
  ddtags: `env:${config.env},version:${config.version}`
})

// Add to logger transports
logger.add(datadogTransport)
```

## Troubleshooting

### Issue: Logs not appearing

**Check**:
1. Log level configuration: `NEXT_PUBLIC_DEBUG_MODE=true`
2. Console transport is enabled
3. File write permissions in `logs/` directory

### Issue: Too many log files

**Solution**: Adjust retention in `logger.ts`:

```typescript
createErrorFileTransport() {
  maxFiles: '7d',  // Keep 7 days instead of 14
}
```

### Issue: Large log files

**Solution**: Reduce max file size:

```typescript
createCombinedFileTransport() {
  maxSize: '10m',  // 10MB instead of 20MB
}
```

### Issue: Missing context in logs

**Solution**: Always pass context object:

```typescript
logInfo('Event happened', {
  // Include all relevant context
  userId: address,
  timestamp: Date.now(),
  ...additionalContext
})
```

## Security Considerations

### What to Log

✅ **Safe to log**:
- Wallet addresses (public)
- Transaction hashes (public)
- Block numbers (public)
- Contract addresses (public)
- Timestamps
- User actions (non-sensitive)
- Error messages
- Performance metrics

### What NOT to Log

❌ **Never log**:
- Private keys
- Seed phrases
- Passwords
- Auth tokens
- API secrets
- Personal data (without consent)

## Performance Impact

### Log Level Impact

- **ERROR/WARN**: Negligible impact
- **INFO**: Minimal impact (~0.1ms per log)
- **DEBUG**: Low impact (~0.2ms per log)

### Best Practices

1. Use appropriate log levels
2. Avoid logging in tight loops
3. Log aggregated data, not individual items
4. Use async logging (Winston handles this)

## Next Steps

1. ✅ Logging infrastructure implemented
2. ⬜ Add logging to all user actions
3. ⬜ Add logging to all blockchain interactions
4. ⬜ Set up log aggregation service
5. ⬜ Create log analysis dashboards
6. ⬜ Set up log-based alerts

---

**Last Updated**: January 30, 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
