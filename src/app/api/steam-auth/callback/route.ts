import { createSession } from "@/lib/session"
import { redirect } from "next/navigation"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const params = url.searchParams

  // Extract steamid from openid.identity or openid.claimed_id
  const identity = params.get("openid.identity") || params.get("openid.claimed_id") || ""
  
  if (!identity) {
    redirect("/?error=no_identity")
  }

  const match = identity.match(/\/(\d+)$/)
  if (!match) {
    redirect("/?error=invalid_identity")
  }

  const steamid = match[1]

  // Validate using Steam API
  const apiKey = process.env.STEAM_API_KEY
  if (!apiKey) {
    redirect("/?error=no_api_key")
  }

  const playerResponse = await fetch(
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamid}`,
    { cache: "no-store" }
  )

  if (!playerResponse.ok) {
    redirect("/?error=steam_api_failed")
  }

  const playerData = await playerResponse.json()
  const player = playerData.response?.players?.[0]

  if (!player) {
    redirect("/?error=player_not_found")
  }

  // Create session
  await createSession({
    steamid,
    name: player.personaname || "Steam User",
    avatar: player.avatarfull || "",
  })

  redirect("/loadout")
}





