"use client"

import { useAccount, useConnect, useSignMessage } from "wagmi"
import { injected } from "wagmi/connectors"
import { signIn, signOut, useSession } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { SiweMessage } from "siwe"

export function WalletConnect() {
    const { address, isConnected } = useAccount()
    const { connect } = useConnect()

    const { signMessageAsync } = useSignMessage()
    const { data: session, status } = useSession()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async () => {
        setError(null)
        try {
            setLoading(true)

            // 1. Connect Wallet if not connected
            if (!isConnected) {
                connect({ connector: injected() })
                return // Wait for connection effect
            }

            // 2. Get Nonce
            const res = await fetch("/api/auth/nonce")
            const nonce = await res.text()

            // 3. Create SIWE Message
            const message = new SiweMessage({
                domain: window.location.host,
                address: address!,
                statement: "Sign in with Ethereum to LaunchPad",
                uri: window.location.origin,
                version: "1",
                chainId: 11155111, // Sepolia
                nonce,
            })

            // 4. Sign Message
            const signature = await signMessageAsync({
                message: message.prepareMessage(),
            })

            // 5. Sign In with NextAuth
            const result = await signIn("credentials", {
                message: JSON.stringify(message),
                redirect: false,
                signature,
            })

            if (result?.error) {
                console.error("Login failed:", result.error)
                setError("Login failed: " + result.error)
            }

        } catch (error) {
            console.error("Auth flow failed:", error)
            setError(error instanceof Error ? error.message : "Authentication failed")
        } finally {
            setLoading(false)
        }
    }

    // Effect to handle post-connection login if needed? 
    // For simplicity, we make user click "Sign In" after connecting for now, 
    // or combine them if the UX allows.

    if (status === "loading") {
        return <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</Button>
    }

    if (session) {
        return (
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                    {session.user?.role} : {session.user?.walletAddress?.slice(0, 6)}...
                </span>
                <Button variant="outline" onClick={() => signOut()}>
                    Sign Out
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <Button
                onClick={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...</>
                ) : (
                    isConnected ? "Sign In with Wallet" : "Connect Wallet"
                )}
            </Button>
            {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
    )
}


