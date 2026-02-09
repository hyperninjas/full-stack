# syntax=docker/dockerfile:1.7

# Production-grade Next.js Dockerfile (pnpm monorepo)
# - Uses Node 22 Alpine for small image size
# - Uses BuildKit cache for pnpm store
# - Uses pnpm deploy to prune dependencies for production (space efficient)
# - Builds non-standalone version (fast buildable, full node_modules)

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
COPY apps/server/package.json apps/server/package.json

# Install deps with cache (workspace context)
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile

# Copy only the client workspace sources
COPY apps/client/ apps/client/

# Disable telemetry in builds
ENV NEXT_TELEMETRY_DISABLED=1

# Build the client workspace
RUN pnpm --filter=client run build

# Deploy only the client workspace with filtered production deps
# This creates a folder /prod/client with package.json, node_modules (prod), and source
RUN pnpm deploy --filter=client --prod /prod/client

# ---------- Runtime ----------
FROM node:22-alpine AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# For sharp on Alpine
RUN apk add --no-cache libc6-compat

# Copy the deployed production app (deps + source)
COPY --from=build /prod/client ./

# Copy build artifacts (Next.js build output)
# pnpm deploy usually excludes ignored files like .next, so we copy manually
COPY --from=build /usr/src/app/apps/client/.next ./.next
COPY --from=build /usr/src/app/apps/client/public ./public

# Expose Next's default port
ENV PORT=3000
EXPOSE 3000

# Drop privileges
USER node

# Basic healthcheck on localhost
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT:-3000}/ || exit 1

# Start the full Next.js server (non-standalone)
CMD ["npm", "start"]
