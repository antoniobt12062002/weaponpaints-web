import { getSession } from "@/lib/session"
import { getPool } from "@/lib/db"

type TeamKey = "2" | "3"

export async function GET() {
  const session = await getSession()
  
  if (!session?.steamid) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }

  const pool = getPool()

  const [skinsRows] = await pool.query(
    `SELECT weapon_team, weapon_defindex, weapon_paint_id, weapon_wear, weapon_seed
     FROM wp_player_skins
     WHERE steamid = ?`,
    [session.steamid]
  )

  const [knifeRows] = await pool.query(
    `SELECT weapon_team, knife
     FROM wp_player_knife
     WHERE steamid = ?`,
    [session.steamid]
  )

  const [glovesRows] = await pool.query(
    `SELECT weapon_team, gloves
     FROM wp_player_gloves
     WHERE steamid = ?`,
    [session.steamid]
  )

  const loadout: Record<TeamKey, { knife: string | null; gloves: string | null; skins: Record<number, any> }> = {
    "2": { knife: null, gloves: null, skins: {} },
    "3": { knife: null, gloves: null, skins: {} },
  }

  for (const row of knifeRows as any[]) {
    const team = String(row.weapon_team) as TeamKey
    if (team === "2" || team === "3") loadout[team].knife = row.knife
  }

  for (const row of glovesRows as any[]) {
    const team = String(row.weapon_team) as TeamKey
    if (team === "2" || team === "3") loadout[team].gloves = row.gloves
  }

  for (const row of skinsRows as any[]) {
    const team = String(row.weapon_team) as TeamKey
    if (team !== "2" && team !== "3") continue
    loadout[team].skins[row.weapon_defindex] = {
      weapon_paint_id: row.weapon_paint_id,
      weapon_wear: Number(row.weapon_wear),
      weapon_seed: Number(row.weapon_seed),
    }
  }

  return Response.json({ steamid: session.steamid, loadout })
}
