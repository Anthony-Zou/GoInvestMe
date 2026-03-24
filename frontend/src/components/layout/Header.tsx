'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useAccount, useConnect, useSignMessage, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { SiweMessage } from 'siwe'
import { useState, useEffect, useRef } from 'react'
import { shortAddress } from '@/lib/utils'

export function Header() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
  const { data: session, status } = useSession()
  const [signing, setSigning] = useState(false)
  const attempted = useRef(false)

  const signIn = async () => {
    if (!address || signing) return
    setSigning(true)
    try {
      const nonce = await fetch('/api/auth/nonce').then(r => r.text())
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to LaunchPad',
        uri: window.location.origin,
        version: '1',
        chainId: 11155111,
        nonce,
      })
      const signature = await signMessageAsync({ message: message.prepareMessage() })
      const { signIn: nextSignIn } = await import('next-auth/react')
      await nextSignIn('credentials', {
        message: JSON.stringify(message),
        signature,
        redirect: false,
      })
    } catch (e) {
      console.error('Sign in failed:', e)
    } finally {
      setSigning(false)
    }
  }

  // Auto sign-in when wallet connects
  useEffect(() => {
    if (isConnected && !session && status === 'unauthenticated' && !attempted.current) {
      attempted.current = true
      signIn()
    }
    if (!isConnected) attempted.current = false
  }, [isConnected, session, status]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            LaunchPad
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/founder" className="hover:text-gray-900 transition-colors">Founder</Link>
            <Link href="/investor" className="hover:text-gray-900 transition-colors">Invest</Link>
            <Link href="/talent" className="hover:text-gray-900 transition-colors">Talent</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {status === 'loading' || signing ? (
            <span className="text-sm text-gray-500">Loading...</span>
          ) : session ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:block">
                {session.user.walletAddress ? shortAddress(session.user.walletAddress) : '...'} · <span className="font-medium">{session.user.role}</span>
              </span>
              <button
                onClick={() => { signOut(); disconnect() }}
                className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : isConnected ? (
            <button
              onClick={signIn}
              className="text-sm px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Sign In with Wallet
            </button>
          ) : (
            <button
              onClick={() => connect({ connector: injected() })}
              className="text-sm px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
