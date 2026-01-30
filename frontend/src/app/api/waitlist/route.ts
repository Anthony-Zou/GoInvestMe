import { NextResponse } from 'next/server'
import { z } from 'zod'

const waitlistSchema = z.object({
    email: z.string().email(),
    role: z.enum(['talent', 'founder', 'investor']).optional().default('talent')
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, role } = waitlistSchema.parse(body)

        // TODO: Connect to MongoDB when ready.
        // For now, valid emails are logged which counts as "captured" for MVP.
        console.log(`[WAITLIST] New signup: ${email} (${role})`)

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
