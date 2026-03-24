import { NextResponse } from 'next/server'

export async function GET() {
  const nonce = Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15)
  return new NextResponse(nonce, { headers: { 'Content-Type': 'text/plain' } })
}
