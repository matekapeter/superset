@AGENTS.md

# packages/host-service — Workspace Backend Service

Backend service providing tRPC API and runtime managers for workspace operations (git, filesystem, chat, PR management).

## Tech Stack
- Hono HTTP server + tRPC + WebSocket
- SQLite via better-sqlite3 + Drizzle ORM
- Mastracode for AI chat runtime
- simple-git + node-pty for terminal/git ops
- Octokit for GitHub API

## Key Files
- `src/app.ts` — `createApp()` bootstraps Hono server with tRPC, WebSocket, auth, runtime managers
- `src/db/schema.ts` — SQLite schema: projects, pullRequests, workspaces
- `src/trpc/router/router.ts` — 9 sub-routers: health, chat, filesystem, git, github, cloud, pull-requests, project, workspace
- `src/runtime/` — Runtime managers (chat, filesystem, git, pull-requests)
- `src/providers/` — Pluggable auth, git credential, and AI model providers

## Key Patterns
- Provider pattern: auth, git credentials, AI models injected via `CreateAppOptions`
- Runtime managers run continuously with background syncing
- WebSocket for filesystem events and terminal I/O

## Exports
- Root: `createApiClient`, `createApp`, auth/credential providers
- `./db` — `createDb`, schema
- `./filesystem` — workspace filesystem events
- `./git` — git factory and credential providers
- `./trpc` — tRPC router and AppRouter type

## Internal Dependencies
- `@superset/trpc` — shared tRPC type definitions
- `@superset/workspace-fs` — filesystem host service
