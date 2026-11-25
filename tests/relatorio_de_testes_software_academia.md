# Relatório Final de Testes de Software: FIT.AI

**Componente Curricular**: Qualidade e Teste de Software (VER-QTS001)
**Projeto Integrado**: Programação para Dispositivos Móveis
**Curso**: Tecnologia em Análise e Desenvolvimento de Sistemas (TADS)
**Instituição**: Instituto Federal de Educação, Ciência e Tecnologia do Rio Grande do Sul (IFRS) — Campus Veranópolis
**Docente Responsável**: Prof. Me. Lucas Miguel Hallmann
**Semestre Letivo**: 2026.2

---

> **COMO USAR ESTE TEMPLATE**
> - Substitua todo marcador `<preencher>` pelos seus dados e apague as linhas de orientação em *itálico* antes de entregar.
> - Mínimos obrigatórios: **12 casos de teste** (com RF e artefato preenchidos), **2 a 3 defeitos reais** e as **3 evidências obrigatórias** (Seção 11).
> - Prioridade de nota: casos de teste + defeitos valem **65% da rubrica** — comece por eles (Seções 6 e 8).
> - O guia `relatorio-de-testes-guia-modelo.md` traz exemplos prontos, a rubrica completa e a trilha de execução.

---

## 1. Identificação do Projeto e Metadados de Execução

| Campo de Identificação | Detalhamento do Registro |
| :--- | :--- |
| **Nome da Aplicação** | FIT.AI (Sistema de Gestão e Prescrição Inteligente de Treinos — Bootcamp Treinos) |
| **Arquitetura** | Front-end Next.js 16 / React 19 + API Fastify 5 / TypeScript / Prisma 7 / PostgreSQL 16 / better-auth |
| **Estudante / Desenvolvedor** | `<seu nome>` |
| **Repositórios** | `<URL do front-end>` e `<URL do back-end>` |
| **Branch / Commit Testado** | `<branch>` / `<hash do commit>` |
| **Período de Homologação e Testes** | `<data de início e fim>` |
| **Versão da Suíte de Testes** | `<ex.: v1.0.0 — Vitest + app.inject>` |

---

## 2. Sumário Executivo e Objetivos da Avaliação

*Escreva um parágrafo respondendo: o que foi avaliado (quais módulos do FIT.AI), com qual objetivo (conformidade funcional, qualidade de código, usabilidade/acessibilidade) e sob qual abordagem (pirâmide de testes: unidade → integração → UI).*

`<texto>`

---

## 3. Escopo dos Testes

### 3.1. Funcionalidades Incluídas no Escopo (Testadas)

*Obrigatórios: autenticação, home/consistência e sessões de treino + pelo menos 1 módulo à sua escolha (dados do usuário, estatísticas, assistente de IA ou interface do front).*

- `<módulo testado>`
- `<módulo testado>`

### 3.2. Funcionalidades Excluídas e Limitações do Escopo (Não Testadas)

*Liste o que não foi testado e justifique em uma frase cada item.*

- `<exclusão e justificativa>`

---

## 4. Ambiente, Dispositivos e Ferramentas de Teste

### 4.1. Matriz de Ambientes de Execução

| Identificador | Tipo de Ambiente | Dispositivo / Navegador | SO / Browser | Viewport / Resolução | Modo de Conexão |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ENV-01** | `<físico/emulado>` | `<...>` | `<...>` | `<...>` | `<...>` |
| **ENV-02** | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` |

### 4.2. Ferramentas e Frameworks Utilizados

- `<ex.: Vitest + cobertura v8, app.inject do Fastify, PostgreSQL de teste via Docker, faker, Chrome DevTools MCP, ESLint, tsc>`

---

## 5. Estratégia e Metodologia de Teste Aplicada

### 5.1. Distribuição da Pirâmide de Testes

*Indique a proporção usada (ex.: 60% unidade, 25% integração, 15% UI) e justifique em 2 linhas.*

`<...>`

### 5.2. Técnicas Funcionais (Caixa-Preta)

- **Classes de Equivalência**: `<o que particionou (ex.: datas válidas × inválidas)>`
- **Análise de Valor Limite (BVA)**: `<fronteiras testadas (ex.: bodyFatPercentage 0/100/101)>`
- **Tabelas de Decisão e/ou Transição de Estados (FSM)**: `<regra modelada (ex.: botões da tela do dia; ciclo de vida da WorkoutSession)>`

### 5.3. Técnicas Estruturais (Caixa-Branca)

- **CFG e Complexidade Ciclomática**: `<método analisado, V(G) calculado pelas fórmulas>`
- **Cobertura dinâmica**: `<metas C0/C1 usadas>`

### 5.4. Características Não-Funcionais

- **Usabilidade (ISO 9241-11 / Nielsen)**: `<heurísticas inspecionadas>`
- **Acessibilidade (WCAG 2.1 AA)**: `<contraste, área de toque, navegação por teclado>`

---

## 6. Planejamento e Execução dos Casos de Teste

*Regras: mínimo de 12 casos; cada linha deve preencher RF, técnica e artefato (arquivo ou rota real); no mínimo 1 caso de cada técnica — equivalência, BVA, tabela de decisão ou FSM, caixa-branca com McCabe e 1 não-funcional.*

| ID Caso | RF | Módulo | Técnica | Nível | Cenário e Entradas | Resultado Esperado | Resultado Obtido | Artefato Testado | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CT-01** | `<RF>` | `<...>` | `<...>` | `<unidade/integração/UI>` | `<...>` | `<...>` | `<...>` | `<...>` | `<Passou/FALHOU>` |
| **CT-02** | `<RF>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` |
| **CT-03** | `<RF>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` |
| **CT-04** | `<RF>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` |
| **CT-05** | `<RF>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` |
| **CT-06** | `<RF>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` |
| **CT-07** | `<RF>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` |
| **CT-08** | `<RF>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` |
| **CT-09** | `<RF>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` |
| **CT-10** | `<RF>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` |
| **CT-11** | `<RF>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` |
| **CT-12** | `<RF>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` |

---

## 7. Evidências de Código de Teste Automatizado

*Cole o código de teste que você realmente escreveu e executou (não o exemplo do guia).*

### 7.1. Teste de Unidade (Vitest)

```typescript
<cole seu código>
```

### 7.2. Teste de Integração de Rota (app.inject)

```typescript
<cole seu código>
```

### 7.3. Cenário de Aceitação (Gherkin)

```gherkin
<cole 1 cenário>
```

---

## 8. Registro e Gestão de Defeitos Encontrados (Bug Tracking)

### 8.1. Tabela Consolidada de Anomalias

| ID Bug | Severidade | Prioridade | Módulo Afetado | Caso de Teste | Resumo do Defeito | Status Atual |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-01** | `<...>` | `<...>` | `<...>` | `<CT>` | `<...>` | `<...>` |
| **BUG-02** | `<...>` | `<...>` | `<...>` | `<CT>` | `<...>` | `<...>` |
| **BUG-03** | `<...>` | `<...>` | `<...>` | `<CT>` | `<...>` | `<...>` |

### 8.2. Ficha Detalhada do Defeito Crítico

- **Identificador / Título**: `<...>`
- **Severidade / Prioridade**: `<...>`
- **Ambiente de Ocorrência**: `<...>`
- **Passos para Reprodução**: `1. ... 2. ... 3. ...`
- **Comportamento Observado**: `<...>`
- **Comportamento Esperado**: `<...>`
- **Causa-Raiz Técnica**: `<...>`
- **Ação Corretiva Implementada**: `<...>`
- **Evidência**: `<link/print na Seção 11>`

---

## 9. Métricas Consolidadas de Qualidade e Cobertura

*Preencha com os números reais da sua execução (`pnpm vitest run --coverage`).*

### 9.1. Indicadores Globais de Execução

| Métrica | Valor Apurado | Meta | Conformidade |
| :--- | :--- | :--- | :--- |
| **Total de Casos Executados** | `<N>` | Mínimo 12 | `<...>` |
| **Passed / Failed** | `<N / N>` | 0 críticos abertos | `<...>` |
| **Pass Rate pós-estabilização** | `<%>` | ≥ 90% | `<...>` |
| **Tempo da Suíte Automatizada** | `<s>` | ≤ 10 s | `<...>` |

### 9.2. Cobertura Estrutural (C0/C1)

| Módulo (arquivo) | Declarações | Linhas Não Executadas | Ramos | Ramos Não Cobertos | Cobertura |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `<arquivo>` | `<n>` | `<n>` | `<n>` | `<n>` | `<%>` |
| **TOTAL** | `<n>` | `<n>` | `<n>` | `<n>` | `<%>` |

- **Cobertura de Instruções ($C_0$)**: `<%>` (meta 80%)
- **Cobertura de Ramos ($C_1$)**: `<%>` (meta 75%)
- **Complexidade Ciclomática do caso crítico**: $V(G) = <n>$
- **DRE (Pressman)**: $\frac{E}{E+D} = <valor>$

---

## 10. Parecer Técnico Final e Decisão de Homologação

> **Parecer**: `<APROVADO / APROVADO COM RESSALVAS / REPROVADO>`
> **Classificação de Liberação**: `<vX.Y.Z>`

1. **Correção dos Defeitos Críticos**: `<...>`
2. **Qualidade Estrutural**: `<...>`
3. **Pendências**: `<...>`

---

## 11. Apêndice de Evidências Obrigatórias

| ID | Item | Obrigatório? | Onde Anexar | Status |
| :--- | :--- | :--- | :--- | :--- |
| **EV-01** | Prints da execução da suíte e do relatório de cobertura (`pnpm vitest run` e `pnpm vitest run --coverage`) | Sim | `<colar/limpar>` | `<ok/pendente>` |
| **EV-02** | Captura de 1 fluxo E2E manual no navegador (ex.: login → home → iniciar treino) | Sim | `<colar/limpar>` | `<ok/pendente>` |
| **EV-03** | Antes/depois de pelo menos 1 bug corrigido | Sim | `<colar/limpar>` | `<ok/pendente>` |
| **EV-04** | Saída da execução do cenário Gherkin | Não (bônus) | `<colar/limpar>` | `<opcional>` |
| **EV-05** | E2E automatizado (Playwright / Chrome DevTools MCP) | Não (bônus) | `<colar/limpar>` | `<opcional>` |

---

## 12. Lições Aprendidas (Reflexão Individual)

**O que os testes revelaram de surpreendente?**
`<...>`

**O que eu faria diferente?**
`<...>`

**Minha principal contribuição neste trabalho:**
`<...>`

---

## 13. Checklist de Entrega Mínima

- [ ] 12 ou mais casos de teste próprios, com RF e artefato preenchidos.
- [ ] Pelo menos 1 caso de cada técnica (equivalência, BVA, tabela/FSM, caixa-branca, não-funcional).
- [ ] 2 a 3 defeitos reais com reprodução, causa-raiz e correção.
- [ ] Evidências EV-01 a EV-03 anexadas.
- [ ] Métricas da Seção 9 preenchidas com os meus números reais.
- [ ] Parecer (Seção 10) embasado nas métricas.
- [ ] Lições aprendidas (Seção 12) e autoavaliação (Seção 14) preenchidas.
- [ ] Nenhum marcador `<...>` restante; linhas de orientação em *itálico* removidas.

---

## 14. Autoavaliação Pré-Entrega

| Critério da Rubrica | Minha Nota (0–10) | Justificativa em uma frase |
| :--- | :---: | :--- |
| 1. Rigor Metodológico e Técnicas de Caixa-Preta | `<n>` | `<...>` |
| 2. Testes de Caixa-Branca e Cobertura Estrutural | `<n>` | `<...>` |
| 3. Testes Não-Funcionais (UX e Acessibilidade) | `<n>` | `<...>` |
| 4. Gestão de Defeitos e Rastreabilidade | `<n>` | `<...>` |
| 5. Automação e Qualidade do Código de Teste | `<n>` | `<...>` |
| 6. Organização, Clareza Técnica e Conclusão | `<n>` | `<...>` |
