# Diagrama UML do Sistema — Bootcamp Treinos (FIT.AI)

> **Objetivo:** descrever, de forma generalizada, **como o sistema funciona** — componentes, atores, casos de uso, fluxos de interação, estados e atividades.
> **Base:** código do snapshot `bootcamp-treinos-aula-03` (rotas Fastify, use cases, Prisma 7/PostgreSQL 16, better-auth, integração com IA), `docker-compose.yml` e as aulas em vídeo: **Aula 2** (back-end, exatamente este código) e **Aula 3** (web app em Next.js que consome a API — incluído aqui como "Aplicação Web").

---

## 1. Visão de contexto (componentes principais)

```mermaid
flowchart LR
    subgraph CLIENTE["Aplicação Web (Next.js 16/React) — porta 3000"]
        UI["Páginas (Home, Plano, Dia, Stats, Perfil, Login)"]
        UI2["authClient.useSession — melhor-auth"]
        UI3["Client HTTP gerado (Orval) — app/_lib/api/fetch-generated"]
        UI4["Chat — Vercel AI SDK (useChat) + streamdown"]
        UI5["Server actions + revalidatePath / TanStack Query"]
        UI6["Estado do chat na URL (nuqs)"]
    end

    subgraph API["API Bootcamp Treinos — Fastify (porta 8080/8081)"]
        ROUTES["Rotas: autenticação, validação Zod, status HTTP"]
        USECASES["Use Cases: regras de negócio (execute DTO)"]
        PRISMA["Prisma Client (adapter pg)"]
        AUTH["better-auth: sessão e login"]
    end

    subgraph IA["Integração com IA"]
        OPENAI[("Modelo de IA externo — gpt-4o-mini")]
    end

    subgraph DATA["Persistência"]
        PG[("PostgreSQL 16 — Docker (postgres:16-alpine)")]
    end

    subgraph GOOGLE["Login opcional"]
        GOO[("Google OAuth (Client ID/Secret)")]
    end

    UI -->|"HTTPS/H1, cookies de sessão"| ROUTES
    UI2 -->|"authClient.useSession"| AUTH
    UI3 -->|"fetch gerado do /swagger.json"| ROUTES
    UI4 -->|"POST /ai — streaming (credentials: include)"| ROUTES
    UI5 -->|"chama funções do client gerado"| ROUTES
    UI6 -.->|"controla abertura/mensagem do chat"| UI4
    ROUTES -->|"instancia e chama execute()"| USECASES
    USECASES -->|"consultas e transações"| PRISMA
    PRISMA -->|"conexão DATABASE_URL"| PG
    ROUTES -->|"login/cadastro, sessão, OAuth"| AUTH
    AUTH -->|"prismaAdapter (persistência)"| PRISMA
    AUTH -->|"redirect /api/auth/callback/google"| GOO
    ROUTES -->|"chat com streaming (tools)"| OPENAI
    OPENAI -->|"tools executam use cases"| USECASES
```

- **Dois projetos**: `bootcamp-treinos-frontend` (**Next.js 16**/React + TypeScript: páginas, Tailwind + shadcn/ui, Orval para o client HTTP, TanStack Query/server actions para as ações e AI SDK para o chat) e `bootcamp-treinos-api` (Fastify). O front é "mobile-first" (apresentação FIT.AI) e foi desenhado no **Figma** — as telas do web app são construídas "fiéis ao FIGMA" (specs em `tasks/*.md`).
- O `better-auth` usa o mesmo banco no modo "adapter" (Prisma), com modelos `Session`, `Account` e `Verification` próprios; o login por Google é via **OAuth 2.0** configurado no Google Cloud Console (callback `http://localhost:8080/api/auth/callback/google`, com `prompt: "select_account"` no provedor). No código fornecido (aula-03) o login por **e-mail/senha** está habilitado; na Aula 3 ele é substituído pelo Google.
- **Orval** gera o cliente HTTP tipado a partir do `swagger.json` (usando os `operationId` das rotas) — o front quase nunca escreve fetch manualmente (a exceção é o chat `/ai`, via AI SDK). Sempre que a API muda, o client é regenerado (`npx orval`).
- **Validação de UI por IA (Aula 3):** o professor conecta o **Chrome DevTools MCP** para o agente abrir a aplicação, tirar screenshots, ler console/CSS e comparar com o Figma durante o desenvolvimento.

---

## 2. Diagrama de casos de uso

```mermaid
flowchart LR
    U(["Usuário"])
    D(["Desenvolvedor"])
    IA(["Modelo de IA externo"])

    UC1(["Login / Cadastro (e-mail e senha / Google OAuth)"])
    UC2(["Consultar tela Início (dia + streak)"])
    UC3(["Gerenciar dados físicos (peso, altura, idade, %gordura)"])
    UC4(["Consultar estatísticas por período"])
    UC5(["Listar planos de treino"])
    UC6(["Ver detalhes de plano e dia"])
    UC7(["Criar plano de treino"])
    UC8(["Iniciar sessão de treino"])
    UC9(["Concluir sessão de treino"])
    UC10(["Conversar com treinador virtual IA"])
    UC11(["Consultar documentação da API (Swagger/Scalar)"])
    UC12(["Implementar telas do web app (fiel ao design Figma FIT.AI)"])
    AUT(["Estar autenticado (sessão válida)"])

    U --> UC1
    U --> UC2
    U --> UC3
    U --> UC4
    U --> UC5
    U --> UC6
    U --> UC7
    U --> UC8
    U --> UC9
    U --> UC10
    D --> UC11
    D --> UC12

    UC2 -.->|<<include>>| AUT
    UC3 -.->|<<include>>| AUT
    UC4 -.->|<<include>>| AUT
    UC5 -.->|<<include>>| AUT
    UC6 -.->|<<include>>| AUT
    UC7 -.->|<<include>>| AUT
    UC8 -.->|<<include>>| AUT
    UC9 -.->|<<include>>| AUT
    UC10 -.->|<<include>>| AUT

    UC10 -->|"chama tools (dados e planos)"| IA
    UC10 -.->|"usa casos: UC3, UC5, UC7"| UC3
    UC10 -.->|"usa casos: UC3, UC5, UC7"| UC5
    UC10 -.->|"usa casos: UC3, UC5, UC7"| UC7
```

**Regra de autenticação:** todos os casos de uso, exceto login e documentação, exigem sessão válida: as rotas chamam `auth.api.getSession()` e respondem **401 `UNAUTHORIZED`** sem sessão. As regras de negócio garantem também que o usuário só opera **seus próprios** dados (casos de "dono" verificam `userId`).

**Desenvolvimento (UC11/UC12):** o desenvolvedor consulta a API em `/docs` e as especificações (`tasks/*.md`, em geral referenciando o **Figma** para as telas) e implementa com apoio de **agentes de IA** (Claude Code) + regras de `.claude/rules/` — processo "Driven Specs" observado nas Aulas 2 e 3. O web app em si é usado pelo Usuário, mas quem o integra com a API é o Desenvolvedor.

**Interação com IA (UC10):** a conversa usa `streamText` com o modelo OpenAI **gpt-4o-mini** e o `SYSTEM_PROMPT` de "personal trainer". O modelo chama **tools** registradas (`getUserTrainData`, `updateUserTrainData`, `getWorkoutPlans`, `createWorkoutPlan`) que delegam aos use cases — por isso UC10 está associado a UC3/UC5/UC7. Como a rota `/ai` também só responde com sessão, o ator "Modelo de IA" **não executa nada diretamente**: é a API que elege a ferramenta do usuário autenticado.

---

## 3. Diagrama de sequência — fluxo de um dia de treino

```mermaid
sequenceDiagram
    participant C as Cliente Web (3000)
    participant API as API (Fastify)
    participant BA as better-auth
    participant UC as Use Case
    participant DB as Prisma / PostgreSQL

    rect rgb(240, 244, 255)
    Note over C,DB: 1. Autenticação
    C->>API: POST /api/auth/sign-in/email
    API->>BA: auth.handler(request)
    BA->>DB: valida credenciais (account/user)
    DB-->>BA: ok
    BA-->>API: 200 + cookie/header de sessão
    API-->>C: 200 Autenticado
    end

    rect rgb(240, 255, 240)
    Note over C,DB: 2. Tela Início (dia e streak)
    C->>API: GET /home/2026-09-08
    API->>BA: auth.api.getSession(headers)
    BA-->>API: session (userId)
    API->>UC: new GetHomeData().execute({userId, date})
    UC->>DB: workoutPlan.findFirst({ userId, isActive: true }) + workoutDays +
    UC->>DB: workoutSession.findMany(... semana)
    DB-->>UC: dados completos
    UC-->>API: activeWorkoutPlanId, todayWorkoutDay, workoutStreak, consistencyByDay
    API-->>C: 200 HomeData
    end

    rect rgb(255, 250, 230)
    Note over C,DB: 3. Iniciar sessão do dia
    C->>API: POST /workout-plans/:id/days/:dayId/sessions
    API->>BA: getSession
    BA-->>API: session
    API->>UC: new StartWorkoutSession().execute({userId, workoutPlanId, workoutDayId})
    UC->>DB: workoutPlan.findUnique(...)
    alt plano não existe ou não é do usuário
        UC-->>API: NotFoundError
        API-->>C: 404 NOT_FOUND_ERROR
    else plano não está ativo
        UC-->>API: WorkoutPlanNotActiveError
        API-->>C: 422 WORKOUT_PLAN_NOT_ACTIVE_ERROR
    else já existe sessão para o dia
        UC-->>API: SessionAlreadyStartedError
        API-->>C: 409 SESSION_ALREADY_STARTED_ERROR
    else tudo ok
        UC->>DB: workoutSession.create({ startedAt: now, workoutDayId })
        DB-->>UC: sessão criada
        UC-->>API: { userWorkoutSessionId }
        API-->>C: 201 Iniciada
    end
    end

    rect rgb(255, 240, 240)
    Note over C,DB: 4. Concluir sessão
    C->>API: PATCH /workout-plans/:id/days/:dayId/sessions/:sessionId
    API->>UC: new UpdateWorkoutSession().execute({ ..., completedAt })
    UC->>DB: valida dono/plano/dia/sessão
    alt não encontrado
        UC-->>API: NotFoundError
        API-->>C: 404
    else ok
        UC->>DB: workoutSession.update({ completedAt })
        DB-->>UC: sessão concluída
        UC-->>API: { id, startedAt, completedAt }
        API-->>C: 200 Concluída
    end
    end
```

---

## 4. Diagrama de estados

### Sessão de treino (`WorkoutSession`)

```mermaid
stateDiagram-v2
    [*] --> SemSessao : dia sem sessão registrada
    SemSessao --> EmAndamento : POST .../sessions<br/>(cria com startedAt = now)
    EmAndamento --> Concluida : PATCH .../sessions/:id<br/>(envia completedAt)
    Concluida --> [*]

    note right of SemSessao
        Tentar iniciar de novo
        aqui = 409 (já iniciada)
    end note
    note right of EmAndamento
        Só existe UMA sessão
        por dia (validada no use case)
    end note
```

### Plano de treino (`WorkoutPlan`) — um ativo por vez

```mermaid
stateDiagram-v2
    [*] --> Criado : POST /workout-plans<br/>(isActive = true)
    Criado --> Desativado : novo plano criado<br/>(transação: desativa antigo)
    Desativado --> Ativo : novo plano assume isActive = true
    Criado --> [*] : desativado e substituído
    note right of Desativado
        Iniciar sessão em plano
        desativado = 422 (não está ativo)
    end note
```

**Comportamento garantido pelo use case `CreateWorkoutPlan`:** antes de criar o novo plano, a transação do Prisma desativa (`isActive = false`) o plano ativo anterior — a regra "**um plano ativo por vez**" é de aplicação, não de banco.

---

## 5. Diagrama de atividade — iniciar sessão de treino

Fluxo com passos de validação e pontos de decisão (implementados em `StartWorkoutSession` + rota):

```mermaid
flowchart TD
    A(["POST /workout-plans/:id/days/:dayId/sessions"]) --> B{"Sessão válida?"}
    B -- "não" --> E401["401 UNAUTHORIZED"]
    B -- "sim" --> C["StartWorkoutSession.execute({ userId, ... })"]
    C --> D{"Plano existe?"}
    D -- "não" --> E404["404 NOT_FOUND_ERROR"]
    D -- "sim" --> F{"Plano pertence ao usuário?"}
    F -- "não" --> E404["404 NOT_FOUND_ERROR"]
    F -- "sim" --> G{"Plano está ativo?"}
    G -- "não" --> E422["422 WORKOUT_PLAN_NOT_ACTIVE_ERROR"]
    G -- "sim" --> H{"Dia existe no plano?"}
    H -- "não" --> E404["404 NOT_FOUND_ERROR"]
    H -- "sim" --> I{"Já existe sessão para o dia?"}
    I -- "sim" --> E409["409 SESSION_ALREADY_STARTED_ERROR"]
    I -- "não" --> J["workoutSession.create(startedAt)"]
    J --> K(["201 { userWorkoutSessionId }"])
```

---

## 6. Resumo comportamental do sistema

| Contexto | Comportamento |
| --- | --- |
| Autenticação | e-mail/senha habilitado no código (better-auth, sessão por cookie) + OAuth Google na Aula 3 (`socialProviders`, `prompt: "select_account"`); o web app lê a sessão com `authClient.useSession()` e a página de perfil faz logout |
| Autorização | toda rota de dados verifica a sessão; use cases conferem o `userId` do dono |
| Transação | criação de plano: desativa o anterior e cria o novo em uma única transação |
| Exclusão | tudo em **Cascade**: apagar usuário remove planos, dias, exercícios, sessões e tabelas do better-auth |
| IA | chat em streaming (limite por `stepCountIs`); o modelo decide quais tools chamar |
| Ações do front | iniciar/concluir treino via **server actions** + `revalidatePath`; chat aberto por **URL state** (nuqs); client HTTP tipado pelo **Orval** a partir do `/swagger.json` |
| Documentação | OpenAPI em `/swagger.json`; UI interativa em `/docs` (Scalar) |

---

## Nota prática ao docente

**Uso em aula:** este material serve como "mapa do funcionamento" — bom para abrir a Aula 11 (construção de API REST: sequência e atividade) e revisar antes da N2 (Projeto Final), pois demonstra o padrão **requisição → autenticação → regra de negócio → banco → resposta** que os estudantes vão replicar. Os vídeos ajudam a contextualizar: a Aula 2 constrói a API (mesmo código), e a Aula 3 adiciona o web app Next.js que consome a API (com Orval + AI SDK), ilustrando o sistema completo.

**Atividade sugerida:** cada dupla escolhe um endpoint (ex.: `PUT /me`) e reproduz, em Mermaid, os itens 3 e 5 adaptados; comparar desenhos entre os pares gera discussão sobre consistência de erros/status codes.

**Possíveis dificuldades:** a noção de "um plano ativo por vez" e "uma sessão por dia" serem regras **de aplicação** (não constraints de banco) é o ponto abstrato mais delicado — vale reforçar com os diagramas de estado e atividade. A integração com IA (tools) também costuma gerar dúvidas: esclareça que a IA só age dentro de tools assíncronas autenticadas, nunca acessa o banco diretamente.

**Turmas heterogêneas:** iniciantes focam nos itens 1 e 2 (o que o sistema faz); intermediários no item 3 (como); avançados modelam o estado do plano/sessão com um terceiro diagrama (ex.: transições possíveis de `completedAt` com datas) justificando decisões de LHC/UX.
