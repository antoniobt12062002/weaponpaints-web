import { auth, signIn, signOut } from "@/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function Page() {
  const session = await auth()
  const steamid = (session?.user as any)?.steamid as string | undefined

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">CS2 WeaponPaints</CardTitle>
          <CardDescription>
            Login com Steam para escolher skins e knife separadas por time (T/CT).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          {!steamid ? (
            <form
              action={async () => {
                "use server"
                await signIn("steam", { redirectTo: "/loadout" })
              }}
            >
              <Button type="submit">Login com Steam</Button>
            </form>
          ) : (
            <>
              <a className="text-sm underline" href="/loadout">
                Ir para Loadout
              </a>
              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/" })
                }}
              >
                <Button type="submit" variant="destructive">
                  Sair
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 text-sm text-muted-foreground">
        <p>
          Este projeto grava no mesmo schema do plugin: wp_player_skins e wp_player_knife.
        </p>
        <p>
          Separação por time: weapon_team 2 = T, weapon_team 3 = CT.
        </p>
      </div>
    </main>
  )
}
