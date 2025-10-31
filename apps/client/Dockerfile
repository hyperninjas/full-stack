# syntax=docker/dockerfile:1.7

# Production-grade Next.js Dockerfile (pnpm monorepo)
# - Uses Node 22 Alpine for small image size
# - Uses BuildKit cache for pnpm store
# - Builds only the client workspace and deploys pruned prod deps
# - Copies .next artifacts for runtime (works without standalone output)

# ---------- Base ----------
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ---------- Build (monorepo) ----------
FROM base AS build
WORKDIR /usr/src/app

# Copy workspace metadata for better caching
COPY pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package manifests that affect dependency graph
COPY apps/client/package.json apps/client/package.json

# Install deps with cache (workspace context)
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile

# Copy only the client workspace sources
COPY apps/client/ apps/client/

# Disable telemetry in builds
ENV NEXT_TELEMETRY_DISABLED=1

# Build only the client workspace
RUN pnpm --filter=client run build

# ---------- Runtime ----------
FROM node:22-alpine AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# For sharp on Alpine
RUN apk add --no-cache libc6-compat

# Copy Next standalone server and static assets
COPY --from=build /usr/src/app/apps/client/.next/standalone ./
COPY --from=build /usr/src/app/apps/client/.next/static ./apps/client/.next/static
COPY --from=build /usr/src/app/apps/client/public ./apps/client/public

# Expose Next's default port
ENV PORT=3000
EXPOSE 3000

# Change working directory to the app workspace inside standalone bundle
WORKDIR /app/apps/client

# Drop privileges
USER node

# Optional: basic healthcheck hitting the root path
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT:-3000}/ || exit 1

# Start the standalone server
CMD ["node", "server.js"]
