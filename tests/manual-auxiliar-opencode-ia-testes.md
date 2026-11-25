# Manual Auxiliar — Usando o Opencode e Modelos Gratuitos de IA nos Testes do FIT.AI

> Documento de apoio ao Trabalho Final de Qualidade e Teste de Software (relatório de testes do FIT.AI, entrega 10/12/2026).
> O Opencode é um **assistente de código** open source que roda no terminal e conhece o seu projeto. Ele **não substitui o seu trabalho**: todo teste deve ser executado, validado e compreendido por você. Use-o para acelerar, revisar e aprender — nunca para gerar um relatório que você não entende.

---

## 1. Como a IA se encaixa (de forma ética) neste trabalho

O uso de IA é permitido e incentivado como **ferramenta de apoio**, desde que você:

- **Escreva/valide o código de teste no seu projeto** (a IA sugere, você executa e confirma com `pnpm test`);
- **Entenda cada caso de teste** que constar no relatório — na apresentação/arguição você pode ser questionado;
- **Use a IA para explicar, revisar e gerar rascunhos**, e não para produzir o relatório final do início ao fim;
- **Registre os números reais** da sua execução (cobertura, resultados) — nunca copie valores inventados ou de exemplos.

**Regra de bolso:** se você não conseguir explicar por que um teste existe e o que ele verifica, ele não é seu. A IA é seu par de programação, não seu autor.

---

## 2. O que é o Opencode

O Opencode (https://opencode.ai) é um agente de programação open source com interface de terminal, aplicativo desktop e versão web. Ele:

- Lê o código do seu projeto (contexto real);
- Edita arquivos e executa comandos no terminal (com sua aprovação);
- Suporta dezenas de provedores de modelos, incluindo **opções gratuitas** (seção 4);
- Lê arquivos de regras do projeto (`AGENTS.md`) — os mesmos conceitos das regras `.claude/rules` que você já usou no FIT.AI;
- Permite criar agentes especializados (ex.: um agente "QA" para testes).

---

## 3. Instalação (Windows)

Três opções (escolha uma):

**Opção A — instalador Desktop (mais simples para começar):**
Baixe o instalador em https://opencode.ai → seção Desktop → Windows x64, instale e abra o aplicativo.

**Opção B — terminal via npm (precisa de Node.js, que você já tem):**

```powershell
npm install -g @opencode/cli
```

**Opção C — binário standalone (sem npm):**
Baixe o zip Windows x64 na seção "Download a standalone CLI binary" em https://opencode.ai, extraia e adicione a pasta ao PATH do Windows.

> Gerenciadores de pacote nativos do Windows (winget/choco) ainda não são suportados; prefira as opções acima.

**Verifique a instalação:**

```powershell
opencode --version
```

---

## 4. Conectando modelos gratuitos de IA

Ao abrir o Opencode na pasta do projeto, use o comando `/models` para ver os modelos disponíveis e `/connect` para autenticar em provedores. Abaixo, as opções gratuitas mais práticas para os testes do FIT.AI:

| Opção | Custo | Como ativar | Pontos fortes | Limitações |
| :--- | :--- | :--- | :--- | :--- |
| **Modelos gratuitos do Opencode** (`opencode`/console) | Grátis | Conecte a conta OpenCode Console pelo `/connect` | Sem chave de API; integração direta | Cota/velocidade variável |
| **Google Gemini** (ex.: Gemini 2.5 Flash) | Grátis (cota generosa) | Crie chave em https://aistudio.google.com (Get API Key) e conecte o provedor Google no `/connect` | Muito bom em português; você já usa o Google para o login do FIT.AI | Limite de requisições/minuto na camada gratuita |
| **Groq** (ex.: Llama 3.3 70B) | Grátis (cota generosa) | Chave em https://console.groq.com e conecte o provedor Groq | Extremamente rápido; ótimo para rodar vários testes | Modelos não são os mais fortes em raciocínio longo |
| **OpenRouter — modelos `:free`** | Grátis | Conta em https://openrouter.ai, chave e provedor OpenRouter | Muitos modelos de teste (DeepSeek, Llama etc.) | Modelos gratuitos variam de qualidade |
| **Ollama (local)** | Grátis, sem internet | Instale o Ollama e baixe um modelo (seção 5) | Privacidade total, sem cota, funciona offline | Exige RAM razoável (8 GB+) e o modelo roda no seu PC |

**Configuração via arquivo (`opencode.json` na raiz do projeto):** alternativamente ao `/connect`, você pode declarar os provedores no arquivo. Nunca escreva a chave diretamente no arquivo — use variável de ambiente (`{env:...}`):

```jsonc
// opencode.json — exemplo com Groq (OpenAI-compatible) + Ollama local
{
  "$schema": "https://opencode.ai/config.json",
  "model": "groq/llama-3.3-70b-versatile",
  "providers": {
    "groq": {
      "settings": {
        "apiKey": "{env:GROQ_API_KEY}"
      }
    },
    "ollama": {}
  }
}
```

Depois defina a variável no Windows (PowerShell, na sessão antes de abrir o Opencode):

```powershell
$env:GROQ_API_KEY = "sua-chave-aqui"
```

> Dica: confirme os IDs exatos dos modelos pela lista do `/models` (os catálogos mudam com frequência). Nunca comite `opencode.json` com chaves; o padrão `{env:...}` já protege você.

---

## 5. Opção local: Ollama (100% grátis, sem cota)

1. Baixe e instale o Ollama em https://ollama.com (Windows).
2. Baixe um modelo bom para código (o `qwen2.5-coder` é excelente em testes):

```powershell
ollama pull qwen2.5-coder:7b
```

3. Abra o Opencode no projeto: ele **detecta o Ollama automaticamente**. Use `/models` e escolha `ollama/qwen2.5-coder:7b`.

Outros modelos úteis para testes: `llama3.1:8b`, `gemma3:4b`, `deepseek-r1:7b` (raciocínio, mais lento). Se o PC tiver 16 GB de RAM, pode usar versões `:14b`.

---

## 6. Primeiros passos no Opencode (TUI)

Abra o Opencode dentro da pasta do backend ou do front:

```powershell
cd bootcamp-treinos-api
opencode
```

Comandos úteis na interface de terminal:

| Comando | O que faz |
| :--- | :--- |
| `/help` | Lista os comandos disponíveis |
| `/init` | Analisa o projeto e cria um `AGENTS.md` inicial |
| `/models` | Troca o modelo da sessão |
| `/connect` | Conecta/autentica provedores (Google, Groq, OpenRouter...) |
| `/agents` | Seleciona o agente (Build, Plan, Explore, General) |
| `/compact` | Resume a conversa para liberar contexto |

**Agentes embutidos úteis para o trabalho de testes:**

- **Build** (padrão): o agente de código — escreve arquivos e roda comandos;
- **Plan**: planeja antes de executar (use quando quiser discutir a estratégia de teste sem alterar arquivos);
- **Explore**: pesquisa o código sem editar nada — ótimo para perguntar "onde fica a validação do bodyFatPercentage?";
- **General**: tarefas de pesquisa em várias etapas.

**Para execuções pontuais sem abrir a interface:**

```powershell
opencode run "Explique o que o use case StartWorkoutSession valida, com os caminhos de erro"
```

---

## 7. Fluxo recomendado: usando o Opencode na trilha de 5 dias

| Dia da trilha | Onde a IA ajuda | O que VOCÊ faz (não delegue) |
| :--- | :--- | :--- |
| **D1 — setup + unidade** | Instalar/configurar o Vitest; escrever o esqueleto dos testes de unidade com mocks do Prisma | Rodar `pnpm test` e conferir cada asserção; ajustar mocks |
| **D2 — integração** | Escrever testes `app.inject` (401, home, `/me`); sugerir massa com faker | Preparar o banco de teste (`.env.test`); executar e interpretar falhas |
| **D3 — cobertura + bugs** | Explicar por que um teste falha; sugerir casos de borda (BVA); ajudar a redigir a ficha de bug | Rodar `pnpm test:coverage`; registrar números reais; corrigir o código |
| **D4 — E2E manual + não-funcionais** | Gerar um roteiro de cliques (login → home → iniciar treino); lembrar critérios WCAG a medir | Executar no navegador e tirar os prints (EV-02) |
| **D5 — relatório** | Revisar uma seção que você escreveu; apontar inconsistências entre Seções 6, 8 e 9 | Escrever o relatório; conferir que tudo bate com os seus números |

**Boas práticas com o agente:**

- Dê **contexto de arquivos**: "olhe `src/usecases/StartWorkoutSession.ts` e escreva um teste..." (o agente já lê o projeto, mas ser específico melhora o resultado).
- Peça para ele **rodar os comandos**: "execute `pnpm test` e corrija o que falhar".
- Exija **asserções precisas**: "não use testes tautológicos; cada teste deve verificar comportamento real".
- **Revise o diff** antes de aceitar: o agente sugere, você decide.
- Ao final de uma sessão boa, peça um **resumo** ("resuma o que foi feito e o que falta testar") para usar na Seção 12 (Lições Aprendidas).

---

## 8. Prompts prontos para copiar e colar

Use os prompts abaixo no Opencode, **adaptando os caminhos ao seu projeto**. Rode sempre os testes depois para confirmar.

**1. Configurar o Vitest no backend**

```text
Instale vitest e @vitest/coverage-v8 como devDependencies deste projeto
e crie um vitest.config.ts básico para testes em TypeScript ESM,
com cobertura v8 apontando para src/ e setup file test/setup.ts
que carrega o arquivo .env.test via dotenv. Não escreva chaves nos arquivos.
```

**2. Teste de unidade de um use case (caixa-branca)**

```text
Leia src/usecases/StartWorkoutSession.ts. Escreva um teste de unidade
com vitest que faça mock do Prisma (vi.mock de ../lib/db.js) e cubra
todos os caminhos de erro do execute(): plano inexistente, plano de
outro usuário, plano inativo, dia inexistente e sessão já iniciada.
Inclua também o caminho feliz. Use AAA e asserções com rejects.
Depois rode pnpm test e corrija o que falhar.
```

**3. Teste de integração de rota (401)**

```text
Leia src/routes/home.ts e o kit de testes existente. Escreva um teste
de integração usando buildApp() e app.inject que verifique: (1) GET
/home/2026-11-23 sem sessão responde 401 com { error, code };
(2) com sessão mockada responde 200 e contém workoutStreak e
consistencyByDay. Mock do better-auth: vi.mock de ../lib/auth.js.
Rode pnpm test ao final.
```

**4. Casos de borda para BVA**

```text
Baseado nos schemas de src/schemas/index.ts (UpsertUserTrainDataBodySchema
e StatsQuerySchema), liste casos de valor limite para bodyFatPercentage
(0, 100, 101, -1), weightInGrams (-1, 0, 1) e datas (formato ISO e datas
inexistentes). Para cada caso, diga qual status HTTP o Zod deve retornar.
```

**5. Explicar uma falha (aprendizado)**

```text
Execute pnpm test. O teste X falhou com o erro abaixo. Explique a causa
provável, como reproduzir manualmente e sugira 2 correções, da mais
simples para a mais robusta. Não edite arquivos ainda.

<cole aqui o erro do terminal>
```

**6. Gerar ficha de bug (Seção 8 do relatório)**

```text
Monte um rascunho de ficha de bug para o defeito que descrevo, no
formato: título, severidade/prioridade, passos para reprodução,
comportamento observado, comportamento esperado, causa-raiz e ação
corretiva. Seja objetivo e técnico.

<descreva o defeito com detalhes>
```

**7. Revisar uma seção do relatório (sem escrever por você)**

```text
Revise o texto abaixo do meu relatório de testes procurando:
inconsistências entre números, casos de teste sem artefato identificado
e afirmações sem evidência. Liste os problemas em ordem de gravidade
com sugestões. Não reescreva o texto; apenas aponte.

<cole a seção>
```

**8. Roteiro de E2E manual (evidência EV-02)**

```text
Crie um roteiro de teste manual de 10 a 12 passos para validar o fluxo
login com Google -> home -> iniciar treino -> marcar como concluído,
no frontend Next.js (localhost:3000) com a API em 8080. Para cada passo,
indique o que deve aparecer na tela e o que registrar como evidência.
```

---

## 9. Personalização: um agente "QA" para o seu projeto

Você pode criar um agente especializado em testes. Crie o arquivo `.opencode/agents/qa.md` na raiz do projeto:

```markdown
---
description: Especialista em testes do FIT.AI (Vitest, Fastify app.inject, WCAG)
mode: subagent
---

Você é um engenheiro de QA focado no projeto FIT.AI.

Regras:
- SEMPRE execute pnpm test após editar qualquer arquivo de teste ou código.
- Use mocks do Prisma em testes de unidade; nunca toque no banco de desenvolvimento.
- Use app.inject para testes de integração; não suba o servidor real.
- Cada teste deve ter nome descritivo em pt-BR e seguir o padrão AAA.
- Nunca escreva chaves de API ou segredos em arquivos do projeto.
```

Depois, no Build, peça: *"Use o agente qa para revisar os testes de src/usecases e sugerir casos faltantes."*

Você também pode criar um `AGENTS.md` na raiz do backend com as convenções de teste do projeto (comandos, banco de teste, regras de mock) — o Opencode o lê automaticamente em toda sessão, como as regras do Claude Code que você já usou.

---

## 10. Limites, custos e cuidados

- **Cotas gratuitas variam**: Gemini/Groq têm limites por minuto/dia. Para a semana de entrega, intercale provedores ou use o Ollama local.
- **A IA erra**: códigos de teste sugeridos podem não compilar, mocks podem estar errados, e a IA pode "inventar" APIs. **A única verdade é o `pnpm test`.** Nunca coloque no relatório um resultado que você não executou.
- **Não cole segredos em prompts**: chaves de API, `DATABASE_URL`, `.env` inteiro — o modelo não precisa disso. Para bancos, use variáveis de ambiente e o `.env.test`.
- **Revise o que o agente edita**: use git (`git diff`) antes de aceitar mudanças grandes; faça commits pequenos e frequentes (Conventional Commits).
- **Ética acadêmica**: o relatório deve refletir o seu trabalho executado. A IA pode revisar, sugerir e explicar — mas os resultados, as evidências e o entendimento são seus. Na dúvida, anote no relatório onde a IA ajudou (Seção 12) — transparência é valorizada.

---

## 11. Referências

- Opencode (site e documentação): https://opencode.ai e https://opencode.ai/docs
- Modelos e provedores: https://models.dev
- Google AI Studio (chave Gemini gratuita): https://aistudio.google.com
- Groq (chave gratuita): https://console.groq.com
- OpenRouter: https://openrouter.ai
- Ollama (modelos locais): https://ollama.com
- Vitest: https://vitest.dev
- Guia do trabalho: `relatorio-de-testes-guia-modelo.md` e template `relatorio_de_testes_software_academia.md` (neste diretório)
- Kit de partida de testes: pasta `kit-testes/` (neste diretório)

---
