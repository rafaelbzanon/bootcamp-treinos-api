# AGENTS.md

Este arquivo orienta o opencode (opencode.ai) ao trabalhar com código neste repositório.

---

## Regras Obrigatórias

Os arquivos em `.claude/rules/` (`architecture.md`, `general.md` e `typescript.md`) definem as regras de arquitetura, código e estilo do projeto. **Todas devem ser seguidas obrigatoriamente** durante o desenvolvimento. Consulte-os antes de qualquer alteração.

---

## Visão Geral

API REST de treinos construída com **Fastify 5**, **TypeScript**, **Prisma 7** e **Better-Auth**. Executa em Node.js 24.x com pnpm 10.30.0 (ambos obrigatórios via `engine-strict` no `.npmrc`).

---

## Stack

| Camada       | Tecnologia                                                                 |
| ------------ | -------------------------------------------------------------------------- |
| Runtime      | Node 24, ESM (`"type": "module"`), TypeScript 5.9 strict               |
| Servidor     | Fastify 5 com `ZodTypeProvider` (validação e serialização via Zod)       |
| Banco        | PostgreSQL 16, Prisma 7.4, `@prisma/adapter-pg` (connection pool)        |
| Autenticação | Better-Auth com login Google (email/senha **não** está habilitado), adaptador Prisma, plugin `openAPI` |
| Documentação | Scalar em `/docs`, Swagger JSON em `/swagger.json`                        |

---

## Estrutura de Diretórios

```
src/
  index.ts             — Aplicação Fastify, middlewares, registro de rotas
  routes/              — Handlers das rotas (plugins do Fastify, registrados com prefix em index.ts)
  usecases/            — Lógica de negócio (uma classe por caso de uso)
    helpers/             → Lógica compartilhada (streak, consistência por dia, datas em UTC)
  schemas/             — Schemas Zod para validação e tipos OpenAPI
  lib/                 — Infraestrutura compartilhada
    db.ts                → PrismaClient (singleton com adapter pg)
    auth.ts              → Better-Auth
  errors/              — Classes de erro customizadas
  generated/prisma/    — Saída do Prisma Client (gitignored, regenerado)
prisma/
  schema.prisma        — Modelo de dados
prisma.config.ts       — Carrega o .env e define a URL do banco (o schema não tem `url`)
tasks/                 — Specs das features (NN.md), implementadas pelo agente
```

---

## Setup

```bash
pnpm install                   # pnpm apenas — .npmrc força engine-strict
docker compose up -d           # Inicia PostgreSQL 16
# crie o .env (veja abaixo) antes dos comandos do Prisma
pnpm exec prisma generate      # Gera Prisma Client → src/generated/prisma/
pnpm exec prisma db push       # Aplica schema no banco do .env (sem migrations)
pnpm dev                       # Inicia servidor dev com tsx --watch
```

**Pré-requisitos**: Node.js 24.x e pnpm 10.30.0 (via Corepack).

---

## Variáveis de Ambiente

O arquivo `.env` fica na raiz do projeto e não é versionado. Variáveis:

| Variável               | Descrição                                                        |
| ---------------------- | ---------------------------------------------------------------- |
| `PORT`                 | Porta do servidor (`8080`; o front-end usa a 3000)               |
| `DATABASE_URL`         | String de conexão PostgreSQL                                     |
| `BETTER_AUTH_SECRET`   | String aleatória para o Better-Auth                              |
| `BETTER_AUTH_URL`      | URL da própria API (`http://localhost:8080`); também é o `servers` do OpenAPI |
| `WEB_APP_BASE_URL`     | URL do front-end (`http://localhost:3000`); única origem do CORS e do `trustedOrigins` |
| `GOOGLE_CLIENT_ID`     | OAuth do Google (pode ficar vazio; sem ele não há login real)    |
| `GOOGLE_CLIENT_SECRET` | OAuth do Google (pode ficar vazio)                               |

### Bancos de dados nesta máquina

O container `bootcamp-treinos-api-postgres` tem dois bancos:

- **`bootcamp-treinos-api-dev`**: é o banco do `.env`, sincronizado com o `schema.prisma` via `db push`. Use-o para desenvolver e testar. Ele contém dados de teste (usuários `user-a`, `user-b` e `user-c`).
- **`bootcamp-treinos-api`**: foi criado por migrations de outra cópia do projeto (`C:\a\dev_mobile_IFRS_2026-main\bootcamp-treinos-api`), está fora de sincronia com o schema e não roda a API. **Nunca rode `prisma db push` contra ele** sem autorização, porque isso pode apagar dados.

O container é compartilhado com essa outra cópia (mesmo nome de projeto Compose). Use `docker compose up -d` com cuidado, porque ele pode recriar o container.

---

## Comandos

| Comando                          | Descrição                                                    |
| -------------------------------- | ------------------------------------------------------------ |
| `pnpm dev`                       | Inicia servidor dev com hot-reload (tsx --watch)             |
| `pnpm build`                     | Compila TypeScript (`tsc`)                                   |
| `pnpm start`                     | Inicia em produção (`node dist/index.js`)                    |
| `pnpm lint`                      | Executa lint em todos os arquivos (`eslint .`)               |
| `pnpm exec tsc --noEmit`         | Checagem de tipos                                            |
| `pnpm exec prisma generate`      | Regenera o Prisma Client após alterações no schema           |
| `pnpm exec prisma db push`       | Aplica o schema do Prisma no banco de dados                  |

---

## Convenções

### Imports (ESM)

- Todos os imports locais **devem** usar extensão `.js` (ex: `from "../lib/db.js"`).
- Ordenação de imports é aplicada pelo `eslint-plugin-simple-import-sort` (builtins → externos → internos). Execute `pnpm exec eslint .` antes de commitar.
- **Sempre** prefira named exports. Evite default exports a menos que estritamente necessário.

### Zod

- **Sempre** importe de `zod/v4`: `import z from "zod/v4"`. **Nunca** use Zod v3.
- Schemas Zod em `src/schemas/` funcionam como schemas de request/response do OpenAPI via `fastify-type-provider-zod`.
- Use validadores nativos sempre que possível: `z.url()`, `z.iso.date()`, `z.iso.datetime()`, etc.
- Enums do Prisma (ex: `WeekDay`) devem ser referenciados com `z.enum(WeekDay)`, importando de `../generated/prisma/enums.js`.

### Rotas

- Siga princípios REST: `GET /recurso`, `POST /recurso`, `GET /recurso/:id/sub`, etc.
- Rotas **nunca** contêm regras de negócio — apenas validação (Zod) e autenticação.
- Toda rota deve instanciar e chamar um use case.
- Erros lançados pelo use case devem ser tratados no handler da rota com try/catch.
- **Sempre** inclua `tags` e `summary` no schema da rota para a documentação Swagger/OpenAPI.

### Autenticação

- Para rotas protegidas, recupere a sessão com `auth.api.getSession({ headers: fromNodeHeaders(request.headers) })` de `better-auth/node`.
- `fromNodeHeaders` converte os headers do Fastify para o formato esperado pelo Better-Auth.
- Recursos de outro usuário retornam `NotFoundError` (404), para não revelar que existem.
- **Testar rotas protegidas sem Google:** crie `user` e `session` direto no banco dev e envie o cookie `better-auth.session_token=<token>.<HMAC-SHA256(token, BETTER_AUTH_SECRET) em base64>`, com URL-encode. Os usuários de teste têm os tokens `tokena`, `tokenb` e `tokenc`.

### Use Cases

- Arquivos de use case usam **PascalCase** (ex: `CreateWorkoutPlan.ts`).
- Todo use case é uma classe com um método `execute`.
- Parâmetros de entrada devem ser uma interface `InputDto` definida inline no mesmo arquivo.
- O retorno deve ser tipado com uma interface `OutputDto` definida inline no mesmo arquivo. **Nunca** retorne o model do Prisma diretamente — faça o mapeamento manual para garantir desacoplamento.
- Use cases chamam o Prisma diretamente (sem camada de repositório).
- **Nunca** capture erros no use case com try/catch. Lance exceções customizadas de `src/errors/index.ts`.

### Erros

- Erros customizados são classes em `src/errors/index.ts` que estendem `Error`.
- Erros existentes e o mapeamento feito na rota (`{ error, code }`):

| Erro                            | Status | `code`                       |
| ------------------------------- | ------ | ---------------------------- |
| `NotFoundError`                 | 404    | `NOT_FOUND_ERROR`            |
| `WorkoutPlanNotActiveError`     | 400    | `WORKOUT_PLAN_NOT_ACTIVE`    |
| `InvalidSessionCompletionError` | 400    | `INVALID_SESSION_COMPLETION` |
| `SessionAlreadyStartedError`    | 409    | `SESSION_ALREADY_STARTED`    |
| (qualquer outro)                | 500    | `INTERNAL_SERVER_ERROR`      |

### Nomenclatura

| Elemento       | Convenção     | Exemplo                            |
| -------------- | ------------- | ---------------------------------- |
| Arquivos       | kebab-case    | `workout-plan.ts`, `auth.ts`      |
| Use cases      | PascalCase    | `CreateWorkoutPlan.ts`            |
| Classes        | PascalCase    | `CreateWorkoutPlan`               |
| Funções/Variáveis | camelCase  | `execute`, `workoutPlanId`        |
| Interfaces     | PascalCase    | `InputDto`, `OutputDto`           |
| Funções        | verbos        | `execute`, `validate`             |

### Datas

- Utilize a biblioteca `dayjs` para manipular e formatar datas.

---

## Fluxo de uma Feature

1. **Schema** (`src/schemas/index.ts`): defina schemas Zod para validação do corpo, parâmetros de rota e respostas.
2. **Erro** (`src/errors/index.ts`): crie classes de erro customizadas se necessário.
3. **Use Case** (`src/usecases/`): implemente a classe com os DTOs inline, chamando o Prisma e lançando erros.
4. **Rota** (`src/routes/`): registre o endpoint com `ZodTypeProvider`, autenticação, `tags` e `summary`, tratando os erros do use case.

---

## Estado do Projeto

- **Implementado:** as tasks `01`–`07` de `tasks/`, mais `PUT /me`, `GET /workout-plans` (`ListWorkoutPlans`, com filtro `active`) e a validação de que `completedAt` não pode ser anterior a `startedAt`. A lista de endpoints com os `operationId` está no `README.md`.
- **Pendente:** a task `08` (chat com IA em `src/routes/ai.ts`). Ela depende de o usuário escolher o provedor (OpenAI ou Google), instalar o AI SDK e configurar uma chave de API. A tool `getWorkoutPlans` deve usar o `ListWorkoutPlans`.
- **Contrato com o front-end** (`pratico-frontend-react-nextjs.md`, projeto `bootcamp-treinos-frontend`): o front gera suas funções com Orval a partir do `/swagger.json`.
  - Toda rota usada pelo front precisa de `operationId`, que vira o nome da função gerada.
  - `/api/auth/*` e `/swagger.json` ficam fora do spec (`hide: true`).
  - Depois de mudar o contrato, é preciso rodar `npx orval` no front.
- **Regras de negócio que não estão nas specs:**
  - **Streak:** conta para trás a partir da data de referência (`date` na home; o menor entre `to` e hoje no stats). Dias fora do plano ativo não quebram a sequência; dias do plano sem sessão concluída quebram, inclusive descanso. O dia de referência ainda não concluído não quebra.
  - **Home:** sem plano ativo, retorna 200 com `activeWorkoutPlanId` e `todayWorkoutDay` ausentes, e todos os dias da semana contam para o streak. O front usa isso para redirecionar ao onboarding; não volte a lançar 404.
  - **Stats:** `from > to` retorna 400.
  - **Dados de treino:** ficam em campos opcionais de `User`, e `bodyFatPercentage` é `Float` (1 = 100%). `GET /me` retorna `null` enquanto algum campo estiver vazio.
- **Testes:** não há testes automatizados. Valide com `pnpm exec tsc --noEmit`, `pnpm lint` e chamadas reais à API no banco dev.
- **Auditoria de ambiente:** siga `Prompt-verificacao-projeto.md`, inclusive a tabela de desvios aprovados.

### Git

- **NUNCA** faça commits sem autorização explícita do usuário. Sempre solicite permissão antes de commitar.
- Use [Conventional Commits](https://www.conventionalcommits.org/) para mensagens de commit: `feat:`, `fix:`, `docs:`, `refactor:`, etc.
- Remoto: `origin` → `https://github.com/rafaelbzanon/bootcamp-treinos-api.git`, branch `main`. Faça push apenas quando o usuário pedir.