# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

As regras obrigatórias de arquitetura, TypeScript e Git estão em `.claude/rules/` (`architecture.md`, `general.md`, `typescript.md`) e são carregadas automaticamente — siga-as, não as repita aqui. `AGENTS.md` traz a mesma visão para outros agentes.

## Estado atual do repositório (importante)

Os arquivos de configuração (`package.json`, `tsconfig.json`, `eslint.config.js`, `prisma.config.ts`, `docker-compose.yml`, `.npmrc`, `.nvmrc`, `.env`) foram montados a partir de `Configuracao_projeto_dev_movel_final.md` e `guia-setup-ambiente-bootcamp-treinos.md` (pnpm oficial: **10.30.0**). O remoto é `https://github.com/rafaelbzanon/bootcamp-treinos-api.git`, branch `main`.

- O container `bootcamp-treinos-api-postgres` (PostgreSQL 16, volume `bootcamp-treinos-api_postgres_data`) é publicado em **`127.0.0.1:5433`**, porque a 5432 é ocupada pelo serviço `postgresql-x64-18` do Windows (inicialização automática). Não volte para a 5432.
- O `.env` (não versionado) tem `PORT=8080`, `DATABASE_URL` para `localhost:5433/bootcamp-treinos-api-dev`, `BETTER_AUTH_SECRET` gerado localmente, `BETTER_AUTH_URL=http://localhost:8080`, `WEB_APP_BASE_URL=http://localhost:3000` e `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` vazias (o aviso `Social provider google is missing clientId or clientSecret` no `pnpm dev` é esperado). Se ele sumir, recrie com essas chaves; o `prisma.config.ts` falha sem `DATABASE_URL`.
- **`bootcamp-treinos-api-dev`** é o banco da API: foi criado vazio e sincronizado com o `schema.prisma` via `db push` (sem migrations). O banco `bootcamp-treinos-api` (o `POSTGRES_DB` do compose) existe mas fica vazio e não é usado.
- O login só tem Google habilitado. Para testar rotas protegidas, crie `user` e `session` direto no banco dev e envie o cookie `better-auth.session_token=<token>.<HMAC-SHA256(token, BETTER_AUTH_SECRET) em base64>`, com URL-encode.
- No Windows, parar o `pnpm dev` em background pode deixar o processo do `tsx` vivo na 8080; confira a porta antes de subir de novo.

### Auditoria de setup (`Prompt-verificacao-projeto.md`)

Quando o usuário pedir para auditar ou corrigir o ambiente, siga esse prompt. Ele define a ordem de precedência entre as referências, o escopo, os comandos de validação e a tabela **"Desvios aprovados"**, que registra as diferenças intencionais em relação às referências. Não reverta esses desvios, e adicione nessa tabela qualquer novo desvio que for aprovado.

### Diagramas

`diagrama-banco-de-dados-*.md`, `diagrama-classes-*.md` e `diagrama-uml-sistema-*.md` descrevem o snapshot **aula-03** (com `env.ts`, migrations, rotas de IA, home/stats), que é mais completo que o código daqui. Use-os como referência de destino das `tasks/`, não como retrato do código atual.

## Comandos

```bash
docker compose up -d          # PostgreSQL 16 em 127.0.0.1:5433
pnpm exec prisma db push      # aplica o schema no banco do .env (dev)
pnpm exec prisma generate     # obrigatório após qualquer mudança no schema.prisma / db push
pnpm exec prisma format
pnpm exec prisma studio
pnpm dev                      # tsx --watch src/index.ts
pnpm build                    # tsc → dist/
pnpm start                    # node dist/index.js
pnpm exec tsc --noEmit        # typecheck
pnpm exec eslint .            # inclui simple-import-sort (erro se imports fora de ordem)
```

Não há testes configurados. Requer Node 24.x e pnpm (engine-strict).

`tests/` guarda os documentos do trabalho de Qualidade e Teste de Software (guia, template do relatório e manual de IA). Eles pressupõem um "kit de partida" (Vitest, `src/build-app.ts`, `.env.test`) que ainda não existe aqui. Ao montá-lo: o banco de teste sai de `db push` (não há migrations); `bodyFatPercentage` vai de 0 a 1 e `weightInGrams` exige inteiro ≥ 1 (os limites do guia estão errados para este projeto); `StartWorkoutSession` retorna `{ id }`; e o código de erro é `SESSION_ALREADY_STARTED`.

## Arquitetura

Fluxo de uma requisição: **rota** (`src/routes/*.ts`, plugin Fastify) → valida com Zod + obtém sessão via `auth.api.getSession` → instancia **use case** (`src/usecases/*.ts`) → use case usa `prisma` de `src/lib/db.ts` e lança erros de `src/errors/index.ts` → rota mapeia cada classe de erro para status + `code` (`NOT_FOUND_ERROR` 404, `WORKOUT_PLAN_NOT_ACTIVE` 400, `INVALID_SESSION_COMPLETION` 400, `SESSION_ALREADY_STARTED` 409, fallback `INTERNAL_SERVER_ERROR` 500).

Pontos que exigem ler vários arquivos para entender:

- **Registro de rotas**: cada arquivo em `src/routes/` exporta um plugin async; ele precisa ser registrado manualmente em `src/index.ts` com um `prefix` (ex.: `workoutPlanRoutes` em `/workout-plans`, logo URLs dentro do plugin são relativas).
- **Better-Auth sobre Fastify**: `src/index.ts` monta `/api/auth/*` convertendo a request do Fastify num `Request` Fetch e repassando para `auth.handler`. `src/lib/auth.ts` reutiliza o singleton Prisma de `db.ts` e, no estado atual, configura apenas o provedor **Google** (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`), com `baseURL` = `BETTER_AUTH_URL` (a API) e `trustedOrigins` = `WEB_APP_BASE_URL` (o front). Email/senha **não** está habilitado.
- **Documentação**: Scalar em `/docs` combina duas fontes — `/swagger.json` (gerado das rotas Zod via `jsonSchemaTransform`) e `/api/auth/open-api/generate-schema` (plugin `openAPI` do Better-Auth). Por isso toda rota precisa de `tags`/`summary` e schemas de response.
- **Prisma 7**: generator `prisma-client` com output em `src/generated/prisma` (não editar; regenerar). Importe `PrismaClient` de `generated/prisma/client.js` e enums de `generated/prisma/enums.js`. O datasource não tem `url` no schema — vem de `prisma.config.ts` (via dotenv).
- **Modelo de domínio**: `User` → `WorkoutPlan` (apenas um `isActive` por usuário; criar um novo desativa o anterior em transação) → `WorkoutDay` (por `WeekDay`, pode ser descanso) → `WorkoutExercise`; `WorkoutSession` pertence a um `WorkoutDay` e está "em andamento" enquanto `completedAt` é null. Tabelas de auth (`user`, `session`, `account`, `verification`) seguem o formato do Better-Auth.
- **Autorização por posse**: quando o recurso não pertence ao usuário da sessão, os use cases lançam `NotFoundError` (não revelam a existência) — veja `StartWorkoutSession`.

## Fluxo de desenvolvimento com specs

Features são descritas como specs em Markdown e implementadas pelo agente: `docs/API_PROMPT.md` é o template; `tasks/NN.md` são as tarefas. As tasks `01`–`07` estão implementadas. Falta a `08` (rota de IA `src/routes/ai.ts`), que precisa escolher o provedor, instalar o AI SDK e configurar uma chave, e cuja tool `getWorkoutPlans` deve usar o `ListWorkoutPlans` (já existe). A lógica compartilhada de streak e consistência fica em `src/usecases/helpers/workout-consistency.ts`. Os dados de treino ficam como campos opcionais em `User`, e `bodyFatPercentage` é `Float` (1 = 100%). Ao implementar, siga a ordem schema → erro → use case → rota.

## Contrato com o front-end (`pratico-frontend-react-nextjs.md`)

O roteiro descreve o front `bootcamp-treinos-frontend` (Next.js 16, porta 3000), que consome esta API por funções geradas com **Orval** a partir do `/swagger.json` e usa o cookie do Better Auth (`credentials: "include"`). Toda mudança de contrato aqui exige rodar `npx orval` no front. O que a API já cumpre do contrato:

- **Portas e URLs:** a API roda na **8080** (`PORT`, `BETTER_AUTH_URL`, que também é o `servers` do OpenAPI). O front fica em `WEB_APP_BASE_URL` (`http://localhost:3000`), a única origem do CORS (`credentials: true`) e do `trustedOrigins` do Better Auth.
- **`operationId`:** toda rota usada pelo front tem um, e ele é o nome da função gerada pelo Orval (`listWorkoutPlans`, `createWorkoutPlan`, `getWorkoutPlan`, `getWorkoutDay`, `startWorkoutSession`, `updateWorkoutSession`, `getHomeData`, `getStats`, `getUserTrainData`, `upsertUserTrainData`). **Rota nova = `operationId` novo.**
- **Spec limpo:** `/api/auth/*` e `/swagger.json` têm `schema: { hide: true }`.
- **Home sem plano ativo:** `GET /home/:date` retorna 200 com `activeWorkoutPlanId` e `todayWorkoutDay` ausentes. O front usa isso, junto com `GET /me` retornando `null`, para redirecionar ao `/onboarding`. **Não volte a lançar erro aqui.**
- **Login:** Google com `prompt: "select_account"`.

Ainda falta o `POST /ai` (task 08). O roteiro espera Vercel AI SDK com streaming, `stopWhen: stepCountIs(10)` (a task 08 diz 5) e 401 sem sessão. O roteiro também cita `src/lib/env.ts`, migrations e `.env.example`, que vêm do snapshot aula-03 e não existem aqui.

## Divergências conhecidas

- Porta: a API usa 8080 por causa do front; `general.md` ainda menciona 4949.
- Porta do banco: as referências e o `README.md`/`AGENTS.md` usam 5432; o projeto usa 5433 (veja "Estado atual").
- Nome do banco: o `DATABASE_URL` em `Configuracao_...` aponta para `bootcamp-treinos-db`; o `.env` usa `bootcamp-treinos-api-dev` (veja "Estado atual").
- `src/schemas/index.ts` ainda usa `z.string().url()` / `.uuid()`; a regra pede validadores nativos do Zod v4 (`z.url()`, `z.uuid()`) em código novo.
