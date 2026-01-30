'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Code2, ShieldCheck, Coins, Users, CheckCircle } from 'lucide-react'

export default function TalentPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-white border-b border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-white"></div>
                <div className="container mx-auto px-6 py-20 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold mb-8">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Coming Soon: The Global Talent Network
                        </div>

                        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight">
                            Work for Equity. <br />
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Build the Future.
                            </span>
                        </h1>

                        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                            LaunchPad connects world-class builders with high-growth startups.
                            Earn valid, liquid equity for your contributions via smart contracts.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <WaitlistForm />
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Feature 1 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                                <Code2 className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Milestone Bounties</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Pick up development, design, or marketing tasks. Get paid automatically when your work is verified.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6">
                                <ShieldCheck className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Resume</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Build an immutable, on-chain reputation based on your actual contributions and successful deliveries.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-6">
                                <Coins className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Liquid Equity</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Receive tokenized SAFE agreements instantly. Hold for the long term or trade on the secondary market.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Call to Action */}
            <section className="py-20 bg-white border-t border-gray-100">
                <div className="container mx-auto px-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                        <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Are you a Founder?</h2>
                    <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                        Tap into a global network of talent ready to build your vision in exchange for equity.
                    </p>
                    <Link href="/founder">
                        <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                            Post Opportunities
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    )
}

function WaitlistForm() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')
        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, role: 'talent' })
            })
            if (res.ok) {
                setStatus('success')
                setEmail('')
            } else {
                setStatus('error')
            }
        } catch (err) {
            console.error(err)
            setStatus('error')
        }
    }

    if (status === 'success') {
        return (
            <div className="bg-green-50 text-green-700 px-6 py-4 rounded-xl border border-green-200 flex items-center gap-3 animate-in fade-in zoom-in">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">You're on the list! We'll be in touch.</span>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <input
                type="email"
                placeholder="Enter your email"
                required
                disabled={status === 'loading'}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <Button
                type="submit"
                size="lg"
                disabled={status === 'loading'}
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-8"
            >
                {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
                {!status.includes('loading') && <ArrowRight className="ml-2 w-4 h-4" />}
            </Button>
        </form>
    )
}
