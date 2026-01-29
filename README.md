# weaponpaints-web (Next.js + Steam + MySQL)

Este projeto substitui o site PHP do cs2-WeaponPaints por uma aplicação Next.js (App Router), com UI moderna e salvamento no mesmo schema MySQL.

## Regras de time (importante)

- `weapon_team = 2` significa **T**
- `weapon_team = 3` significa **CT**

O dashboard tem duas abas (T/CT). Qualquer alteração de skin/knife grava apenas no time selecionado.

## Estrutura do banco (resumo)

### wp_player_skins
- UNIQUE(steamid, weapon_team, weapon_defindex)
- Uma linha por arma e por time.
- UPSERT usado no endpoint `/api/loadout/weapon`.

### wp_player_knife
- UNIQUE(steamid, weapon_team)
- Uma linha por time.
- UPSERT usado no endpoint `/api/loadout/knife`.

## Setup local

1) Instale dependências

```bash
npm install
```

2) Copie `.env.example` para `.env.local` e preencha

```bash
cp .env.example .env.local
```

3) Rode

```bash
npm run dev
```

## Deploy na Vercel

- Configure as mesmas variáveis de ambiente no projeto.
- Em produção:
  - `NEXTAUTH_URL=https://SEU_DOMINIO`
  - `STEAM_REALM=https://SEU_DOMINIO`
  - `STEAM_RETURN_URL=https://SEU_DOMINIO/api/auth/callback/steam`

## Observações

- O arquivo `data/skins_en.json` está com poucos itens para demonstrar a UI.
- Para produção, substitua pelo JSON completo gerado pelo plugin/site original.
