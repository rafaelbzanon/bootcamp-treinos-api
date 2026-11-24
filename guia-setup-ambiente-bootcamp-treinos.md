# Guia de Instalação do Ambiente — Bootcamp Treinos API

> **Objetivo:** preparar, passo a passo, o ambiente de desenvolvimento da aplicação **Bootcamp Treinos API** — uma API de treinos construída com **Node.js, TypeScript, Fastify, Prisma e PostgreSQL (via Docker)**.
>
> **Material de referência:** os snapshots `bootcamp-treinos-aula-00`, `bootcamp-treinos-aula-01` e `bootcamp-treinos-aula-03` (código do mesmo projeto em fases diferentes), `workout-plan (1).json` (exemplo de payload de um plano de treino) e as aulas em vídeo (Aula 0 — Setup do Projeto, Aula 1 — Boas-Vindas, Aula 2 — Back-end com Node.js, Aula 3 — Front-end com React/Next.js/TypeScript).
>
> **Produto real (conforme o vídeo):** o sistema é o app **FIT.AI**, um gestor de treinos com "Coach AI" (personal trainer virtual). Os vídeos mostraram o processo completo: **Aula 0** monta o ambiente do back-end e compara frameworks (Express × Fastify × Nest — Fastify venceu); **Aula 1** apresenta o produto e o design (telas de referência no Figma); **Aula 2** constrói a API (é exatamente o código destes zips); **Aula 3** constrói o web app em **Next.js** (React + TypeScript) que consome a API.

---

## 1. Visão geral do ambiente

**Dois projetos compõem o sistema** (construídos nas aulas 2 e 3 do bootcamp):

| Projeto | O quê é | Tecnologias |
| --- | --- | --- |
| `bootcamp-treinos-api` | Back-end (API REST) — é o código dos zips | Node 24, TypeScript, Fastify 5, Prisma 7, PostgreSQL 16, better-auth, Zod 4, AI SDK |
| `bootcamp-treinos-frontend` | Web app (front-end) — construído na Aula 3 | Next.js 16 (App Router), React, TypeScript, Tailwind + shadcn/ui, better-auth client, Orval (client HTTP), TanStack Query/server actions, Vercel AI SDK |

> Este guia foca no **back-end** (único com arquivos fornecidos). A seção 10.1 resume o que a Aula 3 mostra do front.

Antes de instalar qualquer coisa, veja o mapa completo do que será usado:

| Camada | Ferramenta | Versão | Papel |
| --- | --- | --- | --- |
| Runtime | Node.js | 24.x | Executa os scripts e a API |
| Package manager | pnpm | 10.30.0 | Gerencia as dependências (via Corepack) |
| Linguagem | TypeScript | 5.9.3 | Tipagem estática e segurança |
| Lint / Format | ESLint + Prettier | 9.39.2 / 3.8.1 | Padronização e qualidade do código |
| Framework HTTP | Fastify | 5.7.4 | Servidor web e rotas da API |
| Validação | Zod | 4.3.6 | Validação de entrada/saída |
| ORM | Prisma | 7.4.0 | Acesso ao banco (client + adapter pg) |
| Banco | PostgreSQL | 16 (imagem `postgres:16-alpine`) | Persistência dos dados |
| Container | Docker | versão estável (Desktop) | Sobe o PostgreSQL localizado |
| Autenticação | better-auth | 1.4.18 | Login com e-mail/senha e sessões |
| Docs da API | Swagger + Scalar | via Fastify | `/swagger.json` e interface em `/docs` |
| Inspeção do banco | Prisma Studio | pacote do Prisma | GUI do banco em `http://localhost:51212` (usado na Aula 2) |
| Execução em dev | tsx | 4.21.0 | Hot-reload do servidor |
| IDE | VS Code (nas aulas, Cursor) | versão estável | Edição com extensões Prettier/ESLint |
| (uso nas aulas) | Claude Code + arquivos `tasks/*.md` | agente IA | Desenvolvimento assistido por IA (passos/specs em Markdown) |
| (uso nas aulas) | MCPs: Context7, Serena, Figma DevMode, Chrome DevTools | — | Contexto atualizado, edição econômica de tokens, leitura do design e validação da UI pela IA |
| (uso nas aulas) | Figma | — | Design de referência do produto (FIT.AI); DevMode/MCP para o agente |
| (front — Aula 3) | Next.js (App Router) | 16 | Web app React com Server Components |
| (front — Aula 3) | shadcn/ui + Tailwind | CLI 3.8.5 | Biblioteca de componentes e tema (cores do tema, sem hardcode) |
| (front — Aula 3) | Orval | 8.1.0 (dev) | Gera o cliente HTTP tipado a partir do `swagger.json` |
| (front — Aula 3) | TanStack Query | — | Cache/estado para chamadas client-side à API |
| (front — Aula 3) | nuqs | 2.8.8 | Estado na URL (ex.: abrir o chat com mensagem inicial) |
| (front — Aula 3) | Vercel AI SDK (`@ai-sdk/react`) | via `ai` | `useChat` + `DefaultChatTransport` para o chat `/ai` |
| (front — Aula 3) | streamdown | 2.2.0 | Renderização formatada das mensagens do chat |

**Total de dependências do `package.json` (referência: aula-03, a mais completa):**

Dependências de produção:

| Pacote | Versão |
| --- | --- |
| `fastify` | 5.7.4 |
| `fastify-type-provider-zod` | 6.1.0 |
| `@fastify/cors` | 11.2.0 |
| `@fastify/swagger` | 9.7.0 |
| `@scalar/fastify-api-reference` | 1.44.20 |
| `zod` | 4.3.6 |
| `@prisma/client` | 7.4.0 |
| `@prisma/adapter-pg` | 7.4.0 |
| `better-auth` | 1.4.18 |
| `dotenv` | 17.3.1 |
| `dayjs` | ^1.11.19 |
| `ai` | 6.0.100 |
| `@ai-sdk/openai` | 3.0.33 |
| `@ai-sdk/google` | 3.0.34 (aula-03) |
| `pino-pretty` | 13.1.3 (aula-03) |

Dependências de desenvolvimento:

| Pacote | Versão |
| --- | --- |
| `typescript` | 5.9.3 |
| `tsx` | 4.21.0 |
| `prisma` | 7.4.0 |
| `eslint` | 9.39.2 |
| `typescript-eslint` | ^8.56.0 |
| `@eslint/js` | ^10.0.1 |
| `eslint-config-prettier` | 10.1.8 |
| `eslint-plugin-simple-import-sort` | 12.1.1 |
| `prettier` | 3.8.1 |
| `globals` | ^17.3.0 |
| `@types/node` | 24 |

> **Regra de ouro:** o projeto exige **Node 24.x e pnpm 10.30.0** de forma obrigatória (configuração `engine-strict=true` no `.npmrc`). Sem eles, nem o `pnpm install` funciona.

---

## 2. Passo 1 — Instalar o Node.js 24.x

O projeto usa Node na versão **24.x** (arquivo `.nvmrc` com `v24` e `engines.node: "24.x"` no `package.json`).

### Opção A (recomendada): gerenciador de versões

1. Baixe o **nvm-windows** em https://github.com/coreybutler/nvm-windows/releases.
2. Instale o executável (`nvm-setup.exe`) seguindo o assistente.
3. Abra um **novo terminal** (PowerShell) e instale o Node 24:
   ```powershell
   nvm install 24
   nvm use 24
   ```
4. Confirme:
   ```powershell
   node -v
   # > v24.x.x
   ```

### Opção B: instalador direto

1. Baixe o pacote **Windows Installer (.msi)** da versão LTS em https://nodejs.org.
2. Instale com os padrões (o `npm` é instalado junto, mas não será usado).
3. Em um novo terminal, confirme:
   ```powershell
   node -v
   ```

> **Dica:** os arquivos do projeto já trazem o `.nvmrc` com `v24`. Com o nvm, basta `nvm use` dentro da pasta do projeto para ativar a versão certa.

---

## 3. Passo 2 — Habilitar o pnpm 10.30.0 via Corepack

O `pnpm` vem **embutido no Node.js** através do **Corepack**. Por padrão ele pode estar desabilitado.

1. Habilite o Corepack:
   ```powershell
   corepack enable
   ```

2. Ative a versão exata exigida pelo projeto (`packageManager: "pnpm@10.30.0"`):
   ```powershell
   corepack prepare pnpm@10.30.0 --activate
   ```

3. Confirme:
   ```powershell
   pnpm -v
   # > 10.30.0
   ```

> **Por que pnpm?** O projeto foi criado com pnpm (existe `pnpm-lock.yaml`). Use sempre `pnpm` — nunca `npm` — dentro do projeto, para respeitar o lockfile e o `engine-strict`.

---

## 4. Passo 3 — Instalar o Docker Desktop

O banco (PostgreSQL 16) roda em container via Docker, definido no arquivo `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: bootcamp-treinos-api-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: bootcamp-treinos-api
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

1. Baixe o Docker Desktop em https://www.docker.com/products/docker-desktop (Windows exige WSL2; o instalador oferece a configuração automaticamente).
2. Instale e **reinicie o computador** quando solicitado.
3. Abra o Docker Desktop e aguarde o daemon iniciar (ícone da baleia na bandeja).
4. Confirme no PowerShell:
   ```powershell
   docker --version
   docker compose version
   ```

> **Atenção:** a porta `5432` do PostgreSQL será usada pelo container. Se você já tiver um PostgreSQL local rodando nela, pare-o antes de subir o container (ou será exibido erro de porta em uso).

---

## 5. Passo 4 — Instalar o VS Code e as extensões

A IDE oficial do projeto inclui extensões de edição recomendadas:

1. Instale o **Visual Studio Code** em https://code.visualstudio.com.
2. Abra a pasta do projeto e instale as extensões:
   - **Prettier — Code formatter** (`esbenp.prettier-vscode`)
   - **ESLint** (`dbaeumer.vscode-eslint`)
3. O projeto já possui configuração de editor em `.vscode/settings.json`:
   ```json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": "always"
     }
   }
   ```
   Isso significa: **formatar ao salvar** com Prettier e **corrigir erros do ESLint ao salvar** automaticamente.

> **Dica:** com a configuração acima, você não precisa formatar código manualmente — ao salvar o arquivo, o VS Code aplica as regras do projeto.

---

## 6. Passo 5 — Preparar o projeto e instalar as dependências

Cada pasta `bootcamp-treinos-aula-NN` é um snapshot do projeto em determinada fase:

| Pasta | O que contém |
| --- | --- |
| `bootcamp-treinos-aula-00` | Base da API (rotas, use cases, docs) |
| `bootcamp-treinos-aula-01` | Idem + `.env.example` com variáveis de Google OAuth |
| `bootcamp-treinos-aula-03` | Versão mais completa: `Dockerfile`, migrations do Prisma, `env.ts` com validação de variáveis, `pino-pretty` e IA |

1. Extraia o conteúdo da pasta desejada (ex.: `bootcamp-treinos-aula-03`) para um local de trabalho.
2. No terminal, entre na pasta:
   ```powershell
   cd "caminho\para\bootcamp-treinos-aula-03"
   ```
3. Instale as dependências:
   ```powershell
   pnpm install
   ```
   > Durante a instalação, o Prisma também roda seu `postinstall` para gerar o client. Se algo falhar, rode manualmente: `pnpm exec prisma generate`.

---

## 7. Passo 6 — Configurar as variáveis de ambiente (.env)

O projeto não funciona sem o arquivo `.env` (ele está no `.gitignore` — nunca deve ser versionado).

1. Copie o modelo:
   ```powershell
   Copy-Item .env.example .env
   ```
2. Edite o `.env` e preencha os valores:

| Variável | Valor de exemplo | Observação |
| --- | --- | --- |
| `PORT` | `8080` | Porta do servidor (na aula-03; nas aulas 00/01 o padrão é `8081`) |
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/bootcamp-treinos-api` | Deve bater com o `docker-compose.yml` |
| `BETTER_AUTH_SECRET` | gere um valor aleatório (ver abaixo) | Segredo das sessões de autenticação |
| `API_BASE_URL` | `http://localhost:8080` | Usado no OpenAPI |
| `WEB_APP_BASE_URL` | `http://localhost:3000` | Origem liberada no CORS |
| `GOOGLE_CLIENT_ID` | vazio (ou seu valor) | OAuth Google (aula-03) |
| `GOOGLE_CLIENT_SECRET` | vazio (ou seu valor) | OAuth Google (aula-03) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | vazio (ou seu valor) | IA (aula-03) |
| `OPENAI_API_KEY` | vazio (ou seu valor) | IA opcional (aula-03) |

3. Para gerar o `BETTER_AUTH_SECRET`, rode no terminal (dentro do projeto):
   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copie a saída para a variável `BETTER_AUTH_SECRET`.

> **Importante:** a variável `DATABASE_URL` deve iniciar com `postgresql://` — o schema da aula-03 valida isso com Zod (`env.ts`) e o Prisma depende dela.

> **Login com Google (conforme a Aula 3):** no Console do Google Cloud, crie um projeto, configure a **tela de consentimento** (tipo **External**) e um **OAuth Client** do tipo *Web application* com:
> - **Authorized JavaScript origins:** `http://localhost:8080`
> - **Authorized redirect URIs:** `http://localhost:8080/api/auth/callback/google` (callback tratado pelo better-auth, no back-end)
>
> Copie o *client ID* e o *client secret* para `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` no `.env`. No back-end, habilite o provedor (`socialProviders.google` em `src/lib/auth.ts`) e, para sempre exibir a escolha de conta, use `prompt: "select_account"`. O redirecionamento de volta para o web app é controlado pelo próprio app (variável pública com a URL do front, ex.: `NEXT_PUBLIC_APP_URL`).

---

## 8. Passo 7 — Subir o banco de dados (PostgreSQL no Docker)

1. Com o Docker Desktop rodando, execute:
   ```powershell
   docker compose up -d
   ```
   (em versões antigas: `docker-compose up -d`)

2. Confirme que o container está de pé:
   ```powershell
   docker ps --filter "name=bootcamp-treinos-api-postgres"
   ```
   A saída deve mostrar o container `bootcamp-treinos-api-postgres` com status **Up** (porta `5432`).

> **Conveniência:** o volume `postgres_data` garante que os dados sobrevivam ao reinício do container (`docker compose down` não apaga; `docker compose down -v` apaga tudo).

---

## 9. Passo 8 — Criar as tabelas do banco (Prisma)

O Prisma usa o arquivo `prisma/schema.prisma` para definir os modelos (`User`, `WorkoutPlan`, `WorkoutDay`, `WorkoutExercise`, `WorkoutSession` etc.).

### Opção A — Projeto já tem migrations (aula-03)

Aplique a migration `20260304223538_init` já existente:

```powershell
pnpm exec prisma migrate deploy
```

### Opção B — Projeto sem migrations (aulas 00/01)

Crie a migration inicial a partir do schema:

```powershell
pnpm exec prisma migrate dev --name init
```

Esse comando também executa `prisma generate`, gerando o client em `src/generated/prisma` (pasta criada automaticamente e ignorada pelo Git).

> **Saiba:** o `prisma.config.ts` carrega o `.env` com `dotenv` e injeta o `DATABASE_URL` na configuração de todo `prisma` command. Por isso o `.env` **deve** existir antes deste passo.

> **`db push` × migrations (o que as aulas mostram):** durante a construção do projeto (Aula 2), o professor usa `prisma db push` (sincroniza o schema direto no banco, ideal para prototipagem) seguido de `prisma generate` e `prisma format`. No snapshot final (aula-03) existe a pasta `prisma/migrations/`, que é a forma versionada para trabalho em equipe/produção — use `migrate deploy` (aplicar) ou `migrate dev` (criar nova).

---

## 10. Passo 9 — Rodar a aplicação

1. Inicie o servidor de desenvolvimento (com hot-reload via `tsx --watch`):
   ```powershell
   pnpm dev
   ```

2. Teste os endpoints:
   | Recurso | URL | Observação |
   | --- | --- | --- |
   | Health check | `http://localhost:8080` (ou `:8081`) | Responde `{"message":"Hello World"}` |
   | Spec OpenAPI | `http://localhost:8080/swagger.json` | JSON gerado pelo Swagger |
   | Docs interativas | `http://localhost:8080/docs` | Interface Scalar UI |
   | Auth | `http://localhost:8080/api/auth/*` | Endpoints do better-auth |

> **Porta:** nas aulas 00/01 o código usa `Number(process.env.PORT) || 8081`; na aula-03 o `env.ts` define `PORT` default `8080`. Se o `.env` não define `PORT`, a aula-03 usa `8080` e as aulas 00/01 usam `8081` — ajuste a URL no navegador conforme o caso.

> **CORS:** o servidor libera requisições da origem `http://localhost:3000` (front-end web). Se você testar de outra origem, adicione-a ao `origin` do `@fastify/cors`.

### 10.1 Rodar o front-end (web app — construído na Aula 3)

O back-end em pé, o web app **FIT.AI** (projeto `bootcamp-treinos-frontend`, **Next.js 16 App Router**) pode ser desenvolvido. O que a Aula 3 mostra, na ordem:

1. **Criar o projeto:** `pnpm dlx create-next-app@16` (nome `bootcamp-treinos-frontend`; na fala, "sempre use a mesma versão mostrada na aula").
2. **Autenticação:** `pnpm add better-auth@1.4.18` e criar `app/_lib/auth-client.ts` (`createAuthClient` com `baseURL` da API; o underscore evita que a pasta vire rota). O login com Google usa `authClient.signIn.social({ provider: "google" })`.
3. **UI:** `pnpm dlx shadcn@3.8.5 init` e `pnpm dlx shadcn@3.8.5 add input button card badge avatar` (componentes em `components/ui`); o tema (cores claras/escuras, padrão "blue") é colado em `app/globals.css`. Regra das aulas: **nunca usar cor hardcoded** — sempre as variáveis do tema.
4. **Cliente da API gerado (Orval):** `pnpm add -D orval@8.1.0` + `pnpm add dotenv@17.3.1` + `pnpm add -D prettier@3.8.1`; criar `orval.config.ts` na raiz apontando para o `swagger.json` da API e gerar em `app/_lib/api/fetch-generated/index.ts` (client `fetch` do Next, com `mutator` em `app/_lib/api/fetch.ts` que aplica a URL da API e `credentials: "include"`). Rodar com `npx orval`.
   - Na API, as rotas têm `operationId` (ex.: `getHomeData`, `startWorkoutSession`) exatamente para nomear as funções geradas.
5. **Telas e componentes:** home (`app/page.tsx`, com `ConsistencyTracker` e `WorkoutDayCard`), dia de treino (`app/workout-plans/[id]/days/[id]/page.tsx`, com botões *Iniciar treino* / *Marcar como concluído* e `_actions.ts`), plano (`app/workout-plans/[id]/page.tsx`), estatísticas (heatmap de consistência), perfil (`app/profile/page.tsx`, com logout) e chat do Coach AI (`app/_components/chat.tsx`). Os componentes reutilizáveis ficam em `app/_components/` (ex.: `workout-day-card.tsx`, `bottom-nav.tsx`, `exercise-card.tsx`).
6. **Chat e IA:** no front, o chat usa o **Vercel AI SDK** (`useChat` + `DefaultChatTransport` apontando para `${process.env.NEXT_PUBLIC_API_URL}/ai`, `credentials: "include"`) — **não** usa Orval. Mensagens formatadas com `streamdown@2.2.0`; abertura do chat controlada por **URL state** com `nuqs@2.8.8` (ex.: `?chatOpen=true&message=...`).
7. **Interatividade × Server Components:** as ações (iniciar/concluir treino) são **server actions** que chamam a API e executam `revalidatePath` para atualizar a página; componentes interativos isolados como client components (a página inteira não vira client). Para chamadas client-side, o curso cita **TanStack Query**.
8. **Variáveis de ambiente do front:** `NEXT_PUBLIC_API_URL` (ex.: `http://localhost:8080`) e uma variável pública com a URL do próprio app (retorno do login). Em `next.config.ts`, as imagens remotas de capa (host do `coverImageUrl`) precisam ser liberadas em `images.remotePatterns`.
9. **Rodando:** dentro de `bootcamp-treinos-frontend`, `pnpm dev` (porta `3000`).

> **Fluxo de trabalho mostrado nas aulas:** cada funcionalidade é descrita em um arquivo `tasks/NN.md` (especificação, frequentemente com link do **Figma** e "seja 100% fiel") e implementada com um **agente de IA** (Claude Code; nas aulas, modelos Opus/Sonnet) usando as regras de `.claude/rules/` e os MCPs (Context7, Serena, Figma DevMode, Chrome DevTools). **Sempre que a API mudar, rode o Orval de novo** para atualizar os tipos no front.

---

## 11. Configurações principais e o que cada uma faz

| Arquivo | O que configura |
| --- | --- |
| `.nvmrc` | Versão do Node exigida (`v24`) |
| `.npmrc` | `engine-strict=true` — bloqueia `pnpm install` se a versão do Node/pnpm não bater com o `engines` |
| `package.json` | `engines.node: 24.x`, `packageManager: pnpm@10.30.0`, script `dev` |
| `tsconfig.json` | `target: es2024`, `module`/`moduleResolution: nodenext`, `strict: true`, saída em `dist/` |
| `prisma.config.ts` | Carrega `.env`, aponta `schema`, `migrations` e a url do datasource |
| `prisma/schema.prisma` | Modelos + `generator client` novo (`prisma-client`) com output em `src/generated/prisma` |
| `docker-compose.yml` | PostgreSQL 16-alpine na porta 5432 com volume persistente |
| `Dockerfile` (aula-03) | Imagem `node:24-slim` + Corepack + build em 3 estágios (deps → build → production) |
| `src/lib/db.ts` | Instancia o PrismaClient com `@prisma/adapter-pg` (driver pg) |
| `src/lib/auth.ts` | better-auth com `prismaAdapter` (PostgreSQL) e plugin OpenAPI |
| `src/lib/env.ts` (aula-03) | Validação Zod das variáveis de ambiente (falha rápida na inicialização) |
| `eslint.config.js` | ESLint 9 flat config + typescript-eslint + Prettier + ordenação de imports |
| `.vscode/settings.json` | Format on save (Prettier) e fix ESLint on save |
| `.gitignore` | Ignora `node_modules`, `.env` e `src/generated/prisma` |
| `tasks/NN.md` + `docs/API_PROMPT.md` | Especificações (Driven Specs) usadas com o agente de IA — método das Aulas 2/3 |
| `.claude/rules/*.md` | Regras da arquitetura (routes/use cases/erros), TypeScript e convenções para os agentes de IA |
| `orval.config.ts` (front) | Gera o cliente HTTP tipado do web app a partir do OpenAPI da API |

---

## 12. Fluxo de trabalho (resumo em uma tela)

```powershell
# 1. Banco (com Docker Desktop aberto)
docker compose up -d

# 2. Migrations / client Prisma
pnpm exec prisma migrate deploy   # ou: prisma migrate dev --name init

# 3. Servidor em desenvolvimento
pnpm dev

# 4. Front-end (projeto bootcamp-treinos-frontend, Next.js)
cd ../bootcamp-treinos-frontend
npx orval           # regerar o client tipado quando a API mudar
pnpm dev            # porta 3000 (NEXT_PUBLIC_API_URL=http://localhost:8080)

# 5. Qualidade (quando alterar código)
pnpm exec eslint .
pnpm exec prettier --write .
```

---

## 13. Problemas comuns e soluções

| Sintoma | Causa provável | Solução |
| --- | --- | --- |
| `ERR_PNPM_UNSUPPORTED_ENGINE` no `pnpm install` | Node ou pnpm fora do exigido | Confirme `node -v` (24.x) e `pnpm -v` (10.30.0); use `nvm use 24` |
| `Cannot find module 'dotenv/config'` | `postinstall` do Prisma falhou | `pnpm exec prisma generate` e reinicie o terminal |
| `hydrate_errors` / variável não definida no `.env` | `.env` ausente ou incompleto | Copie o `.env.example`, preencha `DATABASE_URL` e `BETTER_AUTH_SECRET` |
| `port 5432 is already allocated` na subida do Docker | Outro PostgreSQL local na porta 5432 | Pare o serviço local ou troque a porta mapeada |
| `EADDRINUSE: port 8080 (ou 8081)` no `pnpm dev` | Servidor anterior rodando | Encerre o processo anterior ou mude `PORT` no `.env` |
| `Engine non-strict` / pnpm ainda desativado | Corepack não habilitado | `corepack enable` e `corepack prepare pnpm@10.30.0 --activate` |
| Tabelas não encontradas ao chamar a API | Migration não aplicada | `pnpm exec prisma migrate deploy` (com o banco de pé) |
| Erro de **CORS** no navegador | Acesso por `127.0.0.1` em vez de `localhost` | Acesse sempre por `http://localhost:...` (as origens liberadas são `localhost`) |
| Tipos/funções do front desatualizados após mudar a API | Cliente do Orval não regenerado | Rode `npx orval` novamente no projeto do front |
| Imagem de capa não aparece no front | Host da imagem não liberado | Adicione o hostname em `images.remotePatterns` no `next.config.ts` |

---

## 14. Atividade prática sugerida (validação do ambiente)

1. Suba o banco (`docker compose up -d`) e a aplicação (`pnpm dev`).
2. No navegador, abra `http://localhost:8080/docs` e observe a lista de endpoints.
3. Crie um usuário via `POST /api/auth/sign-up/email` (endpoint do better-auth) e confirme a criação no banco com:
   ```powershell
   docker exec bootcamp-treinos-api-postgres psql -U postgres -d bootcamp-treinos-api -c "\dt"
   ```
4. Importe o `workout-plan (1).json` como referência para criar um plano via `POST /workout-plans` (com token de sessão no header).

Esse fluxo completo valida **runtime, package manager, banco, ORM, migrations, auth e docs** — exatamente o que o projeto exige.

---

## Nota prática ao docente

**Adaptação ao laboratório:** este guia é independente de aula — pode ser usado como roteiro de setup no início do semestre (temas de Aulas 04 e 09, que tratam de ecossistema JS/npm e de PostgreSQL/Docker). Em laboratório, distribua os snapshots mais completos (aula-03) para a turma e peça que comparem com `bootcamp-treinos-aula-00` para evidenciar a evolução do projeto. As aulas em vídeo permitem, como atividade, que os estudantes reproduzam o fluxo da Aula 2 (criar um novo endpoint a partir de `tasks/NN.md` com agente de IA) — a evolução express a "Driven Specs" do plano de ensino.

**Tempo estimado:** 60 a 90 minutos para a turma concluir todos os passos (20–30 min para Node/pnpm, 15–20 min para Docker, 15–20 min para `.env` + migrate + dev).

**Possíveis dificuldades:** o item `engine-strict` costuma gerar confusão quando o aluno tem outra versão do Node — explane a leitura do erro `ERR_PNPM_UNSUPPORTED_ENGINE`; o Docker Desktop pode exigir WSL2 e reinício; a geração do secret em PowerShell (`require('crypto')`) pode falhar se houver outra versão do Node ativa.

**Turmas heterogêneas:** disponibilize a **Opção A/B** para Node (quem não quiser nvm instala direto) e ofereça como **desafio avançado** a montagem do `Dockerfile` da aula-03 ou a explicação da validação Zod de `env.ts`; para quem tiver dificuldade, o par mínimo de sucesso é `pnpm install` + `docker compose up -d` + `pnpm dev` (banco fica opcional na primeira execução somente para o endpoint `GET /`).
