import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const verification = await prisma.verification.findFirst({
        where: { userId: session.user.id, type: 'KYC' },
        orderBy: { createdAt: 'desc' },
    })

    if (!verification) {
        return NextResponse.json({ status: 'NONE' })
    }

    return NextResponse.json({
        status: verification.status, // NONE | PENDING | VERIFIED | REJECTED
        providerId: verification.providerId,
        updatedAt: verification.updatedAt,
    })
}
