import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-white">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pt-20 pb-24 text-center">
        {/* Background gradient blob */}
        <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center">
          <div className="h-[600px] w-[900px] rounded-full bg-gradient-to-br from-blue-100 via-indigo-50 to-white opacity-70 blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl">
          <span className="inline-block mb-5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 tracking-wide uppercase">
            Live on Ethereum Sepolia
          </span>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Fund startups faster.<br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              On-chain, with proof.
            </span>
          </h1>

          <p className="mt-6 text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
            Tokenised SAFE agreements. Milestone-gated fund releases.
            Global investors, zero paperwork.
          </p>

          <div className="mt-10 flex gap-4 flex-wrap justify-center">
            <Link
              href="/founder"
              className="px-7 py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
            >
              Start Raising →
            </Link>
            <Link
              href="/investor"
              className="px-7 py-3.5 bg-white text-gray-800 rounded-xl font-semibold text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Browse Deals
            </Link>
          </div>
        </div>

        {/* Mock UI card */}
        <div className="mx-auto mt-16 max-w-2xl">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-100 overflow-hidden text-left">
            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3 bg-gray-50">
              <span className="w-3 h-3 rounded-full bg-red-300" />
              <span className="w-3 h-3 rounded-full bg-yellow-300" />
              <span className="w-3 h-3 rounded-full bg-green-300" />
              <span className="ml-3 text-xs text-gray-400 font-mono">launchpad.app/founder</span>
            </div>
            <div className="grid grid-cols-3 gap-px bg-gray-100">
              <div className="bg-white p-5">
                <p className="text-xs text-gray-500 mb-1">Total Raised</p>
                <p className="text-2xl font-bold text-gray-900">$840K</p>
                <p className="text-xs text-green-600 font-medium mt-1">↑ 12% this week</p>
              </div>
              <div className="bg-white p-5">
                <p className="text-xs text-gray-500 mb-1">Valuation Cap</p>
                <p className="text-2xl font-bold text-gray-900">$5.0M</p>
                <p className="text-xs text-gray-400 font-medium mt-1">SAFE · 20% discount</p>
              </div>
              <div className="bg-white p-5">
                <p className="text-xs text-gray-500 mb-1">Milestones</p>
                <p className="text-2xl font-bold text-gray-900">3 / 5</p>
                <p className="text-xs text-blue-600 font-medium mt-1">2 pending verification</p>
              </div>
            </div>
            <div className="p-5 space-y-2">
              {[
                { label: 'Ship v1 product', status: 'Verified', color: 'bg-green-100 text-green-700' },
                { label: 'Reach 500 DAU', status: 'Verified', color: 'bg-green-100 text-green-700' },
                { label: 'Close 3 enterprise pilots', status: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
                  <span className="text-sm text-gray-700">{m.label}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.color}`}>{m.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ─────────────────────────────────────────────────────── */}
      <section className="border-y border-gray-100 py-6 px-6">
        <div className="mx-auto max-w-4xl flex flex-wrap justify-center gap-8 text-sm text-gray-400 font-medium">
          {['SAFE Agreements', 'ERC-20 Tokenised Rounds', 'On-chain Milestones', 'Non-custodial', 'Sepolia Testnet'].map(t => (
            <span key={t} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs font-bold text-blue-600 tracking-widest uppercase mb-3">How it works</p>
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-14">
            From idea to funded in three steps
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Register & get verified',
                body: 'Submit your startup profile. Our KYB process verifies your business on-chain — once, permanently.',
              },
              {
                step: '02',
                title: 'Deploy your SAFE round',
                body: 'Set your valuation cap, discount rate, and min/max ticket. A SAFE contract deploys to Ethereum in seconds.',
              },
              {
                step: '03',
                title: 'Unlock funds via milestones',
                body: 'Define deliverables. Submit proof of work. Verified milestones release USDC directly to your wallet.',
              },
            ].map(s => (
              <div key={s.step} className="relative p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-shadow">
                <span className="text-5xl font-black text-gray-100 leading-none select-none">{s.step}</span>
                <h3 className="mt-2 text-base font-bold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For Founders / For Investors ──────────────────────────────────── */}
      <section className="px-6 py-20 bg-slate-50">
        <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-6">

          {/* Founders */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">
            <p className="text-xs font-bold tracking-widest uppercase opacity-70 mb-2">For Founders</p>
            <h3 className="text-2xl font-bold mb-4">Raise globally,<br />prove it on-chain.</h3>
            <ul className="space-y-3 mb-8 text-sm opacity-90">
              {[
                'Deploy a SAFE round in under 2 minutes',
                'Accept USDC from any verified investor worldwide',
                'Milestone-gated releases keep investors confident',
                'Full cap table transparency, no spreadsheets',
              ].map(f => (
                <li key={f} className="flex gap-2 items-start">
                  <span className="mt-0.5 shrink-0 text-blue-200">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/founder"
              className="inline-block bg-white text-blue-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
            >
              Open Founder Dashboard →
            </Link>
          </div>

          {/* Investors */}
          <div className="rounded-2xl bg-white border border-gray-100 p-8 shadow-sm">
            <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">For Investors</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Back founders you<br />can verify, not just trust.</h3>
            <ul className="space-y-3 mb-8 text-sm text-gray-600">
              {[
                'Browse live SAFE rounds with full on-chain data',
                'Invest in one click with USDC — no wires, no delays',
                'Track milestone progress and proof of work on-chain',
                'SAFE tokens represent your economic interest',
              ].map(f => (
                <li key={f} className="flex gap-2 items-start">
                  <span className="mt-0.5 shrink-0 text-blue-500">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/investor"
              className="inline-block bg-blue-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Browse Deal Flow →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to build the future?
          </h2>
          <p className="text-gray-500 mb-8">
            LaunchPad is live on Sepolia testnet. Connect your wallet and start in minutes.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/founder" className="px-7 py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
              Start Raising
            </Link>
            <Link href="/investor" className="px-7 py-3.5 bg-white text-gray-800 rounded-xl font-semibold text-sm border border-gray-200 hover:bg-gray-50 transition-colors">
              Start Investing
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
