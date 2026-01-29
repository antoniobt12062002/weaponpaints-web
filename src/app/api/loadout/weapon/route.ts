import { auth } from "@/auth"
import { getPool } from "@/lib/db"
import { z } from "zod"

const schema = z.object({
  weapon_team: z.union([z.literal(2), z.literal(3)]),
  weapon_defindex: z.number().int(),
  weapon_paint_id: z.number().int(),
  weapon_wear: z.number().min(0).max(1),
  weapon_seed: z.number().int().min(0).max(1000),
})

export async function POST(req: Request) {
  const session = await auth()
  const steamid = (session?.user as any)?.steamid as string | undefined

  if (!steamid) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }

  const body = schema.parse(await req.json())
  const pool = getPool()

  // UPSERT for a SINGLE team only.
  // UNIQUE(steamid, weapon_team, weapon_defindex)
  await pool.query(
    `INSERT INTO wp_player_skins
      (steamid, weapon_team, weapon_defindex, weapon_paint_id, weapon_wear, weapon_seed)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      weapon_paint_id = VALUES(weapon_paint_id),
      weapon_wear = VALUES(weapon_wear),
      weapon_seed = VALUES(weapon_seed)`,
    [
      steamid,
      body.weapon_team,
      body.weapon_defindex,
      body.weapon_paint_id,
      body.weapon_wear,
      body.weapon_seed,
    ]
  )

  return Response.json({ ok: true })
}
