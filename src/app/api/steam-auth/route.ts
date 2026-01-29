import { redirect } from "next/navigation"

export async function GET() {
  try {
    console.log("[v0] steam-auth GET called")
    
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    console.log("[v0] baseUrl:", baseUrl)
    
    const returnUrl = `${baseUrl}/api/steam-auth/callback`
    console.log("[v0] returnUrl:", returnUrl)

    const params = new URLSearchParams({
      "openid.ns": "http://specs.openid.net/auth/2.0",
      "openid.mode": "checkid_setup",
      "openid.return_to": returnUrl,
      "openid.realm": baseUrl,
      "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
      "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    })

    const redirectUrl = `https://steamcommunity.com/openid/login?${params.toString()}`
    console.log("[v0] Redirecting to:", redirectUrl)
    
    redirect(redirectUrl)
  } catch (error) {
    console.error("[v0] Steam auth error:", error)
    redirect("/?error=steam_auth_failed")
  }
}


