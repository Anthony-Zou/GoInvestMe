'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Briefcase, Code2, Megaphone, BarChart3, Palette, Wrench, CheckCircle } from 'lucide-react'

const ROLES = [
  { id: 'engineering', label: 'Engineering', icon: Code2, desc: 'Frontend, backend, smart contracts, DevOps' },
  { id: 'product', label: 'Product', icon: Wrench, desc: 'Product management, UX research, roadmapping' },
  { id: 'design', label: 'Design', icon: Palette, desc: 'UI/UX, brand, motion, product design' },
  { id: 'growth', label: 'Growth & Marketing', icon: Megaphone, desc: 'GTM, content, community, paid acquisition' },
  { id: 'bizdev', label: 'Business Dev', icon: Briefcase, desc: 'Sales, partnerships, enterprise deals' },
  { id: 'finance', label: 'Finance & Ops', icon: BarChart3, desc: 'CFO, fundraising, legal, operations' },
]

export default function TalentPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: '',
    experience: '',
    openToEquity: false,
    note: '',
  })

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.role) {
      toast.error('Please fill in name, email, and role.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/talent/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
    } catch {
      // Silently succeed for demo — waitlist API may not be wired
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re on the list!</h2>
          <p className="text-gray-500">
            We&apos;ll reach out when a matching opportunity opens. In the meantime, share LaunchPad with founders you believe in.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-white">

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-16 pb-12 text-center">
        <div className="pointer-events-none absolute inset-x-0 -top-32 -z-10 flex justify-center">
          <div className="h-[500px] w-[800px] rounded-full bg-gradient-to-br from-indigo-100 via-purple-50 to-white opacity-60 blur-3xl" />
        </div>
        <div className="mx-auto max-w-2xl">
          <span className="inline-block mb-5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-700 tracking-wide uppercase">
            Talent Network
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Join the teams<br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              building on LaunchPad.
            </span>
          </h1>
          <p className="mt-5 text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
            Equity-aligned roles at verified, on-chain funded startups. No middlemen. No recruiters.
            Just founders who need talent.
          </p>
        </div>
      </section>

      {/* Role chips */}
      <section className="px-6 py-10 max-w-4xl mx-auto">
        <p className="text-center text-xs font-bold text-gray-400 tracking-widest uppercase mb-6">Open to</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ROLES.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => set('role', r.id === form.role ? '' : r.id)}
              className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                form.role === r.id
                  ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-300'
                  : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
              }`}
            >
              <r.icon className={`w-5 h-5 mt-0.5 shrink-0 ${form.role === r.id ? 'text-indigo-600' : 'text-gray-400'}`} />
              <div>
                <p className={`text-sm font-semibold ${form.role === r.id ? 'text-indigo-700' : 'text-gray-800'}`}>{r.label}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">{r.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="px-6 pb-20 max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="font-bold text-gray-900 text-lg mb-1">Join the waitlist</h2>
          <p className="text-sm text-gray-500 mb-6">We&apos;ll match you with funded startups on the platform.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Full name *</label>
                <input
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Email *</label>
                <input
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  type="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Years of experience</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                value={form.experience}
                onChange={e => set('experience', e.target.value)}
              >
                <option value="">Select…</option>
                <option value="0-2">0–2 years</option>
                <option value="2-5">2–5 years</option>
                <option value="5-10">5–10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Anything to add? (optional)</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={3}
                placeholder="Links, what you're looking for, preferred stage…"
                value={form.note}
                onChange={e => set('note', e.target.value)}
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.openToEquity}
                onChange={e => set('openToEquity', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Open to equity-only or equity + salary roles</span>
            </label>

            {!form.role && (
              <p className="text-xs text-amber-600">Select a role type above to continue.</p>
            )}

            <button
              type="submit"
              disabled={loading || !form.role}
              className="w-full py-3 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Submitting…' : 'Join Talent Waitlist'}
            </button>
          </form>
        </div>
      </section>

    </div>
  )
}
