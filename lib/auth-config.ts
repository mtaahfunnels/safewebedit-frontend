import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error('[AUTH] Missing credentials')
          return null
        }

        try {
          console.log('[AUTH] Attempting login via backend for:', credentials.email)

          // Call backend login API
          const response = await fetch('http://localhost:5005/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          })

          console.log('[AUTH] Backend response status:', response.status)

          if (!response.ok) {
            const errorText = await response.text()
            console.error('[AUTH] Backend login failed:', response.status, errorText)
            return null
          }

          const data = await response.json()
          console.log('[AUTH] Backend response:', JSON.stringify(data))

          if (!data.success || !data.token) {
            console.error('[AUTH] Invalid response from backend')
            return null
          }

          console.log('[AUTH] Backend login successful for:', credentials.email)

          // Return user object with token
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            accessToken: data.token,
            organizationId: data.user.id,
            organizationName: data.user.name,
          }
        } catch (error) {
          console.error('[AUTH] Authentication error:', error)
          return null
        }
      },
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.accessToken = user.accessToken
        token.organizationId = user.organizationId
        token.organizationName = user.organizationName
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).accessToken = token.accessToken
        ;(session.user as any).organizationId = token.organizationId
        ;(session.user as any).organizationName = token.organizationName
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "safewebedit-secret-change-in-production-6h9k2p4m",
  trustHost: true,
  debug: true,
})
