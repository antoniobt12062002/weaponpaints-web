import { auth } from "@/auth"
import { getPool } from "@/lib/db"

type TeamKey = "2" | "3"

export async function GET() {
  const session = await auth()
  const steamid = (session?.user as any)?.steamid as string | undefined

  if (!steamid) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }

  const pool = getPool()

  // Reads for BOTH teams. We do not group or MAX here because T and CT can differ.
  const [skinsRows] = await pool.query(
    `SELECT weapon_team, weapon_defindex, weapon_paint_id, weapon_wear, weapon_seed
     FROM wp_player_skins
     WHERE steamid = ?`,
    [steamid]
  )

  const [knifeRows] = await pool.query(
    `SELECT weapon_team, knife
     FROM wp_player_knife
     WHERE steamid = ?`,
    [steamid]
  )

  const loadout: Record<TeamKey, { knife: string | null; skins: Record<number, any> }> = {
    "2": { knife: null, skins: {} },
    "3": { knife: null, skins: {} },
  }

  for (const row of knifeRows as any[]) {
    const team = String(row.weapon_team) as TeamKey
    if (team === "2" || team === "3") loadout[team].knife = row.knife
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

  return Response.json({ steamid, loadout })
}
