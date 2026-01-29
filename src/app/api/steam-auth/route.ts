import { signIn } from "@/auth"
import { redirect } from "next/navigation"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const openidUrl = "https://steamcommunity.com/openid/login"
    const returnUrl = `${process.env.NEXTAUTH_URL}/api/steam-auth/callback`

    // Prepare OpenID request
    const params = new URLSearchParams({
      "openid.ns": "http://specs.openid.net/auth/2.0",
      "openid.mode": "checkid_setup",
      "openid.return_to": returnUrl,
      "openid.realm": process.env.NEXTAUTH_URL || "http://localhost:3000",
      "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
      "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    })

    redirect(`${openidUrl}?${params.toString()}`)
  } catch (error) {
    console.error("Steam auth error:", error)
    redirect("/auth/error?error=Configuration")
  }
}
