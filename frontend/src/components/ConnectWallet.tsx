'use client'

import { useEffect, useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Wallet, LogOut } from 'lucide-react'

export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [isClient, setIsClient] = useState(false)

  // Only set to true after mount to avoid hydration mismatch
  // This is a legitimate use of useEffect for client-side only rendering
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Show loading state during SSR and hydration
  if (!isClient) {
    return (
      <Button disabled className="flex items-center gap-2">
        <Wallet className="w-4 h-4" />
        Loading...
      </Button>
    )
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <Button
          onClick={() => disconnect()}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <Button
          key={connector.uid}
          onClick={() => connect({ connector })}
          className="flex items-center gap-2"
        >
          <Wallet className="h-4 w-4" />
          Connect {connector.name}
        </Button>
      ))}
    </div>
  )
}