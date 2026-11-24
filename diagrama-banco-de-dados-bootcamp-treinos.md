# Diagrama do Banco de Dados — Bootcamp Treinos API

> **Fonte:** `prisma/schema.prisma` (snapshot aula-03, que inclui as migrations `20260304223538_init`) e `docker-compose.yml`.
>
> **Conferência no vídeo (Aula 2):** este banco é exatamente o modelado ao vivo com o professor — no vídeo, as tabelas (`account`, `session`, `verification`, `user`, `WorkoutDay`, `WorkoutExercise`, `WorkoutPlan`, `WorkoutSession`) são inspecionadas e manipuladas via **Prisma Studio** (`http://localhost:51212`), e o `generator` aponta para `src/generated/prisma`.
>
> **Stack:** PostgreSQL **16** (imagem `postgres:16-alpine` via Docker) + Prisma **7.4.0** com adapter `pg` (`@prisma/adapter-pg`).
> **Banco:** `bootcamp-treinos-api` — usuário `postgres` / senha `password` (valores apenas para desenvolvimento local) na porta `5432`.
> **URL:** `postgresql://postgres:password@localhost:5432/bootcamp-treinos-api` (variável `DATABASE_URL` no `.env`).

---

## 1. Diagrama relacional

```mermaid
erDiagram
    user ||--o{ workout_plan : "possui"
    user ||--o{ session : "sessão de login (better-auth)"
    user ||--o{ account : "conta OAuth/senha (better-auth)"
    user ||--o{ verification : "verificações (better-auth)"
    workout_plan ||--o{ workout_day : "contém (Cascade)"
    workout_day ||--o{ workout_exercise : "contém (Cascade)"
    workout_day ||--o{ workout_session : "sessões iniciadas (Cascade)"

    user {
        string id PK
        string name "nome exibido"
        string email UK "único"
        boolean emailVerified "padrão false"
        string image "url da foto (opcional)"
        int weightInGrams "peso em gramas (opcional)"
        int heightInCentimeters "altura em cm (opcional)"
        int age "idade (opcional)"
        int bodyFatPercentage "0-100, 100 = 100% (opcional)"
        datetime createdAt "default now()"
        datetime updatedAt "auto-update"
    }

    workout_plan {
        string id PK "uuid"
        string name
        string userId FK "-> user.id"
        boolean isActive "padrão true"
        datetime createdAt "Timestamptz"
        datetime updatedAt "Timestamptz"
    }

    workout_day {
        string id PK "uuid"
        string name
        string workoutPlanId FK "-> workout_plan.id"
        boolean isRest "padrão false"
        WeekDay weekDay "enum (Mon–Dom)"
        int estimatedDurationInSeconds
        string coverImageUrl "img de capa (opcional)"
        datetime createdAt "Timestamptz"
        datetime updatedAt "Timestamptz"
    }

    workout_exercise {
        string id PK "uuid"
        string name
        int order "ordem no dia"
        string workoutDayId FK "-> workout_day.id"
        int sets
        int reps
        int restTimeInSeconds "descanso entre séries"
        datetime createdAt "Timestamptz"
        datetime updatedAt "Timestamptz"
    }

    workout_session {
        string id PK "uuid"
        string workoutDayId FK "-> workout_day.id"
        datetime startedAt "início da sessão (obrigatório)"
        datetime completedAt "conclusão (nulo = em andamento)"
        datetime createdAt "Timestamptz"
        datetime updatedAt "Timestamptz"
    }

    session {
        string id PK "criado pelo better-auth"
        datetime expiresAt
        string token UK "único"
        string ipAddress "opcional"
        string userAgent "opcional"
        string userId FK "-> user.id"
        datetime createdAt
        datetime updatedAt
    }

    account {
        string id PK "criado pelo better-auth"
        string accountId
        string providerId "ex.: google, credential"
        string userId FK "-> user.id"
        string accessToken "opcional"
        string refreshToken "opcional"
        string idToken "opcional"
        datetime accessTokenExpiresAt "opcional"
        datetime refreshTokenExpiresAt "opcional"
        string scope "opcional"
        string password "hash da senha (opcional)"
        datetime createdAt
        datetime updatedAt
    }

    verification {
        string id PK "criado pelo better-auth"
        string identifier
        string value
        datetime expiresAt
        datetime createdAt
        datetime updatedAt
    }
```

**Enum `WeekDay`** (tipo PostgreSQL, não é tabela):

```
MONDAY | TUESDAY | WEDNESDAY | THURSDAY | FRIDAY | SATURDAY | SUNDAY
```

Usado na coluna `workout_day.weekDay`; validado com `z.enum(WeekDay)` (gerado em `src/generated/prisma/enums.js`). Em `workout-plan (1).json`, exemplo: `"weekDay": "MONDAY"`.

---

## 2. Mapeamento Prisma → PostgreSQL

O Prisma não converte nomes automaticamente: **tabelas e colunas usam o nome idêntico ao modelo/campo**, salvo onde há `@@map`:

| Modelo Prisma | Tabela no Postgres | `@@map`? | Observações |
| --- | --- | --- | --- |
| `User` | `user` | sim | nome em minúsculo |
| `WorkoutPlan` | `WorkoutPlan` | não | nome do modelo |
| `WorkoutDay` | `WorkoutDay` | não | — |
| `WorkoutExercise` | `WorkoutExercise` | não | — |
| `WorkoutSession` | `WorkoutSession` | não | — |
| `Session` | `session` | sim | better-auth padrão |
| `Account` | `account` | sim | better-auth padrão |
| `Verification` | `verification` | sim | better-auth padrão |

Exemplos de colunas: `userId` (FK), `isActive`, `estimatedDurationInSeconds`, `coverImageUrl` — column name = field name (camelCase preservado pelo Prisma no PostgreSQL).

---

## 3. Constraints e índices

| Tabela | Chave primária | Chaves estrangeiras | Unique | Índices |
| --- | --- | --- | --- | --- |
| `user` | `id` | — | `email` | — |
| `WorkoutPlan` | `id` (uuid, gerado) | `userId → user.id` (Cascade) | — | — |
| `WorkoutDay` | `id` (uuid) | `workoutPlanId → WorkoutPlan.id` (Cascade) | — | — |
| `WorkoutExercise` | `id` (uuid) | `workoutDayId → WorkoutDay.id` (Cascade) | — | — |
| `WorkoutSession` | `id` (uuid) | `workoutDayId → WorkoutDay.id` (Cascade) | — | — |
| `session` | `id` (definido pelo better-auth) | `userId → user.id` (Cascade) | `token` | `userId` |
| `account` | `id` (definido pelo better-auth) | `userId → user.id` (Cascade) | — | `userId` |
| `verification` | `id` (definido pelo better-auth) | — | — | `identifier` |

**Regras de exclusão:**

- Todas as FK usam `onDelete: Cascade` — apagar um `user` apaga seus planos, dias, exercícios, sessões, sessions/accounts; apagar um `WorkoutPlan` apaga seus dias, etc.
- `WorkoutSession.createdAt`/`updatedAt` e `startedAt`/`completedAt` usam type modifier `@db.Timestamptz()` (timestamp com fuso).

**Regras de negócio que o banco facilita (via use case `StartWorkoutSession`):**

- Só uma sessão por dia: o use case consulta `workoutSession.findFirst({ workoutDayId })` e lança `SessionAlreadyStartedError` (409) se já existir — **não há constraint única**; a garantia é da camada de aplicação.
- Só o dono pode acessar: os use cases verificam `workoutPlan.userId === dto.userId` antes de qualquer operação.

---

## 4. Commands de operação do banco

| Operação | Comando |
| --- | --- |
| Subir o PostgreSQL (Docker) | `docker compose up -d` |
| Parar (mantém dados no volume) | `docker compose down` |
| Parar e apagar dados | `docker compose down -v` |
| Aplicar migrations já existentes | `pnpm exec prisma migrate deploy` |
| Criar uma nova migration em dev | `pnpm exec prisma migrate dev --name init` |
| Sincronizar o schema sem migration (**usado nas aulas**) | `pnpm exec prisma db push` |
| Formatar o schema | `pnpm exec prisma format` |
| Gerar o Prisma Client | `pnpm exec prisma generate` (`src/generated/prisma`) |
| Abrir interface gráfica do Prisma | `pnpm exec prisma studio` |
| Inspecionar as tabelas via psql no container | `docker exec -it bootcamp-treinos-api-postgres psql -U postgres -d bootcamp-treinos-api` |

> **Nota da Aula 2:** durante o desenvolvimento, o professor ajusta o schema e roda `prisma db push` + `prisma generate` (prototipagem rápida). A pasta `prisma/migrations/` do snapshot final é a evolução versionada desse fluxo — em produção, prefira `migrate deploy`.

Exemplo de inspeção:

```sql
\dt                          -- lista as tabelas
\d "WorkoutPlan"             -- descreve a tabela (aspas por camelCase)
\du                          -- usuários do banco
```

---

## 5. Como o código conecta ao banco

- `src/lib/db.ts` instancia o `PrismaClient` com `new PrismaPg({ connectionString })` (driver PostgreSQL nativo via adapter) e reutiliza o client em desenvolvimento (cache em `global`) para evitar múltiplas conexões com hot-reload.
- `prisma.config.ts` carrega o `.env` (dotenv) e injeta `DATABASE_URL` em todos os comandos `prisma`.
- O client gerado fica em `src/generated/prisma` (pasta **gitignored** — gerada localmente).
- As entidades `Session`, `Account` e `Verification` são consumidas pelo `better-auth` (`prismaAdapter(prisma, { provider: "postgresql" })` em `src/lib/auth.ts`), que também gerencia sua migração via o mesmo fluxo do Prisma.

---

## Nota prática ao docente

**Uso em aula:** ideal para as Aulas 09 e 10 (tecnologias de persistência e implementação com PostgreSQL/Docker) e como referência na persistência do Projeto Final (N2). O item 4 permite transformar o conteúdo em atividade prática de laboratório: subir o banco, listar as tabelas e verificar a estrutura via `psql`.

**Sugestão de atividade:** baseando-se no `workout-plan (1).json`, peça aos estudantes (a) interpretarem o payload e identificarem as tabelas envolvidas (WorkoutPlan → WorkoutDay → WorkoutExercise), (b) criarem um script de seed que insira o plano via `workoutPlan.create` com o mesmo formato, e (c) validarem com `prisma studio`.

**Possíveis dificuldades:** nomes distintos de tabelas (camelCase vs minúsculo via `@@map`) confundem alunos acostumados a snake_case; o `WeekDay` não é tabela (é enum) — reforçar; a ausência de constraint única para sessão por dia deve gerar discussão produtiva sobre "garantia por regra de negócio vs constraint de banco".

**Turmas heterogêneas:** iniciantes ficam no item 1 (ler relações); intermediário faz os comandos do item 4; avançado implementa o seed proposto e compara a modelagem com uma alternativa normalizada (ex.: tabela `muscle_group`, exercícios reutilizáveis) debatendo trade-offs.
