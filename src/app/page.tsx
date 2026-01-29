import { auth, signOut } from "@/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: "CS2 WeaponPaints - Gerenciador de Skins",
  description: "Configure suas skins e knives do Counter-Strike 2 por time",
}

export default async function Page() {
  const session = await auth()
  const steamid = (session?.user as any)?.steamid as string | undefined
  const userName = session?.user?.name || "Jogador"
  const userImage = session?.user?.image

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation Bar */}
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
              <span className="text-sm font-bold text-white">CP</span>
            </div>
            <h1 className="text-xl font-bold text-white">CS2 Paints</h1>
          </div>
          {steamid && (
            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/" })
              }}
            >
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                Sair
              </Button>
            </form>
          )}
        </nav>
      </div>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left Column */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold text-white">
                Customize Suas{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Skins
                </span>
              </h2>
              <p className="text-lg text-slate-400">
                Gerencie suas skins e knives do Counter-Strike 2 separadas por time. Escolha o visual perfeito para T (Terrorists) e CT (Counter-Terrorists).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 backdrop-blur">
                <div className="text-2xl font-bold text-cyan-400">T</div>
                <p className="mt-1 text-sm text-slate-400">Terrorists</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 backdrop-blur">
                <div className="text-2xl font-bold text-blue-400">CT</div>
                <p className="mt-1 text-sm text-slate-400">Counter-Terrorists</p>
              </div>
            </div>

            {!steamid ? (
              <div className="space-y-3 pt-4">
                <p className="text-sm text-slate-500">Conecte-se com sua conta Steam para começar</p>
                <Link href="/api/steam-auth" className="inline-block">
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-6">
                    Entrar com Steam
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/loadout" className="inline-block">
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-6">
                  Ir para Loadout
                </Button>
              </Link>
            )}
          </div>

          {/* Right Column - Feature Cards */}
          <div className="grid gap-4">
            <div className="rounded-lg border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 backdrop-blur">
              <div className="mb-3 text-2xl">🎯</div>
              <h3 className="font-bold text-white">Separado por Time</h3>
              <p className="mt-2 text-sm text-slate-400">
                Configure diferentes skins para cada equipe. Maximize seu potencial em qualquer role.
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 backdrop-blur">
              <div className="mb-3 text-2xl">🔄</div>
              <h3 className="font-bold text-white">Sincronização Automática</h3>
              <p className="mt-2 text-sm text-slate-400">
                Suas configurações são salvas automaticamente no banco de dados.
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 backdrop-blur">
              <div className="mb-3 text-2xl">🛡️</div>
              <h3 className="font-bold text-white">Seguro e Rápido</h3>
              <p className="mt-2 text-sm text-slate-400">
                Integração direta com Steam para máxima segurança e performance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 bg-slate-950/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-center text-sm text-slate-500">
            CS2 WeaponPaints © 2024 - Gerenciador de Skins para Counter-Strike 2
          </p>
        </div>
      </div>
    </main>
  )
}
