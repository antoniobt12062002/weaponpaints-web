import { createSession } from "@/lib/session"
import { redirect } from "next/navigation"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const params = url.searchParams

    console.log("[v0] Callback params:", Array.from(params.keys()))

    // Extract steamid from openid.identity or openid.claimed_id
    let steamid = ""
    const identity = params.get("openid.identity") || params.get("openid.claimed_id") || ""
    
    if (identity) {
      const match = identity.match(/\/(\d+)$/)
      if (match) {
        steamid = match[1]
      }
    }

    if (!steamid) {
      console.log("[v0] Could not extract steamid from callback")
      return redirect("/?error=invalid_response")
    }

    console.log("[v0] Extracted steamid:", steamid)

    // Validate using Steam API
    const apiKey = process.env.STEAM_API_KEY
    if (!apiKey) {
      console.log("[v0] STEAM_API_KEY not configured")
      return redirect("/?error=config_error")
    }

    console.log("[v0] Validating steamid with Steam API")

    const playerResponse = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamid}`
    )

    if (!playerResponse.ok) {
      console.log("[v0] Steam API request failed")
      return redirect("/?error=api_error")
    }

    const playerData = await playerResponse.json()
    const player = playerData.response?.players?.[0]

    if (!player) {
      console.log("[v0] Player not found")
      return redirect("/?error=player_not_found")
    }

    console.log("[v0] Player validated:", player.personaname)

    // Create session
    await createSession({
      steamid,
      name: player.personaname || "Steam User",
      avatar: player.avatarfull || "",
    })

    console.log("[v0] Session created, redirecting to /loadout")
    return redirect("/loadout")
  } catch (error) {
    console.error("[v0] Callback error:", error)
    return redirect("/?error=callback_error")
  }
}





