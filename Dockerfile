########################
# STAGE 1 : BUILD NODE #
########################
FROM node:22-slim AS builder

WORKDIR /app

# Vars de build côté client (optionnelles, préfixées VITE_)
ARG VITE_FRONTEND_URL
ARG CAPROVER_GIT_COMMIT_SHA
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL
ENV CAPROVER_GIT_COMMIT_SHA=$CAPROVER_GIT_COMMIT_SHA

# pnpm via corepack (comme dans ton exemple)
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

# Dépendances
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Code
COPY . .

ENV NODE_ENV=production

# Génère le .env à partir de .env.exemple AVANT le build,
# en utilisant les variables d'environnement (DATABASE_URL, EMAIL_API_KEY, etc.)
RUN pnpm env:from-example && pnpm build

#########################
# STAGE 2 : RUNTIME SSR #
#########################
FROM node:22-slim

WORKDIR /app
ENV NODE_ENV=production

# On copie uniquement ce dont Nitro a besoin :
# - le bundle serveur dans .output
# - les dépendances Node
# - package.json (pour info / tooling éventuel)
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
ENV PORT=3000
ENV HOST=0.0.0.0

# On lance le serveur Node Nitro généré par SolidStart
RUN pnpm run db:push
CMD ["node", ".output/server/index.mjs"]