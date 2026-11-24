### Papel
Atue como um Engenheiro de DevOps e Desenvolvedor Sênior especializado em auditoria e configuração de ambientes de desenvolvimento em Node.js e TypeScript.

### Objetivo
Auditar, validar e corrigir o setup do projeto atual, garantindo **conformidade funcional** com a documentação de referência: o ambiente deve seguir as referências sempre que elas forem coerentes entre si e com o código, e só desviar delas quando necessário para o projeto funcionar. Todo desvio deve constar em "Desvios aprovados".

### Fontes de Referência (em ordem de precedência)
1. Código atual do repositório (`src/`, `prisma/schema.prisma`): define as dependências realmente necessárias.
2. @guia-setup-ambiente-bootcamp-treinos.md, **seções 1 a 6 (até "6. Passo 5", inclusive)**: ferramentas da máquina e versões.
3. @Configuracao_projeto_dev_movel_final.md: arquivos de configuração do projeto (`package.json`, `tsconfig.json`, `eslint.config.js`, `docker-compose.yml`, `.env`).
4. Arquivos de configuração atuais do repositório.

Em caso de conflito, prevalece a fonte de número menor. Se o conflito não puder ser resolvido por essa ordem, aponte-o e pergunte antes de decidir.

### Escopo
- **Incluído:** Node, pnpm/Corepack, Docker, VS Code e extensões; `package.json`, `.npmrc`, `.nvmrc`, `.gitignore`, `.vscode/settings.json`, `tsconfig.json`, `eslint.config.js`, `prisma.config.ts`, `docker-compose.yml`, `.env` (somente `PORT`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` e as chaves exigidas pelo código, que podem ficar vazias); `prisma generate`.
- **Fora do escopo:** migrations e `prisma db push` (podem apagar dados do banco existente), credenciais do Google OAuth, integração com IA, front-end, código em `src/`.
- O Passo 5 do guia ("extrair o snapshot aula-NN") não se aplica: o código já está no repositório. Considere apenas o `pnpm install` e o `prisma generate`.

### Diretrizes de Execução
1. **Auditoria inicial:** inspecione a máquina e o projeto e compare-os com as referências. Identifique divergências, dependências ausentes, erros de setup e conflitos entre as próprias referências.
2. **Correção controlada:**
   - Proponha as correções em uma lista **que detalhe cada arquivo e cada versão** que será criada ou alterada, incluindo qualquer item que não venha das referências.
   - **Regra crítica:** nenhuma alteração em arquivos de configuração ou código antes de ser apresentada e autorizada por mim. Um detalhe que não estiver na lista aprovada exige nova aprovação.
   - Nunca altere containers, volumes ou o banco de dados existentes sem autorização.
3. **Validação:** após a autorização, aplique as mudanças e execute todos os comandos abaixo, que devem terminar sem erro:
   ```bash
   node -v                       # 24.x
   pnpm -v                       # 10.30.0
   docker compose version
   pnpm install --frozen-lockfile   # ou pnpm install, se ainda não houver lockfile
   pnpm exec prisma generate
   pnpm exec tsc --noEmit
   pnpm exec eslint .
   pnpm build
   pnpm dev                      # e então:
   #   GET  /                 → 200
   #   GET  /docs/            → 200
   #   GET  /swagger.json     → OpenAPI válido
   #   GET  /api/auth/ok      → 200
   #   POST /workout-plans/   sem sessão → 401
   ```
   O projeto não tem suíte de testes automatizados. Não declare que "testes passaram"; informe o resultado de cada comando acima.

### Desvios aprovados das referências
Estes desvios já foram autorizados e não devem ser revertidos:

| Item | Referência diz | Adotado | Motivo |
| --- | --- | --- | --- |
| pnpm | `11.0.0-rc.2` via `devEngines` (Configuração) | `packageManager: pnpm@10.30.0` | Versão do guia, já instalada via Corepack |
| `better-auth` | `1.4.21` (Configuração) | `1.4.18` | Versão do guia |
| Dependências | `package.json` "final" sem `@fastify/cors`, `@scalar/fastify-api-reference`, `better-auth`, `dayjs` | Incluídas | O código as importa (`dayjs` é exigido pelas regras do projeto) |
| `@fastify/swagger-ui` | Listado | Removido | Substituído pelo Scalar no código |
| `@eslint/js` | `^10.0.1` | `9.39.2` | Compatível com `eslint@9.39.2` |
| `eslint-config-prettier` | `dependencies` | `devDependencies` | Ferramenta de desenvolvimento |
| `pnpm.onlyBuiltDependencies` | Ausente (o guia usa `pnpm approve-builds`) | `@prisma/engines`, `esbuild`, `prisma` | Evita a aprovação interativa de builds |
| Script `lint` | Ausente | `eslint .` | Atalho para a validação |
| `tsconfig.json` `outDir` | Comentado | `./dist` | Necessário para `pnpm build` e `pnpm start` |
| `eslint.config.js` | Sem `ignores` | Ignora `dist/**` e `src/generated/**` | Evita lint do código gerado |
| `docker-compose.yml` | Serviço `db`, container `bootcamp-treinos-db` (Configuração) | Serviço `postgres`, container `bootcamp-treinos-api-postgres`, porta `127.0.0.1:5432`, healthcheck | Nomes do guia (coincidem com o container existente); a porta e o healthcheck vêm do Configuração |
| `DATABASE_URL` | Banco `bootcamp-treinos-db` | Banco `bootcamp-treinos-api-dev` (no mesmo container) | O banco `bootcamp-treinos-api` foi criado por outra cópia do projeto e está fora de sincronia com o schema; o `-dev` foi criado com `db push` |
| `prisma.config.ts` | Seção 11 do guia (fora do recorte) | Incluído | Obrigatório: o `schema.prisma` não define `url` |
| `.env` | Sem chaves do Google | `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` vazias | Lidas por `src/lib/auth.ts`; preenchimento fora do escopo |

### Relatório Final
Apresente um resumo estruturado contendo:
- **Status do Setup:** exatamente um entre Completo / Incompleto / Com Pendências.
- **Diagnóstico:** o que estava incorreto ou ausente, incluindo conflitos encontrados nas referências.
- **Ações Realizadas/Propostas:** alterações efetuadas ou aguardando aprovação, e novos desvios (que devem ser adicionados à tabela acima).
- **Validação:** o resultado de cada comando da seção Validação.
