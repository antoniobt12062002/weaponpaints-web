import NextAuth from "next-auth"
import type { Profile } from "next-auth"

// Provider Steam customizado para NextAuth v5
const SteamProvider = {
  id: "steam",
  name: "Steam",
  type: "oauth",
  authorization: {
    url: "https://steamcommunity.com/openid/login",
    params: {
      "openid.ns": "http://specs.openid.net/auth/2.0",
      "openid.mode": "checkid_setup",
      "openid.return_to": `${process.env.NEXTAUTH_URL}/api/auth/callback/steam`,
      "openid.realm": process.env.NEXTAUTH_URL,
      "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
      "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    },
  },
  async profile(profile: Profile & { steamid?: string }) {
    return {
      id: profile.steamid || profile.sub || "",
      name: profile.name || "Steam User",
      image: profile.image || null,
      steamid: profile.steamid || profile.sub || "",
    }
  },
  clientId: "steam",
  clientSecret: process.env.STEAM_API_KEY || "",
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [SteamProvider as any],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        const steamid = (profile as any)?.steamid || (profile as any)?.sub || token.sub
        ;(token as any).steamid = steamid
      }
      return token
    },
    async session({ session, token }) {
      ;(session.user as any).steamid = (token as any).steamid || token.sub
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
})
