# weaponpaints-web (Next.js + Steam + MySQL)

Uma aplicação Next.js moderna que substitui o site PHP original do cs2-WeaponPaints, com autenticação Steam integrada via NextAuth.js e persistência de dados em MySQL.

## Visão Geral do Projeto

- **Framework**: Next.js 14+ (App Router)
- **Autenticação**: NextAuth.js com provedor Steam
- **Banco de dados**: MySQL (schema compatível com versão PHP original)
- **UI**: Tailwind CSS + shadcn/ui
- **Deploy**: Vercel ready

## Regras de time (importante)

- `weapon_team = 2` significa **T** (Terrorists)
- `weapon_team = 3` significa **CT** (Counter-Terrorists)

O dashboard possui duas abas (T/CT). Qualquer alteração de skin/knife grava apenas no time selecionado.

## Estrutura do banco de dados

### wp_player_skins
- `UNIQUE(steamid, weapon_team, weapon_defindex)`
- Uma linha por arma e por time
- UPSERT usado no endpoint `/api/loadout/weapon`

### wp_player_knife
- `UNIQUE(steamid, weapon_team)`
- Uma linha por time
- UPSERT usado no endpoint `/api/loadout/knife`

## Setup Local (Desenvolvimento)

### 1. Clone o repositório
```bash
git clone https://github.com/antoniobt12062002/weaponpaints-web.git
cd weaponpaints-web
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

Preencha as variáveis obrigatórias:
- `NEXTAUTH_SECRET` - Gere com: `openssl rand -base64 32` (ou https://generate-secret.vercel.app/32)
- `NEXTAUTH_URL` - `http://localhost:3000` (desenvolvimento)
- `STEAM_API_KEY` - Obtenha em https://steamcommunity.com/dev/apikey
- `DATABASE_URL` - String de conexão MySQL

### 4. Rode o servidor de desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## Deploy na Vercel

### 1. Via v0 (Recomendado)
- Clique em **"Publish"** no canto superior direito
- Conecte sua conta do Vercel
- Importe o repositório GitHub

### 2. Via GitHub + Vercel Dashboard
1. Commit e push suas mudanças para o repositório
2. Vá para https://vercel.com
3. Clique em "New Project" e importe o repositório
4. Selecione Next.js como framework

### 3. Configure as variáveis de ambiente na Vercel

No dashboard do Vercel, em "Environment Variables", adicione:

```
NEXTAUTH_SECRET=<sua_string_secreta>
NEXTAUTH_URL=https://seu-dominio.vercel.app
STEAM_API_KEY=<sua_chave_steam>
STEAM_REALM=https://seu-dominio.vercel.app
STEAM_RETURN_URL=https://seu-dominio.vercel.app/api/auth/callback/steam
DATABASE_URL=<sua_string_conexao_mysql>
```

### 4. Deploy
Clique em "Deploy" ou faça push para a branch principal para auto-deploy.

## Testando a Autenticação

1. Acesse a aplicação
2. Clique em "Login with Steam"
3. Você será redirecionado para a página de autenticação da Steam
4. Após autenticar, será redirecionado de volta com sua sessão ativa

## Observações Importantes

- O arquivo `data/skins_en.json` contém um conjunto reduzido de itens para demonstração
- Para produção, substitua pelo JSON completo de skins/knives do CS2
- O schema MySQL deve estar criado e compatível com a versão PHP original
- Todas as operações de loadout gravam apenas no time selecionado no dashboard

## Status do Projeto

🔄 **Em Teste** - A aplicação está sendo testada e melhorada continuamente.
