import Link from "next/link"
import { ConnectWallet } from "@/components/ConnectWallet"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-gray-900">GoInvestMe</div>
        <ConnectWallet />
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Connect Entrepreneurs with 
            <span className="text-blue-600"> Investors</span> 
            <br />Through Blockchain
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A decentralized platform where entrepreneurs can raise funding instantly 
            and investors can discover the next big opportunity. Powered by smart contracts.
          </p>
          
          <div className="flex gap-4 justify-center mb-16">
            <Link href="/entrepreneur">
              <Button size="lg" className="flex items-center gap-2">
                Start Fundraising <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/investor">
              <Button variant="outline" size="lg">
                Explore Opportunities
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Instant Funding</h3>
            <p className="text-gray-600">
              Entrepreneurs receive funds immediately upon investment. 
              No delays, no intermediaries, just instant value transfer.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Secure & Transparent</h3>
            <p className="text-gray-600">
              All transactions are secured by blockchain technology. 
              Every investment and ownership is publicly verifiable.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Global Access</h3>
            <p className="text-gray-600">
              Available 24/7 worldwide. No geographic restrictions, 
              no traditional banking limitations. Just pure opportunity.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 text-center">
          <div className="bg-white rounded-xl p-8 shadow-sm border max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-8">Platform Status</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">117</div>
                <div className="text-sm text-gray-600">Security Tests Passed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
                <div className="text-sm text-gray-600">Security Vulnerabilities</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">Live</div>
                <div className="text-sm text-gray-600">On Sepolia Testnet</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-20">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="text-2xl font-bold text-gray-900 mb-4">GoInvestMe</div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Revolutionizing how entrepreneurs raise capital and investors discover opportunities. 
            Built with cutting-edge blockchain technology for maximum security and transparency.
          </p>
          <div className="mt-8 text-sm text-gray-500">
            Contract: 0x8b23a938d1a52588de989a8967a51e2dde0f494f (Sepolia)
          </div>
        </div>
      </footer>
    </div>
  )
}
