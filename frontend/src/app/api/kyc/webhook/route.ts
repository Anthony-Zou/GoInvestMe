import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { createWalletClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import InvestorRegistryABI from '@/lib/abis/InvestorRegistry.json'

function verifyPersonaSignature(payload: string, signature: string, secret: string): boolean {
    const tPart = signature.split(',').find(p => p.startsWith('t='))
    const v1Part = signature.split(',').find(p => p.startsWith('v1='))
    if (!tPart || !v1Part) return false

    const timestamp = tPart.slice(2)
    const expected = v1Part.slice(3)
    const hmac = crypto
        .createHmac('sha256', secret)
        .update(`${timestamp}.${payload}`)
        .digest('hex')

    try {
        return crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expected, 'hex'))
    } catch {
        return false
    }
}

async function setOnChainKYCStatus(walletAddress: string): Promise<void> {
    const adminPrivateKey = process.env.KYC_ADMIN_PRIVATE_KEY
    const registryAddress = process.env.NEXT_PUBLIC_INVESTOR_REGISTRY_ADDRESS

    if (!adminPrivateKey || !registryAddress) {
        console.warn('[KYC] On-chain update skipped: admin wallet or registry address not configured')
        return
    }

    try {
        const account = privateKeyToAccount(`0x${adminPrivateKey}` as `0x${string}`)
        const client = createWalletClient({
            account,
            chain: sepolia,
            transport: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || undefined),
        })

        const ONE_YEAR = BigInt(365 * 24 * 60 * 60)

        await client.writeContract({
            address: registryAddress as `0x${string}`,
            abi: InvestorRegistryABI.abi,
            functionName: 'setKYCStatus',
            args: [walletAddress as `0x${string}`, true, ONE_YEAR],
        })

        console.log(`[KYC] On-chain KYC verified for ${walletAddress}`)
    } catch (err) {
        // Most common cause: investor hasn't called registerInvestor() on-chain yet.
        // DB is already updated to VERIFIED — they can register on-chain when they next invest.
        console.error('[KYC] On-chain KYC update failed (investor may not be registered on-chain):', err)
    }
}

export async function POST(request: Request) {
    const rawBody = await request.text()
    const signature = request.headers.get('Persona-Signature') ?? ''
    const webhookSecret = process.env.KYC_WEBHOOK_SECRET

    if (!webhookSecret) {
        console.error('[KYC] Webhook secret not configured')
        return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
    }

    if (!verifyPersonaSignature(rawBody, signature, webhookSecret)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    let payload: any
    try {
        payload = JSON.parse(rawBody)
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const inquiryId: string = payload?.data?.id
    const status: string = payload?.data?.attributes?.status
    const walletAddress: string = payload?.data?.attributes?.['reference-id']

    if (!inquiryId || !walletAddress) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const verification = await prisma.verification.findFirst({
        where: { providerId: inquiryId, type: 'KYC' },
    })

    if (!verification) {
        console.error('[KYC] No verification record for inquiry:', inquiryId)
        return NextResponse.json({ error: 'Verification not found' }, { status: 404 })
    }

    const newStatus =
        status === 'completed' ? 'VERIFIED' :
        status === 'failed' || status === 'declined' ? 'REJECTED' :
        'PENDING'

    await prisma.verification.update({
        where: { id: verification.id },
        data: { status: newStatus as any, data: payload.data },
    })

    if (newStatus === 'VERIFIED') {
        await setOnChainKYCStatus(walletAddress)
    }

    return NextResponse.json({ received: true })
}
