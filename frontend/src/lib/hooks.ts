import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { GoInvestMeCoreABI, CONTRACT_ADDRESSES } from './web3'

// Hook to get the current contract address based on chain
export function useContractAddress() {
  const { chain, isConnected } = useAccount()

  // Debug logging
  console.log('Chain info:', { chainId: chain?.id, chainName: chain?.name, isConnected })

  if (chain?.id === 11155111) { // Sepolia
    console.log('Using Sepolia contract:', CONTRACT_ADDRESSES.sepolia)
    return CONTRACT_ADDRESSES.sepolia
  }

  // For now, always default to Sepolia since that's where our contract is deployed
  console.log('Defaulting to Sepolia contract:', CONTRACT_ADDRESSES.sepolia)
  return CONTRACT_ADDRESSES.sepolia
}

// Hook to create a new investment coin
export function useCreateCoin() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const contractAddress = useContractAddress()

  const createCoin = async (
    name: string,
    description: string,
    website: string,
    totalSupply: bigint,
    pricePerCoin: string
  ) => {
    if (!contractAddress) throw new Error('Contract not deployed on this network')

    writeContract({
      address: contractAddress as `0x${string}`,
      abi: GoInvestMeCoreABI.abi,
      functionName: 'createCoin',
      args: [name, description, website, totalSupply, parseEther(pricePerCoin)]
    })
  }

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  return {
    createCoin,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error
  }
}

// Hook to buy coins
export function useBuyCoin() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const contractAddress = useContractAddress()

  const buyCoin = async (entrepreneurAddress: string, quantity: bigint, totalCost: string) => {
    if (!contractAddress) throw new Error('Contract not deployed on this network')

    writeContract({
      address: contractAddress as `0x${string}`,
      abi: GoInvestMeCoreABI.abi,
      functionName: 'buyCoin',
      args: [entrepreneurAddress as `0x${string}`, quantity],
      value: parseEther(totalCost)
    })
  }

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  return {
    buyCoin,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error
  }
}

// Hook to get coin information by entrepreneur address
export function useCoinInfo(entrepreneurAddress: string) {
  const contractAddress = useContractAddress()

  console.log('useCoinInfo called with:', {
    entrepreneurAddress,
    contractAddress,
    abiLength: GoInvestMeCoreABI.abi?.length
  })

  return useReadContract({
    address: contractAddress as `0x${string}`,
    abi: GoInvestMeCoreABI.abi,
    functionName: 'getCoinInfo',
    args: [entrepreneurAddress as `0x${string}`],
    query: {
      enabled: !!contractAddress && !!entrepreneurAddress,
    }
  })
}

// Hook to get all entrepreneurs
export function useAllEntrepreneurs() {
  const contractAddress = useContractAddress()

  return useReadContract({
    address: contractAddress as `0x${string}`,
    abi: GoInvestMeCoreABI.abi,
    functionName: 'getAllEntrepreneurs',
    query: {
      enabled: !!contractAddress,
    }
  })
}

// Hook to check if entrepreneur has created a coin
export function useHasCoin(entrepreneurAddress: string) {
  const contractAddress = useContractAddress()

  return useReadContract({
    address: contractAddress as `0x${string}`,
    abi: GoInvestMeCoreABI.abi,
    functionName: 'hasCoin',
    args: [entrepreneurAddress as `0x${string}`],
    query: {
      enabled: !!contractAddress && !!entrepreneurAddress,
    }
  })
}

// Hook to get a specific investment amount for investor-entrepreneur pair
export function useGetInvestment(investorAddress: string, entrepreneurAddress: string) {
  const contractAddress = useContractAddress()

  return useReadContract({
    address: contractAddress as `0x${string}`,
    abi: GoInvestMeCoreABI.abi,
    functionName: 'getInvestment',
    args: [investorAddress as `0x${string}`, entrepreneurAddress as `0x${string}`],
    query: {
      enabled: !!contractAddress && !!investorAddress && !!entrepreneurAddress,
    }
  })
}

// Hook to get specific investment amount between investor and entrepreneur  
export function useInvestmentAmount(investorAddress: string, entrepreneurAddress: string) {
  const contractAddress = useContractAddress()

  return useReadContract({
    address: contractAddress as `0x${string}`,
    abi: GoInvestMeCoreABI.abi,
    functionName: 'getInvestment',
    args: [investorAddress as `0x${string}`, entrepreneurAddress as `0x${string}`],
    query: {
      enabled: !!contractAddress && !!investorAddress && !!entrepreneurAddress,
    }
  })
}

// Simplified portfolio hook that works with component logic
export function useInvestorPortfolio(investorAddress: string) {
  const { data: entrepreneurs, isLoading: entrepreneursLoading } = useAllEntrepreneurs()

  return {
    entrepreneurs: entrepreneurs as string[] || [],
    isLoading: entrepreneursLoading,
    error: null
  }
}

// Legacy hook for backward compatibility
export function useInvestorCoins(investorAddress: string) {
  const portfolio = useInvestorPortfolio(investorAddress)
  return {
    data: portfolio.entrepreneurs.map((inv: string) => inv),
    isLoading: portfolio.isLoading,
    error: portfolio.error
  }
}

// Hook to get ownership percentage (updated to use entrepreneur address)
export function useOwnershipPercentage(entrepreneurAddress: string, investorAddress: string) {
  const contractAddress = useContractAddress()

  const { data, ...rest } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: GoInvestMeCoreABI.abi,
    functionName: 'getOwnershipPercentage',
    args: [investorAddress as `0x${string}`, entrepreneurAddress as `0x${string}`],
    query: {
      enabled: !!contractAddress && !!investorAddress && !!entrepreneurAddress,
    }
  })

  return {
    ...rest,
    data: data ? Number(data) / 100 : 0, // Convert basis points to percentage
  }
}

// Hook to get cap table summary
export function useCapTableSummary(coinId: bigint) {
  const contractAddress = useContractAddress()

  return useReadContract({
    address: contractAddress as `0x${string}`,
    abi: GoInvestMeCoreABI.abi,
    functionName: 'getCapTableSummary',
    args: [coinId],
    query: {
      enabled: !!contractAddress,
    }
  })
}

// Utility function to format ETH values
export function formatEthValue(value: bigint): string {
  return formatEther(value)
}