import React, { useEffect, useState } from 'react'
import { Users, Mail, Wallet, Briefcase, Percent, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface TeamMember {
    id: string
    role: string
    title?: string
    equityBps?: number
    status: string
    inviteEmail?: string
    inviteWallet?: string
    user?: {
        walletAddress: string
        profile?: {
            name?: string
            avatarUrl?: string
        }
    }
}

interface TeamListProps {
    startupId: string
    onRefresh?: number
}

export function TeamList({ startupId, onRefresh }: TeamListProps) {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchTeamMembers()
    }, [startupId, onRefresh])

    const fetchTeamMembers = async () => {
        try {
            const response = await fetch(`/api/team/${startupId}`)
            const data = await response.json()
            setTeamMembers(data.teamMembers || [])
        } catch (error) {
            console.error('Error fetching team members:', error)
            toast.error('Failed to load team members')
        } finally {
            setIsLoading(false)
        }
    }

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this team member?')) return

        try {
            const response = await fetch(`/api/team/${startupId}?memberId=${memberId}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to remove member')

            toast.success('Team member removed')
            fetchTeamMembers()
        } catch (error) {
            toast.error('Failed to remove team member')
            console.error(error)
        }
    }

    const getRoleLabel = (role: string) => {
        return role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACCEPTED':
                return (
                    <span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Active
                    </span>
                )
            case 'PENDING':
                return (
                    <span className="flex items-center gap-1 text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" /> Pending
                    </span>
                )
            case 'DECLINED':
                return (
                    <span className="flex items-center gap-1 text-xs text-red-700 bg-red-100 px-2 py-1 rounded-full">
                        <XCircle className="w-3 h-3" /> Declined
                    </span>
                )
            default:
                return null
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl animate-pulse">
                        <div className="h-12 bg-slate-200 rounded"></div>
                    </div>
                ))}
            </div>
        )
    }

    if (teamMembers.length === 0) {
        return (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No team members yet</p>
                <p className="text-sm text-gray-500 mt-1">Add co-founders and key team members to get started</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {teamMembers.map((member) => (
                <div
                    key={member.id}
                    className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-colors"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                {member.user?.profile?.name?.[0] || member.inviteEmail?.[0]?.toUpperCase() || '?'}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold text-gray-900">
                                        {member.user?.profile?.name || member.inviteEmail || member.inviteWallet?.slice(0, 8) + '...'}
                                    </p>
                                    {getStatusBadge(member.status)}
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <Briefcase className="w-3 h-3" />
                                        {member.title || getRoleLabel(member.role)}
                                    </span>
                                    {member.equityBps && (
                                        <span className="flex items-center gap-1">
                                            <Percent className="w-3 h-3" />
                                            {(member.equityBps / 100).toFixed(2)}% equity
                                        </span>
                                    )}
                                </div>

                                {member.status === 'PENDING' && (
                                    <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                                        {member.inviteEmail ? (
                                            <>
                                                <Mail className="w-3 h-3" /> Invited via {member.inviteEmail}
                                            </>
                                        ) : (
                                            <>
                                                <Wallet className="w-3 h-3" /> Invited via {member.inviteWallet?.slice(0, 10)}...
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}
