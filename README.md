# weaponpaints-web (Next.js + Steam + MySQL)

Uma aplicação Next.js moderna que substitui o site PHP original do cs2-WeaponPaints, com autenticação Steam integrada via NextAuth.js e persistência de dados em MySQL. Agora com design dark gaming moderno!

## Visão Geral do Projeto

- **Framework**: Next.js 14+ (App Router)
- **Autenticação**: NextAuth.js v5 com autenticação Steam OpenID nativa
- **Banco de dados**: MySQL (schema compatível com versão PHP original)
- **UI**: Tailwind CSS + shadcn/ui
- **Design**: Dark gaming aesthetic com cores cyan/blue e slate
- **Deploy**: Vercel ready

## Regras de team (importante)

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
- **NEXTAUTH_SECRET** - Gere com: `openssl rand -base64 32` (ou https://generate-secret.vercel.app/32)
- **NEXTAUTH_URL** - `http://localhost:3000` (desenvolvimento)
- **STEAM_API_KEY** - Obtenha em https://steamcommunity.com/dev/apikey
- **Database** - Configure as variáveis de banco (DB_HOST, DB_USER, DB_PASS, DB_NAME)

### 4. Rode o servidor de desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## Autenticação Steam (OpenID)

O fluxo de autenticação funciona assim:

1. Usuário clica em "Entrar com Steam"
2. Redirecionado para `/api/steam-auth`
3. Redireciona para `https://steamcommunity.com/openid/login`
4. Steam redireciona de volta para `/api/steam-auth/callback`
5. Verificamos a resposta OpenID
6. Buscamos informações do jogador via Steam API
7. Criamos sessão JWT com o steamid
8. Redirecionado para `/loadout`

### Solução de Problemas - Erro "Configuration"

Se receber erro "Configuration" ao fazer login:

- [ ] Verifique se `NEXTAUTH_SECRET` está definido (não deve estar vazio)
- [ ] Verifique se `NEXTAUTH_URL` está correto (deve corresponder à URL atual, sem barra no final)
- [ ] Verifique se `STEAM_API_KEY` está válido (obtenha em https://steamcommunity.com/dev/apikey)
- [ ] Reinicie o servidor: `npm run dev`
- [ ] Limpe cache do navegador e cookies

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
NEXTAUTH_SECRET=<sua_string_secreta_gerada>
NEXTAUTH_URL=https://seu-dominio.vercel.app
STEAM_API_KEY=<sua_chave_steam>
DB_HOST=<seu_host_mysql>
DB_USER=<seu_usuario_mysql>
DB_PASS=<sua_senha_mysql>
DB_NAME=<seu_banco_dados>
```

### 4. Deploy
Clique em "Deploy" ou faça push para a branch principal para auto-deploy.

## Testando a Autenticação

1. Acesse a aplicação em `http://localhost:3000`
2. Clique em "Entrar com Steam"
3. Você será redirecionado para a página de autenticação da Steam
4. Após autenticar e autorizar, será redirecionado de volta com sua sessão ativa
5. Clique em "Ir para Loadout" para gerenciar suas skins

## Design e UI

- **Dark Mode**: Tema escuro otimizado para jogadores
- **Cores**: Cyan (#06f) e Blue (#2563eb) como cores primárias, Slate como neutro
- **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Gradientes**: Efeitos visuais sutis para profundidade
- **Backdrop Blur**: Cards com efeito glass-morphism moderno

## Observações Importantes

- O arquivo `data/skins_en.json` contém um conjunto reduzido de itens para demonstração
- Para produção, substitua pelo JSON completo de skins/knives do CS2
- O schema MySQL deve estar criado e compatível com a versão PHP original
- Todas as operações de loadout gravam apenas no time selecionado no dashboard
- A autenticação Steam usa sessão JWT segura com token criptografado
- Não é mais necessária a dependência `steam-next-auth` (removida por ser inválida)

## Status do Projeto

🎮 **Em Desenvolvimento** - Novo design dark gaming implementado, autenticação Steam corrigida, app pronto para testes em produção.
