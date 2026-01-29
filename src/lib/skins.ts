import skinsJson from "../../data/skins_en.json"

export type SkinRow = {
  weapon_defindex: number
  weapon_name: string
  paint: number
  paint_name: string
  image: string
}

export type WeaponCatalog = Record<
  number,
  { weapon_name: string; default_paint_name: string; default_image_url: string }
>

export type SkinsByWeapon = Record<number, Record<number, { paint_name: string; image_url: string }>>

export function buildCatalog() {
  const rows = skinsJson as unknown as SkinRow[]
  const weapons: WeaponCatalog = {}
  const skinsByWeapon: SkinsByWeapon = {}

  for (const row of rows) {
    if (!skinsByWeapon[row.weapon_defindex]) skinsByWeapon[row.weapon_defindex] = {}
    skinsByWeapon[row.weapon_defindex][row.paint] = {
      paint_name: row.paint_name,
      image_url: row.image,
    }

    if (!weapons[row.weapon_defindex]) {
      weapons[row.weapon_defindex] = {
        weapon_name: row.weapon_name,
        default_paint_name: row.paint_name,
        default_image_url: row.image,
      }
    }
  }

  return { weapons, skinsByWeapon }
}

export const WEAR_PRESETS = [
  { label: "Factory New", value: 0.0 },
  { label: "Minimal Wear", value: 0.07 },
  { label: "Field-Tested", value: 0.15 },
  { label: "Well-Worn", value: 0.38 },
  { label: "Battle-Scarred", value: 0.45 },
]

export const TEAM = {
  T: 2 as const,
  CT: 3 as const,
}
