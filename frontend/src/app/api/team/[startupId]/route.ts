import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TeamRole, InvitationStatus } from '@prisma/client'

// GET /api/team/[startupId] - Get all team members for a startup
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ startupId: string }> }
) {
    try {
        const { startupId } = await params

        const teamMembers = await prisma.teamMember.findMany({
            where: { startupId },
            include: {
                user: {
                    include: {
                        profile: true
                    }
                }
            },
            orderBy: { invitedAt: 'asc' }
        })

        return NextResponse.json({ teamMembers })
    } catch (error) {
        console.error('Error fetching team members:', error)
        return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
    }
}

// POST /api/team/[startupId] - Add a team member
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ startupId: string }> }
) {
    try {
        const { startupId } = await params
        const body = await request.json()
        const { inviteEmail, inviteWallet, role, title, equityBps } = body

        // Validate required fields
        if (!role || (!inviteEmail && !inviteWallet)) {
            return NextResponse.json(
                { error: 'Role and either email or wallet address required' },
                { status: 400 }
            )
        }

        // Check if user already exists
        let userId = null
        if (inviteWallet) {
            const existingUser = await prisma.user.findUnique({
                where: { walletAddress: inviteWallet }
            })
            userId = existingUser?.id || null
        }

        // Create team member
        const teamMember = await prisma.teamMember.create({
            data: {
                startupId,
                userId,
                inviteEmail,
                inviteWallet,
                role: role as TeamRole,
                title,
                equityBps: equityBps ? parseInt(equityBps) : null,
                status: userId ? InvitationStatus.ACCEPTED : InvitationStatus.PENDING
            },
            include: {
                user: {
                    include: {
                        profile: true
                    }
                }
            }
        })

        return NextResponse.json({ teamMember }, { status: 201 })
    } catch (error) {
        console.error('Error adding team member:', error)
        return NextResponse.json({ error: 'Failed to add team member' }, { status: 500 })
    }
}

// PATCH /api/team/[startupId]/[memberId] - Update team member
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ startupId: string }> }
) {
    await params // Consume params
    try {
        const body = await request.json()
        const { memberId, role, title, equityBps, status } = body

        const teamMember = await prisma.teamMember.update({
            where: { id: memberId },
            data: {
                ...(role && { role: role as TeamRole }),
                ...(title !== undefined && { title }),
                ...(equityBps !== undefined && { equityBps: parseInt(equityBps) }),
                ...(status && { status: status as InvitationStatus })
            },
            include: {
                user: {
                    include: {
                        profile: true
                    }
                }
            }
        })

        return NextResponse.json({ teamMember })
    } catch (error) {
        console.error('Error updating team member:', error)
        return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 })
    }
}

// DELETE /api/team/[startupId]/[memberId] - Remove team member
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ startupId: string }> }
) {
    await params // Consume params
    try {
        const url = new URL(request.url)
        const memberId = url.searchParams.get('memberId')

        if (!memberId) {
            return NextResponse.json({ error: 'Member ID required' }, { status: 400 })
        }

        await prisma.teamMember.delete({
            where: { id: memberId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error removing team member:', error)
        return NextResponse.json({ error: 'Failed to remove team member' }, { status: 500 })
    }
}
