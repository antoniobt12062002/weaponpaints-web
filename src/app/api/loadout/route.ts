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
    `SELECT weapon_team, weapon_defindex
     FROM wp_player_gloves
     WHERE steamid = ?`,
    [session.steamid]
  )

  const loadout: Record<TeamKey, { knife: string | null; gloves: { weapon_defindex: number; weapon_paint_id: number } | null; skins: Record<number, any> }> = {
    "2": { knife: null, gloves: null, skins: {} },
    "3": { knife: null, gloves: null, skins: {} },
  }

  for (const row of knifeRows as any[]) {
    const team = String(row.weapon_team) as TeamKey
    if (team === "2" || team === "3") loadout[team].knife = row.knife
  }

  // Primeiro pega o weapon_defindex das gloves de wp_player_gloves
  const glovesDefindexByTeam: Record<TeamKey, number | null> = { "2": null, "3": null }
  for (const row of glovesRows as any[]) {
    const team = String(row.weapon_team) as TeamKey
    if (team === "2" || team === "3") {
      glovesDefindexByTeam[team] = Math.round(Number(row.weapon_defindex))
    }
  }

  // Depois procura o paint_id correspondente em wp_player_skins
  for (const row of skinsRows as any[]) {
    const team = String(row.weapon_team) as TeamKey
    if (team !== "2" && team !== "3") continue
    
    const defindex = row.weapon_defindex
    
    // Se é glove e bate com o defindex em wp_player_gloves
    if (defindex >= 5028 && defindex <= 5035) {
      if (glovesDefindexByTeam[team] === defindex) {
        loadout[team].gloves = {
          weapon_defindex: defindex,
          weapon_paint_id: row.weapon_paint_id,
        }
      }
    } else {
      loadout[team].skins[defindex] = {
        weapon_paint_id: row.weapon_paint_id,
        weapon_wear: Number(row.weapon_wear),
        weapon_seed: Number(row.weapon_seed),
      }
    }
  }

  return Response.json({ steamid: session.steamid, loadout })
}
