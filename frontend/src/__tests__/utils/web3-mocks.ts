import { vi } from 'vitest'
import { parseEther } from 'viem'

// Mock contract data
export const mockCoinInfo = [
  'Test Campaign', // name
  'A test campaign for unit testing', // description  
  'https://test.com', // website
  1000000n, // totalSupply
  parseEther('0.001'), // pricePerCoin
  10000n, // coinsSold
  990000n, // coinsAvailable
  1234567890n, // createdAt
  true // active
]

export const mockAllEntrepreneurs = [
  '0x1111111111111111111111111111111111111111',
  '0x2222222222222222222222222222222222222222',
  '0x3333333333333333333333333333333333333333'
]

export const mockInvestment = parseEther('10') // 10 tokens

// Mock Wagmi hooks
export const mockUseAccount = {
  address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
  isConnected: true,
  isConnecting: false,
  isDisconnected: false,
  chain: {
    id: 11155111,
    name: 'Sepolia',
  },
}

export const mockUseReadContract = {
  data: null,
  isLoading: false,
  error: null,
  refetch: vi.fn(),
}

export const mockUseWriteContract = {
  writeContract: vi.fn(),
  data: '0xmocktxhash',
  isPending: false,
  error: null,
}

export const mockUseWaitForTransactionReceipt = {
  data: {
    transactionHash: '0xmocktxhash',
    blockNumber: 1234567n,
    status: 'success',
  },
  isLoading: false,
  isSuccess: true,
  error: null,
}

// Helper function to create mock hook responses
export function createMockHookResponse<T>(data: T, loading = false, error: Error | null = null) {
  return {
    data,
    isLoading: loading,
    error,
    refetch: vi.fn(),
  }
}

// Helper function to reset all mocks
export function resetAllMocks() {
  vi.clearAllMocks()
}