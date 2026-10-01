# ROOV

Plataforma de descoberta de experiências. Repositório único com o frontend
web e a API, cada um independente.

```
roov/
├── web/              Frontend React + Vite
├── api/              API NestJS + Prisma + PostgreSQL
└── docs/             Documentação de produto e decisões técnicas
```

Não é mais um monorepo com workspace (ver `docs/EMENDA-003-REPO-UNICO-SEM-WORKSPACE.md`):
`web/` e `api/` são duas pastas irmãs, cada uma com seu próprio `package.json`
e `package-lock.json`, sem nenhuma ferramenta linkando uma na outra. Rodar
qualquer uma delas é só entrar na pasta e usar `npm` normalmente.

## Requisitos

- Node.js 22+
- Uma URL de Postgres com a extensão PostGIS habilitada (gerenciado, Supabase
  ou Neon, ou local, se você tiver Docker)

## Primeira execução

```bash
# Frontend
cd web
npm install
npm run dev                       # http://localhost:5173

# API (outro terminal)
cd api
npm install
cp .env.example .env              # preencha DATABASE_URL e DIRECT_URL
openssl rand -base64 48           # cole o resultado em JWT_SECRET
npm run db:migrate                # aplica as migrations
npm run dev                       # http://localhost:3000/v1/health
```

## Comandos

Dentro de `web/` ou `api/`:

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Modo watch |
| `npm run build` | Build de produção |
| `npm test` | Testes (só existe em `api/` por enquanto) |

Só em `api/`:

| Comando | O que faz |
| --- | --- |
| `npm run db:migrate` | Cria e aplica migration em desenvolvimento |
| `npm run db:studio` | Interface visual do banco |

## Rotas

Todas ficam sob `/v1`. Por padrão **toda rota exige autenticação**; as marcadas
como públicas são exceções explícitas via `@Public()`.

| Método | Rota | Público | O que faz |
| --- | --- | --- | --- |
| `GET` | `/health` | sim | Estado da API e do banco |
| `POST` | `/auth/register` | sim | Cadastro. Devolve sessão |
| `POST` | `/auth/login` | sim | Login. Devolve sessão |
| `POST` | `/auth/refresh` | sim | Renova a sessão, rotacionando o refresh token |
| `POST` | `/auth/logout` | sim | Revoga a sessão apresentada |
| `GET` | `/auth/me` | **não** | Perfil do usuário autenticado |

Rotas de sessão são públicas porque são chamadas justamente quando não há
access token válido: exigir um aqui tornaria login e renovação impossíveis.

**Sessão devolvida por register, login e refresh:**

```json
{
  "accessToken": "eyJhbGciOi…",
  "refreshToken": "3Yk8_…",
  "user": { "id": "…", "email": "…", "username": "…", "role": "usuario" }
}
```

O access token vale 15 minutos e não é revogável. O refresh token vale 30 dias,
fica no banco (como hash) e é revogável: é ele que faz o logout ter efeito real.

## Contrato da API

Todas as rotas ficam sob `/v1`.

**Sucesso**

```json
{
  "data": { "status": "ok" },
  "meta": { "requestId": "9f2c…" }
}
```

**Erro**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Lugar não encontrado.",
    "details": [],
    "requestId": "9f2c…"
  }
}
```

`code` é estável e legível por máquina: decisões do cliente se baseiam nele.
`message` é para humanos e pode mudar a qualquer momento, inclusive de idioma.
Nenhum cliente deve comparar `message`.

**Paginação:** por cursor, nunca por offset. O cursor é opaco: não deve ser
interpretado nem construído no frontend.

```json
{ "data": [], "meta": { "nextCursor": "eyJ2…", "hasMore": true } }
```

## Invariantes da arquitetura

Regras que valem para toda a evolução do projeto. Quebrar qualquer uma delas
exige decisão registrada em documento, não commit.

1. **Só repositórios tocam o Prisma.** Controllers e services nunca importam
   `PrismaService`.
2. **Nenhum provedor externo participa da autenticação.** Identidade é nossa:
   nossa tabela, nosso hash, nosso token. Serviços externos entram só onde
   agregam valor claro, como Storage ou hospedagem do próprio Postgres.
3. **Rota nasce protegida.** O guard é global; abrir exige `@Public()`
   explícito. Esquecer o decorator devolve 401: falha fechada, não aberta.
4. **Senha nunca sai da camada de auth.** Nem em resposta, nem em log, nem em
   mensagem de erro. A projeção pública do usuário é uma lista explícita de
   campos, para que um campo sensível novo fique de fora por padrão.
5. **Todo erro sai como `AppException`.** Nunca `HttpException` crua, nunca
   `throw new Error` numa rota.
6. **O motor de recomendação (`web/src/engine/`) continua com uma única
   implementação.** Hoje só existe no frontend. Quando a API precisar da
   mesma lógica (Fase 6/7), a decisão de como compartilhar (pacote
   publicado, cópia com teste de regressão cruzado, ou reabrir workspace)
   precisa ser tomada então, registrada em emenda, não resolvida calada.

## Documentos

- `docs/VISION.md`: identidade do produto
- `docs/ARCHITECTURE.md`: arquitetura do frontend
- `docs/ROADMAP.md`: ordem oficial de desenvolvimento
- `docs/FASE-1-DECISOES-TECNICAS.md`: decisões técnicas do backend
- `docs/EMENDA-001-AUTENTICACAO-E-CUSTOS.md`: custos e hospedagem
- `docs/EMENDA-002-AUTENTICACAO-PROPRIA.md`: reversão para autenticação própria
- `docs/EMENDA-003-REPO-UNICO-SEM-WORKSPACE.md`: saída do monorepo pnpm
- `docs/PRODUTO.md`: visão de MVP, status atual e próximos passos (pra
  apresentar fora do time técnico)
