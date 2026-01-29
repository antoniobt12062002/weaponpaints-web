import { auth } from "@/auth"
import { getPool } from "@/lib/db"
import { z } from "zod"

const schema = z.object({
  weapon_team: z.union([z.literal(2), z.literal(3)]),
  knife: z.string().min(1).max(64),
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
  // UNIQUE(steamid, weapon_team)
  await pool.query(
    `INSERT INTO wp_player_knife (steamid, weapon_team, knife)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE knife = VALUES(knife)`,
    [steamid, body.weapon_team, body.knife]
  )

  return Response.json({ ok: true })
}
