'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { ConnectWallet } from '@/components/ConnectWallet'
import { Button } from '@/components/ui/button'
import { useCoinInfo, useBuyCoin, useAllEntrepreneurs, useOwnershipPercentage, useGetInvestment, useInvestmentAmount, useInvestorPortfolio } from '@/lib/hooks'
import { ArrowLeft, Search, TrendingUp, ExternalLink, Wallet } from 'lucide-react'
import { formatEther } from 'viem'

export default function InvestorPage() {
  const { address, isConnected } = useAccount()
  const { entrepreneurs: portfolioEntrepreneurs, isLoading: portfolioLoading } = useInvestorPortfolio(address || '')
  const { data: allEntrepreneursData, isLoading: entrepreneursLoading } = useAllEntrepreneurs()
  const entrepreneurs = (allEntrepreneursData as readonly string[]) || []
  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [portfolioDetailsAddress, setPortfolioDetailsAddress] = useState<string | null>(null)

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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Investor Portal</h1>
          <div className="bg-white p-8 rounded-xl shadow-sm border max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to explore investment opportunities and manage your portfolio.
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
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Investment Opportunities</h1>
            <p className="text-gray-600">Discover and invest in promising startups</p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Available Campaigns */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold">Available Campaigns</h2>
                </div>
                <div className="p-6">
                  {entrepreneursLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading campaigns...</p>
                    </div>
                  ) : entrepreneurs && entrepreneurs.length > 0 ? (
                    <div className="space-y-6">
                      {entrepreneurs.map((entrepreneurAddress: string) => (
                        <CampaignListItem 
                          key={entrepreneurAddress} 
                          entrepreneurAddress={entrepreneurAddress}
                          onSelect={setSelectedEntrepreneur}
                          isSelected={selectedEntrepreneur === entrepreneurAddress}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns available</h3>
                      <p className="text-gray-600 mb-4">
                        Check back later for new investment opportunities, or create one as an entrepreneur!
                      </p>
                      <Link href="/entrepreneur">
                        <Button>
                          Create Campaign
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Investment Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                {selectedEntrepreneur ? (
                  <InvestmentPanel entrepreneurAddress={selectedEntrepreneur} />
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="text-lg font-semibold mb-4">Select a Campaign</h3>
                    <p className="text-gray-600 text-sm">
                      Choose a campaign from the list to see investment details and make an investment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Your Portfolio */}
          <div className="mt-12">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Your Portfolio</h2>
              </div>
              <div className="p-6">
                {portfolioLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your portfolio...</p>
                  </div>
                ) : (
                  <PortfolioDisplay 
                    investorAddress={address || ''}
                    entrepreneurs={portfolioEntrepreneurs}
                    onViewDetails={setPortfolioDetailsAddress}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Details Modal */}
      {portfolioDetailsAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Investment Details</h3>
              <button
                onClick={() => setPortfolioDetailsAddress(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <PortfolioDetailsContent 
              entrepreneurAddress={portfolioDetailsAddress} 
              investorAddress={address || ''} 
            />
          </div>
        </div>
      )}
    </div>
  )
}

function CampaignListItem({ 
  entrepreneurAddress, 
  onSelect, 
  isSelected 
}: { 
  entrepreneurAddress: string
  onSelect: (address: string) => void
  isSelected: boolean
}) {
  const { data: coinData, isLoading, error } = useCoinInfo(entrepreneurAddress)
  const coinInfo = (coinData as readonly [string, string, string, bigint, bigint, bigint, bigint, bigint, boolean]) || null

  if (isLoading) {
    return (
      <div className="border rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/6"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border rounded-lg p-6 border-red-200 bg-red-50">
        <p className="text-red-600">Campaign by {entrepreneurAddress.slice(0,6)}...{entrepreneurAddress.slice(-4)}: Failed to load data</p>
        <p className="text-sm text-red-500">{error.message}</p>
      </div>
    )
  }

  if (!coinInfo) {
    return (
      <div className="border rounded-lg p-6 border-yellow-200 bg-yellow-50">
        <p className="text-yellow-600">Campaign by {entrepreneurAddress.slice(0,6)}...{entrepreneurAddress.slice(-4)}: No data available</p>
      </div>
    )
  }

  const [projectName, description, websiteUrl, totalSupply, pricePerCoin, coinsSold, coinsAvailable] = coinInfo

  return (
    <div 
      className={`border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''
      }`}
      onClick={() => onSelect(entrepreneurAddress)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{projectName}</h3>
          <p className="text-gray-600 text-sm mb-2">{description}</p>
          <a 
            href={websiteUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            Visit Website <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Price per Token</p>
          <p className="font-semibold">{formatEther(pricePerCoin)} ETH</p>
        </div>
        <div>
          <p className="text-gray-500">Available</p>
          <p className="font-semibold">{coinsAvailable.toString()}/{totalSupply.toString()}</p>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ 
              width: `${Math.max(5, (Number(coinsSold) / Number(totalSupply)) * 100)}%` 
            }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {((Number(coinsSold) / Number(totalSupply)) * 100).toFixed(1)}% funded
        </p>
      </div>
    </div>
  )
}

function InvestmentPanel({ entrepreneurAddress }: { entrepreneurAddress: string }) {
  const [quantity, setQuantity] = useState('')
  const { data: coinData } = useCoinInfo(entrepreneurAddress)
  const coinInfo = (coinData as readonly [string, string, string, bigint, bigint, bigint, bigint, bigint, boolean]) || null
  const { buyCoin, hash, isPending, isConfirming, isSuccess } = useBuyCoin()

  if (!coinInfo) return null

  const [projectName, , , , pricePerCoin, , coinsAvailable] = coinInfo
  const totalCost = quantity ? (BigInt(quantity) * pricePerCoin).toString() : '0'

  const handleInvest = async () => {
    if (!quantity) return
    
    try {
      await buyCoin(
        entrepreneurAddress, 
        BigInt(quantity), 
        formatEther(BigInt(totalCost))
      )
    } catch (error) {
      console.error('Investment failed:', error)
    }
  }

  if (isSuccess) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Investment Successful!</h3>
          <p className="text-gray-600 text-sm mb-4">
            Your investment in {projectName} has been confirmed on the blockchain.
          </p>
          
          {hash && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Transaction Hash:</p>
              <p className="text-xs font-mono bg-white p-2 rounded border break-all mb-2">
                {hash}
              </p>
              <a
                href={`https://sepolia.etherscan.io/tx/${hash}`}
                target="__blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View on Etherscan
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Invest in {projectName}</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Tokens
          </label>
          <input
            type="number"
            min="1"
            max={coinsAvailable.toString()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter amount"
          />
          <p className="text-xs text-gray-500 mt-1">
            Max: {coinsAvailable.toString()} tokens available
          </p>
        </div>
        
        {quantity && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between text-sm mb-2">
              <span>Token Price:</span>
              <span>{formatEther(pricePerCoin)} ETH</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>Quantity:</span>
              <span>{quantity} tokens</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Total Cost:</span>
              <span>{formatEther(BigInt(totalCost))} ETH</span>
            </div>
          </div>
        )}
        
        <Button
          onClick={handleInvest}
          disabled={!quantity || isPending || isConfirming || Number(quantity) > Number(coinsAvailable)}
          className="w-full"
        >
          {isPending ? 'Preparing...' : isConfirming ? 'Confirming...' : 'Invest Now'}
        </Button>
      </div>
    </div>
  )
}

function PortfolioItem({ investment, investorAddress, onViewDetails }: { 
  investment: { entrepreneurAddress: string; balance: bigint };
  investorAddress: string;
  onViewDetails: (address: string) => void;
}) {
  const { data: coinData } = useCoinInfo(investment.entrepreneurAddress)
  const coinInfo = (coinData as readonly [string, string, string, bigint, bigint, bigint, bigint, bigint, boolean]) || null
  const { data: ownershipPercentage } = useOwnershipPercentage(investment.entrepreneurAddress, investorAddress)
  
  if (!coinInfo) {
    return (
      <div className="border rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }
  
  const [projectName, , , , pricePerCoin] = coinInfo
  const investmentValue = BigInt(investment.balance) * BigInt(pricePerCoin)
  
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{projectName}</h4>
          <p className="text-gray-600 text-sm">Investment</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onViewDetails(investment.entrepreneurAddress)}
        >
          View Details
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tokens Owned:</span>
          <span className="font-medium">{investment.balance.toString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Current Value:</span>
          <span className="font-medium">{formatEther(investmentValue)} ETH</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Ownership:</span>
          <span className="font-medium">{ownershipPercentage?.toFixed(2) || '0.00'}%</span>
        </div>
      </div>
    </div>
  )
}

function PortfolioDetailsContent({ entrepreneurAddress, investorAddress }: {
  entrepreneurAddress: string;
  investorAddress: string;
}) {
  const { data: coinData } = useCoinInfo(entrepreneurAddress)
  const coinInfo = (coinData as readonly [string, string, string, bigint, bigint, bigint, bigint, bigint, boolean]) || null
  const { data: investmentBalanceData } = useGetInvestment(investorAddress, entrepreneurAddress)
  const investmentBalance = (investmentBalanceData as bigint) || 0n
  const { data: ownershipPercentage } = useOwnershipPercentage(entrepreneurAddress, investorAddress)
  
  if (!coinInfo || investmentBalance === undefined) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading investment details...</p>
      </div>
    )
  }
  
  if (!investmentBalance || investmentBalance === BigInt(0)) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Investment not found</p>
      </div>
    )
  }
  
  const [projectName, description, websiteUrl, totalSupply, pricePerCoin, coinsSold] = coinInfo
  const investmentValue = BigInt(investmentBalance) * BigInt(pricePerCoin)
  
  return (
    <div className="space-y-6">
      {/* Campaign Info */}
      <div className="border-b pb-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-2">{projectName}</h4>
        <p className="text-gray-600 text-sm mb-3">{description}</p>
        <a 
          href={websiteUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
        >
          Visit Website <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      
      {/* Investment Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h5 className="font-semibold mb-3">Your Investment Summary</h5>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Tokens Owned</p>
            <p className="font-semibold text-lg">{investmentBalance.toString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Current Value</p>
            <p className="font-semibold text-lg">{formatEther(investmentValue)} ETH</p>
          </div>
          <div>
            <p className="text-gray-600">Ownership</p>
            <p className="font-semibold text-lg">{ownershipPercentage?.toFixed(2) || '0.00'}%</p>
          </div>
          <div>
            <p className="text-gray-600">Token Price</p>
            <p className="font-semibold text-lg">{formatEther(pricePerCoin)} ETH</p>
          </div>
        </div>
      </div>
      
      {/* Campaign Progress */}
      <div>
        <h5 className="font-semibold mb-3">Campaign Progress</h5>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Total Supply:</span>
            <span>{totalSupply.toString()} tokens</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tokens Sold:</span>
            <span>{coinsSold.toString()} tokens</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Progress:</span>
            <span>{((Number(coinsSold) / Number(totalSupply)) * 100).toFixed(1)}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full" 
              style={{ 
                width: `${Math.max(2, (Number(coinsSold) / Number(totalSupply)) * 100)}%` 
              }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Transaction History Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Note:</strong> For detailed transaction history, you can view your investment transactions on the blockchain explorer using your wallet address.
        </p>
      </div>
    </div>
  )
}

// New component to handle portfolio display with individual investment checks
function PortfolioDisplay({ investorAddress, entrepreneurs, onViewDetails }: {
  investorAddress: string
  entrepreneurs: string[]
  onViewDetails: (address: string) => void
}) {
  const [hasAnyInvestments, setHasAnyInvestments] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  
  // Simple check to see if we have any investments
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChecking(false)
    }, 2000) // Give time for investment checks to complete
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="space-y-4">
      {entrepreneurs.map((entrepreneurAddress) => (
        <PortfolioItemWrapper 
          key={entrepreneurAddress}
          investorAddress={investorAddress}
          entrepreneurAddress={entrepreneurAddress}
          onViewDetails={onViewDetails}
          onHasInvestment={() => setHasAnyInvestments(true)}
        />
      ))}
      
      {!isChecking && !hasAnyInvestments && (
        <div className="text-center py-8">
          <Wallet className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No investments yet</h3>
          <p className="text-gray-600 text-sm">
            Start investing in campaigns to build your portfolio
          </p>
        </div>
      )}
    </div>
  )
}

// Component that checks individual investments
function PortfolioItemWrapper({ investorAddress, entrepreneurAddress, onViewDetails, onHasInvestment }: {
  investorAddress: string
  entrepreneurAddress: string
  onViewDetails: (address: string) => void
  onHasInvestment: () => void
}) {
  const { data: investmentAmountData } = useInvestmentAmount(investorAddress, entrepreneurAddress)
  const investmentAmount = (investmentAmountData as bigint) || 0n
  const { data: coinData } = useCoinInfo(entrepreneurAddress)
  const coinInfo = (coinData as readonly [string, string, string, bigint, bigint, bigint, bigint, bigint, boolean]) || null
  const { data: ownershipPercentage } = useOwnershipPercentage(entrepreneurAddress, investorAddress)
  
  // Notify parent if we have an investment
  useEffect(() => {
    if (investmentAmount && investmentAmount > BigInt(0) && coinInfo) {
      onHasInvestment()
    }
  }, [investmentAmount, coinInfo, onHasInvestment])
  
  // Only render if there's an actual investment
  if (!investmentAmount || investmentAmount === BigInt(0) || !coinInfo) {
    return null
  }
  
  const [projectName, , , , pricePerCoin] = coinInfo
  const currentValue = BigInt(investmentAmount) * BigInt(pricePerCoin)
  
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{projectName}</h4>
          <p className="text-sm text-gray-600">Investment</p>
        </div>
        <button
          onClick={() => onViewDetails(entrepreneurAddress)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded-md border border-blue-200 hover:border-blue-300 transition"
        >
          View Details
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Tokens Owned:</p>
          <p className="font-semibold">{investmentAmount.toString()}</p>
        </div>
        <div>
          <p className="text-gray-600">Current Value:</p>
          <p className="font-semibold">{formatEther(currentValue)} ETH</p>
        </div>
        <div>
          <p className="text-gray-600">Ownership:</p>
          <p className="font-semibold">{ownershipPercentage?.toFixed(2)}%</p>
        </div>
      </div>
    </div>
  )
}