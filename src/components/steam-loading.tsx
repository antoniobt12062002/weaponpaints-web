"use client"

import { useEffect, useState } from "react"

export function SteamLoading({ message = "Salvando..." }: { message?: string }) {
  const [currentImage, setCurrentImage] = useState(0)

  const images = [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-removebg-preview%20%281%29-jB4EPE0UAk5zfRMMmGC4cis3wm8zEp.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-removebg-preview-UZrG7pTrenJS2MoGQtWhw51L90B7WF.png",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-20 w-20">
          <img
            src={images[currentImage]}
            alt="Loading"
            className="h-full w-full object-contain animate-pulse"
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="text-base font-semibold text-white">{message}</div>
          <div className="flex gap-1">
            <div className="h-2 w-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="h-2 w-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="h-2 w-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    </div>
  )
}
