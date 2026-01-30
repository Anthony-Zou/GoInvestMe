/**
 * Centralized Configuration Module
 * 
 * This module provides type-safe, validated access to all environment variables.
 * It follows the 12 Factor App methodology by externalizing all configuration.
 * 
 * @module config
 */

/**
 * Environment type
 */
export type Environment = 'development' | 'staging' | 'production' | 'test';

/**
 * Network type
 */
export type Network = 'sepolia' | 'mainnet';

/**
 * Configuration interface
 */
export interface AppConfig {
  // Application
  env: Environment;
  version: string;
  appName: string;
  isDevelopment: boolean;
  isProduction: boolean;

  // Network
  network: Network;
  chainId: number;
  enableTestnets: boolean;

  // Contracts
  contracts: {
    sepolia: string | null;
    mainnet: string | null;
    current: string;
    investorRegistry: string;
    startupRegistry: string;
  };

  // RPC
  rpc: {
    sepoliaUrl: string | null;
    mainnetUrl: string | null;
  };

  // Features
  features: {
    analytics: boolean;
    errorTracking: boolean;
    performanceMonitoring: boolean;
    debugMode: boolean;
    showDevTools: boolean;
    verboseLogs: boolean;
  };

  // Monitoring
  monitoring: {
    sentryDsn: string | null;
    sentryEnvironment: string;
    sentryTracesSampleRate: number;
  };

  // Analytics
  analytics: {
    gaId: string | null;
    mixpanelToken: string | null;
  };

  // Security
  security: {
    walletConnectProjectId: string | null;
  };

  // API
  api: {
    url: string;
    timeout: number;
  };
}

/**
 * Get environment variable with type checking
 */
function getEnv(key: string): string | undefined {
  if (typeof window !== 'undefined') {
    // Client-side
    return (window as any).ENV?.[key] || process.env[key];
  }
  // Server-side
  return process.env[key];
}

/**
 * Get required environment variable
 * Throws error if not found
 */
function getRequiredEnv(key: string, description: string): string {
  const value = getEnv(key);
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Description: ${description}\n` +
      `Please check your .env.local file or environment configuration.`
    );
  }
  return value;
}

/**
 * Get optional environment variable with default
 */
function getOptionalEnv(key: string, defaultValue: string): string {
  const value = getEnv(key);
  return value && value.trim() !== '' ? value : defaultValue;
}

/**
 * Get boolean environment variable
 */
function getBooleanEnv(key: string, defaultValue: boolean): boolean {
  const value = getEnv(key);
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Get number environment variable
 */
function getNumberEnv(key: string, defaultValue: number): number {
  const value = getEnv(key);
  if (!value) return defaultValue;
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Get float environment variable
 */
function getFloatEnv(key: string, defaultValue: number): number {
  const value = getEnv(key);
  if (!value) return defaultValue;
  const num = parseFloat(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Validate Ethereum address
 */
function validateAddress(address: string | null, name: string): void {
  if (address && !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error(
      `Invalid Ethereum address for ${name}: ${address}\n` +
      `Address must be a 42-character hexadecimal string starting with 0x`
    );
  }
}

/**
 * Validate chain ID
 */
function validateChainId(chainId: number, network: Network): void {
  const validChainIds: Record<Network, number> = {
    sepolia: 11155111,
    mainnet: 1,
  };

  if (chainId !== validChainIds[network]) {
    throw new Error(
      `Invalid chain ID ${chainId} for network ${network}\n` +
      `Expected: ${validChainIds[network]}`
    );
  }
}

/**
 * Get current contract address based on network
 */
function getCurrentContractAddress(
  network: Network,
  sepoliaAddress: string | null,
  mainnetAddress: string | null
): string {
  if (network === 'sepolia') {
    if (!sepoliaAddress) {
      throw new Error(
        'Sepolia contract address is required when network is set to sepolia.\n' +
        'Please set NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS in your environment.'
      );
    }
    return sepoliaAddress;
  }

  if (network === 'mainnet') {
    if (!mainnetAddress) {
      throw new Error(
        'Mainnet contract address is required when network is set to mainnet.\n' +
        'Please set NEXT_PUBLIC_MAINNET_CONTRACT_ADDRESS in your environment.'
      );
    }
    return mainnetAddress;
  }

  throw new Error(`Unknown network: ${network}`);
}

/**
 * Load and validate configuration
 */
function loadConfig(): AppConfig {
  // Application - Direct access for Next.js static replacement
  const env = (process.env.NEXT_PUBLIC_APP_ENV || 'development') as Environment;
  const version = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'GoInvestMe';

  // Network - Direct access (REQUIRED)
  const network = process.env.NEXT_PUBLIC_NETWORK_NAME as Network;

  if (!network) {
    throw new Error(
      `Missing required environment variable: NEXT_PUBLIC_NETWORK_NAME\n` +
      `Description: Blockchain network to connect to (sepolia or mainnet)\n` +
      `Please check your .env.local file or environment configuration.`
    );
  }

  if (!['sepolia', 'mainnet'].includes(network)) {
    throw new Error(
      `Invalid network: ${network}\n` +
      `Must be either 'sepolia' or 'mainnet'`
    );
  }

  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111', 10);
  validateChainId(chainId, network);

  const enableTestnets = process.env.NEXT_PUBLIC_ENABLE_TESTNETS?.toLowerCase() === 'true' || true;

  // Contracts - Direct access
  const sepoliaAddress = process.env.NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS || null;
  const mainnetAddress = process.env.NEXT_PUBLIC_MAINNET_CONTRACT_ADDRESS || null;

  validateAddress(sepoliaAddress, 'Sepolia contract');
  validateAddress(mainnetAddress, 'Mainnet contract');

  const currentContract = getCurrentContractAddress(network, sepoliaAddress, mainnetAddress);

  // RPC - Direct access
  const sepoliaRpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || null;
  const mainnetRpcUrl = process.env.NEXT_PUBLIC_MAINNET_RPC_URL || null;

  // Features - Direct access
  const enableAnalytics = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS?.toLowerCase() === 'true' || false;
  const enableErrorTracking = process.env.NEXT_PUBLIC_ENABLE_ERROR_TRACKING?.toLowerCase() === 'true' || false;
  const enablePerformanceMonitoring = process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING?.toLowerCase() === 'true' || false;
  const debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE?.toLowerCase() === 'true' || env === 'development';
  const showDevTools = process.env.NEXT_PUBLIC_SHOW_DEVTOOLS?.toLowerCase() === 'true' || env === 'development';
  const verboseLogs = process.env.NEXT_PUBLIC_VERBOSE_LOGS?.toLowerCase() === 'true' || env === 'development';

  // Monitoring - Direct access
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || null;
  const sentryEnvironment = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || env;
  const sentryTracesSampleRate = parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || '1.0');

  // Analytics - Direct access
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || null;
  const mixpanelToken = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || null;

  // Security - Direct access
  const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || null;

  // API - Direct access
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const apiTimeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10);

  return {
    env,
    version,
    appName,
    isDevelopment: env === 'development',
    isProduction: env === 'production',

    network,
    chainId,
    enableTestnets,

    contracts: {
      sepolia: sepoliaAddress,
      mainnet: mainnetAddress,
      current: currentContract,
      investorRegistry: process.env.NEXT_PUBLIC_INVESTOR_REGISTRY_ADDRESS || (network === 'sepolia' ? '0x54Ee6D45Ca93Cb58A6eBd07f8D87be6D9C9F6c12' : ''),
      startupRegistry: process.env.NEXT_PUBLIC_STARTUP_REGISTRY_ADDRESS || (network === 'sepolia' ? '0xE4a56B8F0EEabDf2b10da8f04bBeE249bC1411b9' : ''),
    },

    rpc: {
      sepoliaUrl: sepoliaRpcUrl,
      mainnetUrl: mainnetRpcUrl,
    },

    features: {
      analytics: enableAnalytics,
      errorTracking: enableErrorTracking,
      performanceMonitoring: enablePerformanceMonitoring,
      debugMode,
      showDevTools,
      verboseLogs,
    },

    monitoring: {
      sentryDsn,
      sentryEnvironment,
      sentryTracesSampleRate,
    },

    analytics: {
      gaId,
      mixpanelToken,
    },

    security: {
      walletConnectProjectId,
    },

    api: {
      url: apiUrl,
      timeout: apiTimeout,
    },
  };
}

/**
 * Singleton configuration instance
 * Loaded once at application startup
 */
let configInstance: AppConfig | null = null;

/**
 * Get application configuration
 * 
 * @returns Validated configuration object
 * @throws Error if required environment variables are missing or invalid
 * 
 * @example
 * ```typescript
 * import { getConfig } from '@/lib/config';
 * 
 * const config = getConfig();
 * console.log('Network:', config.network);
 * console.log('Contract:', config.contracts.current);
 * ```
 */
export function getConfig(): AppConfig {
  if (!configInstance) {
    try {
      configInstance = loadConfig();

      // Log configuration in development mode
      if (configInstance.isDevelopment && configInstance.features.verboseLogs) {
        console.log('📋 Configuration loaded:', {
          env: configInstance.env,
          network: configInstance.network,
          chainId: configInstance.chainId,
          contract: configInstance.contracts.current,
          version: configInstance.version,
        });
      }
    } catch (error) {
      console.error('❌ Configuration Error:', error);
      throw error;
    }
  }

  return configInstance;
}

/**
 * Reset configuration (useful for testing)
 * @internal
 */
export function resetConfig(): void {
  configInstance = null;
}

/**
 * Export configuration for immediate use
 */
export const config = getConfig();

/**
 * Export for default import
 */
export default config;
