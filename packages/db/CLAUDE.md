@AGENTS.md

# packages/db — Database Layer

Centralized Drizzle ORM database layer with PostgreSQL schema definitions and type-safe clients.

## Tech Stack
- Drizzle ORM 0.45 (PostgreSQL)
- Neon serverless database
- Zod for validation
- @t3-oss/env-core for env validation

## Key Files
- `src/client.ts` — `db` (HTTP) and `dbWs` (WebSocket/pooled) database clients
- `src/schema/schema.ts` — core tables (tasks, statuses, integrations, workspaces, projects)
- `src/schema/auth.ts` — auth tables (users, sessions, organizations, members, invitations)
- `src/schema/github.ts` — GitHub tables (installations, repositories, pull requests)
- `src/schema/enums.ts` — all enum definitions (Zod + Drizzle pgEnum)

## Important Rules
- **NEVER manually edit files in `drizzle/`** — migration SQL, journal, and snapshots are auto-generated
- **NEVER touch production database** without explicit permission
- Create migrations by modifying schema in `src/schema/` then running `bunx drizzle-kit generate --name="<name>"`
- Always use Neon branches for migration development

## Exports
- Default: `db`, `schema`
- `./client` — database clients
- `./schema` — all table definitions
- `./schema/auth` — auth tables
- `./enums` — enum types
- `./utils` — helpers (`findOrgMembership`, `buildConflictUpdateColumns`)

## Internal Dependencies
- None — this is a foundational package
