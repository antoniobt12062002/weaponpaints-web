import { getSession } from "@/lib/session"
import { getPool } from "@/lib/db"
import { z } from "zod"

const schema = z.object({
  weapon_team: z.union([z.literal(2), z.literal(3)]),
  weapon_defindex: z.number().int().min(0),
})

export async function POST(req: Request) {
  const session = await getSession()

  if (!session?.steamid) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }

  const body = schema.parse(await req.json())
  const pool = getPool()

  await pool.query(
    `INSERT INTO wp_player_gloves (steamid, weapon_team, weapon_defindex)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE weapon_defindex = VALUES(weapon_defindex)`,
    [session.steamid, body.weapon_team, body.weapon_defindex]
  )

  return Response.json({ ok: true })
}
