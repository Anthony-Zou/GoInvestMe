# Configuration Guide - GoInvestMe

## Overview

GoInvestMe follows the [12 Factor App](https://12factor.net/) methodology for configuration management. All configuration is externalized through environment variables, ensuring consistency across environments and security for sensitive data.

## Quick Start

### 1. Copy Environment Template

```bash
cd frontend
cp .env.local.example .env.local
```

### 2. Configure Your Environment

Edit `.env.local` with your specific values:

```bash
# Required: Set your network
NEXT_PUBLIC_NETWORK_NAME=sepolia

# Required: Set contract address
NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS=0x8b23a938d1a52588de989a8967a51e2dde0f494f
```

### 3. Verify Configuration

```bash
npm run dev
```

Check the console for configuration logs. You should see:
```
📋 Configuration loaded: {
  env: 'development',
  network: 'sepolia',
  chainId: 11155111,
  contract: '0x8b23a938d...',
  version: '1.0.0'
}
```

## Environment Files

### Available Templates

| File | Purpose | When to Use |
|------|---------|-------------|
| `.env.local.example` | Local development template | Copy to `.env.local` for development |
| `.env.development.example` | Development defaults | Reference for development settings |
| `.env.production.example` | Production template | Copy to `.env.production` for deployment |

### File Priority

Next.js loads environment variables in this order (later files override earlier ones):

1. `.env` - Default values for all environments
2. `.env.local` - Local overrides (not committed to Git)
3. `.env.development` - Development-specific values
4. `.env.production` - Production-specific values

## Environment Variables Reference

### Network Configuration

#### `NEXT_PUBLIC_NETWORK_NAME` (Required)

The blockchain network to connect to.

- **Type**: `string`
- **Values**: `sepolia` | `mainnet`
- **Example**: `NEXT_PUBLIC_NETWORK_NAME=sepolia`
- **Default**: None (must be set)

#### `NEXT_PUBLIC_CHAIN_ID` (Required)

The chain ID for the selected network.

- **Type**: `number`
- **Values**:
  - `11155111` for Sepolia testnet
  - `1` for Ethereum mainnet
- **Example**: `NEXT_PUBLIC_CHAIN_ID=11155111`
- **Validation**: Must match the selected network

#### `NEXT_PUBLIC_ENABLE_TESTNETS`

Enable or disable testnet connections in wallet.

- **Type**: `boolean`
- **Values**: `true` | `false`
- **Example**: `NEXT_PUBLIC_ENABLE_TESTNETS=true`
- **Default**: `true`

### Contract Addresses

#### `NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS`

GoInvestMeCore contract address on Sepolia testnet.

- **Type**: `string` (Ethereum address)
- **Format**: `0x` followed by 40 hexadecimal characters
- **Example**: `NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS=0x8b23a938d1a52588de989a8967a51e2dde0f494f`
- **Required**: When `NEXT_PUBLIC_NETWORK_NAME=sepolia`
- **Validation**: Must be a valid Ethereum address

#### `NEXT_PUBLIC_MAINNET_CONTRACT_ADDRESS`

GoInvestMeCore contract address on Ethereum mainnet.

- **Type**: `string` (Ethereum address)
- **Format**: `0x` followed by 40 hexadecimal characters
- **Example**: `NEXT_PUBLIC_MAINNET_CONTRACT_ADDRESS=0x...`
- **Required**: When `NEXT_PUBLIC_NETWORK_NAME=mainnet`
- **Status**: Not deployed yet

### RPC Configuration

#### `NEXT_PUBLIC_SEPOLIA_RPC_URL`

Custom RPC endpoint for Sepolia network.

- **Type**: `string` (URL)
- **Example**: `NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`
- **Default**: Uses wagmi's default public endpoint
- **Optional**: Only needed if you want to use your own RPC provider

#### `NEXT_PUBLIC_MAINNET_RPC_URL`

Custom RPC endpoint for Ethereum mainnet.

- **Type**: `string` (URL)
- **Example**: `NEXT_PUBLIC_MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY`
- **Default**: Uses wagmi's default public endpoint
- **Optional**: Only needed if you want to use your own RPC provider

### Application Configuration

#### `NEXT_PUBLIC_APP_ENV`

Application environment identifier.

- **Type**: `string`
- **Values**: `development` | `staging` | `production` | `test`
- **Example**: `NEXT_PUBLIC_APP_ENV=development`
- **Default**: `development`

#### `NEXT_PUBLIC_APP_VERSION`

Application version number.

- **Type**: `string` (semver)
- **Example**: `NEXT_PUBLIC_APP_VERSION=1.0.0`
- **Default**: `1.0.0`
- **Note**: Should match `version` in `package.json`

#### `NEXT_PUBLIC_APP_NAME`

Application display name.

- **Type**: `string`
- **Example**: `NEXT_PUBLIC_APP_NAME=GoInvestMe`
- **Default**: `GoInvestMe`

### Feature Flags

#### `NEXT_PUBLIC_ENABLE_ANALYTICS`

Enable analytics tracking (Google Analytics, Mixpanel).

- **Type**: `boolean`
- **Values**: `true` | `false`
- **Example**: `NEXT_PUBLIC_ENABLE_ANALYTICS=false`
- **Default**: `false`
- **Production**: Set to `true`

#### `NEXT_PUBLIC_ENABLE_ERROR_TRACKING`

Enable error tracking with Sentry.

- **Type**: `boolean`
- **Values**: `true` | `false`
- **Example**: `NEXT_PUBLIC_ENABLE_ERROR_TRACKING=false`
- **Default**: `false`
- **Production**: Set to `true`

#### `NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING`

Enable performance monitoring.

- **Type**: `boolean`
- **Values**: `true` | `false`
- **Example**: `NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=false`
- **Default**: `false`
- **Production**: Set to `true`

#### `NEXT_PUBLIC_DEBUG_MODE`

Enable debug mode with additional logging.

- **Type**: `boolean`
- **Values**: `true` | `false`
- **Example**: `NEXT_PUBLIC_DEBUG_MODE=true`
- **Default**: `true` in development, `false` in production

### Development Tools

#### `NEXT_PUBLIC_SHOW_DEVTOOLS`

Show React Query DevTools in browser.

- **Type**: `boolean`
- **Values**: `true` | `false`
- **Example**: `NEXT_PUBLIC_SHOW_DEVTOOLS=true`
- **Default**: `true` in development, `false` in production

#### `NEXT_PUBLIC_VERBOSE_LOGS`

Enable verbose console logging.

- **Type**: `boolean`
- **Values**: `true` | `false`
- **Example**: `NEXT_PUBLIC_VERBOSE_LOGS=true`
- **Default**: `true` in development, `false` in production

### Monitoring (Production)

#### `NEXT_PUBLIC_SENTRY_DSN`

Sentry Data Source Name for error tracking.

- **Type**: `string` (URL)
- **Example**: `NEXT_PUBLIC_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/7654321`
- **Required**: When `NEXT_PUBLIC_ENABLE_ERROR_TRACKING=true`
- **Get from**: [https://sentry.io](https://sentry.io)

#### `NEXT_PUBLIC_SENTRY_ENVIRONMENT`

Environment name for Sentry.

- **Type**: `string`
- **Example**: `NEXT_PUBLIC_SENTRY_ENVIRONMENT=production`
- **Default**: Uses `NEXT_PUBLIC_APP_ENV`

#### `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`

Percentage of transactions to send to Sentry.

- **Type**: `number` (0.0 to 1.0)
- **Example**: `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1`
- **Default**: `1.0` (100%)
- **Production**: Set to `0.1` or lower to reduce costs

### Analytics (Production)

#### `NEXT_PUBLIC_GA_MEASUREMENT_ID`

Google Analytics Measurement ID.

- **Type**: `string`
- **Format**: `G-XXXXXXXXXX`
- **Example**: `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-ABC123DEF4`
- **Get from**: [Google Analytics](https://analytics.google.com)

#### `NEXT_PUBLIC_MIXPANEL_TOKEN`

Mixpanel project token.

- **Type**: `string`
- **Example**: `NEXT_PUBLIC_MIXPANEL_TOKEN=abc123def456`
- **Get from**: [Mixpanel](https://mixpanel.com)

### Security

#### `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

WalletConnect Cloud Project ID.

- **Type**: `string`
- **Example**: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=abc123def456`
- **Get from**: [WalletConnect Cloud](https://cloud.walletconnect.com)

### API Configuration (Future)

#### `NEXT_PUBLIC_API_URL`

Backend API base URL.

- **Type**: `string` (URL)
- **Example**: `NEXT_PUBLIC_API_URL=https://api.goinvestme.com`
- **Default**: `http://localhost:4000`

#### `NEXT_PUBLIC_API_TIMEOUT`

API request timeout in milliseconds.

- **Type**: `number`
- **Example**: `NEXT_PUBLIC_API_TIMEOUT=30000`
- **Default**: `30000` (30 seconds)

## Environment-Specific Configurations

### Development Environment

```bash
# Development
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_NETWORK_NAME=sepolia
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_ENABLE_TESTNETS=true
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_VERBOSE_LOGS=true
NEXT_PUBLIC_SHOW_DEVTOOLS=true
```

### Staging Environment

```bash
# Staging
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_NETWORK_NAME=sepolia
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_ENABLE_TESTNETS=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=true
NEXT_PUBLIC_DEBUG_MODE=false
```

### Production Environment

```bash
# Production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_NETWORK_NAME=mainnet
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_ENABLE_TESTNETS=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=true
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_SHOW_DEVTOOLS=false
NEXT_PUBLIC_VERBOSE_LOGS=false
```

## Using Configuration in Code

### Import Configuration

```typescript
import { getConfig } from '@/lib/config'

const config = getConfig()
```

### Access Configuration Values

```typescript
// Network information
console.log(config.network) // 'sepolia' or 'mainnet'
console.log(config.chainId) // 11155111 or 1

// Contract address
console.log(config.contracts.current) // Active contract address

// Features
if (config.features.debugMode) {
  console.log('Debug mode enabled')
}

// Environment checks
if (config.isProduction) {
  // Production-only code
}
```

### Using Contract Address in wagmi

```typescript
import { useReadContract } from 'wagmi'
import { getCurrentContractAddress, GoInvestMeCoreABI } from '@/lib/web3'

const { data } = useReadContract({
  address: getCurrentContractAddress(),
  abi: GoInvestMeCoreABI,
  functionName: 'getAllEntrepreneurs',
})
```

## Configuration Validation

The application automatically validates configuration on startup:

### Validation Checks

- ✅ Required environment variables are present
- ✅ Values are properly formatted
- ✅ Chain ID matches selected network
- ✅ Contract addresses are valid Ethereum addresses
- ✅ No obvious configuration conflicts

### Error Messages

If configuration is invalid, you'll see a clear error message:

```
❌ Configuration Error: Error: Missing required environment variable: NEXT_PUBLIC_NETWORK_NAME
Description: Blockchain network to connect to (sepolia or mainnet)
Please check your .env.local file or environment configuration.
```

## Troubleshooting

### Issue: "Missing required environment variable"

**Solution**: Copy `.env.local.example` to `.env.local` and fill in required values.

```bash
cp .env.local.example .env.local
```

### Issue: "Invalid Ethereum address"

**Solution**: Ensure addresses start with `0x` and are exactly 42 characters (0x + 40 hex digits).

### Issue: "Invalid chain ID for network"

**Solution**: Chain ID must match network:
- Sepolia: `11155111`
- Mainnet: `1`

### Issue: Configuration changes not reflecting

**Solution**:
1. Restart the development server (`npm run dev`)
2. Clear Next.js cache: `rm -rf .next`
3. Hard reload browser (Cmd+Shift+R or Ctrl+Shift+R)

### Issue: "Contract address is required"

**Solution**: Set the contract address for your selected network:
- For Sepolia: Set `NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS`
- For Mainnet: Set `NEXT_PUBLIC_MAINNET_CONTRACT_ADDRESS`

## Security Best Practices

### DO ✅

- Store environment files in password manager
- Use different values for each environment
- Rotate API keys regularly
- Review `.gitignore` to ensure `.env.local` is ignored
- Document all environment variables

### DON'T ❌

- Commit `.env.local` or `.env.production` to Git
- Share environment files in Slack/email
- Use production values in development
- Hardcode sensitive values in code
- Store private keys in environment files (use hardware wallet)

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
env:
  NEXT_PUBLIC_NETWORK_NAME: ${{ secrets.NETWORK_NAME }}
  NEXT_PUBLIC_CHAIN_ID: ${{ secrets.CHAIN_ID }}
  NEXT_PUBLIC_MAINNET_CONTRACT_ADDRESS: ${{ secrets.CONTRACT_ADDRESS }}
  NEXT_PUBLIC_SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
```

### Vercel

1. Go to Project Settings → Environment Variables
2. Add each `NEXT_PUBLIC_*` variable
3. Set environment (Production, Preview, Development)
4. Redeploy

### Docker

```dockerfile
# Pass environment variables at runtime
docker run -e NEXT_PUBLIC_NETWORK_NAME=mainnet \
           -e NEXT_PUBLIC_CHAIN_ID=1 \
           ...
           gim-frontend
```

## Migration Guide

### From Hardcoded Values

**Before:**
```typescript
const CONTRACT_ADDRESS = '0x8b23a938...'
```

**After:**
```typescript
import { getCurrentContractAddress } from '@/lib/web3'

const CONTRACT_ADDRESS = getCurrentContractAddress()
```

### Adding New Configuration

1. Add to `.env.*.example` files
2. Document in this guide
3. Add to `config.ts` interface
4. Update validation if needed
5. Use in your code

## Support

For configuration help:
- Check this documentation
- Review `.env.*.example` files
- Check console for validation errors
- See [12 Factor App Config](https://12factor.net/config)

---

**Last Updated**: January 30, 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
