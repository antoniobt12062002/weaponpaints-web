import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AuthError({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const error = searchParams.error || "Unknown Error"

  const errorMessages: Record<string, string> = {
    Configuration:
      "Há um problema com a configuração do servidor. Verifique as variáveis de ambiente.",
    Callback:
      "Houve um erro ao conectar com o Steam. Tente novamente.",
    OAuthCallback:
      "Falha na autenticação Steam. Verifique se aceitou as permissões.",
    OAuthSignin:
      "Não foi possível iniciar o login com Steam.",
    Default: "Um erro desconhecido ocorreu durante a autenticação.",
  }

  const message = errorMessages[error] || errorMessages.Default

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-8 backdrop-blur">
          <div className="flex justify-center mb-4">
            <div className="text-5xl">⚠️</div>
          </div>

          <h1 className="text-2xl font-bold text-center text-white mb-4">
            Erro de Autenticação
          </h1>

          <p className="text-center text-slate-400 mb-6">{message}</p>

          <div className="bg-slate-800/50 rounded p-3 mb-6 text-xs text-slate-300 font-mono break-all">
            {error}
          </div>

          <div className="space-y-3">
            <Link href="/" className="block">
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                Voltar para Home
              </Button>
            </Link>
            <Link href="/api/steam-auth" className="block">
              <Button
                variant="outline"
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Tentar Novamente
              </Button>
            </Link>
          </div>

          <p className="text-xs text-slate-500 text-center mt-6">
            Se o problema persistir, verifique sua conexão de internet ou tente mais tarde.
          </p>
        </div>
      </div>
    </main>
  )
}
