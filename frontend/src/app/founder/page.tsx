'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { ConnectWallet } from '@/components/ConnectWallet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useFounderStartups,
  useStartupDetails,
  useRegisterStartup,
  useCreateRound,
  useRoundDetails,
  useMilestones,
  useCreateMilestone,
  useWithdrawMilestone
} from '@/lib/hooks'
import { ArrowLeft, Plus, TrendingUp, Users, DollarSign, CheckCircle, Clock, ShieldCheck, Flag, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'

export default function FounderPage() {
  const { address, isConnected } = useAccount()

  // 1. Fetch Founder's Startups
  const { data: startupIds, isLoading: loadingStartups } = useFounderStartups(address || '0x0')
  const startupId = startupIds && (startupIds as string[]).length > 0 ? (startupIds as string[])[0] : null

  // 2. Fetch Startup Details
  const { data: startupData, isLoading: loadingDetails } = useStartupDetails(startupId || '')
  // Struct: [founder, name, cid, kybVerified, regDate, kybTime, isActive, safeContracts]
  const startupName = startupData ? (startupData as any)[1] : ''
  const safeContracts = startupData ? (startupData as any)[7] as string[] : []
  const roundAddress = safeContracts && safeContracts.length > 0 ? safeContracts[0] : null

  // 3. Fetch Round Details
  const { data: roundInfo } = useRoundDetails(roundAddress || '')
  const roundName = roundInfo ? roundInfo[0] : ''
  const raised = roundInfo ? roundInfo[6] : 0n // fundsRaised

  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showCreateRoundModal, setShowCreateRoundModal] = useState(false)
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)

  if (!isConnected) {
    return (
      <LandingState />
    )
  }

  const hasStartup = !!startupId
  const hasRound = !!roundAddress

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center bg-white border-b border-gray-100 sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          LaunchPad
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-100">
            <ShieldCheck className="w-3.5 h-3.5" />
            Founder
          </div>
          <ConnectWallet />
        </div>
      </nav>

      <div className="container mx-auto px-6 py-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                {startupName || 'Founder Dashboard'}
              </h1>
              <p className="text-gray-600">
                {hasStartup ? 'Manage your fundraising and milestones.' : 'Register your startup to begin.'}
              </p>
            </div>

            {!hasStartup && (
              <Button onClick={() => setShowRegisterModal(true)} size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Building2 className="mr-2 h-5 w-5" /> Register Startup
              </Button>
            )}

            {hasStartup && !hasRound && (
              <Button onClick={() => setShowCreateRoundModal(true)} size="lg" className="bg-green-600 hover:bg-green-700">
                <TrendingUp className="mr-2 h-5 w-5" /> Launch Round
              </Button>
            )}
          </div>

          {/* Dashboard Content */}
          {hasRound ? (
            <div className="space-y-8">
              {/* Stats Row */}
              <div className="grid md:grid-cols-3 gap-6">
                <StatCard icon={TrendingUp} label="Status" value="Active" color="green" />
                <StatCard icon={DollarSign} label="Funds Raised" value={raised ? `${formatEther(raised)} USDC` : '0 USDC'} color="blue" />
                <StatCard icon={Users} label="Investors" value="-" color="purple" />
              </div>

              {/* Milestones */}
              <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Milestones & Unlocks</h2>
                  <Button variant="outline" onClick={() => setShowMilestoneModal(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add Milestone
                  </Button>
                </div>
                <MilestoneList roundAddress={roundAddress!} />
              </div>
            </div>
          ) : hasStartup ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 border-dashed">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to Raise?</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Launch a compliant SAFE round to accept investments from verified investors.
              </p>
              <Button onClick={() => setShowCreateRoundModal(true)}>Launch Round</Button>
            </div>
          ) : (
            // No Startup State handled by header button mostly, but can add placeholder here
            <div className="bg-slate-50 rounded-2xl p-8 text-center">
              <p className="text-gray-500">Please register your startup to continue.</p>
            </div>
          )}

        </div>
      </div>

      {/* Modals */}
      <RegisterStartupModal open={showRegisterModal} onOpenChange={setShowRegisterModal} />
      {startupId && <CreateRoundModal open={showCreateRoundModal} onOpenChange={setShowCreateRoundModal} startupId={startupId} />}
      {roundAddress && <CreateMilestoneModal open={showMilestoneModal} onOpenChange={setShowMilestoneModal} roundAddress={roundAddress} />}

    </div>
  )
}

function LandingState() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col items-center justify-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">LaunchPad</h1>
        <p className="text-gray-600 mb-8">Connect your wallet to access the Founder Dashboard.</p>
        <div className="flex justify-center"><ConnectWallet /></div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-${color}-50`}>
        <Icon className={`h-5 w-5 text-${color}-600`} />
      </div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}

// --- SUBCOMPONENTS ---

function MilestoneList({ roundAddress }: { roundAddress: string }) {
  const { count } = useMilestones(roundAddress)
  const { withdrawMilestone, isPending } = useWithdrawMilestone()

  // In a real app, fetch each milestone details (0 to count-1)
  // For now, we mock the list visual based on count

  if (count === 0) return <p className="text-gray-500 italic">No milestones defined yet.</p>

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-full border border-gray-200">
              <Flag className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Milestone #{i + 1}</p>
              <p className="text-xs text-gray-500">Unlocks funds upon completion</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => withdrawMilestone(roundAddress, BigInt(i))} disabled={isPending}>
            {isPending ? 'Processing...' : 'Request Withdraw'}
          </Button>
        </div>
      ))}
    </div>
  )
}

function RegisterStartupModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { registerStartup, isPending, isSuccess } = useRegisterStartup()
  const [name, setName] = useState('')

  useEffect(() => {
    if (isSuccess) {
      toast.success('Startup registered!')
      onOpenChange(false)
    }
  }, [isSuccess, onOpenChange])

  return (
    <Modal isOpen={open} onClose={() => onOpenChange(false)} title="Register Startup">
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Create your on-chain identity.</p>
        <div className="space-y-2">
          <label className="text-sm font-medium">Company Name</label>
          <Input value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} placeholder="Acme Inc." />
        </div>
        <Button onClick={() => registerStartup(name, 'QmMockCID')} disabled={isPending || !name} className="w-full">
          {isPending ? 'Registering...' : 'Register'}
        </Button>
      </div>
    </Modal>
  )
}

function CreateRoundModal({ open, onOpenChange, startupId }: { open: boolean, onOpenChange: (open: boolean) => void, startupId: string }) {
  const { createRound, isPending, isSuccess } = useCreateRound()
  const [cap, setCap] = useState('')

  useEffect(() => {
    if (isSuccess) {
      toast.success('Round launched!')
      onOpenChange(false)
    }
  }, [isSuccess, onOpenChange])

  const handleCreate = () => {
    createRound(
      startupId,
      parseEther(cap || '5000000').toString(),
      0,
      parseEther('100').toString(),
      parseEther('100000').toString(),
      30 * 24 * 60 * 60
    )
  }

  return (
    <Modal isOpen={open} onClose={() => onOpenChange(false)} title="Launch Funding Round">
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Deploy a compliant SAFE contract.</p>
        <div className="space-y-2">
          <label className="text-sm font-medium">Valuation Cap (USDC)</label>
          <Input type="number" value={cap} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCap(e.target.value)} placeholder="5000000" />
        </div>
        <Button onClick={handleCreate} disabled={isPending || !cap} className="w-full">
          {isPending ? 'Deploying...' : 'Launch Round'}
        </Button>
      </div>
    </Modal>
  )
}

function CreateMilestoneModal({ open, onOpenChange, roundAddress }: { open: boolean, onOpenChange: (open: boolean) => void, roundAddress: string }) {
  const { createMilestone, isPending, isSuccess } = useCreateMilestone()
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (isSuccess) {
      toast.success('Milestone created!')
      onOpenChange(false)
    }
  }, [isSuccess, onOpenChange])

  return (
    <Modal isOpen={open} onClose={() => onOpenChange(false)} title="Add Milestone">
      <div className="space-y-4">
        <Input value={desc} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDesc(e.target.value)} placeholder="Description (e.g. Beta Launch)" />
        <Input type="number" value={amount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)} placeholder="Amount to Unlock (USDC)" />

        <Button onClick={() => createMilestone(roundAddress, desc, parseEther(amount || '0'))} disabled={isPending} className="w-full">
          {isPending ? 'Creating...' : 'Add Milestone'}
        </Button>
      </div>
    </Modal>
  )
}