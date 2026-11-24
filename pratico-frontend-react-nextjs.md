# Roteiro Prático — Construindo o Front-End com React, Next.js e TypeScript (FIT.AI)

> **Componente:** Programação para Dispositivos Móveis (VER-PDM001) — Tecnologia em Análise e Desenvolvimento de Sistemas — IFRS Campus Veranópolis.
> **Docente:** Lucas Miguel Hallmann.
> **Stack trabalhada:** Node.js, TypeScript, React, Next.js, Tailwind CSS, shadcn/ui, better-auth, Orval, Vercel AI SDK.

---

## 1. Introdução

Este roteiro guia, passo a passo e sem pular etapas, a construção do **front-end web** da aplicação **FIT.AI** (sistema de treinos com personal trainer via IA), projeto `bootcamp-treinos-frontend`, que consome a API `bootcamp-treinos-api` (Node.js/Fastify) construída na etapa anterior.

Para acompanhar, siga os pré-requisitos da seção 3 e execute os passos na ordem. Os blocos `tasks/NN.md` contêm as especificações de cada tela: você pode entregá-los ao seu agente de IA (Claude Code ou similar) ou usá-los como roteiro para implementar manualmente.

---

## 2. O que será construído nesta aula

Este roteiro constrói, do zero, o **front-end web** (projeto `bootcamp-treinos-frontend`) de uma aplicação full stack de treinos, consumindo a API Node.js/Fastify construída na Aula 2 (`bootcamp-treinos-api`). Ao final, a aplicação terá:

- **Tela de login** com Google (`/auth`), fiel ao design do Figma;
- **Tela inicial** (`/`): barra de navegação inferior, treino do dia, sequência (streak) e consistência semanal (quadradinhos);
- **Tela do dia de treino** (`/workout-plans/[id]/days/[dayId]`): lista de exercícios, botões "Iniciar treino" e "Marcar como concluído";
- **Tela do plano de treino** (`/workout-plans/[id]`): os 7 dias do plano;
- **Tela de estatísticas** (`/stats`): heatmap de consistência dos últimos 3 meses (estilo GitHub) e métricas;
- **Tela de perfil** (`/profile`): dados do usuário e botão "Sair da conta";
- **Chatbot de IA** (widget global + página `/onboarding`): um "personal trainer virtual" que pergunta os dados do usuário, monta o plano de treino e salva tudo via API (rota `/ai` do backend);
- **Onboarding**: quem entra sem dados de treino/plano ativo é redirecionado ao chat para se cadastrar.

### 2.1 Contrato da API (backend da Aula 2 — referência obrigatória)

O front-end só funciona com a API rodando. Rotas (prefixos registrados em `src/index.ts`):

| Rota | operationId | Uso no front-end |
|---|---|---|
| `GET /home/:date` | `getHomeData` | Tela inicial (streak, consistência, treino do dia) e verificação de onboarding |
| `GET /me` | `getUserTrainData` | Verificar se o usuário já tem dados de treino |
| `PUT /me` | `upsertUserTrainData` | (usado pelas tools de IA, não pelo front diretamente) |
| `GET /stats?from=&to=` | `getStats` | Tela de estatísticas |
| `GET /workout-plans` | `listWorkoutPlans` | Listagem de planos |
| `POST /workout-plans` | `createWorkoutPlan` | (tool de IA) |
| `GET /workout-plans/:workoutPlanId` | `getWorkoutPlan` | Tela do plano de treino |
| `GET /workout-plans/:workoutPlanId/days/:workoutDayId` | `getWorkoutDay` | Tela do dia de treino |
| `POST /workout-plans/:workoutPlanId/days/:workoutDayId/sessions` | `startWorkoutSession` | Botão "Iniciar treino" |
| `PATCH /workout-plans/:workoutPlanId/days/:workoutDayId/sessions/:sessionId` | `updateWorkoutSession` | Botão "Marcar como concluído" |
| `POST /ai` | — (tags AI) | Chatbot (Vercel AI SDK, streaming) |
| `GET /swagger.json` / `GET /docs` | — | Documentação OpenAPI (usada pelo Orval) |
| `GET/POST /api/auth/*` | — | better-auth (sessão, login Google) |

Respostas principais (schemas Zod em `src/schemas/index.ts`):

- **HomeDataSchema:** `activeWorkoutPlanId?`, `todayWorkoutDay?` (com `workoutPlanId`, `id`, `name`, `isRest`, `weekDay`, `estimatedDurationInSeconds`, `coverImageUrl?`, `exercisesCount`), `workoutStreak`, `consistencyByDay` (objeto `data -> { workoutDayCompleted, workoutDayStarted }`).
- **StatsSchema:** `workoutStreak`, `consistencyByDay`, `completedWorkoutsCount`, `conclusionRate` (decimal de 0 a 1), `totalTimeInSeconds`.
- **GetWorkoutDaySchema:** `exercises[]` e `sessions[]` (com `startedAt?` e `completedAt?`).

> Todos os dados protegidos exigem **sessão válida do better-auth** (cookie). O CORS da API permite `http://localhost:3000` com `credentials: true`.

---

## 3. Pré-requisitos (o que deve existir ANTES de começar)

Requisitos vindos das Aulas 0–2 do bootcamp (equivalentes às aulas de setup e backend do plano de ensino):

1. **Node.js 24.x** (o backend exige via `engines`; versões próximas, como a v22 LTS, também funcionam) e **pnpm 10.x** (`pnpm@10.30.0`).
2. **PostgreSQL 16 via Docker** rodando (`docker-compose up -d` na pasta da API).
3. **API rodando na porta 8080**: `pnpm dev` dentro de `bootcamp-treinos-api`.
   - Obs.: o `CLAUDE.md` atual do repositório menciona a porta 8081, mas o `.env.example` do projeto define `PORT=8080`. Mantenha 8080 para acompanhar o roteiro.
4. **Migrations aplicadas** (`pnpm exec prisma migrate dev`) — tabelas User, WorkoutPlan, WorkoutDay, WorkoutExercise, WorkoutSession, Session, Account.
5. Verificação rápida: acessar `http://localhost:8080/docs` (documentação Scalar) e `http://localhost:8080/swagger.json` (spec OpenAPI — será usado pelo Orval).
6. **Editor**: usa-se o VS Code com o agente **Claude Code** (terminal). O roteiro indica o que o instrutor pede ao agente em cada tarefa (arquivos `tasks/NN.md`) — quem não usar IA pode implementar manualmente, pois todo o código resultante é explicado.
7. **Conta Google** para configurar o login (necessária no Passo 2).
8. **Design no Figma**: `https://www.figma.com/design/icflmwVThvfpiYYXFId8gG/FIT.AI` (mesmo link usado nos arquivos `tasks/*.md`).

---

## 4. Passo 1 — Criar o projeto Next.js

### 4.1 Comando de criação

Abra o terminal na pasta de projetos e rode (com npm troque `pnpm dlx` por `npx`):

```bash
pnpm dlx create-next-app@16
```

Responda às perguntas (aceite as recomendações padrão do Next.js 16):

- **Nome do projeto:** `bootcamp-treinos-frontend`
- **TypeScript:** Yes
- **ESLint:** Yes
- **Tailwind CSS:** Yes
- **src/ directory:** Yes (padrão do Next 16 é a pasta `app/`)
- **Turbopack:** Yes
- **Import alias:** padrão (`@/*`)

O projeto será criado com **Next.js 16.1.6** e Turbopack.

### 4.2 Estrutura inicial criada

```
bootcamp-treinos-frontend/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package.json
├── tsconfig.json
└── pnpm-lock.yaml
```

### 4.3 Abrir no editor e rodar

1. Abra o VS Code e adicione **as duas pastas ao mesmo workspace**: `File → Add Folder to Workspace` — adicione `bootcamp-treinos-api` e `bootcamp-treinos-frontend`. Isso permite ver e editar API e front no mesmo lugar (você vai alternar entre eles várias vezes).
2. Rode o servidor de desenvolvimento dentro do front:

```bash
pnpm run dev
```

3. Confira `http://localhost:3000` — deve mostrar a página padrão do Next ("Hello World" no layout default).

> **Por que `pnpm dlx` em vez de instalar globalmente?** O `dlx` baixa e executa o pacote uma única vez, sem poluir o ambiente global — mesma ideia do `npx`.

---

## 5. Passo 2 — Login com Google (parte 1: configurar o backend)

O front usa **better-auth** (mesma biblioteca do backend). Antes de codar a tela de login, é preciso configurar o provedor Google na API.

### 5.1 Criar credenciais no Google Cloud Console

1. Acesse `https://console.cloud.google.com`.
2. Crie um projeto novo: **New Project → "Bootcamp Treinos" → Create** (sem custo).
3. Menu **APIs & Services → Credentials → Configure Consent Screen**:
   - **Get Started** → nome da aplicação: `Bootcamp Treinos`; e-mail de suporte: o seu;
   - **Audience:** `External` (usuários fora da sua organização poderão logar);
   - Conclua com `Finish`/`Create`.
4. Em **Credentials → Create Credentials → OAuth Client ID**:
   - **Application type:** `Web Application`;
   - **Name:** `Bootcamp Treinos`;
   - **Authorized JavaScript origins:** `http://localhost:8080` (origem da API — é aqui que o cookie de sessão será emitido);
   - **Authorized redirect URIs:** `http://localhost:8080/api/auth/callback/google` — essa URL é copiada da documentação do better-auth (Docs → Authentication → Google). **Sempre HTTP local, nunca HTTPS, senão o callback falha.**
   - Clique em **Create**.
5. Copie o **Client ID** e o **Client Secret** gerados.

> **Dica do instrutor para estudantes:** o **Dev Mode do Figma é pago**, mas estudantes de graduação podem obter o **Figma Education Plan** gratuitamente (o acesso ao Dev Mode está incluído). Se não conseguir, é possível fazer a interface "na mão" — o roteiro explica os dois caminhos.

### 5.2 Variáveis de ambiente do backend

No projeto da API, crie/atualize o `.env` (crie também um `.env.example` documentando todas as variáveis):

```env
PORT=8080
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:8080"
GOOGLE_CLIENT_ID="SEU_CLIENT_ID"
GOOGLE_CLIENT_SECRET="SEU_CLIENT_SECRET"
WEB_APP_BASE_URL="http://localhost:3000"
```

### 5.3 Configurar o provedor no better-auth

Em `src/lib/auth.ts`, **remova** o provedor `emailAndPassword` e adicione o `socialProviders.google` (copiado da documentação do better-auth), usando as variáveis de ambiente:

```ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI } from "better-auth/plugins";

import { prisma } from "./db.js";
import { env } from "./env.js";

export const auth = betterAuth({
  baseURL: env.API_BASE_URL, // http://localhost:8080
  trustedOrigins: [env.WEB_APP_BASE_URL], // http://localhost:3000
  socialProviders: {
    google: {
      prompt: "select_account", // sempre pergunta qual conta usar
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [openAPI()],
});
```

- `baseURL`: URL da própria API (origem do cookie).
- `trustedOrigins`: origem do front-end (3000), que precisa ser confiável para receber o cookie de sessão.
- `prompt: "select_account"`: garante que o Google sempre mostre o seletor de contas (sem isso, o Google loga automaticamente quando só existe uma conta).

> Código final conferido com o arquivo real `bootcamp-treinos-aula-03/src/lib/auth.ts` (já contém o Google).

### 5.4 Commit no backend

```bash
git add .
git commit -m "feat: add signing with Google"
```

> O projeto usa **Conventional Commits** (regra das Aulas 0–2): `feat:`, `fix:`, `chore:` etc. Em aula, vale reforçar essa prática com os estudantes.

---

## 6. Passo 3 — Preparar o front-end para o better-auth

### 6.1 Instalar o cliente better-auth

Dentro de `bootcamp-treinos-frontend`:

```bash
pnpm add better-auth@1.4.18
```

### 6.2 Variáveis de ambiente do front

Crie o `.env.example` e o `.env` na raiz do front:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

- `NEXT_PUBLIC_API_URL`: endereço da API (usado pelo cliente better-auth e pelo chat de IA).
- `NEXT_PUBLIC_BASE_URL`: endereço do próprio front — usado como `callbackURL` (para onde o usuário volta depois de logar).
- **Regra importante:** variáveis com prefixo `NEXT_PUBLIC_` são embutidas no bundle e ficam visíveis no navegador. **Nunca** coloque segredos (chaves de API, client secret) com esse prefixo. Essas duas são inofensivas (URLs locais).

### 6.3 Criar o cliente de autenticação

Crie `app/_lib/auth-client.ts`:

```ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});
```

**Por que a pasta `_lib` (com underscore)?** No Next.js App Router, toda pasta dentro de `app/` pode virar uma rota. O underscore sinaliza que aquela pasta é interna (não é rota) — convenção adotada no projeto (`app/_lib/auth-client.ts`).

### 6.4 Como o login será disparado (visão geral)

Dentro do componente de login, o clique no botão chama:

```ts
await authClient.signIn.social({
  provider: "google",
  callbackURL: process.env.NEXT_PUBLIC_BASE_URL,
});
```

Isso fala com a API (8080), que redireciona ao Google; após autorizar, o usuário volta pelo `callbackURL` já com a sessão (cookie) criada.

---

## 7. Passo 4 — Regras do agente de IA (`.claude/rules/`)

Antes de gerar telas com IA, defina **regras do projeto** — é o que garante que o código gerado siga os padrões da disciplina (padrão "Driven Specs" do plano de ensino). Crie a pasta `.claude/rules/` no front com os arquivos abaixo (conteúdo baseado nas regras do backend e nas convenções do projeto):

### 7.1 `general.md`

```md
## Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS + shadcn/ui para componentes
- better-auth para autenticação
- Orval para gerar clientes de API tipados
- Vercel AI SDK para o chatbot
- dayjs para datas
- pnpm como package manager

## Comandos
- pnpm run dev — servidor de desenvolvimento
- npx orval — regenerar funções de API após mudanças no backend

## MCPs
- SEMPRE use Context7 para buscar documentações atualizadas
- SEMPRE use o Figma MCP para consultar estilos das telas
- Use o Chrome DevTools MCP para validar a interface, quando disponível
```

### 7.2 `typescript.md`

```md
- Escreva código limpo, conciso e fácil de manter, seguindo princípios do SOLID e clean code.
- Use nomes de variáveis descritivos (ex.: isLoading, hasError).
- Use kebab-case para nomes de pastas e arquivos.
- Sempre use TypeScript. Nunca use any.
- DRY (Don't Repeat Yourself). Evite duplicidade; crie funções/componentes reutilizáveis.
- NUNCA escreva comentários no código.
- SEMPRE rode pnpm run dev para verificar se as mudanças estão funcionais.
- SEMPRE use a biblioteca dayjs para manipulação e formatação de datas.
```

### 7.3 `react.md`

```md
- Estilização: NUNCA use cores hard-coded (ex.: bg-[#000000]). SEMPRE use as variáveis de cor do tema em globals.css (bg-background, text-foreground, bg-primary etc.).
- SEMPRE use componentes do shadcn/ui quando disponíveis (Button, Input, Card, Badge, Avatar...). Antes de criar um componente novo, verifique se o shadcn já tem um.
- NUNCA crie mais de um componente no mesmo arquivo.
- NUNCA verifique autenticação no middleware do Next.js. Faça a verificação na própria página (server component).
- A página não deve ser client component; transforme em client component apenas os componentes que realmente precisam de interatividade.
```

### 7.4 `api.md`

```md
- SEMPRE chame as rotas da API por meio das funções geradas pelo Orval em app/_lib/api/fetch-generated/index.ts.
- SEMPRE use o mutator customFetch de app/_lib/api/fetch.ts (envia cookies de sessão).
- Quando a API mudar, SEMPRE rode npx orval para regenerar os tipos.
- Sempre use Context7 para consultar a documentação das bibliotecas antes de usá-las.
```

> **Rotina de trabalho:** o instrutor repete várias vezes que "não se usa IA sem regras". Conforme aparecem problemas, ele **manda o agente adicionar a correção às regras** (ex.: "não use cores hard-coded", "um componente por arquivo", "não verifique autenticação no middleware"). Cada aula de laboratório deve reforçar essa rotina com os estudantes.

---

## 8. Passo 5 — Instalar shadcn/ui e configurar o tema

O shadcn/ui é a biblioteca de componentes (baseada em Tailwind) usada no projeto. No terminal do front:

```bash
pnpm dlx shadcn@3.8.5 init
```

- Aceite as perguntas padrão. Ele configura Tailwind, cria `components.json`, atualiza `app/globals.css` (com variáveis de cor: `--background`, `--foreground`, `--primary`, `--ring` etc. — o "tema") e adiciona utilitários como `cn()` em `lib/utils.ts`.

### 5.1 Tema com as cores do projeto (azul)

Em `ui.shadcn.com/themes`, selecione a cor **Blue**, clique em **Copy code** e substitua os blocos `:root` e `.dark` do `globals.css` pelos valores copiados. Isso padroniza todas as cores do app (e prepara dark mode, se quiser).

### 5.2 Instalar os componentes usados na aula

```bash
pnpm dlx shadcn@3.8.5 add input button card badge avatar
```

Ele cria os componentes em `components/ui/` (editáveis, prontos para personalizar). Durante a aula também se usa o **Form** (com React Hook Form) — instale junto para o passo do chat:

```bash
pnpm dlx shadcn@3.8.5 add form
```

### 5.3 Commit

```bash
git add .
git commit -m "chore: add shadcn/ui setup"
```

---

## 9. Passo 6 — Metodologia de tarefas e o Figma MCP

O trabalho é organizado em **arquivos de tarefa** (`tasks/NN.md`), cada um descrevendo uma tela com requisitos técnicos — é a materialização das "especificações" (Driven Specs). Para cada tarefa:

1. Abre o design no **Figma** (arquivo FIT.AI);
2. Seleciona a tela desejada e usa **botão direito → Copy link to selection**;
3. Escreve a tarefa no formato abaixo e pede ao agente: `Execute tasks/NN.md`.

Modelo de tarefa (mesmo formato usado nos arquivos `tasks/*.md` do projeto):

```md
# Tarefa
Crie a tela de login e integre ela com a API.

# Requisitos Técnicos
- Seja 100% FIEL ao Figma em https://www.figma.com/design/.../?node-id=...
- Ao clicar em "Fazer login com Google", chame o authClient (app/_lib/auth-client.ts).
- Ao acessar a página inicial, caso o usuário não esteja autenticado, redirecione-o para /auth.
```

### 6.1 Figma MCP (como o agente "enxerga" o design)

- Procure "**Figma MCP**" no Google (primeiro link: figma.com → contexto MCP). Há duas opções: **remoto** (via API key) ou **local** (via app do Figma instalado na máquina — mais rápido; exige Dev Mode).
- Com o MCP conectado ao Claude Code, o agente acessa o link da seleção, baixa as imagens e lê os estilos da tela no **Dev Mode**, reproduzindo o design com fidelidade.
- **Sem Dev Mode:** o roteiro continua válido — basta descrever a tela no texto da tarefa (e, se preciso, enviar um print do Figma ao agente).

### 6.2 Context7 MCP

Instale também o **Context7** (`context7.com`) — MCP que fornece à IA documentação atualizada das bibliotecas (Next, better-auth, AI SDK...), reduzindo alucinações e consumo de tokens. Regra: usá-lo sempre que disponível.

### 6.3 `claude mcp` / `.mcp.json`

No terminal (exemplos vistos na aula):

```bash
claude mcp add figma -- npx @figma/context-mcp --figma-api-key <KEY>   # remoto
# ou a variante local indicada na página do Figma MCP

claude mcp add context7 -- npx @upstash/context7-mcp
```

Verifique com `claude mcp list`. O arquivo `.mcp.json` centraliza os servidores MCP do projeto.

> **Alternativa para a disciplina:** estudantes sem plano pago do Figma podem descrever as telas por escrito (ou com capturas de tela) — o agente de IA funciona do mesmo jeito. O importante é manter o padrão `tasks/NN.md`.

---

## 10. Passo 7 — Tela de Login (`/auth`)

### 10.1 Criar a rota

Crie a página `app/auth/page.tsx` (no App Router, a pasta vira a rota `/auth`). Versão inicial, apenas para testar a rota:

```tsx
export default function AuthPage() {
  return <p>auth</p>;
}
```

Confirme em `http://localhost:3000/auth`.

### 10.2 Escrever a tarefa (tasks/01.md)

```md
# Tarefa
Crie a tela de login e integre ela com a API.

# Requisitos Técnicos
- Seja 100% FIEL ao Figma em <link da seleção da tela de login>.
- Ao clicar em "Fazer login com Google", chame o authClient (app/_lib/auth-client.ts).
- Ao acessar a página inicial, caso o usuário não esteja autenticado, redirecione-o para /auth.
```

No Claude Code (ou outro agente): `Execute tasks/01.md`. O agente baixa as imagens do Figma para `public/` (ex.: logo e imagem de fundo `login-bg`), consulta os estilos no Dev Mode e gera a página.

### 10.3 O que o agente deve produzir

- `app/auth/page.tsx`: layout dividido — à esquerda imagem/ilustração com o slogan ("O app que vai transformar a forma como você treina" — texto exibido na tela do navegador) e à direita o botão **"Fazer login com Google"**;
- Imagens em `public/` (servidas e otimizadas com cache pelo Next);
- Botão usando o componente `Button` do shadcn e cores do tema (`globals.css`) — nada de cores hard-coded;
- Login: `authClient.signIn.social({ provider: "google", callbackURL: NEXT_PUBLIC_BASE_URL })`.

### 10.4 Correções feitas pelo instrutor ao revisar o código gerado

1. **Nada de verificação de auth no middleware:** o agente criou `middleware.ts` validando o cookie do better-auth. O instrutor removeu e pediu a verificação **na própria página** (regra nova em `react.md`): o middleware deve ser reservado para checagens muito rápidas; a validação real (sessão no banco) é feita no server component.
2. **Imagem deslocada:** ajustou a imagem de fundo com `object-cover`/`object-center`.
3. **`callbackURL`:** depois do login o usuário caía numa página "hello world" — faltava definir `NEXT_PUBLIC_BASE_URL` e passá-lo como `callbackURL` (passo 6.2). Após limpar os cookies e relogar, o fluxo funcionou.

### 10.5 Teste completo do login

1. Limpe os cookies (`DevTools → Application → Cookies`).
2. Acesse `http://localhost:3000/auth` e clique em **Fazer login com Google**.
3. O Google mostra o seletor de conta (graças ao `prompt: "select_account"`).
4. Após autorizar, você volta ao front autenticado (cookie `better-auth.session_token`).
5. Commits:

```bash
# front
git commit -m "feat: add signing with better auth"
# api
git commit -m "feat: ensure Google sign in always prompts for account selection"
```

---

## 11. Passo 8 — Integração tipada com a API: Orval

Em vez de escrever `fetch` manualmente, o front gera **funções tipadas** a partir da documentação OpenAPI da API. Ferramenta: **Orval**.

### 11.1 Preparar o backend: operationId

No backend, adicione `operationId` em cada rota (é o nome que o Orval dará à função gerada). Exemplos:

| Rota | operationId |
|---|---|
| `GET /home/:date` | `getHomeData` |
| `GET /workout-plans` | `listWorkoutPlans` |
| `POST /workout-plans` | `createWorkoutPlan` |
| `GET /workout-plans/:workoutPlanId` | `getWorkoutPlan` |
| `GET /workout-plans/:workoutPlanId/days/:workoutDayId` | `getWorkoutDay` |
| `POST .../sessions` | `startWorkoutSession` |
| `PATCH .../sessions/:sessionId` | `updateWorkoutSession` |
| `GET /stats` | `getStats` |
| `GET /me` | `getUserTrainData` |
| `PUT /me` | `upsertUserTrainData` |

(Confira em `src/routes/*.ts` do projeto — os operationIds já estão lá.)

**Correção importante:** as rotas do better-auth (`/api/auth/*`) e `/swagger.json` precisam de `schema: { hide: true }`, para não poluir a documentação usada pelo Orval.

### 11.2 Instalar Orval e dotenv no front

```bash
pnpm add -D orval@8.1.0
pnpm add dotenv@17.3.1
```

### 11.3 Criar `orval.config.ts` na raiz do front

Código de configuração:

```ts
import "dotenv/config";
import { defineConfig } from "orval/config";

export default defineConfig({
  rc: {
    input: `${process.env.NEXT_PUBLIC_API_URL}/swagger.json`,
  },
  fetch: {
    output: {
      target: "./app/_lib/api/fetch-generated/index.ts",
      client: "fetch",
      prettier: true,
      override: {
        mutator: {
          path: "./app/_lib/api/fetch.ts",
          name: "customFetch",
        },
      },
    },
  },
});
```

- `input`: a spec OpenAPI da API (`http://localhost:8080/swagger.json`).
- `target`: arquivo que o Orval vai gerar, dentro de `app/_lib/api/`.
- `client: "fetch"`: gera funções baseadas no `fetch` do Next.js (com cache e revalidação próprios).
- `mutator`: injeta um `customFetch` (criado no próximo passo) em todas as funções.

### 11.4 Criar o `customFetch` — `app/_lib/api/fetch.ts`

```ts
export const customFetch: typeof fetch = async (input, init) => {
  const url = new URL(input as string, process.env.NEXT_PUBLIC_API_URL);
  return fetch(url, {
    ...init,
    credentials: "include",
  });
};
```

**Por quê?** A autenticação do better-auth é baseada em **sessão salva em cookie**. O `credentials: "include"` faz o navegador enviar esse cookie para a API em toda chamada. Sem ele, todas as rotas protegidas respondem 401.

### 11.5 Gerar as funções

```bash
npx orval
```

Erros comuns (e a solução):
- **Caminho errado no `target`** (ex.: `app/lib` em vez de `app/_lib`) → corrija a linha indicada e rode de novo;
- **Prettier ausente** (pois `prettier: true`): `pnpm add -D prettier@3.8.1`;
- **Rota de auth aparecendo na spec** → aplique o `schema: { hide: true }` do item 11.1 e regenere.

Resultado: `app/_lib/api/fetch-generated/index.ts` com funções tipadas (`getHomeData`, `getStats`, `startWorkoutSession`...), incluindo as interfaces exatas dos parâmetros e respostas.

### 11.6 Testar a integração na página inicial

Transforme a home em **server component assíncrono** que valida a sessão e chama a API:

```tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import dayjs from "dayjs";

import { authClient } from "./_lib/auth-client";
import { getHomeData } from "./_lib/api/fetch-generated";

export default async function HomePage() {
  const session = await authClient.getSession({
    fetchOptions: { headers: await headers() },
  });

  if (!session?.data?.user) {
    redirect("/auth");
  }

  const homeData = await getHomeData(dayjs().format("YYYY-MM-DD"), {
    fetchOptions: { headers: await headers() },
  });

  if (homeData.status === 200) {
    console.log(homeData.data); // no terminal (server component)
  }

  return <p>hello world</p>;
}
```

Detalhes importantes:

- `await headers()` passa os headers da requisição do Next para a chamada ao `authClient` e à API — necessário dentro de server components (os cookies vêm nesses headers).
- `dayjs().format("YYYY-MM-DD")` envia a data de hoje (formato esperado pelo `z.iso.date()`).
- `console.log` de server component aparece **no terminal**, não no navegador.
- Instale o dayjs (regra do projeto): `pnpm add dayjs@1.11.19`.

### 11.7 Ajuste no backend descoberto no teste

Ao chamar `getHomeData` sem plano de treino ativo, a API devolvia 404 ("active workout plan not found"). Para a home funcionar mesmo assim, o instrutor altera o backend:

- No use case `GetHomeData`, deixa de lançar erro quando não há treino hoje e passa a retornar `undefined`;
- No schema da rota (`src/routes/home.ts`), `todayWorkoutDay` vira **opcional** (`.optional()`);
- Regenera o front com `npx orval` e corrige os erros de TypeScript na página (o tipo agora pode ser `undefined`).

> **Regra de ouro:** "Sempre que você mudar a API, rode `npx orval` novamente no front." A cada mudança de contrato, os tipos ficam desatualizados e o compilador acusa — é o fluxo full stack: API ↔ geração ↔ página.

Commits:

```bash
# api
git commit -m "feat: ensure today workout day is optional on home route"
# front
git commit -m "feat: add home page and orval setup"
```

---

## 12. Passo 9 — Tela Inicial (`/`)

### 12.1 Tarefa 02 (`tasks/02.md`) — requisitos

```md
# Tarefa
Crie a tela que está em <link Figma — seleção da home>. Seja 100% FIEL AO FIGMA.

# Requisitos Técnicos
- Crie a barra de navegação (bottom nav) <link Figma>. Os demais botões, com exceção da home, não farão nada por enquanto.
- Crie a tela em app/page.tsx.
- Essa tela deve ser um server component (não há interatividade: cliques apenas levam a outras telas).
- Recupere os dados por meio da função getHomeData (app/_lib/api/fetch-generated/index.ts).
- Crie um componente que renderize o dia de treino (workout-day-card) para reutilizá-lo em outros lugares.
- Os quadradinhos com os dias da semana ficam totalmente azuis caso o usuário já tenha completado um treino naquele dia; meio azuis caso apenas tenha iniciado; totalmente brancos caso não tenha iniciado nem completado. Para obter essas informações, chame getHomeData e veja o objeto consistencyByDay.
- Os botões "Ver treinos" e "Ver histórico" não devem fazer nada por enquanto.
- Ao clicar no treino de hoje, não faça nada por enquanto.
```

> Os requisitos também podem ser ditados por voz (use qualquer ferramenta de ditado que transcreva texto). Isso vira um ótimo exercício de escrita de especificações.

### 12.2 Resultado gerado

- `app/_components/bottom-nav.tsx`: navegação inferior (Home, calendário, Sparkles, perfil) — server component; o botão de calendário consulta `getHomeData` para saber o plano ativo (ver Passo 14);
- `app/_components/workout-day-card.tsx`: card do treino do dia (nome, duração, exercícios, imagem de capa);
- `app/_components/consistency-tracker.tsx`: semana com quadradinhos coloridos conforme `consistencyByDay`;
- `app/page.tsx`: monta home + header "Olá, {nome}" (nome vem da sessão) + streak.

### 12.3 Problemas e correções no caminho (importantes para a aula)

1. **Erro de lint por tipo opcional:** após regenerar o Orval, `todayWorkoutDay` pode ser `undefined` — o instrutor pediu ao agente: *"Corrige os erros de TypeScript: todayWorkoutDay pode ser undefined em page.tsx"*.
2. **Cores hard-coded:** o agente usou `text-white/70` etc. → comando: *"Não use cores hard-coded. Sempre use as cores que estão em globals.css. Adicione isso nas regras."*
3. **Múltiplos componentes em um arquivo:** o agente criou vários componentes dentro de `page.tsx` → *"Nunca crie mais de um componente no mesmo arquivo. Adicione às regras em react.md."*
4. **Quadradinhos não pintavam:** a página comparava a data no formato errado com o `consistencyByDay`. Solução: passar o retorno real da API ao agente (*"A API retornou isso... o quadrado de sábado não foi meio pintado"*). Depois de informar o formato exato das chaves (data ISO), funcionou. **Lição: o agente só acerta aquilo que você explica.**
5. **Imagens do `ufs.sh` não carregavam:** as capas vêm do UploadThing (`*.ufs.sh`). O Next bloqueia domínios remotos no `<Image>` por padrão. Correção em `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.ufs.sh" },
    ],
  },
};

export default nextConfig;
```

6. **Dados de teste:** para ver a home com conteúdo, o instrutor usou o **Prisma Studio** (`pnpm exec prisma studio`) para inspecionar/editar `WorkoutSession` (ex.: colocar `startedAt`/`completedAt` no dia de sábado) e depois chamou `startWorkoutSession` pela própria documentação (`/docs`) com o body de exemplo `workout-plan (1).json` (disponível em `material-fonte/`).

### 12.4 Validação visual

- Home com streak, quadradinho azul-escuro (treino concluído) e azul-claro (iniciado);
- "Hoje é dia de descanso" quando `isRest: true` (dados de teste).

Commit: `git commit -m "feat: add home page and orval setup"` (ou "feat: add home screen").

---

## 13. Passo 10 — Tela do Dia de Treino (`/workout-plans/[id]/days/[dayId]`)

### 13.1 Tarefa 03 (`tasks/03.md`) — requisitos

```md
# Tarefa
Crie a tela que está em <link Figma — treino do dia>. Seja 100% FIEL AO FIGMA.

# Requisitos Técnicos
- Crie a tela em app/workout-plans/[id]/days/[dayId]/page.tsx (rota dinâmica).
- O usuário deve ser redirecionado para ela ao clicar no componente WorkoutDayCard.
- Recupere os dados necessários com a função getWorkoutDay (app/_lib/api/fetch-generated/index.ts).
- Caso o usuário já tenha alguma sessão de treino para o dia (veja o objeto sessions retornado pela API), exiba o botão "Marcar como concluído" <link Figma do botão>.
- Caso ele não tenha uma sessão iniciada, exiba o botão "Iniciar treino" <link Figma>. Esse botão deve chamar a função startWorkoutSession.
- Após chamar startWorkoutSession, chame revalidatePath do Next para recarregar a página.
- Caso o dia tenha uma sessão concluída, exiba um botão ghost no lugar de iniciar treino, com o texto "Concluído".
- Ao clicar no botão de interrogação (?) nos exercícios do dia, não faça nada por enquanto.
- O botão de voltar na top bar deve voltar para a página anterior.
- O botão com ícone de calendário na bottom nav deve estar ativo nessa página e, ao clicá-lo, devemos ir para a página do plano de treino (busque o plano ativo chamando getHomeData na bottom nav também).
- A página NÃO deve ser um client component. Transforme em client component apenas os componentes necessários dentro dela.
```

> **Nota técnica:** a rota não pode ter dois parâmetros com o mesmo nome — por isso o caminho final usa `[id]/days/[dayId]` (nomes distintos).

### 13.2 Código resultante

Estrutura:

```
app/workout-plans/[id]/days/[dayId]/
├── _actions.ts                    # server actions (start / complete)
├── _components/
│   ├── back-button.tsx
│   ├── complete-workout-button.tsx
│   ├── start-workout-button.tsx
│   └── exercise-card.tsx          # criado depois, no passo do chat
└── page.tsx
```

`page.tsx` (server component):

```tsx
import { getWorkoutDay } from "@/app/_lib/api/fetch-generated";

interface Props {
  params: Promise<{ id: string; dayId: string }>;
}

export default async function WorkoutDayPage({ params }: Props) {
  const { id: workoutPlanId, dayId } = await params;

  const workoutDayData = await getWorkoutDay(workoutPlanId, dayId);

  if (workoutDayData.status !== 200) {
    return null; // ou redirect
  }

  const {
    name,
    weekDay,
    estimatedDurationInSeconds,
    exercises,
    sessions,
    coverImageUrl,
  } = workoutDayData.data;

  const durationInMinutes = Math.round(estimatedDurationInSeconds / 60);
  const inProgressSession = sessions.find((s) => s.startedAt && !s.completedAt);
  const completedSession = sessions.find((s) => s.completedAt);
  const hasInProgressSession = !!inProgressSession;
  const hasCompletedSession = !!completedSession;

  // ... renderiza top bar, cover, lista de ExerciseCard,
  //     e o botão adequado (iniciar/concluir) conforme o estado
}
```

Padrão dos botões (client components) com **server actions** — a ação roda no servidor, chama a API e revalida a página:

```tsx
// _actions.ts
"use server";

import { revalidatePath } from "next/cache";
import {
  startWorkoutSession,
  updateWorkoutSession,
} from "@/app/_lib/api/fetch-generated";

export async function startWorkoutAction(workoutPlanId: string, workoutDayId: string) {
  await startWorkoutSession(workoutPlanId, workoutDayId);
  revalidatePath(`/workout-plans/${workoutPlanId}/days/${workoutDayId}`);
}

export async function completeWorkoutAction(
  workoutPlanId: string,
  workoutDayId: string,
  sessionId: string,
) {
  await updateWorkoutSession(workoutPlanId, workoutDayId, sessionId, {
    completedAt: new Date().toISOString(),
  });
  revalidatePath(`/workout-plans/${workoutPlanId}/days/${workoutDayId}`);
}
```

```tsx
// start-workout-button.tsx
"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { startWorkoutAction } from "../_actions";

export function StartWorkoutButton({
  workoutPlanId,
  workoutDayId,
}: {
  workoutPlanId: string;
  workoutDayId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={isPending}
      onClick={() =>
        startTransition(() => startWorkoutAction(workoutPlanId, workoutDayId))
      }
    >
      Iniciar treino
    </Button>
  );
}
```

### 13.3 Conceitos importantes

- **Server Component × Client Component:** página sem interatividade → server; somente os botões precisam de `"use client"` (melhor performance e menos JavaScript no navegador).
- **Server Actions:** funções `"use server"` podem chamar a API e depois `revalidatePath` — recarrega os dados da rota sem refresh manual (é por isso que, ao clicar "Iniciar treino", o botão vira "Marcar como concluído" instantaneamente).
- **`useTransition`:** deixa o botão `disabled` enquanto a ação está pendente (feedback visual/UX).
- **Dedup de requests no Next:** chamar `getHomeData` na home **e** na bottom nav não gera duas requisições — o Next deduplica requisições iguais no mesmo ciclo de renderização.
- **TanStack Query:** também é possível chamar a API direto com TanStack Query (React Query) — vantagens/desvantagens são detalhadas na aula de deploy. Aqui, o padrão usado é server components + server actions.

### 13.4 Correção do instrutor

O agente não usou o componente `Button` do shadcn → comando: *"Sempre use Button do shadcn/ui. Adicione às suas regras em react.md."* (o agente corrigiu e registrou).

### 13.5 Teste do fluxo completo

1. Na home, clique no card do treino de hoje;
2. Clique em **Iniciar treino** (a página recarrega e mostra "Marcar como concluído");
3. Clique em **Marcar como concluído** (vira "Concluído", ghost);
4. Volte à home: o quadradinho do dia fica totalmente azul e o streak incrementa.

---

## 14. Passo 11 — Tela do Plano de Treino (`/workout-plans/[id]`)

### 14.1 Tarefa 04 (`tasks/04.md`)

```md
# Tarefa
Crie a tela que está em <link Figma — plano de treino>. Seja 100% FIEL AO FIGMA.

# Requisitos Técnicos
- Crie a tela em app/workout-plans/[id]/page.tsx.
- Chame a função getWorkoutPlan para recuperar os dados necessários.
- Renderize os dias de treino; ao clicar em um dia, leve o usuário para a tela do dia (criada no passo anterior).
- Na badge, exiba o nome do workout plan.
- Página protegida (verificação de sessão como nas demais).
```

Tela simples, sem interatividade além dos cliques de navegação. Depois de pronta, ajuste a **bottom nav**: o botão de calendário passa a levar **sempre** para a tela do plano de treino ativo (senão seria impossível acessá-la quando houvesse treino hoje). Lógica do código:

```tsx
// bottom-nav.tsx (server component)
const homeData = await getHomeData(dayjs().format("YYYY-MM-DD"));
// se existe plano ativo -> link para /workout-plans/<id>
// senão -> sem ação (ou onboarding, passo 16)
```

---

## 15. Passo 12 — Tela de Estatísticas (`/stats`) + Chrome DevTools MCP

### 15.1 Tarefa 05 (`tasks/05.md`) — requisitos

```md
# Tarefa
Crie a tela que está em <link Figma — stats>. SEJA 100% FIEL AO FIGMA.

# Requisitos Técnicos
- Os dados necessários são retornados pela função getStats.
- Para referência de como exibir os dias de consistência, veja a página inicial (consistency tracker).
- Caso o workoutStreak seja zero, exibir a sequência na cor cinza; senão, na cor de destaque (vermelho/primary).
- conclusionRate é um decimal entre 0 e 1 (multiplique por 100 para exibir em %).
- O heatmap de consistência deve exibir os últimos três meses (calcule from/to e passe para getStats).
- O heatmap não diferencia visualmente datas futuras de datas passadas (trate isso).
```

### 15.2 Chrome DevTools MCP — o agente valida a própria interface

Ferramenta usada nesta etapa: o MCP **Chrome DevTools** conecta o agente a uma instância real do Chrome e permite validar a UI (navegar, clicar, tirar screenshot, ler console e inspecionar CSS).

Instalação (conforme a documentação oficial do `chrome-devtools-mcp`):

```bash
# 1. Instalar o MCP no Claude Code
claude mcp add chrome-devtools -- npx chrome-devtools-mcp@latest

# 2. Configurar auto-connect no arquivo .mcp.json do projeto
```

No `.mcp.json`, habilite o `autoConnect` (configuração do projeto). No Chrome, ative o **Remote Debugging** (`chrome://flags` ou flag de inicialização). Com tudo conectado:

1. Na tarefa 05, o instrutor adiciona: *"Use o Chrome DevTools MCP para validar suas mudanças."*
2. O agente abre o navegador, navega até `/stats`, clica na navegação, tira screenshot e **compara com o Figma**;
3. Ele mesmo detectou que o heatmap não ocupava 100% da largura e sugeriu ajustes;
4. O MCP também lê logs do console e inspeciona estilos — o agente pode inserir `console.log`, ler a saída e corrigir bugs sozinho.

**Na disciplina:** esse MCP é gratuito e é uma excelente ponte para discutir **testes de interface e acessibilidade** (o agente pode ser instruído a validar contraste e legibilidade).

### 15.3 Resultado

Página `/stats` com heatmap de 3 meses (estilo GitHub), streak (vermelho se > 0), treinos concluídos, taxa de conclusão (%) e tempo total. Commit: `git commit -m "feat: add stats page"`.

---

## 16. Passo 13 — Tela de Perfil (`/profile`)

Sem arquivo de tarefa formal (peça direto no chat do agente):

```md
Crie a página em /profile, seja 100% fiel ao Figma <link Figma — profile>.
O botão de sair da conta deve fazer signOut.
```

Resultado: dados do usuário (nome, e-mail, avatar do Google) + botão "Sair da conta" chamando `authClient.signOut()`.

---

## 17. Passo 14 — Chatbot de IA (widget global)

### 17.1 Tarefa 06 (`tasks/06.md`) — requisitos

```md
# Tarefa
Crie um chatbot que chame a rota AI da API (não use orval).

# Requisitos Técnicos
- Use Vercel AI SDK. Exemplo:
  <código de exemplo com useChat>
- Armazene o estado de abertura do chat na URL e também uma mensagem inicial que será enviada automaticamente. Use a biblioteca nuqs para isso.
  Exemplo: /?chatOpen=true&initialMessage=Como fazer supino
- Abra o chatbot ao clicar no botão central da barra de navegação (ícone sparkles).
- Abra o chatbot ao clicar no botão de interrogação (?) de cada exercício. Crie um componente ExerciseCard (app/workout-plans/[id]/days/[dayId]/_components/exercise-card.tsx) e renderize-o no exercises.map. A mensagem inicial passada via URL deve ser "Como executar o exercício X corretamente?".
- Use a biblioteca streamdown para formatar as mensagens do chatbot.
- Ao abrir o chatbot e não haver nenhuma mensagem, exiba as mensagens sugeridas (ex.: "Monte meu plano de treino") conforme o Figma <link>.
- Seja 100% fiel ao Figma <link — chat>.
```

### 17.2 Instalar as dependências

```bash
pnpm add ai@6.0.49
pnpm add @ai-sdk/react@3.0.51
pnpm add nuqs@2.8.8
pnpm add streamdown@2.2.0
```

### 17.3 Componentes criados (estrutura final)

- `app/_components/chat.tsx`: o widget global de chat;
- `app/_components/chat-open-button.tsx`: botão da bottom nav (ícone Sparkles) que seta `?chatOpen=true` via `useQueryState` (nuqs);
- `app/_components/exercise-card.tsx`: card do exercício com botão `?` que abre o chat com `initialMessage=Como executar o exercício ${name} corretamente?`;
- `app/layout.tsx` alterado (resumo da saída do agente):

```tsx
// layout.tsx — resumo das alterações do agente:
// "Added NuqsAdapter wrapper and global <Chat> component (wrapped in Suspense)"
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";
import { Chat } from "./_components/chat";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <NuqsAdapter>
          {children}
          <Suspense>
            <Chat />
          </Suspense>
        </NuqsAdapter>
      </body>
    </html>
  );
}
```

> O `NuqsAdapter` é obrigatório para o `useQueryState` funcionar em server components do Next; o `Suspense` é necessário porque o hook lê a URL (no Next 16, componentes que leem `useSearchParams` devem estar suspensos).

### 17.4 Núcleo do chat (com `useChat` do AI SDK)

```tsx
"use client";

import { useChat } from "@ai-sdk/react";
import { useQueryState } from "nuqs";
import { Streamdown } from "streamdown";

export function Chat() {
  const [chatOpen] = useQueryState("chatOpen");
  const [initialMessage] = useQueryState("initialMessage");

  const { messages, input, handleInputChange, handleSubmit, setInput } = useChat({
    api: `${process.env.NEXT_PUBLIC_API_URL}/ai`,
    credentials: "include", // envia o cookie de sessão!
    body: { initialMessage }, // mensagem inicial enviada automaticamente
  });

  if (!chatOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 ...">
      {/* mensagens sugeridas quando não há histórico */}
      {messages.length === 0 && (
        <div>
          <button onClick={() => setInput("Monte meu plano de treino")}>
            Monte meu plano de treino
          </button>
          {/* demais sugestões do Figma */}
        </div>
      )}
      {messages.map((m) => (
        <div key={m.id}>
          <Streamdown>{m.content}</Streamdown>
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  );
}
```

### 17.5 URL State (conceito central deste passo)

Em vez de estado global (Context/Redux), o estado do chat mora na **URL** (`?chatOpen=true&initialMessage=...`), gerenciado pelo **nuqs**:

- compartilhável (o link abre o chat já com a pergunta);
- sobrevive a reloads;
- acessível de qualquer componente (bottom nav, exercise card, onboarding).

### 17.6 Correções feitas pelo instrutor no código gerado

1. **URL da API:** o `useChat` precisa de `api: ${NEXT_PUBLIC_API_URL}/ai` (o agente havia deixado sem prefixo);
2. **401 Unauthorized:** faltava `credentials: "include"` no `useChat` — sem o cookie, a rota `/ai` (protegida) rejeita;
3. **Input com useState:** o agente usou `useState` para o valor do input, re-renderizando o chat a cada tecla. Peça **React Hook Form + Zod + componente `Form` do shadcn** (comando: *"Use o componente Form do shadcn com react hook form e zod ao invés de useStates para armazenar o valor do input"*). Resultado final: `FormField/FormControl/Input` com validação `z.string().min(1)` e reset automático ao enviar;
4. **Scroll bugado:** mensagens cortadas no fim — adicionar padding no final do chat.

---

## 18. Passo 15 — Chave de IA no backend (OpenAI ou Gemini)

A rota `/ai` do backend usa o Vercel AI SDK com o modelo **OpenAI** (`openai("gpt-4o-mini")`). Também é possível trocar para **Gemini** (gratuito para esse uso):

### 18.1 OpenAI (padrão do backend)

No `.env` da API:

```env
OPENAI_API_KEY="sk-..."
```

### 18.2 Alternativa gratuita: Gemini

1. Crie uma chave em `aistudio.google.com` → **Get API Key → Create API key**;
2. Adicione ao `.env` da API:

```env
GOOGLE_GENERATIVE_AI_API_KEY="AIza..."
```

3. Instale o provider: `pnpm add @ai-sdk/google@3.0.34` (o backend atual já usa `@ai-sdk/google 3.0.34` + `@ai-sdk/openai 3.0.33`);
4. Troque a importação e o modelo em `src/routes/ai.ts`:

```ts
// antes
import { openai } from "@ai-sdk/openai";
// depois
import { google } from "@ai-sdk/google";
```

```ts
const result = streamText({
  model: google("gemini-2.5-flash"), // gratuito
  system: SYSTEM_PROMPT,
  messages: await convertToModelMessages(messages),
  stopWhen: stepCountIs(10),
  tools: { ... },
});
```

> Erro comum: cota do Gemini excedida no meio do teste — nesse caso, volte para o OpenAI. A lição: **o provider é plug-and-play** — troca-se uma linha — e o modelo gratuito (gemini-2.5-flash) é ótimo para fins didáticos.

### 18.3 O que a rota `/ai` faz (contexto do backend, Aula 2)

- Recebe mensagens no formato do AI SDK, responde em **streaming**;
- `SYSTEM_PROMPT` define o "personal trainer virtual" (tom amigável, perguntas simples);
- **Tools** que a IA pode chamar: `getUserTrainData`, `updateUserTrainData`, `getWorkoutPlans`, `createWorkoutPlan`;
- `stopWhen: stepCountIs(10)`: limita a 10 passos (evita loops);
- Requer sessão (401 se não autenticado).

O fluxo: o usuário fala seus dados (peso, altura, idade, % gordura) → a IA salva via `updateUserTrainData` (convertendo kg → gramas!) → depois, ao pedir "monte meu plano de treino", ela pergunta objetivo/dias/lesões e cria o plano completo de 7 dias via `createWorkoutPlan`.

---

## 19. Passo 16 — Onboarding (`/onboarding`)

### 19.1 O problema descoberto no teste

Ao deslogar e remover todos os planos do banco, a home quebrava: o backend lançava "Active workout plan not found" (o `activeWorkoutPlanId` era obrigatório na resposta). Correção no backend:

- Em `GetHomeData` (use case), não lançar erro quando não há plano ativo;
- No schema/retorno, `activeWorkoutPlanId` passa a ser **opcional**;
- Regenerar os tipos no front (`npx orval`) e corrigir os erros de TypeScript.

### 19.2 Tarefa 07 (`tasks/07.md`) — requisitos

```md
# Tarefa
Crie a tela que está em <link Figma — onboarding>. Seja 100% fiel ao Figma.

# Requisitos Técnicos
- Caso o usuário não tenha dados de treino e/ou plano de treino ativo, leve-o para essa nova página. Ela deve estar em /onboarding.
- Ela deve renderizar o chat.tsx (componente Chat).
- Para recuperar essas informações, use as funções getHomeData e getUserTrainData (app/_lib/api/fetch-generated/index.ts).
- Faça essa verificação em TODAS as páginas (o usuário pode acessar qualquer rota diretamente).
- Coloque um botão "Acessar FIT.AI" na top bar, que leva o usuário para a página inicial.
- A mensagem inicial enviada ao chat deve ser "Quero começar a melhorar minha saúde".
```

Lógica de verificação (em cada página protegida / no layout):

```tsx
const [homeData, trainData] = await Promise.all([
  getHomeData(dayjs().format("YYYY-MM-DD")),
  getUserTrainData(),
]);

if (!homeData.data?.activeWorkoutPlanId || !trainData.data) {
  redirect("/onboarding");
}
```

> Dica para modelos mais simples: se o agente for mais fraco (nesta tarefa usou-se Sonnet 4.6, por ser mais rápida), use o **plan mode** antes de executar.

### 19.3 Teste do onboarding

1. Deslogue, apague os planos (via Prisma Studio) e recarregue → você cai em `/onboarding` com o chat aberto;
2. O chat já envia "Quero começar a melhorar minha saúde";
3. A IA pergunta os dados → salva; pergunta objetivo/dias → cria o plano;
4. Botão "Acessar FIT.AI" → home com o plano novo e streak zerado.

---

## 20. Passo 17 — Refinamentos finais e commits

- **React Hook Form + Zod no chat** (item 17.6.3): `pnpm dlx shadcn@3.8.5 add form` + `react-hook-form` + `zod`; validação `z.string().min(1)`, reset automático.
- **Build de verificação:** `pnpm build` (o agente deve rodar e confirmar "Build ok").
- **Commits** (Conventional Commits, do início ao fim — lista vista na aula):

```bash
# front
git commit -m "feat: add signing with better auth"
git commit -m "chore: add shadcn/ui setup"
git commit -m "feat: add home page and orval setup"
git commit -m "feat: add workout day page"
git commit -m "feat: add workout plan page"
git commit -m "feat: add stats page"
git commit -m "feat: add profile page"
git commit -m "feat: add chatbot widgets"
git commit -m "feat: add onboarding page"
git commit -m "feat: use react hook form in chat input"
# api
git commit -m "feat: add signing with Google"
git commit -m "feat: ensure Google sign in always prompts for account selection"
git commit -m "feat: ensure today workout day is optional on home route"
git commit -m "feat: ensure home route works without active workout plan"
git commit -m "feat: add ai routes"
```

---

## 21. Checklist de validação final (fim da aula)

- [ ] Login Google funciona (prompt de seleção de conta; cookie criado).
- [ ] Usuário sem sessão é redirecionado para `/auth`.
- [ ] Home exibe nome, treino do dia, streak e consistência corretamente.
- [ ] Quadradinhos: branco = nada; azul-claro = iniciado; azul-escuro = concluído.
- [ ] Fluxo iniciar → concluir treino funciona com refresh automático (revalidatePath).
- [ ] Calendário da bottom nav leva ao plano de treino ativo.
- [ ] `/stats` exibe heatmap de 3 meses e métricas (conclusionRate em %).
- [ ] `/profile` mostra os dados e o "Sair da conta" funciona.
- [ ] Chat abre pelo botão central e pelo `?` dos exercícios (com pergunta automática).
- [ ] Chat salva dados do usuário e cria plano de treino (tools da rota `/ai`).
- [ ] Onboarding redireciona quem não tem dados/plano, em qualquer rota.
- [ ] Nenhuma cor hard-coded; componentes do shadcn; sem `any`; sem comentários.
- [ ] `npx orval` rodado após cada mudança de API; `pnpm build` sem erros.

---

## 22. Erros encontrados na aula e como foram resolvidos (troubleshooting)

| # | Sintoma | Causa | Correção |
|---|---|---|---|
| 1 | Login volta para "hello world" | Falta `callbackURL` | `NEXT_PUBLIC_BASE_URL` + `callbackURL` no `signIn.social` |
| 2 | Google loga automaticamente | Sem prompt de conta | `prompt: "select_account"` no better-auth |
| 3 | Orval não gera | `target` com caminho errado (`app/lib` × `app/_lib`) | Corrigir `orval.config.ts` e rodar `npx orval` |
| 4 | Orval falha por prettier | `prettier: true` sem pacote | `pnpm add -D prettier@3.8.1` |
| 5 | Spec poluída com rotas de auth | Rotas sem `hide: true` | `schema: { hide: true }` em `/api/auth/*` e `/swagger.json` |
| 6 | `getHomeData` retorna 404 sem plano | Use case lança erro | `todayWorkoutDay`/`activeWorkoutPlanId` opcionais + regerar Orval |
| 7 | Imagens de capa não carregam | Domínio não permitido no `<Image>` | `images.remotePatterns` com `*.ufs.sh` |
| 8 | Quadradinhos não pintam | Comparação de data no formato errado | Informar o formato exato do `consistencyByDay` (data ISO) |
| 9 | Página do dia não compila | Dois parâmetros dinâmicos com o mesmo nome | Renomear para `[id]/days/[dayId]` |
| 10 | Chat retorna 401 | Cookie não enviado | `credentials: "include"` no `useChat` |
| 11 | Chat re-renderiza a cada tecla | `useState` no input | React Hook Form + Zod + `Form` do shadcn |
| 12 | Cota do Gemini excedida / erro de modelo | Chave/cota | Trocar provider (OpenAI/Gemini) ou chave |
| 13 | Scroll do chat corta mensagens | Layout sem espaço final | Padding no fim do chat |

---

## 23. Notas técnicas

- **Portas:** a API roda na porta **8080** (conforme o `.env.example` do projeto); o `CLAUDE.md` atual do repositório menciona 8081. Mantenha 8080 para acompanhar este roteiro.
- **Versões-chave do stack:** Next.js 16.1.6 (Turbopack), `pnpm add orval@8.1.0 -D`, `@ai-sdk/react 3.0.51`, `ai 6.0.49`, `better-auth@1.4.18`, `shadcn@3.8.5`, `dayjs@1.11.19`, `nuqs@2.8.8`, `streamdown@2.2.0`.

---

## 24. Referências

**Projeto-fonte (no repositório)**
- `bootcamp-treinos-aula-03/` — backend Fastify/Prisma/better-auth (rotas, schemas, use cases);
- `workout-plan (1).json` — corpo de exemplo do `POST /workout-plans`;
- `docs/API_PROMPT.md` — template de especificação de rotas (Driven Specs);
- `CLAUDE.md` e `.claude/rules/*` — convenções do projeto.

**Documentação oficial**
- Next.js 16: https://nextjs.org/docs
- React: https://react.dev
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com (themes em /themes)
- better-auth: https://www.better-auth.com/docs (seção Google provider)
- Orval: https://orval.dev
- Vercel AI SDK: https://ai-sdk.dev
- nuqs: https://nuqs.47ng.com
- Streamdown: https://streamdown.ai
- TanStack Query: https://tanstack.com/query
- dayjs: https://day.js.org
- Figma MCP: https://www.figma.com (Context MCP / Dev Mode)
- Chrome DevTools MCP: https://github.com/ChromeDevTools/chrome-devtools-mcp
- Context7: https://context7.com
- Google Cloud Console: https://console.cloud.google.com
- Google AI Studio (chave Gemini): https://aistudio.google.com
- Prisma: https://www.prisma.io/docs
- Conventional Commits: https://www.conventionalcommits.org

**Bibliografia do componente (ancoragem no plano de ensino)**
- BANKS, A.; PORCINO, E. *Learning React*. 2. ed. O'Reilly, 2020.
- EISENMAN, B. *Learning React Native*. 2. ed. O'Reilly, 2017.
- CHERNY, B. *Programming TypeScript*. O'Reilly, 2019.
- CASCIARO, M.; MAMMINO, L. *Node.js Design Patterns*. 3. ed. Packt, 2020.

---

## Nota prática ao docente

**Enquadramento no plano de ensino:** este roteiro serve de laboratório-guia para as aulas de React/TypeScript, APIs e sincronização (Aulas 05–06 e 11–12 do cronograma 2026.2), sendo o "projeto guarda-chuva" que os estudantes podem estender no Projeto Final (N2). Sugere-se dividi-lo em 2–3 encontros: (a) Passos 1–7 (setup, auth, shadcn, login); (b) Passos 8–13 (Orval, home, treino, plano, stats); (c) Passos 14–17 (chat IA e onboarding). Tempo estimado: 4 a 6 horas de laboratório, mais o tempo de estudo individual.

**Dificuldades esperadas:** configuração do OAuth no Google Cloud (URLs de redirect), conceito de cookies/`credentials: include`, Server × Client Components e regeneração do Orval após mudanças de API. Turmas heterogêneas: os estudantes iniciantes podem pular o chat de IA (Passos 14–16) ou usar o modelo Gemini gratuito; os avançados podem receber desafios extras (dark mode com o tema do shadcn, TanStack Query nas telas de mutação, testes com o Chrome DevTools MCP).

**Adaptação ao laboratório:** sem Claude Code/plano pago, os `tasks/*.md` viram especificações abertas que os estudantes implementam manualmente (Driven Specs); o Figma pode ser substituído por descrições + prints; o Dev Mode não é obrigatório. Reforce em aula as regras do Passo 7 (cores do tema, um componente por arquivo, auth fora do middleware) como rubrica de qualidade de código.
