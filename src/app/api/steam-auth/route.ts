import { redirect } from "next/navigation"

export async function GET() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const returnUrl = `${baseUrl}/api/steam-auth/callback`

    const params = new URLSearchParams({
      "openid.ns": "http://specs.openid.net/auth/2.0",
      "openid.mode": "checkid_setup",
      "openid.return_to": returnUrl,
      "openid.realm": baseUrl,
      "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
      "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    })

    redirect(`https://steamcommunity.com/openid/login?${params.toString()}`)
  } catch (error) {
    console.error("Steam auth error:", error)
    redirect("/?error=steam_auth_failed")
  }
}

