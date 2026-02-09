# syntax=docker/dockerfile:1.7

# Follow pnpm monorepo best practices: use slim image, BuildKit cache, and pnpm deploy

# ---------- Base ----------
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ---------- Build & Deploy (monorepo) ----------
FROM base AS build
WORKDIR /usr/src/app

# Copy workspace metadata first for better caching
COPY pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package manifests that affect dependency graph
COPY apps/server/package.json apps/server/package.json
COPY apps/client/package.json apps/client/package.json

# Install deps with cache (workspace context)
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile

# Copy only the server workspace sources
COPY apps/server/ apps/server/

# Build only the server workspace
RUN pnpm --filter=server run build

# Deploy only the server workspace with production deps & pruned files
RUN pnpm deploy --filter=server --prod /prod/server

# ---------- Runtime ----------
FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Copy the pruned, production-only server bundle
COPY --from=build /prod/server .
COPY --from=build /usr/src/app/apps/server/dist ./dist

# Run as non-root
USER node

# Runtime config
ENV PORT=4000
EXPOSE 4000

CMD ["node", "dist/src/main.js"]
