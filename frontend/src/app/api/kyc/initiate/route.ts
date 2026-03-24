import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
    const session = await auth()
    if (!session?.user?.id || !session?.user?.walletAddress) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const personaApiKey = process.env.PERSONA_API_KEY
    const templateId = process.env.PERSONA_TEMPLATE_ID

    if (!personaApiKey || !templateId) {
        return NextResponse.json({ error: 'KYC provider not configured' }, { status: 503 })
    }

    // Create a Persona inquiry
    const inquiryRes = await fetch('https://withpersona.com/api/v1/inquiries', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${personaApiKey}`,
            'Content-Type': 'application/json',
            'Persona-Version': '2023-01-05',
        },
        body: JSON.stringify({
            data: {
                attributes: {
                    'inquiry-template-id': templateId,
                    'reference-id': session.user.walletAddress,
                },
            },
        }),
    })

    if (!inquiryRes.ok) {
        const err = await inquiryRes.text()
        console.error('[KYC] Persona inquiry creation failed:', err)
        return NextResponse.json({ error: 'Failed to create KYC session' }, { status: 502 })
    }

    const { data: inquiry } = await inquiryRes.json()
    const inquiryId: string = inquiry.id

    // Create a session token for the hosted flow
    const sessionRes = await fetch('https://withpersona.com/api/v1/inquiry-sessions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${personaApiKey}`,
            'Content-Type': 'application/json',
            'Persona-Version': '2023-01-05',
        },
        body: JSON.stringify({
            data: {
                attributes: { 'inquiry-id': inquiryId },
            },
        }),
    })

    if (!sessionRes.ok) {
        return NextResponse.json({ error: 'Failed to create KYC session token' }, { status: 502 })
    }

    const { data: sessionData } = await sessionRes.json()
    const sessionToken: string = sessionData.attributes['session-token']

    // Upsert pending Verification row
    const existing = await prisma.verification.findFirst({
        where: { userId: session.user.id, type: 'KYC' },
        orderBy: { createdAt: 'desc' },
    })

    if (existing) {
        await prisma.verification.update({
            where: { id: existing.id },
            data: { providerId: inquiryId, status: 'PENDING', data: { sessionToken } },
        })
    } else {
        await prisma.verification.create({
            data: {
                userId: session.user.id,
                type: 'KYC',
                provider: 'Persona',
                providerId: inquiryId,
                status: 'PENDING',
                data: { sessionToken },
            },
        })
    }

    const hostedUrl = `https://withpersona.com/verify?inquiry-id=${inquiryId}&session-token=${sessionToken}`

    return NextResponse.json({ inquiryId, hostedUrl })
}
