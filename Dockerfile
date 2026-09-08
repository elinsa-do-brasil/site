# syntax=docker/dockerfile:1
#
# Imagem de produção da Elinsa (Next.js 16 + Payload CMS 3). Usa
# `output: "standalone"` (next.config.ts) para copiar só o necessário para
# rodar `node server.js` — sem devDependencies e sem o restante do
# código-fonte. Migrations (drizzle-kit / payload) rodam em ambiente de
# dev/CI, não neste container.
#
# Variáveis NEXT_PUBLIC_* são inlineadas no bundle do client durante
# `pnpm build`, então o build precisa dos valores reais de produção. Isso é
# resolvido montando o `.env` do projeto como build secret (nunca fica em
# nenhuma camada da imagem) — o próprio Next.js já carrega `.env`
# automaticamente (ver lib/env.ts / lib/envPublic.ts). Segredos
# server-only (SITE_DATABASE_URL, PAYLOAD_SECRET etc.) entram via variáveis
# de ambiente do container em runtime (docker-compose env_file).
#
# Alpine (musl) em todos os estágios de propósito: sharp e outros nativos
# (sharp, esbuild, @sentry/cli) precisam ser baixados/resolvidos já para
# musl — copiar um node_modules resolvido em glibc para um runtime Alpine
# quebraria os binários nativos.

ARG NODE_VERSION=24-alpine
ARG PNPM_VERSION=11.25.0

FROM node:${NODE_VERSION} AS deps
ARG PNPM_VERSION
WORKDIR /app
# libc6-compat: alguns pacotes nativos esperam glibc mesmo com prebuild musl.
# build-base + python3: fallback para qualquer dependência sem binário
# prebuilt para musl que precise compilar na instalação.
RUN apk add --no-cache libc6-compat build-base python3
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# package.json + lockfile primeiro para cachear a camada de install.
# patches/ é necessário porque pnpm-workspace.yaml define patchedDependencies.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile

FROM node:${NODE_VERSION} AS builder
ARG PNPM_VERSION
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# .env montado só durante o build (nunca persiste em camada da imagem).
# Sem ele, payload.config.ts e lib/db/index.ts lançam erro na coleta de
# páginas do Next (CMS_DATABASE_URL / SITE_DATABASE_URL / PAYLOAD_SECRET /
# BETTER_AUTH_SECRET etc. precisam existir, mesmo que não sejam usados de
# fato — nenhuma rota faz generateStaticParams ou busca dados no build).
RUN --mount=type=secret,id=dotenv,target=/app/.env \
    pnpm build

# `output: "standalone"` copia o .env usado no build para dentro de
# .next/standalone/ de propósito (server.js autônomo carrega sua própria
# env) — isso incluiria os segredos reais do .env na imagem final. Remove
# aqui, ainda dentro do estágio builder: o runner só copia o conteúdo já
# limpo via COPY --from=builder, então essa camada nunca é exportada.
RUN rm -f .next/standalone/.env .next/standalone/.env.*

FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# server.js do standalone não copia public/ nem .next/static por padrão
# (ver next.config.ts output.md) — precisam ser copiados manualmente.
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

CMD ["node", "server.js"]
