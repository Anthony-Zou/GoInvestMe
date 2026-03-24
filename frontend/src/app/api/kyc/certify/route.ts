import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'
import InvestorRegistryABI from '@/lib/abis/InvestorRegistry.json'
import { CONTRACTS } from '@/lib/contracts'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.walletAddress) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, email, isAccredited, termsAccepted } = await req.json()
  if (!name || !email || !isAccredited || !termsAccepted) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  // Save to DB
  await prisma.verification.upsert({
    where: { id: (await prisma.verification.findFirst({
      where: { userId: session.user.id!, type: 'KYC' }
    }))?.id ?? '' },
    create: {
      userId: session.user.id!,
      type: 'KYC',
      provider: 'self-certification',
      status: 'VERIFIED',
      data: { name, email, certifiedAt: new Date().toISOString() },
    },
    update: {
      status: 'VERIFIED',
      provider: 'self-certification',
      data: { name, email, certifiedAt: new Date().toISOString() },
    },
  }).catch(async () => {
    // Fallback: create new record
    await prisma.verification.create({
      data: {
        userId: session.user.id!,
        type: 'KYC',
        provider: 'self-certification',
        status: 'VERIFIED',
        data: { name, email, certifiedAt: new Date().toISOString() },
      },
    })
  })

  // Set on-chain KYC status if admin key is available
  const adminKey = process.env.KYC_ADMIN_PRIVATE_KEY
  if (adminKey) {
    try {
      const account = privateKeyToAccount(`0x${adminKey.replace('0x', '')}` as `0x${string}`)
      const client = createWalletClient({
        account,
        chain: sepolia,
        transport: http(),
      })
      await client.writeContract({
        address: CONTRACTS.investorRegistry as `0x${string}`,
        abi: InvestorRegistryABI.abi,
        functionName: 'setKYCStatus',
        args: [session.user.walletAddress as `0x${string}`, true, BigInt(365 * 24 * 60 * 60)],
      })
    } catch (err) {
      console.error('[KYC] On-chain setKYCStatus failed:', err)
    }
  }

  return NextResponse.json({ status: 'VERIFIED' })
}
