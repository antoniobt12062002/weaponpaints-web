"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { TEAM, WEAR_PRESETS, buildCatalog, buildAllGloves } from "@/lib/skins"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

type Team = 2 | 3

type TeamLoadout = {
  knife: string | null
  gloves: number | null
  skins: Record<number, { weapon_paint_id: number; weapon_wear: number; weapon_seed: number }>
}

type LoadoutResponse = {
  steamid: string
  loadout: {
    "2": TeamLoadout
    "3": TeamLoadout
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export default function LoadoutClient() {
  const [team, setTeam] = useState<Team>(TEAM.T)
  const [data, setData] = useState<LoadoutResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [weaponFilter, setWeaponFilter] = useState("")

  const { weapons, skinsByWeapon } = useMemo(() => buildCatalog(), [])
  const allGloves = useMemo(() => buildAllGloves(), [])

  useEffect(() => {
    let active = true
    setLoading(true)
    fetch("/api/loadout", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("failed")
        return r.json()
      })
      .then((json: LoadoutResponse) => {
        if (active) setData(json)
      })
      .catch(() => toast.error("Erro ao carregar loadout"))
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const current = useMemo(() => {
    if (!data) return null
    return team === TEAM.T ? data.loadout["2"] : data.loadout["3"]
  }, [data, team])

  const weaponEntries = useMemo(() => {
    const entries = Object.entries(weapons).map(([def, w]) => ({
      weapon_defindex: Number(def),
      weapon_name: w.weapon_name,
      default_paint_name: w.default_paint_name,
      default_image_url: w.default_image_url,
    }))
    const q = weaponFilter.trim().toLowerCase()
    if (!q) return entries
    return entries.filter((e) => e.weapon_name.toLowerCase().includes(q))
  }, [weapons, weaponFilter])

  async function saveKnife(targetTeam: Team, knife: string) {
    const r = await fetch("/api/loadout/knife", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weapon_team: targetTeam, knife }),
    })
    if (!r.ok) throw new Error("save_knife_failed")

    setData((prev) => {
      if (!prev) return prev
      const key = targetTeam === TEAM.T ? "2" : "3"
      return {
        ...prev,
        loadout: {
          ...prev.loadout,
          [key]: { ...prev.loadout[key], knife },
        },
      }
    })
  }

  async function saveGloves(targetTeam: Team, weapon_defindex: number) {
    const r = await fetch("/api/loadout/gloves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weapon_team: targetTeam, weapon_defindex }),
    })
    if (!r.ok) throw new Error("save_gloves_failed")

    setData((prev) => {
      if (!prev) return prev
      const key = targetTeam === TEAM.T ? "2" : "3"
      return {
        ...prev,
        loadout: {
          ...prev.loadout,
          [key]: { ...prev.loadout[key], gloves: weapon_defindex },
        },
      }
    })
  }

  async function saveWeapon(targetTeam: Team, payload: { weapon_defindex: number; weapon_paint_id: number; weapon_wear: number; weapon_seed: number }) {
    const r = await fetch("/api/loadout/weapon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weapon_team: targetTeam, ...payload }),
    })
    if (!r.ok) throw new Error("save_weapon_failed")

    setData((prev) => {
      if (!prev) return prev
      const key = targetTeam === TEAM.T ? "2" : "3"
      return {
        ...prev,
        loadout: {
          ...prev.loadout,
          [key]: {
            ...prev.loadout[key],
            skins: {
              ...prev.loadout[key].skins,
              [payload.weapon_defindex]: {
                weapon_paint_id: payload.weapon_paint_id,
                weapon_wear: payload.weapon_wear,
                weapon_seed: payload.weapon_seed,
              },
            },
          },
        },
      }
    })
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </main>
    )
  }

  if (!data || !current) {
    return <main className="mx-auto max-w-6xl p-6">Você precisa estar logado.</main>
  }

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Loadout - PeladosCM</h1>
          <p className="text-sm text-muted-foreground">
            Configuração de skins para o servidor da comunidade PeladosCM. Alterações aplicam somente ao time selecionado.
          </p>
        </div>
      </div>

      <Tabs value={String(team)} onValueChange={(v) => setTeam(Number(v) as Team)}>
        <TabsList>
          <TabsTrigger value="2">T</TabsTrigger>
          <TabsTrigger value="3">CT</TabsTrigger>
        </TabsList>
      </Tabs>

      <KnifeCard
        team={team}
        knife={current.knife}
        onSave={async (knife) => {
          try {
            await saveKnife(team, knife)
            toast.success(team === TEAM.T ? "Knife salva para T" : "Knife salva para CT")
          } catch {
            toast.error("Erro ao salvar knife")
          }
        }}
      />

      <GlovesCard
        team={team}
        gloves={current.gloves}
        onSave={async (weapon_defindex) => {
          try {
            await saveGloves(team, weapon_defindex)
            toast.success(team === TEAM.T ? "Gloves salvas para T" : "Gloves salvas para CT")
          } catch {
            toast.error("Erro ao salvar gloves")
          }
        }}
        glovesSkins={glovesSkinsByWeapon[5032] ?? {}}
      />

      <Card>
        <CardHeader>
          <CardTitle>Armas</CardTitle>
          <CardDescription>
            Selecione uma arma, escolha uma skin e ajuste wear/seed. O salvamento é por time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="weaponFilter">Buscar</Label>
              <Input
                id="weaponFilter"
                value={weaponFilter}
                onChange={(e) => setWeaponFilter(e.target.value)}
                placeholder="weapon_ak47, weapon_awp..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {weaponEntries.map((w) => (
                <WeaponCard
                  key={w.weapon_defindex}
                  team={team}
                  weapon_defindex={w.weapon_defindex}
                  weapon_name={w.weapon_name}
                  skins={skinsByWeapon[w.weapon_defindex]}
                  selected={current.skins[w.weapon_defindex]}
                  defaultImage={w.default_image_url}
                  defaultName={w.default_paint_name}
                  onSave={async (payload) => {
                    try {
                      await saveWeapon(team, payload)
                      toast.success(team === TEAM.T ? "Skin salva para T" : "Skin salva para CT")
                    } catch {
                      toast.error("Erro ao salvar skin")
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

function KnifeCard({
  team,
  knife,
  onSave,
}: {
  team: Team
  knife: string | null
  onSave: (knife: string) => Promise<void>
}) {
  const knifeOptions = [
    { label: "Default knife", value: "weapon_knife" },
    { label: "Karambit", value: "weapon_knife_karambit" },
    { label: "M9 Bayonet", value: "weapon_knife_m9_bayonet" },
    { label: "Butterfly", value: "weapon_knife_butterfly" },
  ]

  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(knife ?? "weapon_knife")

  useEffect(() => {
    setSelected(knife ?? "weapon_knife")
  }, [knife])

  const selectedLabel = knifeOptions.find((k) => k.value === selected)?.label ?? selected

  return (
    <Card>
      <CardHeader>
        <CardTitle>Knife</CardTitle>
        <CardDescription>
          Time atual: {team === TEAM.T ? "T" : "CT"}. Salva apenas neste time.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="text-sm">
          Atual: <span className="font-medium">{selectedLabel}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <KnifeCombobox
            open={open}
            setOpen={setOpen}
            value={selected}
            setValue={setSelected}
            options={knifeOptions}
          />

          <Button
            variant="default"
            onClick={async () => {
              await onSave(selected)
            }}
          >
            Salvar para {team === TEAM.T ? "T" : "CT"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function KnifeCombobox({
  open,
  setOpen,
  value,
  setValue,
  options,
}: {
  open: boolean
  setOpen: (v: boolean) => void
  value: string
  setValue: (v: string) => void
  options: { label: string; value: string }[]
}) {
  const currentLabel = options.find((o) => o.value === value)?.label ?? "Selecionar knife"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" type="button">
          {currentLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Command>
          <CommandInput placeholder="Buscar..." />
          <CommandList>
            <CommandEmpty>Nenhum resultado.</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.value}
                  onSelect={() => {
                    setValue(o.value)
                    setOpen(false)
                  }}
                >
                  {o.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function GlovesCard({
  team,
  gloves,
  onSave,
  glovesSkins,
}: {
  team: Team
  gloves: number | null
  onSave: (weapon_defindex: number) => Promise<void>
  glovesSkins: Record<number, { paint_name: string; image_url: string }>
}) {
  const glovesOptions = useMemo(() => {
    return Object.entries(glovesSkins).map(([k, v]) => ({ weapon_defindex: Number(k), name: v.paint_name }))
  }, [glovesSkins])

  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(gloves?.toString() ?? "0")

  useEffect(() => {
    setSelected(gloves?.toString() ?? "0")
  }, [gloves])

  const selectedLabel = useMemo(() => {
    if (selected === "0" || !selected) return "Gloves | Default"
    const foundGlove = glovesOptions.find((g) => g.weapon_defindex === Number(selected))
    return foundGlove?.name ?? selected
  }, [selected, glovesOptions])

  const currentImage = useMemo(() => {
    const gloveData = glovesSkins[Number(selected)]
    return gloveData?.image_url ?? ""
  }, [selected, glovesSkins])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gloves</CardTitle>
        <CardDescription>
          Time atual: {team === TEAM.T ? "T" : "CT"}. Salva apenas neste time.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="h-32 w-full rounded-md border bg-secondary/40 flex items-center justify-center overflow-hidden">
          {currentImage && <img src={currentImage} alt={selectedLabel} className="h-full object-contain" />}
        </div>

        <div className="text-sm">
          Atual: <span className="font-medium">{selectedLabel}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" type="button">
                {selectedLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Command>
                <CommandInput placeholder="Buscar gloves..." />
                <CommandList>
                  <CommandEmpty>Nenhuma glove.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setSelected("0")
                        setOpen(false)
                      }}
                    >
                      Gloves | Default
                    </CommandItem>
                    {glovesOptions.map((g) => (
                      <CommandItem
                        key={g.weapon_defindex}
                        onSelect={() => {
                          setSelected(String(g.weapon_defindex))
                          setOpen(false)
                        }}
                      >
                        {g.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Button
            variant="default"
            onClick={async () => {
              await onSave(Number(selected))
            }}
          >
            Salvar para {team === TEAM.T ? "T" : "CT"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function WeaponCard({
  team,
  weapon_defindex,
  weapon_name,
  skins,
  selected,
  defaultImage,
  defaultName,
  onSave,
}: {
  team: Team
  weapon_defindex: number
  weapon_name: string
  skins: Record<number, { paint_name: string; image_url: string }>
  selected?: { weapon_paint_id: number; weapon_wear: number; weapon_seed: number }
  defaultImage: string
  defaultName: string
  onSave: (payload: { weapon_defindex: number; weapon_paint_id: number; weapon_wear: number; weapon_seed: number }) => Promise<void>
}) {
  const selectedPaintId = selected?.weapon_paint_id ?? 0

  const [open, setOpen] = useState(false)
  const [paintOpen, setPaintOpen] = useState(false)

  const [paintId, setPaintId] = useState<number>(selectedPaintId)
  const [wear, setWear] = useState<number>(selected?.weapon_wear ?? 0.15)
  const [seed, setSeed] = useState<number>(selected?.weapon_seed ?? 0)

  useEffect(() => {
    setPaintId(selectedPaintId)
    setWear(selected?.weapon_wear ?? 0.15)
    setSeed(selected?.weapon_seed ?? 0)
  }, [selectedPaintId, selected?.weapon_wear, selected?.weapon_seed])

  const skinOptions = useMemo(() => {
    return Object.entries(skins).map(([k, v]) => ({ paintId: Number(k), name: v.paint_name }))
  }, [skins])

  const currentSkin = skins[paintId]
  const currentImage = currentSkin?.image_url ?? defaultImage
  const currentName = currentSkin?.paint_name ?? defaultName
  const currentSkinName = currentSkin?.paint_name ?? "Selecionar skin"

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <CardTitle className="text-sm">{weapon_name}</CardTitle>
        <CardDescription className="text-xs">{currentName}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="h-28 w-full rounded-md border bg-secondary/40 flex items-center justify-center overflow-hidden">
          <img src={currentImage} alt={currentName} className="h-full object-contain" />
        </div>

        <Popover open={paintOpen} onOpenChange={setPaintOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className="w-full justify-start">
              {currentSkinName}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <Command>
              <CommandInput placeholder="Buscar skin..." />
              <CommandList>
                <CommandEmpty>Nenhuma skin.</CommandEmpty>
                <CommandGroup>
                  {skinOptions.map((o) => (
                    <CommandItem
                      key={o.paintId}
                      onSelect={() => {
                        setPaintId(o.paintId)
                        setPaintOpen(false)
                      }}
                    >
                      {o.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button type="button" className="w-full">Settings</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{skins[paintId]?.paint_name ?? "Settings"}</DialogTitle>
                <DialogDescription>
                  Time: {team === TEAM.T ? "T" : "CT"}. Salva em weapon_team={team}.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Wear presets</Label>
                  <div className="flex flex-wrap gap-2">
                    {WEAR_PRESETS.map((p) => (
                      <Button
                        key={p.label}
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setWear(p.value)}
                      >
                        {p.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Wear (0.00 - 1.00)</Label>
                  <Slider
                    value={[wear]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={(v) => setWear(Number(v[0].toFixed(2)))}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    max={1}
                    value={wear}
                    onChange={(e) => setWear(clamp(Number(e.target.value), 0, 1))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Seed (0 - 1000)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={1000}
                    value={seed}
                    onChange={(e) => setSeed(clamp(Number(e.target.value), 0, 1000))}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={async () => {
                    await onSave({
                      weapon_defindex,
                      weapon_paint_id: paintId,
                      weapon_wear: wear,
                      weapon_seed: seed,
                    })
                    setOpen(false)
                  }}
                >
                  Use
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
