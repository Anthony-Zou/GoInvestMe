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
  useMilestoneDetails,
  useCreateMilestone,
  useWithdrawMilestone
} from '@/lib/hooks'
import { ArrowLeft, Plus, TrendingUp, Users, DollarSign, CheckCircle, Clock, ShieldCheck, Flag, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { SubmitProofModal } from '@/components/SubmitProofModal'
import { AddTeamMemberModal } from '@/components/AddTeamMemberModal'
import { TeamList } from '@/components/TeamList'

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
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [teamRefresh, setTeamRefresh] = useState(0)

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

              {/* Team Section */}
              <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Team</h2>
                  <Button variant="outline" onClick={() => setShowTeamModal(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add Member
                  </Button>
                </div>
                <TeamList startupId={startupId!} onRefresh={teamRefresh} />
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
            <div className="space-y-8">
              {/* Team Section (before fundraising) */}
              <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold">Build Your Team</h2>
                    <p className="text-sm text-gray-600 mt-1">Add co-founders and key team members before launching your round</p>
                  </div>
                  <Button variant="outline" onClick={() => setShowTeamModal(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add Member
                  </Button>
                </div>
                <TeamList startupId={startupId!} onRefresh={teamRefresh} />
              </div>

              {/* Launch Round CTA */}
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
      {startupId && (
        <AddTeamMemberModal
          open={showTeamModal}
          onOpenChange={setShowTeamModal}
          startupId={startupId}
          onSuccess={() => setTeamRefresh(prev => prev + 1)}
        />
      )}

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
  const [showProofModal, setShowProofModal] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null)

  if (count === 0) return <p className="text-gray-500 italic">No milestones defined yet. Add your first milestone to unlock funds based on deliverables.</p>

  return (
    <>
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <MilestoneCard
            key={i}
            roundAddress={roundAddress}
            milestoneId={i}
            onSubmitProof={() => {
              setSelectedMilestone(i)
              setShowProofModal(true)
            }}
          />
        ))}
      </div>

      {selectedMilestone !== null && (
        <SubmitProofModal
          open={showProofModal}
          onOpenChange={setShowProofModal}
          roundAddress={roundAddress}
          milestoneId={selectedMilestone}
        />
      )}
    </>
  )
}

function MilestoneCard({ roundAddress, milestoneId, onSubmitProof }: {
  roundAddress: string
  milestoneId: number
  onSubmitProof: () => void
}) {
  const milestone = useMilestoneDetails(roundAddress, milestoneId)
  const { withdrawMilestone, isPending } = useWithdrawMilestone()

  if (!milestone) {
    return (
      <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 animate-pulse">
        <div className="h-12 bg-slate-200 rounded w-1/2"></div>
      </div>
    )
  }

  const getStatusBadge = () => {
    if (milestone.isVerified) {
      return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">✓ Verified</span>
    }
    if (milestone.isCompleted) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">⏳ Pending Verification</span>
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">○ Not Started</span>
  }

  const getActionButton = () => {
    if (milestone.isVerified) {
      return (
        <Button
          size="sm"
          onClick={() => withdrawMilestone(roundAddress, BigInt(milestoneId))}
          disabled={isPending}
          className="bg-green-600 hover:bg-green-700"
        >
          {isPending ? 'Processing...' : '💰 Withdraw Funds'}
        </Button>
      )
    }
    if (milestone.isCompleted) {
      return (
        <Button size="sm" variant="outline" disabled>
          Awaiting Verification
        </Button>
      )
    }
    return (
      <Button size="sm" onClick={onSubmitProof} className="bg-blue-600 hover:bg-blue-700">
        📤 Submit Proof
      </Button>
    )
  }

  return (
    <div className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2 rounded-full border border-blue-200">
            <Flag className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900">Milestone #{milestoneId + 1}</p>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-gray-600">{milestone.description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Unlock Amount</p>
          <p className="text-lg font-bold text-gray-900">{formatEther(milestone.amount)} USDC</p>
        </div>
      </div>

      {milestone.proofOfWork && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs font-semibold text-blue-700 mb-1">Proof of Work Submitted:</p>
          <a
            href={milestone.proofOfWork}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline break-all"
          >
            {milestone.proofOfWork}
          </a>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        {getActionButton()}
      </div>
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