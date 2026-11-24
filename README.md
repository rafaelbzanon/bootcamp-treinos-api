# Bootcamp Treinos API

API REST do **FIT.AI**, um gestor de planos de treino. Ela permite criar planos semanais, iniciar e concluir sessões de treino, acompanhar a consistência e a sequência (streak) de treinos e guardar os dados físicos do usuário.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Runtime | Node.js 24, ESM, TypeScript 5.9 (strict) |
| Servidor | Fastify 5 + `fastify-type-provider-zod` (validação e serialização com Zod 4) |
| Banco | PostgreSQL 16 (Docker) + Prisma 7 com `@prisma/adapter-pg` |
| Autenticação | Better Auth (login com Google) |
| Documentação | OpenAPI (`@fastify/swagger`) + Scalar |
| Datas | dayjs (UTC) |

## Pré-requisitos

- **Node.js 24.x**: o `.npmrc` usa `engine-strict=true`, então outras versões bloqueiam o `pnpm install`.
- **pnpm 10.30.0**: habilite com `corepack enable && corepack prepare pnpm@10.30.0 --activate`.
- **Docker** com Docker Compose.

## Como rodar

```bash
pnpm install
docker compose up -d          # sobe o PostgreSQL 16 na porta 5432
# crie o arquivo .env (veja abaixo)
pnpm exec prisma generate     # gera o Prisma Client em src/generated/prisma
pnpm exec prisma db push      # cria as tabelas a partir do schema
pnpm dev                      # servidor com hot-reload em http://localhost:3000
```

### Variáveis de ambiente (`.env`)

```env
PORT=3000
DATABASE_URL="postgresql://postgres:password@localhost:5432/bootcamp-treinos-api"
BETTER_AUTH_SECRET=<valor aleatório>
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

- Gere o `BETTER_AUTH_SECRET` com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- O login usa o Google. Crie um OAuth Client do tipo *Web application* no Google Cloud com o redirect URI `http://localhost:3000/api/auth/callback/google` e preencha `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`. Sem eles a API sobe normalmente, mas não é possível fazer login.

## Comandos

| Comando | Descrição |
| --- | --- |
| `pnpm dev` | Servidor de desenvolvimento (`tsx --watch`) |
| `pnpm build` | Compila para `dist/` |
| `pnpm start` | Roda a versão compilada |
| `pnpm lint` | ESLint (inclui ordenação de imports) |
| `pnpm exec tsc --noEmit` | Checagem de tipos |
| `pnpm exec prisma generate` | Regenera o Prisma Client (rode após mudar o `schema.prisma`) |
| `pnpm exec prisma db push` | Aplica o schema no banco |
| `pnpm exec prisma studio` | Interface visual do banco |

O projeto ainda não tem testes automatizados.

## Endpoints

A documentação interativa fica em **http://localhost:3000/docs**. Ela reúne o OpenAPI da API (`/swagger.json`) e o do Better Auth. Todas as rotas abaixo, exceto as de documentação e autenticação, exigem uma sessão autenticada.

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/workout-plans` | Cria um plano de treino; o plano ativo anterior do usuário é desativado |
| `GET` | `/workout-plans/:workoutPlanId` | Plano com seus dias (com a contagem de exercícios) |
| `GET` | `/workout-plans/:workoutPlanId/days/:workoutDayId` | Dia de treino com exercícios e sessões |
| `POST` | `/workout-plans/:workoutPlanId/days/:workoutDayId/sessions` | Inicia uma sessão de treino |
| `PATCH` | `/workout-plans/:workoutPlanId/days/:workoutDayId/sessions/:sessionId` | Conclui uma sessão (`completedAt`) |
| `GET` | `/home/:date` | Dados da página inicial: treino do dia, consistência da semana e streak |
| `GET` | `/stats?from=YYYY-MM-DD&to=YYYY-MM-DD` | Estatísticas do período: consistência, streak, taxa de conclusão e tempo total |
| `GET` | `/me` | Dados de treino do usuário (`null` se ainda não cadastrados) |
| `PUT` | `/me` | Cria ou atualiza os dados de treino (peso, altura, idade, % de gordura) |
| `GET/POST` | `/api/auth/*` | Rotas do Better Auth |

Erros seguem o formato `{ "error": string, "code": string }`. Recursos de outro usuário retornam 404.

## Arquitetura

```
Rota (src/routes)  →  Use case (src/usecases)  →  Prisma (src/lib/db.ts)  →  PostgreSQL
```

- **Rotas**: validam a entrada com Zod (`src/schemas`), checam a sessão com `auth.api.getSession` e convertem os erros do use case em status HTTP.
- **Use cases**: uma classe por operação, com um método `execute` e DTOs de entrada e saída. Concentram as regras de negócio e lançam erros de `src/errors`.
- **Prisma Client**: é gerado em `src/generated/prisma`, que não é versionado.

As convenções obrigatórias do projeto estão em [`.claude/rules/`](.claude/rules/) e em [`AGENTS.md`](AGENTS.md).

## Status

- As tasks `01` a `07` de [`tasks/`](tasks/) estão implementadas.
- A task `08` (chat com IA, um personal trainer virtual em `/ai`) ainda está pendente.

## Documentação de apoio

- [`guia-setup-ambiente-bootcamp-treinos.md`](guia-setup-ambiente-bootcamp-treinos.md): passo a passo do ambiente.
- [`Configuracao_projeto_dev_movel_final.md`](Configuracao_projeto_dev_movel_final.md): configuração de referência do projeto.
- Diagramas: [banco de dados](diagrama-banco-de-dados-bootcamp-treinos.md), [classes](<diagrama-classes-bootcamp-treinos (1).md>) e [UML do sistema](diagrama-uml-sistema-bootcamp-treinos.md).
