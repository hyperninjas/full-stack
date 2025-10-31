# Full Stack Monorepo

A pnpm workspace with two apps under `apps/`:

- `apps/client`: Next.js app
- `apps/server`: NestJS API

## Prerequisites

- pnpm installed
- Node.js LTS recommended

## Install

```bash
pnpm install
```

## Install dependencies for a specific app

- **Add a runtime dependency**
  ```bash
  pnpm add <pkg> --filter client
  pnpm add <pkg> --filter server
  ```
- **Add a dev dependency**
  ```bash
  pnpm add -D <pkg> --filter client
  pnpm add -D <pkg> --filter server
  ```
- **Remove a dependency**
  ```bash
  pnpm remove <pkg> --filter client
  pnpm remove <pkg> --filter server
  ```
- **Add the same dependency to both apps**
  ```bash
  pnpm add <pkg> --filter client --filter server
  ```

## Workspace

- Defined in `pnpm-workspace.yaml` with `packages: - apps/*`.
- Root `package.json` contains scripts to run each app and both together.

## Common Scripts (run from repo root)

- `pnpm dev` — run client and server in parallel
- `pnpm build` — build both apps in parallel
- `pnpm start` — start both apps in parallel (expects they are built)
- `pnpm dev:client` — run Next.js dev server
- `pnpm dev:server` — run NestJS in watch mode
- `pnpm build:client` / `pnpm build:server`
- `pnpm start:client` / `pnpm start:server`
- `pnpm lint:client` / `pnpm lint:server`

## Development

- Client default dev URL: `http://localhost:3000`
- Server default port: `3000`
- To run both together, use `pnpm dev`.

If you hit a port conflict (`EADDRINUSE: 3000`), adjust one app’s port via env:

- Next.js: `PORT=3001 pnpm dev:client`
- NestJS: configure `apps/server/src/main.ts` to read `process.env.PORT` with a fallback.

## Changesets (Versioning + Changelogs)

- Config at `.changeset/config.json` (targets `apps/*`, base branch `main`).
- Create a changeset:
  ```bash
  pnpm changeset
  ```
- Apply versions and update lockfile:
  ```bash
  pnpm version-packages
  ```
- Build and publish (skips private apps):
  ```bash
  pnpm release
  ```

## Git hooks (Husky) & Commitlint

- **Hooks installation**: hooks are installed on `pnpm install` via the root `prepare` script (`husky install`).
- **Pre-commit**: runs `pnpm run lint`, which fans out to `apps/client` and `apps/server` lint scripts.
- **Commit message check**: `commit-msg` runs Conventional Commits via Commitlint.

### Conventional commit examples

```text
feat: add homepage hero
fix(server): handle missing env var
chore(client): update eslint config
docs: update README
```

### Manual commit message check

```bash
echo "feat: something" | pnpm exec commitlint
pnpm exec commitlint --edit .git/COMMIT_EDITMSG
```

### Bypass hooks (not recommended)

```bash
git commit -m "wip: temp" --no-verify
```

Notes:

- Packages in `apps/` are `"private": true` and will not be published.
- Initialize git and ensure your default branch is `main` to match Changesets baseBranch.

## Project Structure

```bash
apps/
  client/
  server/
.changeset/
package.json
pnpm-workspace.yaml
```

## Troubleshooting

- Change base port to avoid conflicts or stop the process occupying it.
- Ensure `git` is initialized and the default branch is `main` for the Changesets suggested-flow to work without warnings.
