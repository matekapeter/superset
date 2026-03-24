@AGENTS.md

# packages/local-db — Local SQLite Database

Local SQLite database schema for the desktop app managing projects, worktrees, workspaces, and settings.

## Tech Stack
- Drizzle ORM (SQLite dialect)
- Zod for runtime validation
- UUID for ID generation

## Tables (9)
- **Local**: projects, worktrees, workspaces, workspaceSections, settings, browserHistory
- **Synced (Electric SQL)**: users, organizations, organizationMembers, tasks

## Key Patterns
- UUID primary keys with auto-generated defaults
- Synced tables use snake_case columns to match cloud Postgres schema
- Git/GitHub status stored as JSON in worktrees
- Soft-delete pattern via `deletingAt` field

## Exports
- `./schema` — Drizzle ORM tables and relations
- `./schema/zod` — Zod schemas and TypeScript types

## Internal Dependencies
- None
