import NextAuth from "next-auth"
import SteamProvider from "steam-next-auth"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    SteamProvider({
      clientSecret: process.env.STEAM_API_KEY!,
      realm: process.env.STEAM_REALM!,
      callbackUrl: process.env.STEAM_RETURN_URL!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, profile }) {
      const steamid =
        (profile as any)?.steamid ??
        (profile as any)?.steamId ??
        (token as any)?.steamid ??
        token.sub

      ;(token as any).steamid = steamid
      return token
    },
    async session({ session, token }) {
      ;(session.user as any).steamid = (token as any).steamid ?? token.sub
      return session
    },
  },
})
