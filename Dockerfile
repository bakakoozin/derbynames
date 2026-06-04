########################
# STAGE 1 : BUILD NODE #
########################
FROM node:22-slim AS builder

WORKDIR /app

# Vars de build côté client (optionnelles, préfixées VITE_)
ARG VITE_FRONTEND_URL
ARG VITE_API_DERBY
ARG CAPROVER_GIT_COMMIT_SHA
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL
ENV VITE_API_DERBY=$VITE_API_DERBY
ENV CAPROVER_GIT_COMMIT_SHA=$CAPROVER_GIT_COMMIT_SHA

# pnpm via corepack (comme dans ton exemple)
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

# Dépendances
COPY package.json pnpm-lock.yaml ./
COPY drizzle.config.ts ./
RUN pnpm install --frozen-lockfile

# Code
COPY . .

ENV NODE_ENV=production

RUN pnpm build

#########################
# STAGE 2 : RUNTIME SSR #
#########################
FROM node:22-slim

WORKDIR /app
ENV NODE_ENV=production

# On copie le bundle Nitro et les fichiers nécessaires au push Drizzle :
# - le bundle serveur dans .output
# - les dépendances Node
# - package.json (pour info / tooling éventuel)
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/src/db ./src/db

EXPOSE 3000
ENV PORT=3000
ENV HOST=0.0.0.0

# On applique le schéma au démarrage, quand les variables runtime CapRover sont disponibles.
CMD ["sh", "-c", "./node_modules/.bin/drizzle-kit push && node .output/server/index.mjs"]
