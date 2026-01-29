import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      id: "steam",
      name: "Steam",
      async authorize(credentials) {
        try {
          // Get Steam OpenID response from credentials
          const steamid = (credentials?.steamid as string) || ""
          const name = (credentials?.name as string) || ""
          const avatar = (credentials?.avatar as string) || ""

          if (!steamid) return null

          return {
            id: steamid,
            name,
            image: avatar,
            steamid,
          }
        } catch (error) {
          console.error("Steam auth error:", error)
          return null
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        ;(token as any).steamid = (user as any).steamid || user.id
      }
      return token
    },
    async session({ session, token }) {
      ;(session.user as any).steamid = (token as any).steamid || token.sub
      return session
    },
  },
  pages: {
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
})
