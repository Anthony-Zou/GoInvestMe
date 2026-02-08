'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import { ConnectWallet } from '@/components/ConnectWallet'
import { Button } from '@/components/ui/button'
import { useEntrepreneurs, useRoundDetails, useInvest } from '@/lib/hooks'
import { Search, TrendingUp, Wallet, ArrowRight, ShieldCheck, Globe, DollarSign, Filter, PieChart, ArrowLeft, CheckCircle } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'

export default function InvestorPage() {
  const { isConnected } = useAccount()
  const { data: entrepreneursData, isLoading: entrepreneursLoading } = useEntrepreneurs()
  const rounds = entrepreneursData as string[] | undefined
  const [selectedRound, setSelectedRound] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  if (!isConnected) {
    return (
      <LandingState />
    )
  }

  // Filter (mocked)
  const filteredRounds = rounds?.filter((addr: string) =>
    addr.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center bg-white border-b border-gray-100 sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          LaunchPad
        </Link>
        <div className="flex items-center gap-4">
          <ConnectWallet />
        </div>
      </nav>

      <div className="container mx-auto px-6 py-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                Deal Flow
              </h1>
              <p className="text-gray-600">Discover and invest in curated pre-seed opportunities.</p>
            </div>

            <div className="relative w-full md:w-auto min-w-[300px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search rounds..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* List */}
            <div className={`${selectedRound ? 'lg:col-span-4 hidden lg:block' : 'lg:col-span-12'}`}>
              {entrepreneursLoading ? (
                <p>Loading...</p>
              ) : filteredRounds && filteredRounds.length > 0 ? (
                <div className="space-y-4">
                  {filteredRounds.map((addr) => (
                    <RoundListItem
                      key={addr}
                      roundAddress={addr}
                      onClick={() => setSelectedRound(addr)}
                      isSelected={selectedRound === addr}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-white rounded-xl border border-dashed">
                  <p className="text-gray-500">No active rounds found.</p>
                </div>
              )}
            </div>

            {/* Detail Panel */}
            {selectedRound && (
              <div className="lg:col-span-8 animate-in slide-in-from-right-4 duration-300">
                <div className="mb-4 lg:hidden">
                  <Button variant="ghost" onClick={() => setSelectedRound(null)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                </div>
                <div className="sticky top-24">
                  <InvestmentPanel roundAddress={selectedRound} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function LandingState() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Investor Portal</h1>
        <p className="text-gray-600 mb-8">Connect your wallet to see available deals.</p>
        <div className="flex justify-center"><ConnectWallet /></div>
      </div>
    </div>
  )
}

function RoundListItem({ roundAddress, onClick, isSelected }: { roundAddress: string, onClick: () => void, isSelected: boolean }) {
  const { data } = useRoundDetails(roundAddress)
  // data: [name, desc, web, supply, price, sold, raised, investors, closed]

  // Fallback if loading
  if (!data) return <div className="p-4 rounded-xl border bg-gray-50 animate-pulse h-24"></div>

  const name = data[0] as string
  const raised = data[6] as bigint // raw units
  // Assuming USDC (6 decimals)
  const raisedDisplay = formatUnits(BigInt(raised || 0), 6)

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-xl border cursor-pointer transition-all hover:shadow-md ${isSelected ? 'border-blue-500 bg-blue-50' : 'bg-white border-gray-100'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-gray-900">{name}</h3>
        <span className="text-[10px] uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Live</span>
      </div>
      <p className="text-sm text-gray-500 mb-2">SAFE Round</p>
      <p className="text-xs font-medium text-gray-900">Raised: ${raisedDisplay} USDC</p>
    </div>
  )
}

function InvestmentPanel({ roundAddress }: { roundAddress: string }) {
  const { data: roundData } = useRoundDetails(roundAddress)
  const { invest, isPending, isSuccess } = useInvest()

  // State
  const [amount, setAmount] = useState('100') // USDC
  const [showKYC, setShowKYC] = useState(false)
  const [kycVerified, setKycVerified] = useState(false) // Mock

  if (!roundData) return <div>Loading details...</div>

  const name = roundData[0] as string
  const desc = roundData[1] as string
  const raised = formatUnits(BigInt(roundData[6] as bigint || 0), 6)

  const handleInvest = () => {
    if (!kycVerified) {
      setShowKYC(true)
      return
    }
    // Convert input USDC string to BigInt (6 decimals)
    try {
      const amountUnits = parseUnits(amount, 6)
      invest(roundAddress, amountUnits)
    } catch (e) {
      toast.error("Invalid amount")
    }
  }

  if (isSuccess) {
    return (
      <div className="bg-green-50 p-8 rounded-2xl border border-green-200 text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-green-800 mb-2">Investment Successful!</h2>
        <p className="text-green-700">You have successfully invested ${amount} USDC in {name}.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-100 bg-slate-50">
        <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
        <p className="text-gray-600 mt-2">{desc}</p>
      </div>

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Raised</p>
            <p className="text-xl font-bold">${raised}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Valuation Cap</p>
            <p className="text-xl font-bold">$5M</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-700">Investment Amount (USDC)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <Input
              value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
              className="pl-10 text-lg py-6"
              type="number"
            />
          </div>
        </div>

        {!kycVerified && (
          <div className="bg-yellow-50 p-4 rounded-lg flex items-center gap-3 border border-yellow-100">
            <ShieldCheck className="text-yellow-600 h-5 w-5" />
            <p className="text-sm text-yellow-700">KYC Verification required before investing.</p>
          </div>
        )}

        <Button onClick={handleInvest} disabled={isPending || !amount} size="lg" className="w-full text-lg h-14 bg-blue-600 hover:bg-blue-700">
          {isPending ? 'Processing...' : kycVerified ? 'Invest Now' : 'Verify & Invest'}
        </Button>
      </div>

      <Modal isOpen={showKYC} onClose={() => setShowKYC(false)} title="Identity Verification">
        <div className="space-y-4">
          <p className="text-gray-600">Simulating KYC Check...</p>
          <Button className="w-full" onClick={() => {
            toast.success("Verified!")
            setKycVerified(true)
            setShowKYC(false)
          }}>Complete (Mock)</Button>
        </div>
      </Modal>
    </div>
  )
}