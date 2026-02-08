import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Users, Mail, Wallet, Briefcase, Percent, X } from 'lucide-react'

const TEAM_ROLES = [
    { value: 'CO_FOUNDER', label: 'Co-Founder' },
    { value: 'TECHNICAL_LEAD', label: 'Technical Lead' },
    { value: 'BUSINESS_LEAD', label: 'Business Lead' },
    { value: 'DESIGN_LEAD', label: 'Design Lead' },
    { value: 'MARKETING_LEAD', label: 'Marketing Lead' },
    { value: 'ADVISOR', label: 'Advisor' },
    { value: 'CONTRIBUTOR', label: 'Contributor' }
]

interface AddTeamMemberModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    startupId: string
    onSuccess?: () => void
}

export function AddTeamMemberModal({ open, onOpenChange, startupId, onSuccess }: AddTeamMemberModalProps) {
    const [inviteMethod, setInviteMethod] = useState<'email' | 'wallet'>('email')
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteWallet, setInviteWallet] = useState('')
    const [role, setRole] = useState('CO_FOUNDER')
    const [title, setTitle] = useState('')
    const [equityBps, setEquityBps] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (inviteMethod === 'email' && !inviteEmail) {
            toast.error('Please enter an email address')
            return
        }
        if (inviteMethod === 'wallet' && !inviteWallet) {
            toast.error('Please enter a wallet address')
            return
        }

        setIsSubmitting(true)
        try {
            const response = await fetch(`/api/team/${startupId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inviteEmail: inviteMethod === 'email' ? inviteEmail : null,
                    inviteWallet: inviteMethod === 'wallet' ? inviteWallet : null,
                    role,
                    title: title || null,
                    equityBps: equityBps ? parseInt(equityBps) * 100 : null // Convert % to basis points
                })
            })

            if (!response.ok) throw new Error('Failed to add team member')

            toast.success('Team member invited successfully!')
            onOpenChange(false)
            resetForm()
            onSuccess?.()
        } catch (error) {
            toast.error('Failed to invite team member')
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setInviteEmail('')
        setInviteWallet('')
        setRole('CO_FOUNDER')
        setTitle('')
        setEquityBps('')
    }

    return (
        <Modal isOpen={open} onClose={() => onOpenChange(false)} title="Add Team Member">
            <div className="space-y-4">
                {/* Invite Method Toggle */}
                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                    <button
                        onClick={() => setInviteMethod('email')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${inviteMethod === 'email'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email
                    </button>
                    <button
                        onClick={() => setInviteMethod('wallet')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${inviteMethod === 'wallet'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Wallet className="w-4 h-4 inline mr-2" />
                        Wallet
                    </button>
                </div>

                {/* Invite Input */}
                {inviteMethod === 'email' ? (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email Address</label>
                        <Input
                            type="email"
                            value={inviteEmail}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInviteEmail(e.target.value)}
                            placeholder="teammate@example.com"
                        />
                    </div>
                ) : (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Wallet Address</label>
                        <Input
                            value={inviteWallet}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInviteWallet(e.target.value)}
                            placeholder="0x..."
                        />
                    </div>
                )}

                {/* Role Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {TEAM_ROLES.map((r) => (
                            <option key={r.value} value={r.value}>
                                {r.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Custom Title */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Custom Title (Optional)</label>
                    <Input
                        value={title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                        placeholder="e.g., Head of Engineering"
                    />
                </div>

                {/* Equity Allocation */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Equity Allocation (Optional)</label>
                    <div className="relative">
                        <Input
                            type="number"
                            value={equityBps}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEquityBps(e.target.value)}
                            placeholder="5"
                            min="0"
                            max="100"
                            step="0.1"
                        />
                        <Percent className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500">Enter percentage (e.g., 5 for 5%)</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                        {isSubmitting ? 'Inviting...' : 'Send Invitation'}
                    </Button>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                        Cancel
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
