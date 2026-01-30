'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { formatEther } from 'viem'
import { ConnectWallet } from '@/components/ConnectWallet'
import { Button } from '@/components/ui/button'
import { useCreateCoin, useHasCoin, useCoinInfo } from '@/lib/hooks'
import { ArrowLeft, Plus, TrendingUp, Users, DollarSign, CheckCircle, Clock, ShieldCheck, Flag } from 'lucide-react'
import { toast } from 'sonner'

export default function FounderPage() {
  const { address, isConnected } = useAccount()
  const { data: hasCoin, isLoading: checkingCoin } = useHasCoin(address || '')
  const { data: coinData, isLoading: loadingCoinInfo } = useCoinInfo(address || '')
  const coinInfo = (coinData as readonly [string, string, string, bigint, bigint, bigint, bigint, bigint, boolean]) || null
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center bg-white border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            LaunchPad
          </Link>
          <ConnectWallet />
        </nav>

        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Founder Dashboard</h1>
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 max-w-lg mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Welcome, Founder</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Connect your wallet to verify your identity, create investment rounds, and manage your startup's fundraising journey.
            </p>
            <div className="flex justify-center">
              <ConnectWallet />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center bg-white border-b border-gray-100 sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          LaunchPad
        </Link>
        <div className="flex items-center gap-4">
          {/* Verified Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-100">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Founder
          </div>
          <ConnectWallet />
        </div>
      </nav>

      <div className="container mx-auto px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                Founder Dashboard
                <span className="md:hidden inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-semibold border border-blue-100 align-middle">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              </h1>
              <p className="text-gray-600">Manage your fundraising rounds and track your build progress.</p>
            </div>
            {!hasCoin && (
              <Button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                size="lg"
              >
                <Plus className="h-5 w-5" />
                New Round
              </Button>
            )}
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">Live</span>
              </div>
              <p className="text-sm text-gray-500 font-medium">Active Rounds</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {checkingCoin ? '...' : hasCoin ? 1 : 0}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium">Total Investors</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {/* Mocked for now since not in contract return */}
                {loadingCoinInfo ? '...' : coinInfo && coinInfo[5] > 0n ? '12' : '0'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium">Capital Raised</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {loadingCoinInfo ? '...' : coinInfo ?
                  `${formatEther(BigInt(coinInfo[5]) * BigInt(coinInfo[4]))} ETH` : '0.00 ETH'}
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content: Rounds */}
            <div className="lg:col-span-2 space-y-8">
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Your Rounds</h2>
                  <Link href="/investor" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View Public Page
                  </Link>
                </div>

                {checkingCoin || loadingCoinInfo ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading your rounds...</p>
                  </div>
                ) : hasCoin && coinInfo ? (
                  <CampaignCard coinInfo={coinInfo as readonly [string, string, string, bigint, bigint, bigint, bigint, bigint, boolean]} onEditClick={() => setShowEditForm(true)} />
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 border-dashed">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No active rounds</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                      You haven't launched any investment rounds yet. Create one to start raising capital.
                    </p>
                    <Button
                      onClick={() => setShowCreateForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Create Round
                    </Button>
                  </div>
                )}
              </section>

              {/* Milestones Section (Placeholder) */}
              {!!hasCoin && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Milestones & Unlocks</h2>
                    <Button variant="outline" size="sm" onClick={() => toast.info('Milestone creation coming locally soon!')}>
                      <Plus className="w-4 h-4 mr-2" /> Add Milestone
                    </Button>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-start gap-4">
                      <div className="mt-1">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Round Closed & Initial Unlock</h4>
                        <p className="text-sm text-gray-500 mt-1">20% of funds unlocked upon round completion.</p>
                      </div>
                      <div className="ml-auto text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-600">Completed</span>
                        <p className="text-sm font-medium text-gray-900 mt-1">10 ETH</p>
                      </div>
                    </div>
                    <div className="p-6 border-b border-gray-50 flex items-start gap-4 opacity-60">
                      <div className="mt-1">
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Beta Launch</h4>
                        <p className="text-sm text-gray-500 mt-1">Release MVP to first 100 users.</p>
                      </div>
                      <div className="ml-auto text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Locked</span>
                        <p className="text-sm font-medium text-gray-900 mt-1">25 ETH</p>
                      </div>
                    </div>
                    <div className="p-6 flex items-start gap-4 opacity-60">
                      <div className="mt-1">
                        <Flag className="w-6 h-6 text-gray-300" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Global Expansion</h4>
                        <p className="text-sm text-gray-500 mt-1">Launch in 3 new markets.</p>
                      </div>
                      <div className="ml-auto text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Locked</span>
                        <p className="text-sm font-medium text-gray-900 mt-1">45 ETH</p>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar: Compliance/Support */}
            <div className="space-y-6">
              <div className="bg-blue-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <ShieldCheck className="w-8 h-8 text-blue-300 mb-4" />
                  <h3 className="text-lg font-bold mb-2">Compliance Status</h3>
                  <p className="text-blue-200 text-sm mb-4">Your KYC/KYB verification is active. You are eligible to raise up to 500 ETH.</p>
                  <Button variant="secondary" size="sm" className="w-full text-blue-900 font-semibold">View Documents</Button>
                </div>
                {/* Decorative background */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-blue-800 rounded-full opacity-50 blur-2xl"></div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start text-gray-600" onClick={() => toast.success('Invite sent to team member!')}>
                    <Plus className="w-4 h-4 mr-2" /> Add Team Member
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-gray-600" onClick={() => toast.info('Request submitted to extend round duration.')}>
                    <Clock className="w-4 h-4 mr-2" /> Extend Round Duration
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-gray-600" onClick={() => toast.success('Update posted to all investors.')}>
                    Updates for Investors
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateForm && (
        <CreateCampaignModal onClose={() => setShowCreateForm(false)} />
      )}

      {/* Edit Campaign Modal */}
      {showEditForm && coinInfo && (
        <EditCampaignModal
          coinInfo={coinInfo as readonly [string, string, string, bigint, bigint, bigint, bigint, bigint, boolean]}
          onClose={() => setShowEditForm(false)}
        />
      )}
    </div>
  )
}

function CampaignCard({ coinInfo, onEditClick }: { coinInfo: readonly [string, string, string, bigint, bigint, bigint, bigint, bigint, boolean], onEditClick: () => void }) {
  const [projectName, description, websiteUrl, totalSupply, pricePerCoin, coinsSold, coinsAvailable, createdAt, active] = coinInfo
  const progress = (Number(coinsSold) / Number(totalSupply)) * 100
  const raised = formatEther(BigInt(coinsSold) * BigInt(pricePerCoin))
  const target = formatEther(BigInt(totalSupply) * BigInt(pricePerCoin))

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold text-gray-900">{projectName}</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-wide">
              SAFE Phase
            </span>
          </div>
          <p className="text-gray-600 text-base mb-3 max-w-2xl text-pretty">{description}</p>
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1"
          >
            {websiteUrl}
          </a>
        </div>
        <div className="text-right ml-6">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${active ? 'bg-green-500' : 'bg-gray-500'}`}></span>
            {active ? 'Active Round' : 'Inactive'}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-100">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Total Raised</p>
            <p className="text-3xl font-bold text-gray-900">{raised} <span className="text-lg text-gray-500 font-normal">ETH</span></p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 font-medium mb-1">Target</p>
            <p className="text-xl font-semibold text-gray-700">{target} ETH</p>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-4 mb-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-4 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.max(2, progress)}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-sm text-gray-500">
          <span>{progress.toFixed(1)}% funded</span>
          <span>{String(coinsAvailable)} SAFEs remaining</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 border-t border-gray-100 pt-6">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Instrument</p>
          <p className="text-base font-semibold text-gray-900">Tokenized SAFE</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Valuation Cap</p>
          <p className="text-base font-semibold text-gray-900">100 ETH</p> {/* Mocked */}
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Price per SAFE</p>
          <p className="text-base font-semibold text-gray-900">{formatEther(pricePerCoin)} ETH</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Total Supply</p>
          <p className="text-base font-semibold text-gray-900">{String(totalSupply)}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 h-10"
          onClick={onEditClick}
        >
          Edit Round Details
        </Button>
        <Button
          className="flex-1 bg-gray-900 hover:bg-black text-white h-10"
          onClick={() => {
            window.open('/investor', '_blank')
          }}
        >
          View Public Page
        </Button>
      </div>
    </div>
  )
}

function CreateCampaignModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    totalSupply: '',
    pricePerCoin: ''
  })

  const { createCoin, isPending, isConfirming, isSuccess } = useCreateCoin()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createCoin(
        formData.name,
        formData.description,
        formData.website,
        BigInt(formData.totalSupply),
        formData.pricePerCoin
      )
    } catch (error) {
      console.error('Error creating round:', error)
    }
  }

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Round Created!</h2>
          <p className="text-gray-600 mb-8">
            Your SAFE round has been successfully deployed to the blockchain. Investors can now participate.
          </p>
          <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg">
            Done
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">New Investment Round</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="text-2xl">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Project Name
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Acme AI"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Pitch / Description
            </label>
            <textarea
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your vision, market, and use of funds..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Website / Deck URL
            </label>
            <input
              type="url"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Total SAFE Allocation
              </label>
              <input
                type="number"
                required
                min="100"
                max="10000000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={formData.totalSupply}
                onChange={(e) => setFormData(prev => ({ ...prev, totalSupply: e.target.value }))}
                placeholder="1000000"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Price per SAFE (ETH)
              </label>
              <input
                type="number"
                required
                min="0.0001"
                max="100"
                step="0.0001"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={formData.pricePerCoin}
                onChange={(e) => setFormData(prev => ({ ...prev, pricePerCoin: e.target.value }))}
                placeholder="0.001"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending || isConfirming}
              className="flex-1 h-12"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || isConfirming}
              className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 text-lg"
            >
              {isPending ? 'Deploying...' : isConfirming ? 'Confirming...' : 'Launch Round'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditCampaignModal({ coinInfo, onClose }: { coinInfo: readonly [string, string, string, bigint, bigint, bigint, bigint, bigint, boolean], onClose: () => void }) {
  if (!coinInfo) return null

  const [projectName, description, websiteUrl, totalSupply, pricePerCoin, coinsSold] = coinInfo

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Round Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Current Campaign Info */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
            <h3 className="font-bold text-gray-900 mb-4">Immutable On-Chain Data</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Project Name</p>
                <p className="font-semibold">{projectName}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Allocation</p>
                <p className="font-semibold">{String(totalSupply)}</p>
              </div>
              <div>
                <p className="text-gray-500">Price per SAFE</p>
                <p className="font-semibold">{formatEther(pricePerCoin)} ETH</p>
              </div>
              <div>
                <p className="text-gray-500">Raised So Far</p>
                <p className="font-semibold text-green-600">{formatEther(BigInt(coinsSold) * BigInt(pricePerCoin))} ETH</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Description</label>
            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm focus-within:ring-2 ring-blue-500 transition-all">
              {/* Note: Real app would allow editing off-chain metadata (IPFS) here. For now, readonly. */}
              <p className="text-gray-900 text-sm whitespace-pre-wrap">{description}</p>
            </div>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Website</label>
            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm break-all font-medium"
              >
                {websiteUrl}
              </a>
            </div>
          </div>

          {/* Note about immutability */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-900">Blockchain Immutability</h4>
              <p className="text-sm text-blue-700 mt-1">
                Core financial terms are locked in the smart contract to protect investors. To change terms, you must deploy a new round.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 h-11 border-gray-300">
              Close
            </Button>
            <Button
              className="flex-1 h-11 bg-gray-900 hover:bg-black text-white"
              onClick={() => {
                window.open('/investor', '_blank')
                onClose()
              }}
            >
              View Public Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}