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
| Autenticação | Better-Auth com email/senha, adaptador Prisma, plugin `openAPI`          |
| Documentação | Scalar em `/docs`, Swagger JSON em `/swagger.json`                        |

---

## Estrutura de Diretórios

```
src/
  index.ts             — Aplicação Fastify, middlewares, registro de rotas
  routes/              — Handlers das rotas (módulos plugin do Fastify)
  usecases/            — Lógica de negócio (uma classe por caso de uso)
  schemas/             — Schemas Zod para validação e tipos OpenAPI
  lib/                 — Infraestrutura compartilhada
    db.ts                → PrismaClient (singleton com adapter pg)
    auth.ts              → Better-Auth
  errors/              — Classes de erro customizadas
  generated/prisma/    — Saída do Prisma Client (gitignored, regenerado)
prisma/
  schema.prisma        — Modelo de dados
```

---

## Setup

```bash
pnpm install                   # pnpm apenas — .npmrc força engine-strict
docker compose up -d           # Inicia PostgreSQL 16
pnpm exec prisma generate      # Gera Prisma Client → src/generated/prisma/
pnpm exec prisma db push       # Aplica schema no banco (sem migrations)
pnpm dev                       # Inicia servidor dev com tsx --watch
```

**Pré-requisito**: Node.js 24.x (`engines.node` no `package.json`).

---

## Variáveis de Ambiente

Copie/use o arquivo `.env` na raiz do projeto. Variáveis obrigatórias:

| Variável              | Descrição                                      |
| --------------------- | ---------------------------------------------- |
| `DATABASE_URL`        | String de conexão PostgreSQL                   |
| `BETTER_AUTH_SECRET`  | String aleatória para o Better-Auth            |
| `PORT`                | Porta do servidor (padrão: `3000`)             |

> **Atenção**: o `docker-compose` cria o banco com nome `bootcamp-treinos-api`, mas o `.env` referencia `bootcamp-treinos-db`. Certifique-se de que ambos coincidem antes de executar.

---

## Comandos

| Comando                          | Descrição                                                    |
| -------------------------------- | ------------------------------------------------------------ |
| `pnpm dev`                       | Inicia servidor dev com hot-reload (tsx --watch)             |
| `pnpm build`                     | Compila TypeScript (`tsc`)                                   |
| `pnpm start`                     | Inicia em produção (`node dist/index.js`)                    |
| `pnpm exec eslint .`             | Executa lint em todos os arquivos                            |
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

### Use Cases

- Arquivos de use case usam **PascalCase** (ex: `CreateWorkoutPlan.ts`).
- Todo use case é uma classe com um método `execute`.
- Parâmetros de entrada devem ser uma interface `InputDto` definida inline no mesmo arquivo.
- O retorno deve ser tipado com uma interface `OutputDto` definida inline no mesmo arquivo. **Nunca** retorne o model do Prisma diretamente — faça o mapeamento manual para garantir desacoplamento.
- Use cases chamam o Prisma diretamente (sem camada de repositório).
- **Nunca** capture erros no use case com try/catch. Lance exceções customizadas de `src/errors/index.ts`.

### Erros

- Erros customizados são classes em `src/errors/index.ts` que estendem `Error`.
- Exemplos existentes: `NotFoundError`, `WorkoutPlanNotActiveError`, `SessionAlreadyStartedError`.
- O handler da rota mapeia cada erro customizado para o status HTTP correspondente (ex: `NotFoundError` → 404, `SessionAlreadyStartedError` → 409).

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

## Observações

- `tsconfig.json` está com `"outDir": "./dist"` comentado — `pnpm build` / `tsc` não gera `dist/` até que seja descomentado. `pnpm start` falhará sem isso.
- Ainda não há testes configurados.
- O diretório aninhado `bootcamp-treinos-api/` parece ser um repositório git interno — ignore-o a menos que seja rastreado intencionalmente.

### Git

- **NUNCA** faça commits sem autorização explícita do usuário. Sempre solicite permissão antes de commitar.
- Use [Conventional Commits](https://www.conventionalcommits.org/) para mensagens de commit: `feat:`, `fix:`, `docs:`, `refactor:`, etc.