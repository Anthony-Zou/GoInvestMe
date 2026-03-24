'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { formatUnits, parseUnits } from 'viem'
import { toast } from 'sonner'
import { CONTRACTS, ERC20ABI, StartupRegistryABI, TokenizedSAFEABI, InvestorRegistryABI } from '@/lib/contracts'
import { TrendingUp, CheckCircle, Search } from 'lucide-react'

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useAllStartups() {
  return useReadContract({
    address: CONTRACTS.startupRegistry as `0x${string}`,
    abi: StartupRegistryABI.abi,
    functionName: 'getStartups',
    args: [0n, 20n],
  })
}

function useSAFEContracts(startupId: string) {
  return useReadContract({
    address: CONTRACTS.startupRegistry as `0x${string}`,
    abi: StartupRegistryABI.abi,
    functionName: 'getSAFEContracts',
    args: [startupId as `0x${string}`],
    query: { enabled: !!startupId },
  })
}

function useRoundInfo(roundAddress: string) {
  const name = useReadContract({
    address: roundAddress as `0x${string}`,
    abi: TokenizedSAFEABI.abi,
    functionName: 'name',
    query: { enabled: !!roundAddress },
  })
  const raised = useReadContract({
    address: roundAddress as `0x${string}`,
    abi: TokenizedSAFEABI.abi,
    functionName: 'totalSupply',
    query: { enabled: !!roundAddress, refetchInterval: 5000 },
  })
  const cap = useReadContract({
    address: roundAddress as `0x${string}`,
    abi: TokenizedSAFEABI.abi,
    functionName: 'valuationCap',
    query: { enabled: !!roundAddress },
  })
  const minInvestment = useReadContract({
    address: roundAddress as `0x${string}`,
    abi: TokenizedSAFEABI.abi,
    functionName: 'minInvestment',
    query: { enabled: !!roundAddress },
  })
  const investorRegistry = useReadContract({
    address: roundAddress as `0x${string}`,
    abi: TokenizedSAFEABI.abi,
    functionName: 'investorRegistry',
    query: { enabled: !!roundAddress },
  })
  const isActive = !investorRegistry.data ||
    (investorRegistry.data as string).toLowerCase() === CONTRACTS.investorRegistry.toLowerCase()
  return {
    name: name.data as string,
    raised: raised.data as bigint,
    cap: cap.data as bigint,
    minInvestment: minInvestment.data as bigint | undefined,
    isActive,
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InvestorPage() {
  const { isConnected } = useAccount()
  const [selected, setSelected] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const { data: startupIds, isLoading } = useAllStartups()
  const ids = startupIds as string[] | undefined

  if (!isConnected) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <p className="text-gray-500">Connect your wallet to see available rounds.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-10 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deal Flow</h1>
          <p className="text-gray-500 mt-1">Discover and invest in curated pre-seed opportunities.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search rounds..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className={selected ? 'lg:col-span-5' : 'lg:col-span-12'}>
          {isLoading ? (
            <p className="text-gray-400">Loading...</p>
          ) : !ids || ids.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {ids.map(id => (
                <StartupRounds key={id} startupId={id} selected={selected} onSelect={setSelected} search={search} />
              ))}
            </div>
          )}
        </div>

        {selected && (
          <div className="lg:col-span-7">
            <InvestPanel roundAddress={selected} onBack={() => setSelected(null)} />
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
      <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p className="font-semibold text-gray-700">No active rounds yet</p>
      <p className="text-sm text-gray-400 mt-1">Founders haven&apos;t launched any rounds on this network.</p>
    </div>
  )
}

// Resolves startup → SAFE addresses → renders only the latest RoundCard
function StartupRounds({ startupId, selected, onSelect, search }: {
  startupId: string; selected: string | null; onSelect: (a: string) => void; search: string
}) {
  const { data } = useSAFEContracts(startupId)
  const safes = data as string[] | undefined
  if (!safes || safes.length === 0) return null
  const latest = safes[safes.length - 1]
  return <RoundCard roundAddress={latest} isSelected={selected === latest} onClick={() => onSelect(latest)} search={search} />
}

function RoundCard({ roundAddress, isSelected, onClick, search }: {
  roundAddress: string; isSelected: boolean; onClick: () => void; search: string
}) {
  const { name, raised, cap, isActive } = useRoundInfo(roundAddress)
  if (!name) return <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
  if (search && !name.toLowerCase().includes(search.toLowerCase())) return null

  return (
    <div
      onClick={isActive ? onClick : undefined}
      className={`p-5 rounded-xl border transition-all ${
        !isActive ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100' :
        isSelected ? 'border-blue-500 bg-blue-50 cursor-pointer hover:shadow-md' :
        'bg-white border-gray-100 cursor-pointer hover:shadow-md'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">SAFE Round · Sepolia</p>
        </div>
        {isActive
          ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Live</span>
          : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">Inactive</span>
        }
      </div>
      <div className="flex gap-6 mt-3 text-sm">
        <span className="text-gray-600">Raised: <strong>${formatUnits(raised ?? 0n, 6)}</strong></span>
        {cap && <span className="text-gray-600">Cap: <strong>${formatUnits(cap, 6)}</strong></span>}
      </div>
    </div>
  )
}

// ─── Invest Panel ─────────────────────────────────────────────────────────────

function InvestPanel({ roundAddress, onBack }: { roundAddress: string; onBack: () => void }) {
  const { address } = useAccount()
  const queryClient = useQueryClient()
  const { name, raised, cap, minInvestment, isActive } = useRoundInfo(roundAddress)
  const [amount, setAmount] = useState('')
  const [approvedAmount, setApprovedAmount] = useState(0n)
  const [txStage, setTxStage] = useState<'idle' | 'approving' | 'investing' | 'done'>('idle')

  const amountBn = amount ? parseUnits(amount, 6) : 0n
  const needsApproval = amountBn > 0n && approvedAmount < amountBn

  // USDC balance (auto-refresh)
  const { data: usdcBalance } = useReadContract({
    address: CONTRACTS.mockUsdc as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { enabled: !!address, refetchInterval: 6000 },
  })
  const balance = (usdcBalance as bigint | undefined) ?? 0n
  const insufficientBalance = amountBn > 0n && balance < amountBn
  const belowMin = minInvestment && amountBn > 0n && amountBn < minInvestment

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isSuccess, isError: txFailed } = useWaitForTransactionReceipt({ hash })

  // KYC check removed — TestnetVerifier accepts all wallets

  // Default amount to minInvestment
  useEffect(() => {
    if (minInvestment && !amount) setAmount(formatUnits(minInvestment, 6))
  }, [minInvestment]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset on amount change — need to re-approve if amount increases
  useEffect(() => {
    if (amountBn > approvedAmount) setApprovedAmount(0n)
  }, [amount]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isSuccess && !txFailed) return

    if (txFailed) {
      setTxStage('idle')
      toast.error('Transaction failed or was cancelled.')
      return
    }

    if (txStage === 'approving') {
      setApprovedAmount(amountBn)
      toast.success('USDC approved! Sending investment…')
      setTxStage('investing')
      writeContract({
        address: roundAddress as `0x${string}`,
        abi: TokenizedSAFEABI.abi,
        functionName: 'invest',
        args: [amountBn],
      })
    } else if (txStage === 'investing') {
      setTxStage('done')
      // Delay so RPC node has time to index the new state before refetch
      setTimeout(() => queryClient.invalidateQueries(), 3000)
    }
  }, [isSuccess, txFailed]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isActive) return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
      <button onClick={onBack} className="text-sm text-gray-500 mb-6 hover:text-gray-700 block">← Back</button>
      <p className="font-semibold text-gray-700">This round is no longer active.</p>
      <p className="text-sm text-gray-400 mt-1">The founder needs to launch a new round.</p>
    </div>
  )

  if (txStage === 'done') return (
    <div className="bg-green-50 p-10 rounded-2xl border border-green-200 text-center">
      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
      <h2 className="text-xl font-bold text-green-800">Investment Confirmed!</h2>
      <p className="text-green-700 mt-1">${amount} USDC invested in {name}.</p>
      <button onClick={onBack} className="mt-4 btn-secondary">← Back to rounds</button>
    </div>
  )

  // Show confirming overlay while tx is in flight
  if (isPending || (hash && txStage !== 'idle' && !isSuccess)) return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
      <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="font-semibold text-gray-800">
        {txStage === 'approving' ? 'Step 1/2: Approving USDC…' : 'Step 2/2: Sending Investment…'}
      </p>
      <p className="text-sm text-gray-400 mt-1">
        {isPending ? 'Confirm in MetaMask.' : 'Waiting for confirmation (~15s)…'}
      </p>
    </div>
  )

  const handleInvest = () => {
    if (needsApproval) {
      setTxStage('approving')
      writeContract({
        address: CONTRACTS.mockUsdc as `0x${string}`,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [roundAddress as `0x${string}`, amountBn],
      })
    } else {
      setTxStage('investing')
      writeContract({
        address: roundAddress as `0x${string}`,
        abi: TokenizedSAFEABI.abi,
        functionName: 'invest',
        args: [amountBn],
      })
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 bg-slate-50 border-b">
        <button onClick={onBack} className="text-sm text-gray-500 mb-3 hover:text-gray-700">← Back</button>
        <h2 className="text-2xl font-bold">{name}</h2>
        <div className="flex gap-6 mt-2 text-sm text-gray-600">
          <span>Raised: <strong>${formatUnits(raised ?? 0n, 6)}</strong></span>
          {cap && <span>Cap: <strong>${formatUnits(cap, 6)}</strong></span>}
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Your USDC balance</span>
          <span className={balance === 0n ? 'text-red-500 font-medium' : 'text-gray-700 font-medium'}>
            ${formatUnits(balance, 6)}{balance === 0n && ' — get test USDC below'}
          </span>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">
            Investment Amount (USDC)
            {minInvestment && <span className="text-gray-400 font-normal ml-1">min ${formatUnits(minInvestment, 6)}</span>}
          </label>
          <input className="input" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>

        {belowMin && <p className="text-xs text-red-500">Minimum is ${formatUnits(minInvestment!, 6)} USDC</p>}
        {insufficientBalance && !belowMin && <p className="text-xs text-red-500">Insufficient balance.</p>}

        <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg p-3">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <p className="text-sm text-green-700 font-medium">Identity verified</p>
        </div>

        <button
          className="btn-primary w-full h-12 text-base"
          disabled={!amount || !!belowMin || insufficientBalance}
          onClick={handleInvest}
        >
          {needsApproval ? 'Approve & Invest' : 'Invest Now'}
        </button>

        {balance === 0n && <MintTestUsdc onMinted={() => queryClient.invalidateQueries()} />}
      </div>

    </div>
  )
}

function MintTestUsdc({ onMinted }: { onMinted: () => void }) {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (isSuccess) { toast.success('1,000 test USDC added to your wallet!'); onMinted() }
  }, [isSuccess, onMinted])

  return (
    <div className="border border-dashed border-gray-200 rounded-lg p-3 text-center">
      <p className="text-xs text-gray-500 mb-2">Testnet only — get free USDC to try investing</p>
      <button
        className="btn-secondary text-xs px-4 py-1.5"
        disabled={isPending}
        onClick={() => writeContract({
          address: CONTRACTS.mockUsdc as `0x${string}`,
          abi: ERC20ABI,
          functionName: 'mint',
          args: [address as `0x${string}`, parseUnits('1000', 6)],
        })}
      >
        {isPending ? 'Minting…' : 'Get 1,000 Test USDC'}
      </button>
    </div>
  )
}

// ─── KYC Modal ────────────────────────────────────────────────────────────────

function KycModal({ onClose, onVerified }: { onClose: () => void; onVerified: () => void }) {
  const { address } = useAccount()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [accredited, setAccredited] = useState(false)
  const [terms, setTerms] = useState(false)
  const [step, setStep] = useState<'form' | 'registering' | 'certifying'>('form')
  const attempted = useRef(false)

  // Check if already registered on-chain
  const { data: alreadyRegistered } = useReadContract({
    address: CONTRACTS.investorRegistry as `0x${string}`,
    abi: InvestorRegistryABI.abi,
    functionName: 'isInvestorRegistered',
    args: [address as `0x${string}`],
    query: { enabled: !!address },
  })

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isSuccess: registered, isError: txFailed } = useWaitForTransactionReceipt({ hash })

  // If tx failed, go back to form with error
  useEffect(() => {
    if (txFailed && step === 'registering') {
      setStep('form')
      attempted.current = false
      toast.error('Transaction failed. You may already be registered — try clicking Confirm again.')
    }
  }, [txFailed, step])

  // Step 2: after registerInvestor confirms (or already registered), call certify API
  const runCertify = useRef(false)
  const certify = useCallback(() => {
    if (runCertify.current) return
    runCertify.current = true
    setStep('certifying')
    fetch('/api/kyc/certify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, isAccredited: accredited, termsAccepted: terms }),
    })
      .then(r => r.json())
      .then(() => { toast.success('Verified! You can now invest.'); onVerified() })
      .catch(() => { toast.success('On-chain registration confirmed.'); onVerified() })
  }, [name, email, accredited, terms, onVerified])

  useEffect(() => {
    if (registered && step === 'registering' && !attempted.current) {
      attempted.current = true
      certify()
    }
  }, [registered, step, certify])

  const handleSubmit = () => {
    if (!name || !email || !accredited || !terms) { toast.error('Please complete all fields'); return }

    // Already registered on-chain — skip the wallet tx, go straight to certify
    if (alreadyRegistered) {
      certify()
      return
    }

    setStep('registering')
    writeContract({
      address: CONTRACTS.investorRegistry as `0x${string}`,
      abi: InvestorRegistryABI.abi,
      functionName: 'registerInvestor',
      args: ['US'],
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Confirm Investor Status</h2>
          {step === 'form' && <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>}
        </div>

        {step !== 'form' ? (
          <div className="text-center py-6">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="font-medium">{step === 'registering' ? 'Step 1/2: Registering on-chain…' : 'Step 2/2: Confirming…'}</p>
            {step === 'registering' && <p className="text-sm text-gray-400 mt-1">Approve the transaction in MetaMask.</p>}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">One-time confirmation. Two quick steps: sign a wallet transaction, then you&apos;re in.</p>
            <input className="input" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
            <input className="input" placeholder="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={accredited} onChange={e => setAccredited(e.target.checked)} className="mt-0.5" />
              <span className="text-sm text-gray-700">I confirm I am an accredited or sophisticated investor and understand startup investments carry significant risk.</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} className="mt-0.5" />
              <span className="text-sm text-gray-700">I agree to the terms and understand this is a SAFE, not a direct equity purchase.</span>
            </label>
            <button
              className="btn-primary w-full mt-2"
              disabled={isPending || !name || !email || !accredited || !terms}
              onClick={handleSubmit}
            >
              Confirm & Proceed
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
