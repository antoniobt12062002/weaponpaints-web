import { signIn } from "@/auth"

async function verifySteamOpenID(
  openidParams: URLSearchParams
): Promise<{ steamid: string; name: string; avatar: string } | null> {
  try {
    // Verify with Steam
    const verifyParams = new URLSearchParams({
      ...Object.fromEntries(openidParams),
      "openid.mode": "check_auth",
    })

    const response = await fetch("https://steamcommunity.com/openid/login", {
      method: "POST",
      body: verifyParams,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })

    const text = await response.text()

    // Check if verification was successful
    if (!text.includes("is_valid:true")) {
      return null
    }

    // Extract steamid from openid.identity
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

      const playerData = await playerResponse.json()

      const player = playerData.response?.players?.[0]

      if (!player) return null

      return {
        steamid,
        name: player.personaname || "Steam User",
        avatar: player.avatarfull || player.avatar || "",
      }
    } catch (apiError) {
      console.log("Could not fetch player info from API, using basic info")
      return {
        steamid,
        name: "Steam User",
        avatar: "",
      }
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

    // Check if this is the Steam callback
    if (!params.get("openid.identity")) {
      return new Response("Invalid Steam response", { status: 400 })
    }

    // Verify the OpenID response
    const steamUser = await verifySteamOpenID(params)

    if (!steamUser) {
      return new Response("Steam verification failed", { status: 401 })
    }

    // Sign in with credentials provider
    await signIn("credentials", {
      steamid: steamUser.steamid,
      name: steamUser.name,
      avatar: steamUser.avatar,
      redirect: false,
    })

    // Redirect to loadout page
    return new Response(null, {
      status: 302,
      headers: { Location: "/loadout" },
    })
  } catch (error) {
    console.error("Callback error:", error)
    return new Response(null, {
      status: 302,
      headers: { Location: "/auth/error?error=Callback" },
    })
  }
}
