import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { StartupRegistryABI, TokenizedSAFEABI, CONTRACT_ADDRESSES } from './web3'

// Hook to get the current contract address based on chain
export function useContractAddress() {
  const { chain } = useAccount()
  // Simply return the registries from config
  return {
    startupRegistry: CONTRACT_ADDRESSES.startupRegistry,
    investorRegistry: CONTRACT_ADDRESSES.investorRegistry
  }
}

// --- STARTUP REGISTRY HOOKS ---

export function useCreateRound() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { startupRegistry } = useContractAddress()

  const createRound = async (
    startupId: string,
    valuationCap: string,
    discountRate: number,
    minInvestment: string,
    maxInvestment: string,
    durationSeconds: number
  ) => {
    if (!startupRegistry) throw new Error('StartupRegistry address not found')

    writeContract({
      address: startupRegistry as `0x${string}`,
      abi: StartupRegistryABI.abi,
      functionName: 'createRound',
      args: [
        startupId as `0x${string}`,
        BigInt(valuationCap),
        BigInt(discountRate),
        BigInt(minInvestment),
        BigInt(maxInvestment),
        BigInt(durationSeconds)
      ]
    })
  }

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  return { createRound, hash, isPending, isConfirming, isSuccess, error }
}

export function useRegisterStartup() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { startupRegistry } = useContractAddress()

  const registerStartup = async (companyName: string, dataRoomCID: string) => {
    if (!startupRegistry) throw new Error('StartupRegistry address not found')

    writeContract({
      address: startupRegistry as `0x${string}`,
      abi: StartupRegistryABI.abi,
      functionName: 'registerStartup',
      args: [companyName, dataRoomCID]
    })
  }

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  return { registerStartup, hash, isPending, isConfirming, isSuccess, error }
}

export function useAllStartups(offset: bigint = 0n, limit: bigint = 10n) {
  const { startupRegistry } = useContractAddress()

  return useReadContract({
    address: startupRegistry as `0x${string}`,
    abi: StartupRegistryABI.abi,
    functionName: 'getStartups',
    args: [offset, limit],
    query: { enabled: !!startupRegistry }
  })
}

export function useFounderStartups(founderAddress: string) {
  const { startupRegistry } = useContractAddress()

  return useReadContract({
    address: startupRegistry as `0x${string}`,
    abi: StartupRegistryABI.abi,
    functionName: 'getStartupsByFounder',
    args: [founderAddress as `0x${string}`],
    query: { enabled: !!startupRegistry && !!founderAddress }
  })
}

export function useStartupDetails(startupId: string) {
  const { startupRegistry } = useContractAddress()

  return useReadContract({
    address: startupRegistry as `0x${string}`,
    abi: StartupRegistryABI.abi,
    functionName: 'getStartup',
    args: [startupId as `0x${string}`],
    query: { enabled: !!startupRegistry && !!startupId }
  })
}

// --- TOKENIZED SAFE HOOKS ---

export function useInvest() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  // Note: approve() should be handled by UI before calling this if allowance is low
  const invest = async (roundAddress: string, amount: bigint) => {
    writeContract({
      address: roundAddress as `0x${string}`,
      abi: TokenizedSAFEABI.abi,
      functionName: 'invest',
      args: [amount]
    })
  }

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  return { invest, hash, isPending, isConfirming, isSuccess, error }
}

export function useRoundDetails(roundAddress: string) {
  // Reading simplified info for adapter compatibility
  // Ideally, use multicall
  const { data: name } = useReadContract({
    address: roundAddress as `0x${string}`,
    abi: TokenizedSAFEABI.abi,
    functionName: 'name',
    query: { enabled: !!roundAddress }
  })

  const { data: symbol } = useReadContract({
    address: roundAddress as `0x${string}`,
    abi: TokenizedSAFEABI.abi,
    functionName: 'symbol',
    query: { enabled: !!roundAddress }
  })

  // Returning tuple-like structure to match legacy useCoinInfo if needed, or object
  // Legacy useCoinInfo returned: [name, description, website, totalSupply, pricePerCoin, coinsSold, ...]
  // We mock the missing parts suitable for UI display
  if (!name) return { data: null }

  return {
    data: [
      name,
      'Startup Funding Round', // description placeholder
      'https://launchpad.xyz', // website placeholder
      1000000n, // totalSupply placeholder
      1000000n, // pricePerCoin placeholder
      0n,       // coinsSold placeholder
      0n,       // fundsRaised placeholder
      0n,       // investorCount placeholder
      false     // isClosed
    ] as const
  }
}

// --- MILESTONE HOOKS ---

export function useCreateMilestone() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const createMilestone = async (roundAddress: string, description: string, amount: bigint) => {
    writeContract({
      address: roundAddress as `0x${string}`,
      abi: TokenizedSAFEABI.abi,
      functionName: 'createMilestone',
      args: [description, amount]
    })
  }

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  return { createMilestone, hash, isPending, isConfirming, isSuccess, error }
}

export function useWithdrawMilestone() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const withdrawMilestone = async (roundAddress: string, milestoneId: bigint) => {
    writeContract({
      address: roundAddress as `0x${string}`,
      abi: TokenizedSAFEABI.abi,
      functionName: 'withdrawMilestoneFunds',
      args: [milestoneId]
    })
  }

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  return { withdrawMilestone, hash, isPending, isConfirming, isSuccess, error }
}

export function useMilestones(roundAddress: string) {
  const { data: countRaw } = useReadContract({
    address: roundAddress as `0x${string}`,
    abi: TokenizedSAFEABI.abi,
    functionName: 'milestoneCount',
    query: { enabled: !!roundAddress }
  })
  return { count: countRaw ? Number(countRaw) : 0 }
}

// Get detailed milestone information
export function useMilestoneDetails(roundAddress: string, milestoneId: number) {
  const { data } = useReadContract({
    address: roundAddress as `0x${string}`,
    abi: TokenizedSAFEABI.abi,
    functionName: 'milestones',
    args: [BigInt(milestoneId)],
    query: { enabled: !!roundAddress && milestoneId >= 0 }
  })

  if (!data) return null

  // Milestone struct: [description, amount, isCompleted, isVerified, proofOfWork]
  const milestone = data as readonly [string, bigint, boolean, boolean, string]

  return {
    description: milestone[0],
    amount: milestone[1],
    isCompleted: milestone[2],
    isVerified: milestone[3],
    proofOfWork: milestone[4]
  }
}

// Submit proof-of-work for a milestone
export function useSubmitMilestoneProof() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const submitProof = async (roundAddress: string, milestoneId: bigint, proofUrl: string) => {
    writeContract({
      address: roundAddress as `0x${string}`,
      abi: TokenizedSAFEABI.abi,
      functionName: 'submitMilestoneProof',
      args: [milestoneId, proofUrl]
    })
  }

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  return { submitProof, hash, isPending, isConfirming, isSuccess, error }
}

// Verify a milestone (admin/protocol only)
export function useValuationCap(roundAddress: string) {
  return useReadContract({
    address: roundAddress as `0x${string}`,
    abi: TokenizedSAFEABI.abi,
    functionName: 'valuationCap',
    query: { enabled: !!roundAddress }
  })
}

export function useVerifyMilestone() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const verifyMilestone = async (roundAddress: string, milestoneId: bigint) => {
    writeContract({
      address: roundAddress as `0x${string}`,
      abi: TokenizedSAFEABI.abi,
      functionName: 'verifyMilestone',
      args: [milestoneId]
    })
  }

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  return { verifyMilestone, hash, isPending, isConfirming, isSuccess, error }
}

// --- LEGACY ADAPTERS (For Backward Compatibility) ---

export function useEntrepreneurs() {
  return useAllStartups()
}

export function useCoinInfo(entrepreneurAddress: string) {
  // Adapter: In new model, `entrepreneurAddress` in UI context is treated as `roundAddress` (SAFE address)
  // because InvestorPage iterates over SAFE addresses.
  return useRoundDetails(entrepreneurAddress)
}

export function useBuyCoin() {
  const { invest, ...rest } = useInvest()
  // Adapter to match signature: (entrepreneurAddress, quantity, totalCost)
  // We treat entrepreneurAddress as roundAddress, quantity as amount (USDC)
  const buyCoin = async (addr: string, qty: bigint, cost: bigint) => {
    // "qty" in old model was tokens. "cost" was msg.value.
    // In USDC model, "qty" is USDC amount we want to invest.
    return invest(addr, qty)
  }
  return { buyCoin, ...rest }
}

export function useInvestment(entrepreneurAddress: string) { return { data: null } }
export function useCoinBalance(entrepreneurAddress: string) { return { data: 0n } }
export function useOwnershipPercentage(entrepreneurAddress: string, investorAddress: string) { return { data: 0 } }
export function useHasCoin(entrepreneurAddress: string) { return { data: false } }
export function useGetInvestment(inv: string, ent: string) { return { data: 0n } }
export function useInvestmentAmount(inv: string, ent: string) { return { data: 0n } }
export function useCapTableSummary(id: bigint) { return { data: null } }
export function useCreateCoin() {
  return { createCoin: async () => { }, hash: undefined, isPending: false, isConfirming: false, isSuccess: false, error: null }
}
export function useAllEntrepreneurs() { return useAllStartups() }
export function useInvestorPortfolio(inv: string) {
  const { data } = useAllStartups()
  return { entrepreneurs: data as string[] || [], isLoading: false, error: null }
}
export function useInvestorCoins(inv: string) {
  const { entrepreneurs, isLoading, error } = useInvestorPortfolio(inv)
  return { data: entrepreneurs, isLoading, error }
}

export function formatEthValue(value: bigint): string {
  return formatEther(value)
}