import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const waitlistSchema = z.object({
    email: z.string().email(),
    role: z.enum(['talent', 'founder', 'investor']).optional().default('talent'),
    source: z.string().optional(),
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, role, source } = waitlistSchema.parse(body)

        await prisma.waitlistEntry.upsert({
            where: { email },
            create: { email, role, source },
            update: {},
        })

        return NextResponse.json(
            { message: "You've been added to the waitlist!" },
            { status: 200 }
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
