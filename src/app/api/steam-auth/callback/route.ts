import { createSession } from "@/lib/session"
import { redirect } from "next/navigation"

async function verifySteamOpenID(
  openidParams: URLSearchParams
): Promise<{ steamid: string; name: string; avatar: string } | null> {
  try {
    console.log("[v0] Verifying Steam OpenID response")
    
    const verifyParams = new URLSearchParams({
      ...Object.fromEntries(openidParams),
      "openid.mode": "check_auth",
    })

    console.log("[v0] Sending verify request to Steam")
    
    const response = await fetch("https://steamcommunity.com/openid/login", {
      method: "POST",
      body: verifyParams,
    })

    const text = await response.text()
    console.log("[v0] Steam verification response:", text.substring(0, 100))

    if (!text.includes("is_valid:true")) {
      console.log("[v0] OpenID verification failed")
      return null
    }

    const identity = openidParams.get("openid.identity") || ""
    console.log("[v0] OpenID identity:", identity)
    
    const steamidMatch = identity.match(/\/(\d+)$/)

    if (!steamidMatch) {
      console.log("[v0] Could not extract steamid from identity")
      return null
    }

    const steamid = steamidMatch[1]
    console.log("[v0] Extracted steamid:", steamid)

    // Try to fetch player info from Steam API, but don't fail if it's missing
    let playerName = "Steam User"
    let playerAvatar = ""
    
    try {
      const apiKey = process.env.STEAM_API_KEY
      
      if (!apiKey) {
        console.log("[v0] STEAM_API_KEY not configured, using fallback")
      } else {
        console.log("[v0] Fetching player info from Steam API")
        
        const playerResponse = await fetch(
          `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamid}`,
          { next: { revalidate: 0 } }
        )

        if (playerResponse.ok) {
          const playerData = await playerResponse.json()
          const player = playerData.response?.players?.[0]

          if (player) {
            playerName = player.personaname || "Steam User"
            playerAvatar = player.avatarfull || ""
            console.log("[v0] Player info fetched:", playerName)
          }
        }
      }
    } catch (apiError) {
      console.log("[v0] Could not fetch player info from Steam API:", apiError)
      // Continue with fallback values
    }

    return {
      steamid,
      name: playerName,
      avatar: playerAvatar,
    }
  } catch (error) {
    console.error("[v0] Steam verification error:", error)
    return null
  }
}

export async function GET(request: Request) {
  try {
    console.log("[v0] Steam callback called")
    console.log("[v0] Request URL:", request.url)
    
    const url = new URL(request.url)
    const params = url.searchParams

    console.log("[v0] Search params keys:", Array.from(params.keys()))

    if (!params.get("openid.identity")) {
      console.log("[v0] No openid.identity param found")
      redirect("/?error=invalid_steam_response")
    }

    const steamUser = await verifySteamOpenID(params)

    if (!steamUser) {
      console.log("[v0] Steam user verification returned null")
      redirect("/?error=steam_verification_failed")
    }

    console.log("[v0] Creating session for steamid:", steamUser.steamid)
    
    // Create session with cookies
    await createSession(steamUser)

    console.log("[v0] Session created, redirecting to /loadout")
    
    redirect("/loadout")
  } catch (error) {
    console.error("[v0] Callback error:", error)
    redirect("/?error=steam_callback_error")
  }
}



