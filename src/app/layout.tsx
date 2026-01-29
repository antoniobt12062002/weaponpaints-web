import type { Metadata } from "next"
import "./globals.css"
import { Sonner } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "CS2 WeaponPaints",
  description: "Weapon loadout dashboard",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <Sonner />
      </body>
    </html>
  )
}
