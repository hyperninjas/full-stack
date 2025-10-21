# Full Stack Monorepo

A pnpm workspace with two apps under `apps/`:

- `apps/clinet`: Next.js app
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
  pnpm add <pkg> --filter clinet
  pnpm add <pkg> --filter server
  ```
- **Add a dev dependency**
  ```bash
  pnpm add -D <pkg> --filter clinet
  pnpm add -D <pkg> --filter server
  ```
- **Remove a dependency**
  ```bash
  pnpm remove <pkg> --filter clinet
  pnpm remove <pkg> --filter server
  ```
- **Add the same dependency to both apps**
  ```bash
  pnpm add <pkg> --filter clinet --filter server
  ```

## Workspace

- Defined in `pnpm-workspace.yaml` with `packages: - apps/*`.
- Root `package.json` contains scripts to run each app and both together.

## Common Scripts (run from repo root)

- `pnpm dev` — run client and server in parallel
- `pnpm build` — build both apps in parallel
- `pnpm start` — start both apps in parallel (expects they are built)
- `pnpm dev:clinet` — run Next.js dev server
- `pnpm dev:server` — run NestJS in watch mode
- `pnpm build:clinet` / `pnpm build:server`
- `pnpm start:clinet` / `pnpm start:server`
- `pnpm lint:clinet` / `pnpm lint:server`

## Development

- Client default dev URL: `http://localhost:3000`
- Server default port: `3000`
- To run both together, use `pnpm dev`.

If you hit a port conflict (`EADDRINUSE: 3000`), adjust one app’s port via env:

- Next.js: `PORT=3001 pnpm dev:clinet`
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

Notes:
- Packages in `apps/` are `"private": true` and will not be published.
- Initialize git and ensure your default branch is `main` to match Changesets baseBranch.

## Project Structure

```
apps/
  clinet/
  server/
.changeset/
package.json
pnpm-workspace.yaml
```

## Troubleshooting

- Change base port to avoid conflicts or stop the process occupying it.
- Ensure `git` is initialized and the default branch is `main` for the Changesets suggested-flow to work without warnings.
