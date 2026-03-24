import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-white">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pt-20 pb-24 text-center">
        <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center">
          <div className="h-[600px] w-[900px] rounded-full bg-gradient-to-br from-blue-100 via-indigo-50 to-white opacity-70 blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl">
          <span className="inline-block mb-5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 tracking-wide uppercase">
            Live on Ethereum Sepolia
          </span>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Startups shouldn&apos;t need<br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              insiders to begin.
            </span>
          </h1>

          <p className="mt-6 text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
            LaunchPad unlocks the earliest stage of innovation — for everyone.
            Milestone-gated funding, tokenised SAFEs, verifiable proof of work.
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

      {/* ── Competitive whitespace ────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-xs font-bold text-blue-600 tracking-widest uppercase mb-3">Market Position</p>
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-4">
            No one owns the &ldquo;before institution&rdquo; layer
          </h2>
          <p className="text-center text-gray-500 max-w-xl mx-auto mb-14">
            Every existing player serves founders after they already have traction or access. LaunchPad is the infrastructure for the stage before.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Left: gap description */}
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <h3 className="font-bold text-gray-900 text-lg mb-6">Where others play</h3>
              <div className="space-y-4">
                {[
                  { label: 'VCs & Angels', note: 'Require traction, network, or warm intros' },
                  { label: 'Accelerators & Venture Studios', note: 'Selective, geography-limited, equity-heavy' },
                  { label: 'Crowdfunding', note: 'Consumer-facing, no milestone accountability' },
                  { label: 'Freelance / Talent platforms', note: 'No ownership layer or equity tooling' },
                  { label: 'Token launches / DAOs', note: 'High compliance risk, speculative-first' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <span className="mt-1 w-2 h-2 rounded-full bg-gray-200 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: LaunchPad's space */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">
              <h3 className="font-bold text-lg mb-6 opacity-90">Where LaunchPad operates</h3>
              <div className="space-y-5">
                {[
                  { phase: 'Conceptualise', desc: 'Form a team, align on equity, publish an idea page' },
                  { phase: 'Iterate MVP', desc: 'Ship work under milestone contracts with on-chain escrow' },
                  { phase: 'Core team expansion', desc: 'Invite collaborators with vesting schedules' },
                  { phase: 'Fundraise planning', desc: 'Deploy tokenised SAFEs, build investor-ready records' },
                ].map(item => (
                  <div key={item.phase} className="flex items-start gap-3">
                    <span className="mt-1 w-2 h-2 rounded-full bg-blue-200 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">{item.phase}</p>
                      <p className="text-xs opacity-70">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-xl bg-white/10 px-4 py-3 text-xs font-medium">
                LaunchPad monetizes execution, ownership, and trust across the pre-VC lifecycle.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing tiers ─────────────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-slate-50">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-xs font-bold text-blue-600 tracking-widest uppercase mb-3">Business Model</p>
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-4">
            Aligned to every stage of your journey
          </h2>
          <p className="text-center text-gray-500 max-w-xl mx-auto mb-14">
            Usage-based fees, subscriptions, and institutional access — priced for founders at every level.
          </p>

          <div className="grid md:grid-cols-4 gap-5">
            {[
              {
                tier: 'Explore',
                price: 'Free',
                audience: 'Hobbyist',
                tag: 'Discover & form teams',
                features: [
                  'Idea pages & project spaces',
                  'Team formation & collaborator invites',
                  'Draft equity split (non-binding)',
                  'Limited collaborators & public projects only',
                ],
                cta: 'Get started',
                href: '/founder',
                highlight: false,
              },
              {
                tier: 'Execute',
                price: '~1.0% of payouts',
                audience: 'Active Teams',
                tag: 'Ship work safely',
                features: [
                  'Milestone-based contracts',
                  'On-chain escrow & conditional payouts',
                  'Guaranteed global payments to talent',
                  'Verifiable proof-of-work & delivery records',
                  'Execution history tied to founders',
                ],
                cta: 'Start shipping',
                href: '/founder',
                highlight: false,
              },
              {
                tier: 'Commit',
                price: '$49–99/mo + ~1.25%',
                audience: 'VC-bound startups',
                tag: 'Trust & ownership',
                features: [
                  'Everything in Execute, plus:',
                  'Vesting schedules & ownership lock-in',
                  'Tokenised SAFE & ownership instruments',
                  'Cap table management',
                  'Compliance & jurisdiction tooling',
                  'Investor-ready records & reporting',
                ],
                cta: 'Raise your round',
                href: '/founder',
                highlight: true,
              },
              {
                tier: 'Institutional',
                price: 'Annual contract',
                audience: 'Enterprise Customers',
                tag: 'Signal & access',
                features: [
                  'Execution-backed deal flow access',
                  'Startup formation & execution analytics',
                  'Portfolio benchmarking dashboards',
                  'Talent & skill demand intelligence',
                  'Curated matching & introductions',
                  'API / Data exports',
                ],
                cta: 'Contact us',
                href: '/investor',
                highlight: false,
              },
            ].map(t => (
              <div
                key={t.tier}
                className={`rounded-2xl p-6 flex flex-col ${
                  t.highlight
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-200'
                    : 'bg-white border border-gray-100 shadow-sm'
                }`}
              >
                <div className="mb-4">
                  <p className={`text-xs font-bold tracking-widest uppercase mb-1 ${t.highlight ? 'text-blue-200' : 'text-blue-600'}`}>
                    {t.tier}
                  </p>
                  <p className={`text-xl font-extrabold leading-tight ${t.highlight ? 'text-white' : 'text-gray-900'}`}>
                    {t.price}
                  </p>
                  <p className={`text-xs mt-1 ${t.highlight ? 'text-blue-200' : 'text-gray-400'}`}>
                    {t.audience} · {t.tag}
                  </p>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {t.features.map(f => (
                    <li key={f} className="flex gap-2 items-start">
                      <span className={`mt-0.5 shrink-0 text-xs ${t.highlight ? 'text-blue-200' : 'text-blue-500'}`}>✓</span>
                      <span className={`text-xs leading-relaxed ${t.highlight ? 'text-blue-50' : 'text-gray-600'}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={t.href}
                  className={`block text-center text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors ${
                    t.highlight
                      ? 'bg-white text-blue-700 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {t.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roadmap ───────────────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-xs font-bold text-blue-600 tracking-widest uppercase mb-3">Roadmap</p>
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-4">
            Demonstrating momentum, quarter by quarter
          </h2>
          <p className="text-center text-gray-500 max-w-lg mx-auto mb-14">
            Each milestone builds the execution record that signals readiness for institutional capital.
          </p>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
            {/* 2026 */}
            <div>
              <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-5">2026</p>
              <div className="space-y-4">
                {[
                  {
                    q: 'Q1',
                    title: 'Core infrastructure live',
                    items: ['Vercel + Neon deployment pipeline', 'Smart contracts on Sepolia', 'KYC/KYB onboarding flow'],
                  },
                  {
                    q: 'Q2',
                    title: 'Execution layer',
                    items: ['Milestone-based contracts & escrow', 'On-chain proof-of-work records', 'Team formation & vesting'],
                  },
                  {
                    q: 'Q3',
                    title: 'Ownership & capital layer',
                    items: ['Tokenised SAFE instruments', 'Cap table management', 'Investor-ready reporting'],
                  },
                  {
                    q: 'Q4',
                    title: 'Fundraise readiness',
                    items: ['Institutional deal flow dashboard', 'Portfolio analytics', 'Series A preparation'],
                  },
                ].map(row => (
                  <div key={row.q} className="flex gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">{row.q}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{row.title}</p>
                      <ul className="mt-1 space-y-0.5">
                        {row.items.map(i => (
                          <li key={i} className="text-xs text-gray-400 flex gap-1.5 items-start">
                            <span className="mt-1 w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                            {i}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2027 + fundraising */}
            <div>
              <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-5">2027</p>
              <div className="space-y-4 mb-8">
                {[
                  {
                    q: 'Q1',
                    title: 'Scale & institutional partnerships',
                    items: ['Expand to mainnet', 'API & data export offering', 'Curated matching & introductions'],
                  },
                ].map(row => (
                  <div key={row.q} className="flex gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-600">{row.q}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{row.title}</p>
                      <ul className="mt-1 space-y-0.5">
                        {row.items.map(i => (
                          <li key={i} className="text-xs text-gray-400 flex gap-1.5 items-start">
                            <span className="mt-1 w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                            {i}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fundraising callout */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                <p className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-2">Fundraising</p>
                <p className="text-sm font-bold text-gray-900 mb-1">Singapore HQ · Q4 2026 target</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Building execution-backed evidence throughout 2026 to close a seed round with
                  institutional partners by Q4 — with founder metrics, not promises.
                </p>
              </div>

              {/* GTM channels */}
              <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">Go-to-market</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Builder & Indie Founder Communities',
                    'Founder-Led Referrals',
                    'University & Alumni Networks',
                    'Accelerators & Venture Studios',
                    'Institutional Partnerships',
                    'Open-Source & Developer Ecosystems',
                  ].map(ch => (
                    <span key={ch} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-gray-600 font-medium">
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
      <section className="px-6 py-24 text-center bg-slate-50">
        <div className="mx-auto max-w-xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            The earliest stage of innovation<br />starts here.
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
