'use client'
import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { formatUnits, parseUnits } from 'viem'
import { toast } from 'sonner'
import { CONTRACTS, StartupRegistryABI, TokenizedSAFEABI } from '@/lib/contracts'
import { Plus, TrendingUp, CheckCircle, Clock, Flag } from 'lucide-react'

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useFounderStartups(address: string) {
  return useReadContract({
    address: CONTRACTS.startupRegistry as `0x${string}`,
    abi: StartupRegistryABI.abi,
    functionName: 'getStartupsByFounder',
    args: [address as `0x${string}`],
    query: { enabled: !!address },
  })
}

function useStartupDetails(startupId: string) {
  return useReadContract({
    address: CONTRACTS.startupRegistry as `0x${string}`,
    abi: StartupRegistryABI.abi,
    functionName: 'getStartup',
    args: [startupId as `0x${string}`],
    query: { enabled: !!startupId },
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

function useMilestoneCount(roundAddress: string) {
  return useReadContract({
    address: roundAddress as `0x${string}`,
    abi: TokenizedSAFEABI.abi,
    functionName: 'milestoneCount',
    query: { enabled: !!roundAddress, refetchInterval: 4000 },
  })
}

function useMilestoneDetails(roundAddress: string, id: number) {
  return useReadContract({
    address: roundAddress as `0x${string}`,
    abi: TokenizedSAFEABI.abi,
    functionName: 'milestones',
    args: [BigInt(id)],
    query: { enabled: !!roundAddress && id >= 0, refetchInterval: 4000 },
  })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FounderPage() {
  const { address, isConnected } = useAccount()

  const { data: startupIds } = useFounderStartups(address ?? '')
  const startupId = (startupIds as string[] | undefined)?.[0] ?? ''

  const { data: startupRaw } = useStartupDetails(startupId)
  const startup = startupRaw as { companyName: string } | undefined
  const startupName = startup?.companyName ?? ''

  const { data: safeAddresses } = useSAFEContracts(startupId)
  const safes = safeAddresses as string[] | undefined
  const roundAddress = safes && safes.length > 0 ? safes[safes.length - 1] : ''

  const [showRegister, setShowRegister] = useState(false)
  const [showLaunch, setShowLaunch] = useState(false)
  const [showMilestone, setShowMilestone] = useState(false)

  if (!isConnected) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <p className="text-gray-500">Connect your wallet to access the Founder Dashboard.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-10 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{startupName || 'Founder Dashboard'}</h1>
          <p className="text-gray-500 mt-1">
            {startupId ? 'Manage your fundraising and milestones.' : 'Register your startup to begin.'}
          </p>
        </div>
        {!startupId && (
          <button onClick={() => setShowRegister(true)} className="btn-primary">
            Register Startup
          </button>
        )}
        {startupId && !roundAddress && (
          <button onClick={() => setShowLaunch(true)} className="btn-primary">
            Launch Round
          </button>
        )}
      </div>

      {/* Round info */}
      {roundAddress && <RoundPanel roundAddress={roundAddress} onAddMilestone={() => setShowMilestone(true)} />}

      {/* Modals */}
      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}
      {startupId && showLaunch && <LaunchRoundModal startupId={startupId} onClose={() => setShowLaunch(false)} />}
      {roundAddress && showMilestone && <AddMilestoneModal roundAddress={roundAddress} onClose={() => setShowMilestone(false)} />}
    </div>
  )
}

// ─── Round Panel ──────────────────────────────────────────────────────────────

function RoundPanel({ roundAddress, onAddMilestone }: { roundAddress: string; onAddMilestone: () => void }) {
  const { data: raised } = useReadContract({
    address: roundAddress as `0x${string}`,
    abi: TokenizedSAFEABI.abi,
    functionName: 'totalSupply',
    query: { enabled: !!roundAddress, refetchInterval: 5000 },
  }) as { data: bigint | undefined }

  const { data: cap } = useReadContract({
    address: roundAddress as `0x${string}`,
    abi: TokenizedSAFEABI.abi,
    functionName: 'valuationCap',
    query: { enabled: !!roundAddress },
  }) as { data: bigint | undefined }

  const { data: count } = useMilestoneCount(roundAddress)
  const milestoneCount = count ? Number(count) : 0

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total Raised" value={`$${formatUnits(raised ?? 0n, 6)}`} />
        <StatCard label="Valuation Cap" value={cap ? `$${Number(cap) / 1e6 >= 1e6 ? (Number(cap) / 1e12).toFixed(1) + 'M' : formatUnits(cap, 6)}` : '—'} />
        <StatCard label="Milestones" value={String(milestoneCount)} />
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-900">Milestones</h2>
          <button onClick={onAddMilestone} className="btn-secondary flex items-center gap-1 text-sm">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        {milestoneCount === 0 ? (
          <p className="text-sm text-gray-400 italic">No milestones yet. Add milestones to unlock funds based on deliverables.</p>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: milestoneCount }).map((_, i) => (
              <MilestoneRow key={i} roundAddress={roundAddress} id={i} />
            ))}
          </div>
        )}
      </div>

      {/* Round address */}
      <p className="text-xs text-gray-400 text-center">Round contract: {roundAddress}</p>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}

function MilestoneRow({ roundAddress, id }: { roundAddress: string; id: number }) {
  const { data } = useMilestoneDetails(roundAddress, id)
  if (!data) return null
  const [description, amount, isCompleted, isVerified] = data as [string, bigint, boolean, boolean, string]

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
      {isVerified ? <CheckCircle className="w-4 h-4 text-green-600 shrink-0" /> :
       isCompleted ? <Clock className="w-4 h-4 text-yellow-500 shrink-0" /> :
       <Flag className="w-4 h-4 text-gray-400 shrink-0" />}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{description}</p>
        <p className="text-xs text-gray-500">${formatUnits(amount, 6)} USDC unlock</p>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        isVerified ? 'bg-green-100 text-green-700' :
        isCompleted ? 'bg-yellow-100 text-yellow-700' :
        'bg-gray-100 text-gray-600'
      }`}>
        {isVerified ? 'Verified' : isCompleted ? 'Pending' : 'Open'}
      </span>
    </div>
  )
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function TxModal({ title, onClose, hash, isSuccess, successMsg, children }: {
  title: string; onClose: () => void; hash?: `0x${string}`
  isSuccess: boolean; successMsg: string; children: React.ReactNode
}) {
  const queryClient = useQueryClient()
  useEffect(() => {
    if (isSuccess) {
      toast.success(successMsg)
      onClose()
      // Delay invalidation so the RPC node has time to index the new state
      setTimeout(() => queryClient.invalidateQueries(), 3000)
    }
  }, [isSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  if (hash && !isSuccess) {
    return (
      <Modal title={title} onClose={onClose}>
        <div className="py-8 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-700">Confirming on-chain…</p>
          <p className="text-xs text-gray-400">This takes ~15 seconds on Sepolia.</p>
        </div>
      </Modal>
    )
  }

  return <Modal title={title} onClose={onClose}>{children}</Modal>
}

function RegisterModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({ hash })

  return (
    <TxModal title="Register Startup" onClose={onClose} hash={hash} isSuccess={isSuccess} successMsg="Startup registered!">
      <input className="input" placeholder="Company name" value={name} onChange={e => setName(e.target.value)} />
      <button
        className="btn-primary w-full mt-4"
        disabled={isPending || !name}
        onClick={() => writeContract({
          address: CONTRACTS.startupRegistry as `0x${string}`,
          abi: StartupRegistryABI.abi,
          functionName: 'registerStartup',
          args: [name, ''],
        })}
      >
        {isPending ? 'Sending…' : 'Register'}
      </button>
    </TxModal>
  )
}

function LaunchRoundModal({ startupId, onClose }: { startupId: string; onClose: () => void }) {
  const [cap, setCap] = useState('1000000')
  const [discount, setDiscount] = useState('20')
  const [minInvest, setMinInvest] = useState('100')
  const [maxInvest, setMaxInvest] = useState('25000')
  const [days, setDays] = useState('90')
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({ hash })

  const handleLaunch = () => {
    writeContract({
      address: CONTRACTS.startupRegistry as `0x${string}`,
      abi: StartupRegistryABI.abi,
      functionName: 'createRound',
      args: [
        startupId as `0x${string}`,
        parseUnits(cap, 6),
        BigInt(Math.round(parseFloat(discount) * 100)),
        parseUnits(minInvest, 6),
        parseUnits(maxInvest, 6),
        BigInt(parseInt(days) * 86400),
      ],
    })
  }

  return (
    <TxModal title="Launch Funding Round" onClose={onClose} hash={hash} isSuccess={isSuccess} successMsg="Round launched!">
      <p className="text-sm text-gray-500 mb-4">Deploy a SAFE contract on Sepolia.</p>
      <div className="space-y-3">
        <Field label="Valuation Cap (USDC)" value={cap} onChange={setCap} placeholder="1000000" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Discount Rate (%)" value={discount} onChange={setDiscount} placeholder="20" />
          <Field label="Duration (days)" value={days} onChange={setDays} placeholder="90" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Min Investment (USDC)" value={minInvest} onChange={setMinInvest} placeholder="100" />
          <Field label="Max Investment (USDC)" value={maxInvest} onChange={setMaxInvest} placeholder="25000" />
        </div>
      </div>
      <button className="btn-primary w-full mt-4" disabled={isPending} onClick={handleLaunch}>
        {isPending ? 'Sending…' : 'Launch Round'}
      </button>
    </TxModal>
  )
}

function AddMilestoneModal({ roundAddress, onClose }: { roundAddress: string; onClose: () => void }) {
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({ hash })

  return (
    <TxModal title="Add Milestone" onClose={onClose} hash={hash} isSuccess={isSuccess} successMsg="Milestone added!">
      <div className="space-y-3">
        <Field label="Description" value={desc} onChange={setDesc} placeholder="Launch MVP" type="text" />
        <Field label="Unlock Amount (USDC)" value={amount} onChange={setAmount} placeholder="10000" />
      </div>
      <button
        className="btn-primary w-full mt-4"
        disabled={isPending || !desc || !amount}
        onClick={() => writeContract({
          address: roundAddress as `0x${string}`,
          abi: TokenizedSAFEABI.abi,
          functionName: 'createMilestone',
          args: [desc, parseUnits(amount, 6)],
        })}
      >
        {isPending ? 'Sending…' : 'Add Milestone'}
      </button>
    </TxModal>
  )
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'number' }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
      <input className="input" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type} />
    </div>
  )
}
