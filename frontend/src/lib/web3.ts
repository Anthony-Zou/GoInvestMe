import { http, createConfig } from 'wagmi'
import { sepolia, mainnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { getConfig } from './config'

/**
 * Get application configuration
 */
const appConfig = getConfig()

// Log configuration (only in debug mode)
if (typeof window !== 'undefined' && appConfig.features.debugMode) {
  console.log('Web3 configuration initialized:', {
    network: appConfig.network,
    chainId: appConfig.chainId,
    contractAddress: appConfig.contracts.current,
  })
}

/**
 * Contract deployment addresses
 * Now loaded from environment variables instead of hardcoded
 */
export const CONTRACT_ADDRESSES = {
  sepolia: appConfig.contracts.sepolia,
  mainnet: appConfig.contracts.mainnet,
  current: appConfig.contracts.current, // Active contract based on selected network
  investorRegistry: appConfig.contracts.investorRegistry,
  startupRegistry: appConfig.contracts.startupRegistry,
} as const

/**
 * Get current contract address for the active network
 */
export function getCurrentContractAddress(): string {
  return appConfig.contracts.current
}

/**
 * Build chain configuration with optional custom RPC URLs
 */
function buildChainTransports() {
  const transports: Record<number, ReturnType<typeof http>> = {}

  // Sepolia configuration
  if (appConfig.enableTestnets) {
    transports[sepolia.id] = http(appConfig.rpc.sepoliaUrl || undefined)
  }

  // Mainnet configuration
  transports[mainnet.id] = http(appConfig.rpc.mainnetUrl || undefined)

  return transports
}

/**
 * Build chain list based on configuration
 */
function buildChains() {
  const chains = [mainnet] as const

  if (appConfig.enableTestnets) {
    return [mainnet, sepolia] as const
  }

  return chains
}

/**
 * Wagmi configuration
 * Automatically configured based on environment variables
 */
export const config = createConfig({
  chains: buildChains(),
  connectors: [
    injected(),
  ],
  transports: buildChainTransports(),
})

/**
 * Contract ABIs (imported from compiled artifacts)
 */
export { default as GoInvestMeCoreABI } from './GoInvestMeCore.json' // Deprecated
export { default as TokenizedSAFEABI } from './abis/TokenizedSAFE.json'
export { default as StartupRegistryABI } from './abis/StartupRegistry.json'
export { default as InvestorRegistryABI } from './abis/InvestorRegistry.json'

/**
 * TypeScript module augmentation for wagmi
 */
declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}