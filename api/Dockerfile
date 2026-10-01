# Imagem da API do ROOV.
#
# Existe desde a Fase 1, antes de haver deploy configurado, e o motivo é
# estratégico: um container roda igual em Render, Fly, Railway, Koyeb ou num
# VPS. É o que garante que usar plano gratuito hoje não vire bloqueio amanhã —
# trocar de hospedagem passa a ser uma tarde de trabalho, não uma migração.
#
# Build a partir desta pasta (api/), não da raiz do repo — não é mais um
# monorepo com workspace:
#   docker build -t roov-api .

# ─── Estágio 1: dependências ──────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# Só o manifesto primeiro: o cache de camada do Docker sobrevive a mudanças de
# código-fonte, e `npm ci` deixa de rodar a cada commit.
COPY package.json package-lock.json ./
RUN npm ci

# ─── Estágio 2: build ─────────────────────────────────────────────────────────
FROM deps AS build
WORKDIR /app
COPY . .

RUN npx prisma generate \
 && npm run build \
 && npm prune --omit=dev

# ─── Estágio 3: runtime ───────────────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Usuário sem privilégio. Processo como root dentro de container transforma
# uma falha de execução remota em comprometimento do host.
USER node

COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=build --chown=node:node /app/package.json ./

EXPOSE 3000

# Migrations rodam no start, não no build: no build não existe banco acessível.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
