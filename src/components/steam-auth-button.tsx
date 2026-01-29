"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SteamLoading } from "@/components/steam-loading"

export function SteamAuthButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    
    // Espera mínimo de 3 segundos
    await new Promise((resolve) => setTimeout(resolve, 3000))
    
    // Redireciona para autenticação Steam
    window.location.href = "/api/steam-auth"
  }

  if (isLoading) {
    return <SteamLoading message="Conectando com Steam..." />
  }

  return (
    <Button
      onClick={handleClick}
      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-6"
    >
      Entrar com Steam
    </Button>
  )
}
