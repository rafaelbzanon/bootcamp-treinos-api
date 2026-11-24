# Configuração para o ambiente de desenvolvimento do projeto


## 1 - Instalar o gerenciador de pacotes do Node.js

>**Tip:** Baixar o NVM no site: https://github.com/nvm-sh/nvm#installing-and-updating

>**IMPORTANTE:** Usar sempre a versão LTS em produção

```
  nvm install 24
  nvm use 24
  node -v
```

## 2 - Instalar o PNPM (gerenciador de pacotes mais rápido)

No Windows, usando o PowerShell:

```
$env:PNPM_VERSION = "11.0.0-rc.2"; Invoke-WebRequest https://get.pnpm.io/install.ps1 -UseBasicParsing | Invoke-Expression
```
>**Tip:** Pode acessar o endereço https://pnpm.io/pt/next/installation para maiores informações.

## 3 - Instalar a IDE Cursor e a IA Claude
1 - Fazer o download do Cursor em: https://cursor.com/pt-BR/download
2 - Fazer o download do Claude em: https://claude.ai/login

# Início do Setup do Backend

## 4 - No terminal:
```
pnpm init
```
Instalação de dependências e pacotes:
```
pnpm add typescript@5.9.3 @types/node@24 -D 
pnpm add prettier@3.8.1 eslint@9.39.2 -D
```
## 5 - Instalar o Git e criar o arquivo .gitignore (opcional)
## 6 - Configurar o Typescript 
```
npx tsc --init
```
## 7 - Configurar o tsconfig.json
1 - criar o diretorio src/index.ts
2 - rodar o comando:
```
node dist\index.js
```
```
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {

    "module": "nodenext",
    "moduleResolution": "nodenext",
    "target": "es2024", //alterar
    "skipLibCheck": true,
    "strict": true,
    //"outDir": "./dist",
  },
  "include": ["src"],
}
```
> **IMPORTANTE:** Essa versão do arquivo tsconfig.json é a final.
## 8 - Instalar o servidor de desenvolvimento
```
pnpm add -d tsx@4.21.0
```
Roda com auto reload.
1 - Alterar package.json: "scripts"
2 - Roda alterações em arquivos alterados/salvos
3 - Fazer um comit Git
## 9 - Configurar o package.json
1 - criar o arquivo na raiz do diretorio do projeto
```
{
  "name": "bootcamp-treinos-api",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devEngines": {
    "packageManager": [
      {
        "name": "pnpm",
        "version": "^11.0.0-rc.2",
        "onFail": "download"
      },
      {
        "name": "npm"
      }
    ]
  },
  "type": "module",
  "scripts": {
    "dev": "tsx --watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "engines": {
    "node": "24.x"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/node": "24",
    "eslint": "9.39.2",
    "eslint-plugin-simple-import-sort": "12.1.1",
    "globals": "^17.5.0",
    "prettier": "3.8.1",
    "prisma": "7.4.0",
    "tsx": "4.21.0",
    "typescript": "5.9.3",
    "typescript-eslint": "^8.58.2"
  },
  "dependencies": {
    "@fastify/swagger": "9.7.0",
    "@fastify/swagger-ui": "5.2.5",
    "@prisma/adapter-pg": "7.4.0",
    "@prisma/client": "7.4.0",
    "dotenv": "17.3.1",
    "eslint-config-prettier": "10.1.8",
    "fastify": "5.7.4",
    "fastify-type-provider-zod": "6.1.0",
    "zod": "4.3.6"
  }
}

```
>**IMPORTANTE:** Versão final do arquivo package.json
## 10 - Extensões na IDE
Rodar o comando no terminal:
```
pnpm create @eslint/config@1.11.0
```
```
pnpm add eslint-config-prettier@10.1.8
```
Alterar o eslint.config.js
```
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], 
    plugins: { js
    }, 
    extends: ["js/recommended"], 
    languageOptions: { 
      globals: globals.node 
    } 
  },
  tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
]);

```
Plugin eslint-plugin-import
```
pnpm add eslint-plugin-simple-import-sort@12.1.1
```
Arruma os imports do arquivo a cada salvamento.
## 11 - Fastify
Rodar no terminal:
```
pnpm add fastify@5.7.4
```
Copiar o seguinte código no src/index.ts:
```
//console.log("Hello World");
// Import the framework and instantiate it
import "dotenv/config";

import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import Fastify from 'fastify';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import z from "zod/v4";



const app = Fastify({
  logger: true
})

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Bootcamp Treinos API',
      description: 'API para o bootcamp de treinos do FSC',
      version: '1.0.0',
    },
    servers: [{
      description: "Localhost",
      url: "http://localhost:3000",
    }],
  },
  transform: jsonSchemaTransform,
});

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
await app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
}),

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Declare a route

app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
        description: 'Hello World',
        tags: ['hello'],
        response: {
            200: z.object({
                message: z.string(),
            }),    
        },        
    },
    handler: () => {
        return { 
            message: "teste" 
        };
    },
  });



// Run the server!
//try {
//  await app.listen({ port: Number(process.env.PORT) || 3000 })
//} catch (err) {
//  app.log.error(err)
//  process.exit(1)
//}
```
Executar o ambiente:
```
pnpm run dev
```
Criamos a primeira API
## 12 - dotenv
Rodar no terminal:
```
pnpm add dotenv@17.3.1
```
Configurar o .env da raiz:
```
PORT=3000
```
## 13 - Zod
Rodar no terminal:
```
pnpm add zod@4.3.6
pnpm add fastify-type-provider-zod@6.1.0
```
>**OBS.:** Finalizamos a API
## 14 - Documentação
Rodar no terminal:
```
pnpm add @fastify/swagger@9.7.0 @fastify/swagger-ui@5.2.5
```
>**OBS.:** Esse plugin funciona de forma assincrona.
## 15 - Banco de dados relacional
No terminal, instalar o Prisma ORM:
```
pnpm add prima@7.4.0 @prisma/client@7.4.0 @prisma/adapter-pg@7.4.0
npx prisma init
pnpm aprove-builds
```
Criar as tabelas em prisma/schema.prisma
```
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id            String        @id //@default(uuid())
  workoutPlans  WorkoutPlan[]
  name          String
  email         String
  emailVerified Boolean       @default(false)
  image         String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  sessions      Session[]
  accounts      Account[]

  @@unique([email])
  @@map("user")
}

model WorkoutPlan {
  id        String   @id @default(uuid())
  name      String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  workoutDays WorkoutDay[]
}

enum WeekDay {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}

model WorkoutDay {
  id            String            @id @default(uuid())
  name          String
  workoutPlanId String
  workoutPlan   WorkoutPlan       @relation(fields: [workoutPlanId], references: [id])
  isRest        Boolean           @default(false)
  weekDay       WeekDay
  exercises     WorkoutExercise[]
  createdAt     DateTime          @default(now())
  updateAt      DateTime          @updatedAt
}

model WorkoutExercise {
  id                String     @id @default(uuid())
  name              String
  order             Int
  workoutDayId      String
  workoutDay        WorkoutDay @relation(fields: [workoutDayId], references: [id])
  sets              Int
  reps              Int
  restTimeInSeconds Int
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([token])
  @@index([userId])
  @@map("session")
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([userId])
  @@map("account")
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([identifier])
  @@map("verification")
}

```
Após criar as tabelas, rodar o comando:
```
npx prisma format
```
criar um arquivo docker-compose.yml na raiz com o conteúdo:
```
services:
  db:
    image: postgres:16-alpine
    container_name: bootcamp-treinos-db
    restart: unless-stopped # Mais seguro que 'always' para evitar loops de erro infinitos
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: bootcamp-treinos-api
    ports:
      - "127.0.0.1:5432:5432" # Acesso restrito ao localhost
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d bootcamp-treinos-api"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
    driver: local
```
>**OBS.:** É possivel utilizar o Docker Desktop. Pode ser baixado em: https://docs.docker.com/desktop/
Com o banco funcionando, alterar o arquivo .env para:
```
PORT=3000
DATABASE_URL="postgresql://postgres:password@localhost:5432/bootcamp-treinos-db"
```
Rodar o comando no terminal:
```
npx prisma db push
```
Isso vai criar as tabelas no prisma. Após isso rodar o docker e verificar as tabelas:
```
docker-compose up -d 
npx prisma studio
```
## 16 - Configurar a autenticação com BETTER-AUTH 
No terminal:
```
nvm use 24
pnpm add better-auth@1.4.21
```
Acessar a opção installation no site: https://better-auth.com/docs/installation
Seguir os passos em Set Environment Variables e colocar as variaveis de ambiente BETTER_AUTH_SECRET e BETTER_AUT_URL no .env:
```
PORT=3000
DATABASE_URL="postgresql://postgres:password@localhost:5432/bootcamp-treinos-db"
BETTER_AUTH_SECRET=Sua chave aqui
BETTER_AUTH_URL=http://localhost:3000 # Base URL do app
```
Dentro do diretório src criar lib/auth.ts e depois rodar o comando:
```
npx prisma generate
```
>**IMPORTANTE:** se rodar o comando npx prisma db push é necessário rodar o comando npx prisma generate depois.
Criar o conteúdo do arquivo auth.ts
```
import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {openAPI} from "better-auth/plugins";

import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL})

});

export const auth = betterAuth({
    trustedOrigins: ["http://localhost:3000"],
    emailAndPassword: {
      enabled: true,
    },
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    plugins: [openAPI()],
  });
```
após rodar o comando:
```
npx @better-auth/cli@1.4.21 generate
```
>**OBS.:** Yes para overwriting do arquivo do prisma.
```
npx prisma db push
```
## 17 - Integrar o Better-Auth, Fastify e Cors 
Instalar a biblioteca do Cors:
```
pnpm add @fastify/cors@11.2.0
```
Alterar o src/index.ts 
```

import "dotenv/config";

import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
//import fastifySwaggerUI from "@fastify/swagger-ui";
import fastifyApiReference from "@scalar/fastify-api-reference";
//import { fromNodeHeaders } from "better-auth/node";
import Fastify from 'fastify';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import z from "zod/v4";

import { auth } from "./lib/auth.js";



const app = Fastify({
  logger: true,
});

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Bootcamp Treinos API',
      description: 'API para o bootcamp de treinos do FSC',
      version: '1.0.0',
    },
    servers: [{
      description: "Localhost",
      url: "http://localhost:3000",
    }],
  },
  transform: jsonSchemaTransform,
});

 
//await app.register(fastifySwaggerUI, {
//  routePrefix: '/docs',
//});

await app.register(fastifyCors, {
  origin: ["http://localhost:3000"],
  credentials: true,
});

await app.register(fastifyApiReference, {
  routePrefix: "/docs",
  configuration:{
    sources: [{
      title: "Bootcamp Treinos API",
      slug: "bootcamp-treinos-api",
      url: "/swagger.json",
    },
  {
    title: "Auth API",
    slug: "auth-api",
    url: "/api/auth/open-api/generate-schema",

  },],
  },
});

app.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: "/swagger.json",
  schema: {
    hide: true,
  },
  handler: async () => {
    return app.swagger();
  }
});


app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Declare a route

app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
        description: 'Hello World',
        tags: ['hello'],
        response: {
            200: z.object({
                message: z.string(),
            }),    
        },        
    },
    handler: () => {
        return { 
            message: "teste" 
        };
    },
  });

// Register authentication endpoint
app.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  async handler(request, reply) {
    try {
      // Construct request URL
      const url = new URL(request.url, `http://${request.headers.host}`);
      
      // Convert Fastify headers to standard Headers object
      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString());
      });
      // Create Fetch API-compatible request
      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });
      // Process authentication request
      const response = await auth.handler(req);
      // Forward response to client
      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      return reply.send(response.body ? await response.text() : null);
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ 
        error: "Internal authentication error",
        code: "AUTH_FAILURE"
      });
    }
  }
});

// Run the server!
try {
 await app.listen({ port: Number(process.env.PORT) || 3000 })
} catch (err) {
 app.log.error(err)
 process.exit(1)
}
```
>**OBS.:** Verificar se o auth.ts está conforme o passo anterior.
## 18 - Usar o Scalar 
Exibe de uma maneira agradável a API criada.
```
pnpm add @scalar/fastify-api-reference@1.44.20
```
