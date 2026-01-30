'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { formatEther } from 'viem'
import { ConnectWallet } from '@/components/ConnectWallet'
import { Button } from '@/components/ui/button'
import { useCreateCoin, useHasCoin, useCoinInfo } from '@/lib/hooks'
import { ArrowLeft, Plus, TrendingUp, Users, DollarSign } from 'lucide-react'

export default function EntrepreneurPage() {
  const { address, isConnected } = useAccount()
  const { data: hasCoin, isLoading: checkingCoin } = useHasCoin(address || '')
  const { data: coinData, isLoading: loadingCoinInfo } = useCoinInfo(address || '')
  const coinInfo = (coinData as readonly [string, string, string, bigint, bigint, bigint, bigint, bigint, boolean]) || null
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <ArrowLeft className="h-6 w-6" />
            GoInvestMe
          </Link>
          <ConnectWallet />
        </nav>
        
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Entrepreneur Dashboard</h1>
          <div className="bg-white p-8 rounded-xl shadow-sm border max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to create investment campaigns and manage your projects.
            </p>
            <ConnectWallet />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <ArrowLeft className="h-6 w-6" />
          GoInvestMe
        </Link>
        <ConnectWallet />
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Entrepreneur Dashboard</h1>
              <p className="text-gray-600">Manage your investment campaigns and track progress</p>
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2"
              size="lg"
            >
              <Plus className="h-5 w-5" />
              Create Campaign
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {checkingCoin ? '...' : hasCoin ? 1 : 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tokens Sold</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loadingCoinInfo ? '...' : coinInfo ? String(coinInfo[5]) : '0'}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Funds Raised</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loadingCoinInfo ? '...' : coinInfo ? 
                      `${formatEther(BigInt(coinInfo[5]) * BigInt(coinInfo[4]))} ETH` : '0 ETH'}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Campaign List */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Your Campaigns</h2>
            </div>
            <div className="p-6">
              {checkingCoin || loadingCoinInfo ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your campaigns...</p>
                </div>
              ) : hasCoin && coinInfo ? (
                <div className="space-y-4">
                  <CampaignCard coinInfo={coinInfo as readonly [string, string, string, bigint, bigint, bigint, bigint, bigint, boolean]} onEditClick={() => setShowEditForm(true)} />
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
                  <p className="text-gray-600 mb-6">
                    Create your first investment campaign to start raising funds
                  </p>
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Your First Campaign
                  </Button>
                </div>
              )}
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
  
  return (
    <div className="border rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{projectName}</h3>
          <p className="text-gray-600 text-sm mb-2">{description}</p>
          <a 
            href={websiteUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            {websiteUrl}
          </a>
        </div>
        <div className="text-right ml-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {active ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Supply</p>
          <p className="text-lg font-semibold">{String(totalSupply)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Price per Token</p>
          <p className="text-lg font-semibold">{formatEther(pricePerCoin)} ETH</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Sold</p>
          <p className="text-lg font-semibold">{String(coinsSold)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Available</p>
          <p className="text-lg font-semibold">{String(coinsAvailable)}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{((Number(coinsSold) / Number(totalSupply)) * 100).toFixed(1)}%</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ 
              width: `${Math.max(2, (Number(coinsSold) / Number(totalSupply)) * 100)}%` 
            }}
          ></div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={onEditClick}
        >
          Edit Campaign
        </Button>
        <Button 
          size="sm" 
          className="flex-1"
          onClick={() => {
            // Open investor page with this campaign in a new tab
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
      console.error('Error creating campaign:', error)
    }
  }

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4">Campaign Created Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your investment campaign has been created and is now live on the blockchain.
          </p>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Create Investment Campaign</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="My Awesome Startup"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your project and what you're building..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://myproject.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Token Supply
            </label>
            <input
              type="number"
              required
              min="100"
              max="10000000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.totalSupply}
              onChange={(e) => setFormData(prev => ({ ...prev, totalSupply: e.target.value }))}
              placeholder="1000000"
            />
            <p className="text-xs text-gray-500 mt-1">Between 100 and 10,000,000 tokens</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price per Token (ETH)
            </label>
            <input
              type="number"
              required
              min="0.0001"
              max="100"
              step="0.0001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.pricePerCoin}
              onChange={(e) => setFormData(prev => ({ ...prev, pricePerCoin: e.target.value }))}
              placeholder="0.001"
            />
            <p className="text-xs text-gray-500 mt-1">Between 0.0001 and 100 ETH</p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending || isConfirming}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || isConfirming}
              className="flex-1"
            >
              {isPending ? 'Creating...' : isConfirming ? 'Confirming...' : 'Create Campaign'}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Campaign</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Current Campaign Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Current Campaign Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Project Name:</span>
                <span className="font-medium">{projectName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Supply:</span>
                <span className="font-medium">{String(totalSupply)} tokens</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price per Token:</span>
                <span className="font-medium">{formatEther(pricePerCoin)} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tokens Sold:</span>
                <span className="font-medium">{String(coinsSold)} tokens</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Funds Raised:</span>
                <span className="font-medium">{formatEther(BigInt(coinsSold) * BigInt(pricePerCoin))} ETH</span>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-gray-900 text-sm">{description}</p>
            </div>
          </div>
          
          {/* Website */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <a 
                href={websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm break-all"
              >
                {websiteUrl}
              </a>
            </div>
          </div>
          
          {/* Note about immutability */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">Campaign Information</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Campaign details are stored immutably on the blockchain and cannot be modified after creation. 
                  This ensures transparency and trust for your investors.
                </p>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button 
              onClick={() => {
                // Open investor page to view public campaign
                window.open('/investor', '_blank')
                onClose()
              }}
              className="flex-1"
            >
              View Public Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}