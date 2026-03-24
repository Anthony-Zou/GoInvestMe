import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.walletAddress) return NextResponse.json({ status: 'NONE' })

  const v = await prisma.verification.findFirst({
    where: { userId: session.user.id!, type: 'KYC' },
    orderBy: { createdAt: 'desc' },
  }).catch(() => null)

  return NextResponse.json({ status: v?.status ?? 'NONE' })
}
