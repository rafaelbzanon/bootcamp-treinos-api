# Guia do Estudante — Relatório Final de Testes (FIT.AI)

> Este guia é a sua referência para montar o relatório final de testes. Ele contém os **mínimos obrigatórios**, a **trilha de execução**, **exemplos para consulta** (nunca para copiar), os **comandos** e a **rubrica de avaliação**.
> O arquivo que você preenche e entrega é o template `relatorio_de_testes_software_academia.md`. Se for usar IA como apoio, leia também o `manual-auxiliar-opencode-ia-testes.md`.

---

## 1. Prazos de Entrega

- **10/12/2026** — conforme a regra da turma:
  - Entrega for **única**: relatório completo neste dia;
- Em caso de dúvida sobre a regra, pergunte ao professor no início do trabalho.

---

## 2. Mínimos Obrigatórios (o que cai na nota)

- **12 casos de teste** (no mínimo), cada um com a coluna RF e o artefato (arquivo ou rota real) preenchidos.
- **Módulos obrigatórios:** autenticação, home/consistência e sessões de treino **+ 1 módulo à sua escolha** (dados do usuário, estatísticas, assistente de IA ou interface do front).
- **Técnicas:** no mínimo **1 caso de cada** — classes de equivalência, BVA, tabela de decisão ou FSM, caixa-branca com McCabe e 1 não-funcional.
- **2 a 3 defeitos reais** com reprodução, causa-raiz e correção.
- **3 evidências obrigatórias:** prints da suíte/cobertura (EV-01), 1 captura de fluxo E2E manual (EV-02) e antes/depois de 1 bug (EV-03).
- **Cobertura real** anexada. Meta: C0 ≥ 80% e C1 ≥ 75% **nos módulos que você testou** (não no projeto inteiro).

---

## 3. Trilha de Execução de 5 Dias (~13 h)

| Dia | Tempo | Atividade | Resultado |
| :--- | :---: | :--- | :--- |
| **D1** | 3 h | Instalar o kit de partida (Seção 9), subir o banco de teste, rodar o teste-exemplo; escrever 3–4 testes de unidade do módulo de sessões. | Suíte rodando + primeiros testes verdes |
| **D2** | 3 h | Testes de integração com `app.inject` (401 sem sessão, home, `/me`); massa de dados com faker. | Testes de integração verdes |
| **D3** | 2 h | Rodar cobertura, anotar métricas (Seção 9 do template); reproduzir 1–2 bugs reais, corrigir e registrar (Seção 8). | Métricas + defeitos documentados |
| **D4** | 2 h | E2E manual no navegador (login → home → iniciar treino); medições de acessibilidade (contraste, área de toque). | Prints EV-02 e casos não-funcionais |
| **D5** | 3 h | Preencher o relatório (Seções 2–10 do template), anexar evidências, checklist e autoavaliação. | Relatório pronto para entrega |

> Está sem tempo? A ordem de prioridade está na Seção 4 — faça primeiro o que vale mais nota.

---

## 4. Onde estão os pontos (hierarquia esforço × nota)

- **65% da nota** vem de **casos de teste** (critérios 1 e 2 da rubrica) + **gestão de defeitos** (critério 4). Comece por aqui.
- **10%** vêm da **automação/código de teste** (critério 5) — o kit de partida resolve a maior parte.
- **15%** são os **não-funcionais** (critério 3) — 2 casos bem medidos bastam.
- **10%** são **organização e conclusão** (critério 6) — o template enxuto já garante.

---

## 5. Exemplos de Casos de Teste (consulte, não copie)

A tabela abaixo mostra casos de teste completos, ancorados nas rotas e regras reais do FIT.AI. Use como referência de preenchimento — **os seus casos devem ser escritos por você**, a partir do que o seu projeto faz.

| ID Caso | RF | Módulo | Técnica | Nível | Descrição do Cenário e Entradas | Resultado Esperado | Resultado Obtido | Artefato Testado | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CT-01** | RF-01 | Autenticação | Caixa-Preta (Fluxo Feliz) | UI / E2E | Clique em "Fazer login com Google" na tela `/auth`, seleção de conta válida. | Sessão better-auth criada (cookie `better-auth.session_token`) e redirecionamento para a home (`callbackURL`). | Login efetuado e usuário redirecionado à home. | `app/auth/page.tsx` + rotas `/api/auth/*` | **Passou** |
| **CT-02** | RF-01 | Autenticação | Caixa-Preta (Equivalência Inválida) | Integração (API) | `GET /home/2026-11-23` **sem** cookie de sessão. | `401` com `{ "error": "Unauthorized", "code": "UNAUTHORIZED" }`. | 401 retornado; rota protegida. | `src/routes/home.ts` | **Passou** |
| **CT-03** | RF-01 | Autenticação | Caixa-Preta (Controle de Acesso) | UI / E2E | Acesso direto a `/` sem estar autenticado. | Redirecionamento (`redirect`) para `/auth`. | Redirecionamento executado pelo server component. | `app/page.tsx` | **Passou** |
| **CT-04** | RF-02 | Home | Caixa-Preta (Equivalência Válida) | Integração (API) | `GET /home/:date` autenticado, com plano ativo e dia correspondente à data. | `200` com `todayWorkoutDay` preenchido e `consistencyByDay` com 7 entradas. | Resposta completa conforme `HomeDataSchema`. | `src/usecases/GetHomeData.ts` | **Passou** |
| **CT-05** | RF-02 | Home | Caixa-Preta (Regressão de Bug) | Integração (API) | `GET /home/:date` autenticado, **sem** plano ativo. | `200` com `activeWorkoutPlanId` e `todayWorkoutDay` ausentes (sem erro). | Na 1ª rodada retornou 404; após correção, 200. | `src/usecases/GetHomeData.ts` | **FALHOU → Corrigido** |
| **CT-06** | RF-02 | Home | Caixa-Preta (BVA) | Integração (API) | `GET /home/2026-02-30` (data inexistente) e `GET /home/26-11-2026` (formato errado). | `400`/`422` de validação do `z.iso.date()`. | Datas inválidas rejeitadas pelo Zod. | `z.iso.date()` em `src/schemas/index.ts` | **Passou** |
| **CT-07** | RF-03 | Sessões | Transição de Estados (FSM) | Integração (API) | `POST /workout-plans/:id/days/:dayId/sessions` autenticado, dono do plano, sem sessão no dia. | `201` com `{ userWorkoutSessionId }` e `startedAt` no banco. | Sessão criada com sucesso. | `src/usecases/StartWorkoutSession.ts` | **Passou** |
| **CT-08** | RF-03 | Sessões | Transição de Estados (FSM Ilegal) | Integração (API) | Repetir o POST de CT-07 no mesmo dia. | `409` com `SESSION_ALREADY_STARTED_ERROR`. | Transição ilegal bloqueada. | `src/usecases/StartWorkoutSession.ts` | **Passou** |
| **CT-09** | RF-03 | Sessões | Caixa-Preta (Segurança/Autoria) | Integração (API) | `POST .../sessions` em plano de **outro** usuário. | `404` (não revelar existência do recurso). | Regra de propriedade respeitada. | `src/usecases/StartWorkoutSession.ts` | **Passou** |
| **CT-10** | RF-03 | Sessões | Transição de Estados (FSM) | Integração (API) | `PATCH .../sessions/:sessionId` com `{ completedAt: <ISO> }` em sessão em andamento. | `200` com `completedAt` persistido; home conta o dia como concluído. | Conclusão registrada e consistência atualizada. | `src/usecases/UpdateWorkoutSession.ts` | **Passou** |
| **CT-11** | RF-04 | Dados do Usuário | Caixa-Preta (BVA) | Integração (API) | `PUT /me` com `bodyFatPercentage` = 0, 100 e 101; `weightInGrams` = -1, 0 e 1. | 0 e 100 → `200`; 101 e -1 → `400`. | Fronteiras aceitas; inválidos rejeitados. | `UpsertUserTrainDataBodySchema` em `src/schemas/index.ts` | **Passou** |
| **CT-12** | RF-05 | Estatísticas | Caixa-Preta (Equivalência) | Integração (API) | `GET /stats?from=<hoje-3meses>&to=<hoje>` autenticado. | `200` com `conclusionRate` em [0,1], `workoutStreak` ≥ 0. | Resposta consistente com `StatsSchema`. | `src/usecases/GetStats.ts` | **Passou** |
| **CT-13** | RF-06 | Assistente de IA | Caixa-Preta (Controle de Acesso) | Integração (API) | `POST /ai` com mensagens **sem** sessão. | `401 Unauthorized`. | Rota protegida corretamente. | `src/routes/ai.ts` | **Passou** |
| **CT-14** | RF-06 | Assistente de IA | Caixa-Branca (Regra de Negócio) | Unidade | Tool `updateUserTrainData` recebendo **70 kg**. | Conversão para **70000 g** antes do use case. | Conversão kg → gramas validada com mock. | tool `updateUserTrainData` em `src/routes/ai.ts` | **Passou** |
| **CT-15** | RF-06 | Assistente de IA | Caixa-Preta (Transação) | Integração (API) | Conversa que leva à tool `createWorkoutPlan` (objetivo + 5 dias/semana). | Plano com **7 dias** (MONDAY..SUNDAY), descansos com `isRest: true`, plano anterior desativado. | Plano criado; antigo com `isActive: false`. | tool `createWorkoutPlan` + `src/usecases/CreateWorkoutPlan.ts` | **Passou** |
| **CT-16** | RF-07 | Interface (Dia de Treino) | Caixa-Preta (Tabela de Decisão) | UI / E2E | Combinações de sessão no dia: (a) sem sessão; (b) `startedAt` sem `completedAt`; (c) `completedAt` preenchido. | (a) "Iniciar treino"; (b) "Marcar como concluído"; (c) ghost "Concluído". | Tabela de decisão implementada. | `app/workout-plans/[id]/days/[dayId]/_components/*` | **Passou** |
| **CT-17** | RF-07 | Interface (Server Action) | Caixa-Preta (Recarga de Dados) | UI / E2E | Clique em "Iniciar treino" na tela do dia. | Server Action chama `startWorkoutSession` + `revalidatePath`, sem refresh manual. | Na 1ª rodada não atualizava (faltava `revalidatePath`); corrigido. | `app/workout-plans/[id]/days/[dayId]/_actions.ts` | **FALHOU → Corrigido** |
| **CT-18** | RF-07 | Interface (Onboarding) | Caixa-Preta (Fluxo Alternativo) | UI / E2E | Login sem dados de treino e sem plano ativo, acessando qualquer rota. | Redirecionamento para `/onboarding` com chat aberto e mensagem inicial. | Verificação em todas as páginas funcionando. | `app/onboarding/page.tsx` | **Passou** |
| **CT-19** | RF-08 | Acessibilidade | Não-Funcional (WCAG 2.1 AA) | UI / Tela | Contraste do texto secundário da home sobre o fundo do tema. | Razão ≥ 4.5:1 em todos os textos. | Texto secundário resultou em 2.8:1 no modo escuro. | Variáveis de cor em `app/globals.css` | **FALHOU** |
| **CT-20** | RF-08 | Usabilidade | Não-Funcional (Área de Toque) | UI / Tela | Botões da barra de navegação inferior em viewport 390 px. | Mínimo de 48 x 48 dp por alvo de toque. | Botões com área ≥ 48 dp. | `app/_components/bottom-nav.tsx` | **Passou** |
| **CT-21** | RF-08 | Usabilidade | Não-Funcional (Heurística Nielsen) | UI / Tela | Várias mensagens no chat em viewport mobile. | Última mensagem visível; input sem re-render a cada tecla. | Scroll cortava mensagens; corrigido com padding final. | `app/_components/chat.tsx` | **FALHOU → Corrigido** |

---

## 6. Exemplos de Código de Teste (referência)

### 6.1. Teste de Unidade de Use Case (`Vitest` — Backend)

Exemplo cobrindo os caminhos do CFG de `StartWorkoutSession.execute()` (5 predicados, $V(G) = 6$):

```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  NotFoundError,
  SessionAlreadyStartedError,
  WorkoutPlanNotActiveError,
} from "../errors/index.js";
import { prisma } from "../lib/db.js";
import { StartWorkoutSession } from "./StartWorkoutSession.js";

vi.mock("../lib/db.js", () => ({
  prisma: {
    workoutPlan: { findUnique: vi.fn() },
    workoutDay: { findUnique: vi.fn() },
    workoutSession: { findFirst: vi.fn(), create: vi.fn() },
  },
}));

describe("StartWorkoutSession (Caixa-Branca — caminhos do CFG)", () => {
  let useCase: StartWorkoutSession;

  const dto = {
    userId: "user-1",
    workoutPlanId: "plan-1",
    workoutDayId: "day-1",
  };

  beforeEach(() => {
    useCase = new StartWorkoutSession();
    vi.clearAllMocks();
  });

  it("deve criar a sessão quando o plano está ativo e o dia pertence ao plano", async () => {
    vi.mocked(prisma.workoutPlan.findUnique).mockResolvedValue({
      id: "plan-1",
      userId: "user-1",
      isActive: true,
    } as never);
    vi.mocked(prisma.workoutDay.findUnique).mockResolvedValue({ id: "day-1" } as never);
    vi.mocked(prisma.workoutSession.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.workoutSession.create).mockResolvedValue({
      id: "session-1",
      startedAt: new Date(),
    } as never);

    const result = await useCase.execute(dto);

    expect(result.userWorkoutSessionId).toBe("session-1");
  });

  it("deve lançar WorkoutPlanNotActiveError quando o plano está inativo", async () => {
    vi.mocked(prisma.workoutPlan.findUnique).mockResolvedValue({
      id: "plan-1",
      userId: "user-1",
      isActive: false,
    } as never);

    await expect(useCase.execute(dto)).rejects.toBeInstanceOf(
      WorkoutPlanNotActiveError,
    );
  });

  it("deve lançar SessionAlreadyStartedError quando já existe sessão no dia", async () => {
    vi.mocked(prisma.workoutPlan.findUnique).mockResolvedValue({
      id: "plan-1",
      userId: "user-1",
      isActive: true,
    } as never);
    vi.mocked(prisma.workoutDay.findUnique).mockResolvedValue({ id: "day-1" } as never);
    vi.mocked(prisma.workoutSession.findFirst).mockResolvedValue({
      id: "existing",
    } as never);

    await expect(useCase.execute(dto)).rejects.toBeInstanceOf(
      SessionAlreadyStartedError,
    );
  });

  it("deve lançar NotFoundError para plano de outro usuário (não vazar existência)", async () => {
    vi.mocked(prisma.workoutPlan.findUnique).mockResolvedValue({
      id: "plan-1",
      userId: "another-user",
      isActive: true,
    } as never);

    await expect(useCase.execute(dto)).rejects.toBeInstanceOf(NotFoundError);
  });
});
```

### 6.2. Teste de Integração de Rota (`app.inject` do Fastify)

Para testar rotas sem abrir porta de rede, o kit de partida traz a função `buildApp()` (extraída do `src/index.ts`) e o mock do better-auth:

```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FastifyInstance } from "fastify";

vi.mock("../src/lib/auth.js", () => ({
  auth: {
    api: { getSession: vi.fn() },
  },
}));

import { auth } from "../src/lib/auth.js";
import { buildApp } from "../src/build-app.js";

describe("GET /home/:date (Integração)", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it("deve responder 401 quando não há sessão de autenticação", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const response = await app.inject({
      method: "GET",
      url: "/home/2026-11-23",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: "Unauthorized",
      code: "UNAUTHORIZED",
    });
  });
});
```

### 6.3. Teste de Aceitação Baseado em Comportamento (Gherkin)

```gherkin
# language: pt
Funcionalidade: Execução do Dia de Treino
  Como usuário autenticado do FIT.AI
  Quero iniciar e concluir minha sessão de treino do dia
  Para registrar minha consistência semanal corretamente

  Cenário: Iniciar treino de um dia sem sessão
    Dado que o usuário possui um plano de treino "Ativo"
    E o dia de treino de hoje não possui sessão iniciada
    Quando o usuário clicar no botão "Iniciar treino"
    Então o sistema deve criar uma sessão com startedAt preenchido
    E a tela deve ser revalidada exibindo o botão "Marcar como concluído"
```

---

## 7. Exemplo de Registro de Defeitos (referência)

| ID Bug | Severidade | Prioridade | Módulo Afetado | Caso de Teste | Resumo do Defeito | Status Atual |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-01** | Crítica | Alta | Home / API | CT-05 | `GET /home/:date` retornava 404 ("Active workout plan not found") para usuários sem plano ativo, quebrando a home após o login. | Corrigido e Re-testado |
| **BUG-02** | Alta | Alta | Chat de IA | CT-13 | Chat retornava 401 pois o `useChat` não enviava o cookie (ausência de `credentials: "include"`). | Corrigido e Re-testado |
| **BUG-03** | Média | Média | Interface / Home | — | Imagens de capa (`*.ufs.sh`) não renderizavam por falta de `images.remotePatterns` no `next.config.ts`. | Corrigido e Re-testado |
| **BUG-04** | Média | Média | Home / Consistência | — | Quadradinhos da consistência não pintavam por comparação de datas em formatos diferentes. | Corrigido e Re-testado |
| **BUG-05** | Baixa | Média | Acessibilidade | CT-19 | Contraste insuficiente de texto secundário (2.8:1 contra 4.5:1 da WCAG AA). | Aberto para Próxima Sprint |
| **BUG-06** | Baixa | Média | Chat de IA / UX | CT-21 | Scroll do chat cortava as últimas mensagens; input com `useState` re-renderizava a cada tecla. | Corrigido e Re-testado |

**Estrutura da ficha detalhada (use para o seu defeito crítico):**

- **Título**: o que quebra, onde.
- **Severidade / Prioridade**: Crítica/Alta/Média/Baixa com justificativa.
- **Passos para Reprodução**: lista numerada, do zero até o erro.
- **Comportamento Observado**: o que de fato aconteceu (com a resposta/erro).
- **Comportamento Esperado**: o que deveria acontecer.
- **Causa-Raiz Técnica**: onde está o defeito no código.
- **Ação Corretiva Implementada**: o que mudou e como foi re-testado.

---

## 8. Comandos de Execução no Projeto FIT.AI

```bash
# BACKEND (bootcamp-treinos-api)
docker compose up -d                          # PostgreSQL de teste
pnpm exec prisma migrate reset                # banco limpo e determinístico
pnpm add -D vitest @vitest/coverage-v8        # instalar a suíte (se ainda não instalou)
pnpm test                                     # executar a suíte (script do kit)
pnpm exec vitest run --coverage               # apurar cobertura C0/C1
pnpm exec eslint .                            # análise estática
pnpm exec tsc --noEmit                        # validação estrita de tipos

# FRONTEND (bootcamp-treinos-frontend)
pnpm build                                    # portão de qualidade (tipos + lint + build)
npx orval                                     # validar conformidade do cliente gerado com o OpenAPI

# E2E / UI (manual com evidência)
# Chrome DevTools MCP (auto-connect) ou: pnpm exec playwright test
```

---

## 9. Kit de Partida de Testes (pasta `kit-testes/`)

O kit elimina as horas de configuração inicial. Para instalar no backend `bootcamp-treinos-api`:

1. `pnpm add -D vitest @vitest/coverage-v8`
2. Copie `vitest.config.ts` para a raiz do backend.
3. Copie `src/build-app.ts` para `src/` (extrai a montagem do app do `src/index.ts`).
4. Ajuste `src/index.ts` para usar a nova função:

```ts
import { buildApp } from "./build-app.js";

const app = await buildApp({ logger: envToLogger[env.NODE_ENV] });

try {
  await app.listen({ host: "0.0.0.0", port: env.PORT });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
```

5. Copie a pasta `test/` (setup + 2 testes-exemplo funcionando).
6. Crie o arquivo `.env.test` apontando para um banco de teste:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/bootcamp_treinos_test"
```

7. Aplique as migrations no banco de teste: `pnpm exec prisma migrate reset` (com `DATABASE_URL` apontando para o banco de teste — nunca para o de desenvolvimento).
8. Adicione os scripts no `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

9. Rode `pnpm test` — os testes-exemplo devem passar. A partir daí, escreva os seus.

**Detalhes do kit:**

- `vitest.config.ts` carrega `test/setup.ts` (lê `.env.test`) e aponta a cobertura para `src/**/*.ts`, com os limiares de 80%/75% comentados para você descomentar na reta final.
- O teste de integração mocka o módulo `src/lib/auth.js` — assim o 401/200 da rota `/home/:date` é testado sem instanciar o better-auth completo.
- Para testes que precisam do banco real (ex.: criar plano com 7 dias), use o Prisma contra o banco de teste e limpe os dados no `beforeEach`.

---

## 10. Como Você Será Avaliado (Rubrica)

| Critério | Peso | Onde no Relatório | Nota máxima exige | Erros comuns que derrubam a nota |
| :--- | :---: | :--- | :--- | :--- |
| **1. Rigor Metodológico e Técnicas de Caixa-Preta** | 25% | Seções 5.2 e 6 | Equivalência sem mascaramento de erros, BVA nos limites reais da API e Tabela de Decisão/FSM consistentes. | Classes inválidas misturadas (*error masking*); casos genéricos sem artefato real; fronteiras inventadas. |
| **2. Testes de Caixa-Branca e Cobertura Estrutural** | 20% | Seções 5.3, 6 e 9.2 | CFG coerente de um use case, $V(G)$ pelas três fórmulas e cobertura real ≥ 80%/75% nos módulos testados. | $V(G)$ errado; CFG desconectado do código; cobertura copiada do exemplo. |
| **3. Testes Não-Funcionais (UX e Acessibilidade)** | 15% | Seções 5.4 e 6 | Heurísticas de Nielsen inspecionadas e WCAG medida de verdade (contraste, toque, foco). | Acessibilidade só opinativa, sem medição. |
| **4. Gestão de Defeitos e Rastreabilidade** | 20% | Seções 6 (coluna RF) e 8 | Bugs com passos de reprodução, causa-raiz, correção e vínculo com CT. | Relatório sem defeitos (contradiz Myers); bug sem causa-raiz/evidência. |
| **5. Automação e Qualidade do Código de Teste** | 10% | Seções 7 e 11 (EV-01) | Mocks do Prisma/provider usados, asserções precisas, suíte executada (print anexado). | Código de teste que não compila; testes tautológicos; sem evidência. |
| **6. Organização, Clareza Técnica e Conclusão** | 10% | Seções 10, 12, 13 e 14 + documento | Markdown impecável, parecer embasado em métricas, lições sinceras. | Parecer sem base em métricas; marcadores `<...>` não substituídos. |

---

## 11. Escolha o Seu Nível

| Nível | O que você precisa fazer | Nota máxima |
| :--- | :--- | :---: |
| **Mínimo** | 4 módulos de API (autenticação, home, sessões + 1 à escolha), 12 CTs, suíte Vitest com banco de teste e as 3 evidências obrigatórias. | 7,0 |
| **Intermediário** | Nível mínimo + 2–3 CTs de UI/E2E manual do front com capturas + acessibilidade/usabilidade medidas. | 9,0 |
| **Avançado** | Nível intermediário + testes do assistente de IA com mocks do provider + E2E automatizado (Playwright/Chrome DevTools MCP) + cobertura ≥ 80%/75%. | 10,0 (+0,5 de bônus com casos de borda extras além da meta) |

---

## 12. Datas Importantes

| Data | O que acontece |
| :--- | :--- |
| **24/11 (Aula 17)** | Início do trabalho: kit de partida distribuído; ambiente de testes funcionando até o fim do encontro (D1 da trilha). |
| **01/12 (Aula 18)** | Entrega (única ou checkpoint, conforme a regra da turma): template preenchido nas Seções 1 a 10 + EV-01. |
| **10/12 (Aula 19 — N2)** | Entrega final completa (se houver checkpoint) junto da apresentação do Projeto Final. |

---

## 13. Checklist Rápido de Última Hora

- [ ] `pnpm test` passa na minha máquina (e tenho o print da execução).
- [ ] Rodei `pnpm test:coverage` e colei os meus números reais na Seção 9.
- [ ] Os 12+ CTs citam arquivos/rotas que existem no MEU projeto.
- [ ] Tenho prints de antes/depois de pelo menos 1 bug corrigido.
- [ ] Tirei 1 captura do fluxo E2E no navegador.
- [ ] Preenchi lições aprendidas e autoavaliação com sinceridade.
- [ ] Não sobrou nenhum marcador `<...>` no template.
- [ ] Se usei IA, consigo explicar cada teste do relatório.

---

## 14. Referências e Arquivos Relacionados

- Template para entrega: `relatorio_de_testes_software_academia.md` (neste diretório)
- Kit de partida: pasta `kit-testes/` (neste diretório)
- Manual de apoio com IA (Opencode + modelos gratuitos): `manual-auxiliar-opencode-ia-testes.md` (neste diretório)
- Vitest: https://vitest.dev
- Fastify (app.inject): https://fastify.dev/docs/latest/Reference/Testing
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref
