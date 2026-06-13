# ---------------------------------------------------------------------------
# Slikk Feedback Hub — production image (Next.js + Prisma + PostgreSQL)
# Multi-stage build: full deps to compile, then a slim runtime with only
# production dependencies (so `prisma migrate deploy` still works at boot).
# ---------------------------------------------------------------------------

FROM node:22-bookworm-slim AS base
WORKDIR /app
# Prisma's query/schema engines need OpenSSL; ca-certificates for outbound TLS.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# ---- Install all dependencies (incl. dev) for the build ----
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# ---- Build the Next.js app ----
FROM deps AS builder
COPY . .
# Placeholder so any accidental Prisma client init during build can't fail.
# Pages read cookies (dynamic), so no database is actually queried at build time.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Install production-only dependencies ----
FROM base AS prod-deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev

# ---- Runtime image ----
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

# Production node_modules (includes @prisma/client + the prisma CLI for migrations).
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
# Build output and the files the server needs at runtime.
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --chown=node:node public ./public
COPY --chown=node:node prisma ./prisma
COPY --chown=node:node scripts/bootstrap-admin.mjs ./scripts/bootstrap-admin.mjs
COPY --chown=node:node next.config.ts package.json ./
COPY --chown=node:node docker/entrypoint.sh ./docker/entrypoint.sh
RUN chmod +x ./docker/entrypoint.sh

USER node
EXPOSE 3000
ENTRYPOINT ["./docker/entrypoint.sh"]
