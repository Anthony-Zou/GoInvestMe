import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { SiweMessage } from "siwe"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Ethereum",
            credentials: {
                message: {
                    label: "Message",
                    type: "text",
                    placeholder: "0x0",
                },
                signature: {
                    label: "Signature",
                    type: "text",
                    placeholder: "0x0",
                },
            },
            async authorize(credentials) {
                try {
                    const siwe = new SiweMessage(JSON.parse((credentials?.message as string) || "{}"))
                    const result = await siwe.verify({
                        signature: (credentials?.signature as string) || "",
                        // nonce: await getCsrfToken({ req: { headers: req.headers } }), // In App Router, we handle nonce differently or trust allow-list for now
                    })

                    if (result.success) {
                        const walletAddress = siwe.address

                        // Upsert User
                        const user = await prisma.user.upsert({
                            where: { walletAddress },
                            create: {
                                walletAddress,
                                role: "INVESTOR", // Default role
                            },
                            update: {},
                        })

                        return {
                            id: user.id,
                            walletAddress: user.walletAddress,
                            role: user.role,
                        }
                    }
                    return null
                } catch (e) {
                    console.error("SIWE Error:", e)
                    return null
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, token }: { session: any; token: any }) {
            session.user.walletAddress = token.sub
            session.user.id = token.id
            session.user.role = token.role
            return session
        },
        async jwt({ token, user }: { token: any; user: any }) {
            if (user) {
                token.sub = user.walletAddress
                token.id = user.id
                token.role = user.role
            }
            return token
        },
    },
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
})
