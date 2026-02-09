# Full Stack Monorepo

A pnpm workspace with two main packages available at the root:

- `client`: Next.js app (Frontend)
- `server`: NestJS API (Backend)

## Prerequisites

- Node.js 22.x
- pnpm 10.25.0
- Postgres (local) for server development

## Quick Start

1. **Install Dependencies**
   ```bash
   pnpm install
   ```
   This installs dependencies for both `client` and `server`.

2. **Setup Database**
   Ensure your local Postgres is running.
   ```bash
   # Set the database URL environment variable (required for Prisma)
   export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"

   # Generate Prisma Client
   pnpm --filter server prisma:generate
   # Or using the root alias:
   pnpm prebuild

   # Push the schema to your local database
   pnpm --filter server prisma:migrate
   # Or using the root alias:
   pnpm migrate
   ```

3. **Generate API Client**
   The frontend uses a generated TypeScript client to interact with the backend API.
   ```bash
   pnpm --filter client openapi
   ```
   This runs `openapi-generator-cli` using the configuration in `client/openapi-generator.config.json`.

4. **Run Development Server**
   Start both client and server in parallel:
   ```bash
   pnpm dev
   ```
   - **Client**: [http://localhost:3001](http://localhost:3001)
   - **Server**: [http://localhost:3000](http://localhost:3000)

## Development Workflow

### Managing Dependencies

Since this is a monorepo, you must specify which package to install dependencies into.

- **Add a runtime dependency** (e.g., `lodash` to client):
  ```bash
  pnpm add lodash --filter client
  ```
- **Add a dev dependency** (e.g., `jest` to server):
  ```bash
  pnpm add -D jest --filter server
  ```
- **Remove a dependency**:
  ```bash
  pnpm remove <package_name> --filter client
  ```
- **Add to both packages**:
  ```bash
  pnpm add <package_name> --filter client --filter server
  ```

### Build & Start

- **Build everything**:
  ```bash
  pnpm build
  ```
- **Start production**:
  ```bash
  pnpm start
  ```
- **Build/Start individual apps**:
  ```bash
  pnpm build:client
  pnpm build:server
  ```

### Testing & Linting

- **Server Tests**:
  ```bash
  pnpm --filter server test
  pnpm --filter server test:e2e
  ```
- **Lint Code**:
  ```bash
  pnpm lint
  ```

## Monorepo Structure

The project uses pnpm workspaces defined in `pnpm-workspace.yaml`.

```text
/
├── client/           # Next.js Frontend
│   ├── openapi-generator.config.json
│   └── package.json
├── server/           # NestJS Backend
│   ├── prisma/
│   └── package.json
├── .changeset/       # Versioning configuration
├── package.json      # Root scripts & dev dependencies
└── pnpm-workspace.yaml
```

## Changesets (Versioning + Changelogs)

- Config at `.changeset/config.json`.
- Create a changeset (run this when you make changes):
  ```bash
  pnpm changeset
  ```
- Apply versions and update lockfile (CI/CD usually handles this):
  ```bash
  pnpm version-packages
  ```
- Build and publish:
  ```bash
  pnpm release
  ```

## Git hooks (Husky) & Commitlint

- **Hooks installation**: automatic on `pnpm install` via `prepare` script.
- **Pre-commit**: runs `pnpm run lint`.
- **Commit message check**: enforces Conventional Commits.

### Conventional commit examples

```text
feat: add homepage hero
fix(server): handle missing env var
chore(client): update eslint config
docs: update README
```

## Troubleshooting

- **Port Conflicts**:
  - Client defaults to port `3001` (configured in `client/package.json`).
  - Server defaults to port `3000`.
  - If you encounter `EADDRINUSE`, check for running processes or adjust ports.
- **Prisma Client Not Found**:
  - If the server fails to start with this error, run `pnpm --filter server prisma:generate` to regenerate the client.
