'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { ConnectWallet } from '@/components/ConnectWallet'
import { Button } from '@/components/ui/button'
import { useEntrepreneurs, useCoinInfo, useBuyCoin, useInvestment, useCoinBalance } from '@/lib/hooks'
import { Search, TrendingUp, Wallet, ArrowRight, ShieldCheck, Globe, DollarSign, Filter, PieChart } from 'lucide-react'

export default function InvestorPage() {
  const { isConnected } = useAccount()
  const { data: entrepreneursData, isLoading: entrepreneursLoading } = useEntrepreneurs()
  const entrepreneurs = entrepreneursData as string[] | undefined
  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null // Prevent hydration mismatch

  if (!isConnected) {
    // ... (lines 26-48 omitted for brevity, logic remains same)
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center bg-white border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            LaunchPad
          </Link>
          <ConnectWallet />
        </nav>

        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Investor Portal</h1>
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 max-w-lg mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Welcome, Investor</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Connect your wallet to access curated pre-seed deal flow, manage your portfolio, and invest in the future of innovation.
            </p>
            <div className="flex justify-center">
              <ConnectWallet />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Filter logic (mocked for now, can be real search)
  const filteredEntrepreneurs = entrepreneurs?.filter((addr: string) =>
    addr.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 font-sans">


      <div className="container mx-auto px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                Deal Flow
                <span className="md:hidden inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[10px] font-semibold border border-green-100 align-middle">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              </h1>
              <p className="text-gray-600">Discover and invest in curated pre-seed opportunities.</p>
            </div>
            <div className="relative w-full md:w-auto min-w-[300px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search rounds, founders, or tags..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Filter className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Primary</span>
              </div>
              <p className="text-sm text-gray-500 font-medium">Available Rounds</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {entrepreneursLoading ? '...' : entrepreneurs?.length || 0}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <PieChart className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium">Portfolio Companies</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {/* Mocked for demo */}
                0
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium">Total Invested</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                0.00 ETH
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* List of Rounds */}
            <div className={`${selectedEntrepreneur ? 'lg:col-span-5 hidden lg:block' : 'lg:col-span-12'}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Live Rounds</h2>
                <Button variant="ghost" size="sm" className="text-gray-500">View All</Button>
              </div>

              <div className="space-y-4">
                {entrepreneursLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading deal flow...</p>
                  </div>
                ) : filteredEntrepreneurs && filteredEntrepreneurs.length > 0 ? (
                  filteredEntrepreneurs.map((address) => (
                    <RoundListItem
                      key={address}
                      entrepreneurAddress={address}
                      onClick={() => setSelectedEntrepreneur(address)}
                      isSelected={selectedEntrepreneur === address}
                    />
                  ))
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 border-dashed">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No active rounds</h3>
                    <p className="text-gray-500 mb-6">
                      There are currently no open investment rounds matching your criteria.
                    </p>
                    <Link href="/founder">
                      <Button variant="outline">Are you a Founder?</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Investment Panel (Details) */}
            {selectedEntrepreneur && (
              <div className="lg:col-span-7 animate-in slide-in-from-right-4 duration-300">
                <div className="sticky top-24">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedEntrepreneur(null)}
                    className="lg:hidden mb-4 text-gray-600 pl-0 hover:bg-transparent"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" /> Back to List
                  </Button>
                  <InvestmentPanel entrepreneurAddress={selectedEntrepreneur} />
                </div>
              </div>
            )}

            {/* Mobile: If selected, hide list (handled by css classes above somewhat, but need explicit mobile handling) */}
            {selectedEntrepreneur && (
              <div className="lg:hidden fixed inset-0 bg-white z-50 overflow-y-auto p-6">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedEntrepreneur(null)}
                  className="mb-4 text-gray-600 pl-0 hover:bg-transparent"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" /> Back to Deal Flow
                </Button>
                <InvestmentPanel entrepreneurAddress={selectedEntrepreneur} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
}

// Component for list item
function RoundListItem({ entrepreneurAddress, onClick, isSelected }: { entrepreneurAddress: string, onClick: () => void, isSelected: boolean }) {
  const { data: coinInfo } = useCoinInfo(entrepreneurAddress)
  const info = (coinInfo as readonly [string, string, string, bigint, bigint, bigint, bigint, bigint, boolean]) || null

  if (!info) return null

  const [projectName, description, , totalSupply, pricePerCoin, coinsSold] = info
  const progress = (Number(coinsSold) / Number(totalSupply)) * 100

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-xl border cursor-pointer transition-all hover:shadow-md ${isSelected
        ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500'
        : 'bg-white border-gray-100 hover:border-blue-100'
        }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-gray-900 truncate pr-4">{projectName || 'Untitled Project'}</h3>
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">SAFE</span>
      </div>
      <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{description || 'No description provided.'}</p>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatEther(BigInt(pricePerCoin))} ETH / SAFE</span>
          <span>{(Number(coinsSold) / Number(totalSupply) * 100).toFixed(0)}% Funded</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-blue-600 h-1.5 rounded-full"
            style={{ width: `${Math.max(5, progress)}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

function InvestmentPanel({ entrepreneurAddress }: { entrepreneurAddress: string }) {
  const { data: coinInfo, error } = useCoinInfo(entrepreneurAddress)
  const { buyCoin, isPending, isConfirming, isSuccess } = useBuyCoin()
  const { data: investment } = useInvestment(entrepreneurAddress)
  const { data: userBalance } = useCoinBalance(entrepreneurAddress)

  const [quantity, setQuantity] = useState('1')

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <p className="text-red-600 font-medium">Failed to load round details</p>
        <p className="text-sm text-red-500 mt-2">{error.message}</p>
      </div>
    )
  }

  if (!coinInfo) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading details...</p>
      </div>
    )
  }

  const [projectName, description, websiteUrl, totalSupply, pricePerCoin, coinsSold, coinsAvailable] = coinInfo as unknown as [string, string, string, bigint, bigint, bigint, bigint]

  const investmentBalance = ((investment as any)?.balance || (investment as any)?.[0] || 0n) as bigint
  const handleBuy = async () => {
    try {
      const totalCostWei = BigInt(quantity) * BigInt(pricePerCoin)
      await buyCoin(entrepreneurAddress, BigInt(quantity), totalCostWei)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-8 border-b border-gray-100 bg-gradient-to-br from-white to-slate-50">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{projectName}</h2>
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1"
            >
              <Globe className="w-4 h-4" /> {websiteUrl}
            </a>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 uppercase tracking-wide">
            Live Round
          </span>
        </div>
        <p className="text-gray-600 leading-relaxed text-lg">{description}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
        <div className="p-6 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">SAFE Price</p>
          <p className="text-xl font-bold text-gray-900">{formatEther(pricePerCoin)} ETH</p>
        </div>
        <div className="p-6 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Raised / Target</p>
          <p className="text-xl font-bold text-gray-900">
            {formatEther(BigInt(coinsSold) * BigInt(pricePerCoin))} <span className="text-sm text-gray-400 font-normal">/ {formatEther(BigInt(totalSupply) * BigInt(pricePerCoin))} ETH</span>
          </p>
        </div>
      </div>

      <div className="p-8">
        {isSuccess ? (
          <div className="bg-green-50 rounded-xl p-8 text-center border border-green-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Investment Confirmed!</h3>
            <p className="text-gray-600 mb-6">
              You have successfully invested in {projectName}. Your SAFE tokens have been transferred to your wallet.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => window.location.reload()} // Simple reload to reset state for now
              >
                Invest More
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Invest in Round</h3>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <div className="flex justify-between text-sm mb-2 text-gray-500 font-medium">
                  <span>Allocation</span>
                  <span>{coinsAvailable.toString()} SAFEs available</span>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <label className="sr-only">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      max={coinsAvailable.toString()}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>
                  <div className="text-lg font-bold text-gray-500">SAFEs</div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total Investment</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatEther(BigInt(quantity || 0) * BigInt(pricePerCoin))} ETH
                  </span>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
              onClick={handleBuy}
              disabled={isPending || isConfirming || !quantity || Number(quantity) <= 0}
            >
              {isPending ? 'Processing...' : isConfirming ? 'Confirming Transaction...' : 'Invest Now'}
            </Button>

            <p className="text-center text-xs text-gray-400">
              By investing, you agree to the Terms of Service and confirm you are an accredited investor or meet local regulations.
            </p>
          </div>
        )}
      </div>

      {/* Portfolio Holdings Footer */}
      {(investmentBalance > 0n || (userBalance && userBalance > 0n)) && (
        <div className="bg-gray-50 border-t border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-full border border-gray-200 flex items-center justify-center shadow-sm">
              <Wallet className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Your Holdings</p>
              <p className="text-gray-900 font-medium">
                You own <span className="font-bold text-blue-600">{(investmentBalance || userBalance || 0n).toString()} SAFEs</span> in this round.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}