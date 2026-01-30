import Link from "next/link"
import { ConnectWallet } from "@/components/ConnectWallet"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Shield, Zap, Globe, Users, CheckCircle } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navigation (Sticky Optional) */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          LaunchPad
        </div>
        <div className="flex items-center gap-4">
          <Link href="/founder" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition hidden md:block">
            For Founders
          </Link>
          <Link href="/investor" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition hidden md:block">
            For Investors
          </Link>
          <ConnectWallet />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white -z-10" />
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6">
            Raise faster, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Iterate quicker
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            The On-Chain Operating System for Startup Creation.
            Connect verified founders, democratised capital, and global talent on a single trusted platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/founder">
              <Button size="lg" className="h-12 px-8 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                Start Fundraising <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/investor">
              <Button variant="outline" size="lg" className="h-12 px-8 text-lg border-gray-300 hover:bg-gray-50 text-gray-700">
                Explore Opportunities
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-gray-200 pt-8">
            <div>
              <p className="text-3xl font-bold text-gray-900">100%</p>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">On-Chain Transparency</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">&lt;1s</p>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Transaction Finality</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">Global</p>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Talent Access</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">$0</p>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Platform Fee (Beta)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution (The Context) */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Earliest Part of a Venture Building Journey</h2>
            <p className="text-gray-600 text-lg">
              LaunchPad bridges the gap before institutional financing. We enable investors to participate in the most attractive part of venture building while giving founders the tools to execute.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Founders</h3>
              <p className="text-gray-600">Raise capital from a global pool. Implement on-chain milestones and operational transparency.</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Investors</h3>
              <p className="text-gray-600">Access curated, vetted pre-seed deal flow. Small ticket sizes with tokenized SAFE agreements.</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Global Talent</h3>
              <p className="text-gray-600">Work with high-potential startups. Get paid instantly via on-chain escrow upon milestone completion.</p>
              <span className="inline-block mt-3 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded pointer-events-none">Coming Soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600">The journey from idea to traction, streamlined.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[2.5rem] left-0 right-0 h-0.5 bg-gray-200 -z-10 translate-y-1/2 w-[80%] mx-auto"></div>

            <div className="relative text-center">
              <div className="w-16 h-16 bg-white border-2 border-blue-600 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-sm z-10">1</div>
              <h3 className="text-lg font-semibold mb-2">Verified</h3>
              <p className="text-sm text-gray-600">Founder applies, passes rigorous KYC/KYB and project vetting.</p>
            </div>
            <div className="relative text-center">
              <div className="w-16 h-16 bg-white border-2 border-blue-600 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-sm z-10">2</div>
              <h3 className="text-lg font-semibold mb-2">Data Room</h3>
              <p className="text-sm text-gray-600">Startup creates a profile with standardized, secure information.</p>
            </div>
            <div className="relative text-center">
              <div className="w-16 h-16 bg-white border-2 border-blue-600 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-sm z-10">3</div>
              <h3 className="text-lg font-semibold mb-2">Funding</h3>
              <p className="text-sm text-gray-600">Launch tokenized SAFE round. Investors participate with transparent terms.</p>
            </div>
            <div className="relative text-center">
              <div className="w-16 h-16 bg-white border-2 border-green-600 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-sm z-10">4</div>
              <h3 className="text-lg font-semibold mb-2">Build</h3>
              <p className="text-sm text-gray-600">Funds released on milestones. Hire talent via on-chain contracts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision / Three Forces */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Three Forces Make This Inevitable</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Capital</h4>
                    <p className="text-gray-600">Retail demand for alternative assets is exploding, meeting emerging regulatory clarity for tokenized instruments.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Technology</h4>
                    <p className="text-gray-600">High-performance blockchains are now mature enough for real-world, compliant financial applications.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Culture</h4>
                    <p className="text-gray-600">Remote-first is the default for high-growth startup formation, creating a global marketplace for ideas and talent.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-100 rounded-2xl p-8 aspect-square flex items-center justify-center">
              {/* Placeholder for visual or chart from deck */}
              <div className="text-center">
                <Shield className="h-24 w-24 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Compliance & Trust Layer</p>
                <p className="text-slate-400 text-sm mt-2">Built for scale from day one</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="mb-4 md:mb-0">
              <span className="text-2xl font-bold text-white">LaunchPad</span>
            </div>
            <div className="flex gap-8">
              <Link href="/terms" className="hover:text-white transition">Terms</Link>
              <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
              <Link href="https://twitter.com" className="hover:text-white transition">Twitter</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center md:text-left text-sm text-gray-500">
            <p className="mb-2">
              LaunchPad is the on-chain operating system for startup creation.
            </p>
            <p>
              &copy; {new Date().getFullYear()} LaunchPad. All rights reserved.
            </p>
            <div className="mt-4 text-xs">
              Contract: 0x8b23a938d1a52588de989a8967a51e2dde0f494f (Sepolia)
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
