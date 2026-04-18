# GameBoxd

> Uma plataforma social para catalogar, avaliar e descobrir jogos.

GameBoxd é uma aplicação web inspirada no Letterboxd, mas voltada para o universo dos videogames. Permite que usuários descubram jogos, registrem o que estão jogando, deixem avaliações, criem listas personalizadas e acompanhem seu histórico de jogatina — tudo integrado com a base de dados da [RAWG API](https://rawg.io/).

---

## Tecnologias

**Backend**
- Node.js + Express 5
- TypeScript
- Prisma ORM + PostgreSQL (Neon DB)
- Redis (IORedis) — caching de requisições à RAWG API
- JWT — autenticação stateless
- bcryptjs — hash de senhas
- Nodemailer — envio de e-mails (recuperação de senha)
- Multer — upload de avatares
- Vitest + Supertest — testes unitários e de integração

**Frontend**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI

---

## Funcionalidades

- [x] Cadastro e login de usuários com autenticação via JWT
- [x] Edição de perfil (nome, bio, avatar)
- [x] Recuperação de senha por e-mail
- [x] Catálogo de jogos integrado à RAWG API
- [x] Busca por nome, gênero e plataforma
- [x] Página de detalhes de cada jogo
- [x] Avaliação de jogos com nota (0–10) e comentário
- [x] Marcação de status por jogo: Jogando, Zerado ou Quero Jogar
- [x] Curtida de jogos
- [x] Criação de listas personalizadas (pública ou privada)
- [x] Seções de jogos em destaque, recentes e em alta na home

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- Banco de dados PostgreSQL (local ou [Neon DB](https://neon.tech/))
- Instância Redis (local ou [Upstash](https://upstash.com/))
- Chave de API RAWG — obtenha gratuitamente em [rawg.io/apidocs](https://rawg.io/apidocs)
- Conta Gmail com [App Password](https://support.google.com/accounts/answer/185833) habilitado (para envio de e-mails)

---

## Como rodar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/GameBoxd.git
cd GameBoxd
```

---

### Backend

#### 2. Instale as dependências

```bash
cd backend
npm install
```

#### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` dentro de `backend/` com base no exemplo abaixo:

```env
# Banco de dados
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# JWT
JWT_SECRET="sua_chave_secreta_aqui"
JWT_EXPIRES_IN="7d"

# RAWG API
RAWG_API_KEY="sua_rawg_api_key"

# Redis
REDIS_URL="redis://localhost:6379"

# E-mail (Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="seu@gmail.com"
SMTP_PASS="sua_app_password"
SMTP_FROM="GameBoxd <seu@gmail.com>"

# URLs
FRONTEND_URL="http://localhost:3000"
CORS_ORIGINS="http://localhost:3000"
```

#### 4. Execute as migrations do banco

```bash
npx prisma migrate deploy
```

#### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

O backend estará disponível em `http://localhost:3001`.

---

### Frontend

#### 6. Instale as dependências

```bash
cd ../frontend
npm install
```

#### 7. Configure as variáveis de ambiente

Crie um arquivo `.env.local` dentro de `frontend/` com base no exemplo abaixo:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
REDIS_URL="redis://localhost:6379"
```

#### 8. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:3000`.

---

## Scripts disponíveis

### Backend (`/backend`)

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor em modo desenvolvimento |
| `npm run build` | Compila o TypeScript para JavaScript |
| `npm start` | Inicia o servidor a partir do build |
| `npm test` | Roda todos os testes com Vitest |
| `npm run test:unit` | Roda apenas testes unitários |
| `npm run test:integration` | Roda apenas testes de integração |
| `npm run test:coverage` | Gera relatório de cobertura |

### Frontend (`/frontend`)

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor Next.js em modo desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm start` | Inicia o servidor Next.js em produção |
| `npm run lint` | Executa o ESLint |

---

## Estrutura de pastas

```
GameBoxd/
├── backend/
│   ├── prisma/              # Schema e migrations do banco de dados
│   ├── uploads/             # Avatares enviados pelos usuários
│   └── src/
│       ├── controllers/     # Lógica de entrada e saída das rotas
│       ├── services/        # Regras de negócio
│       ├── routes/          # Definição dos endpoints
│       ├── middlewares/     # Autenticação e validações
│       ├── models/          # Tipos e interfaces
│       ├── lib/             # Clientes de banco, Redis e e-mail
│       ├── utils/           # Funções auxiliares
│       ├── __tests__/       # Testes unitários e de integração
│       └── server.ts        # Entry point do servidor
│
└── frontend/
    └── src/
        ├── app/             # Rotas e páginas (Next.js App Router)
        │   ├── games/
        │   ├── lists/
        │   ├── profile/
        │   ├── login/
        │   ├── register/
        │   ├── forgot-password/
        │   └── reset-password/
        ├── components/      # Componentes reutilizáveis
        │   ├── auth/
        │   ├── games/
        │   ├── lists/
        │   ├── profile/
        │   ├── nav/
        │   └── ui/
        ├── services/        # Chamadas à API do backend
        ├── hooks/           # Custom hooks React
        ├── lib/             # Utilitários e configurações
        └── types/           # Tipos TypeScript globais
```

---

## Como contribuir

1. Faça um fork do repositório
2. Crie uma branch para sua feature: `git checkout -b feat/minha-feature`
3. Faça commit das suas alterações: `git commit -m 'feat: adiciona minha feature'`
4. Envie para o seu fork: `git push origin feat/minha-feature`
5. Abra um Pull Request descrevendo as mudanças

---

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
