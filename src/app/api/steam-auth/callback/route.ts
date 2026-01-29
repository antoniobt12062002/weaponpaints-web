import { createSession } from "@/lib/session"
import { redirect } from "next/navigation"

async function verifySteamOpenID(
  openidParams: URLSearchParams
): Promise<{ steamid: string; name: string; avatar: string } | null> {
  try {
    const verifyParams = new URLSearchParams({
      ...Object.fromEntries(openidParams),
      "openid.mode": "check_auth",
    })

    const response = await fetch("https://steamcommunity.com/openid/login", {
      method: "POST",
      body: verifyParams,
    })

    const text = await response.text()

    if (!text.includes("is_valid:true")) {
      return null
    }

    const identity = openidParams.get("openid.identity") || ""
    const steamidMatch = identity.match(/\/(\d+)$/)

    if (!steamidMatch) return null

    const steamid = steamidMatch[1]

    // Fetch player info from Steam API
    try {
      const apiKey = process.env.STEAM_API_KEY
      if (!apiKey) throw new Error("STEAM_API_KEY not configured")

      const playerResponse = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamid}`
      )

      if (!playerResponse.ok) throw new Error("Failed to fetch player data")

      const playerData = await playerResponse.json()
      const player = playerData.response?.players?.[0]

      if (!player) {
        return { steamid, name: "Steam User", avatar: "" }
      }

      return {
        steamid,
        name: player.personaname || "Steam User",
        avatar: player.avatarfull || "",
      }
    } catch (apiError) {
      console.log("Could not fetch player info from Steam API:", apiError)
      return { steamid, name: "Steam User", avatar: "" }
    }
  } catch (error) {
    console.error("Steam verification error:", error)
    return null
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const params = url.searchParams

    if (!params.get("openid.identity")) {
      redirect("/?error=invalid_steam_response")
    }

    const steamUser = await verifySteamOpenID(params)

    if (!steamUser) {
      redirect("/?error=steam_verification_failed")
    }

    // Create session with cookies
    await createSession(steamUser)

    redirect("/loadout")
  } catch (error) {
    console.error("Callback error:", error)
    redirect("/?error=steam_callback_error")
  }
}

