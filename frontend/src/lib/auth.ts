import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { SiweMessage } from 'siwe'
import { prisma } from './prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'Ethereum',
      credentials: {
        message: { label: 'Message', type: 'text' },
        signature: { label: 'Signature', type: 'text' },
      },
      async authorize(credentials) {
        try {
          const siwe = new SiweMessage(JSON.parse(credentials?.message as string))
          const result = await siwe.verify({ signature: credentials?.signature as string })
          if (!result.success) return null

          const walletAddress = siwe.address.toLowerCase()

          try {
            const user = await prisma.user.upsert({
              where: { walletAddress },
              create: { walletAddress, role: 'INVESTOR' },
              update: {},
            })
            return { id: user.id, walletAddress: user.walletAddress, role: user.role }
          } catch {
            // DB unavailable — still allow login with wallet-only session
            return { id: walletAddress, walletAddress, role: 'INVESTOR' }
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.walletAddress = user.walletAddress
        token.role = user.role
      }
      return token
    },
    session({ session, token }: { session: any; token: any }) {
      session.user.walletAddress = token.walletAddress
      session.user.role = token.role
      return session
    },
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
})

// Extend next-auth types
declare module 'next-auth' {
  interface Session {
    user: { walletAddress: string; role: string; id?: string; name?: string | null; email?: string | null; image?: string | null }
  }
}
