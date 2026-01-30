import { NextResponse } from "next/server"

export async function GET() {
    // Mock nonce generation (must be alphanumeric, at least 8 chars)
    // Using simple random string without special characters
    const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    return new NextResponse(nonce, { headers: { "Content-Type": "text/plain" } })
}
