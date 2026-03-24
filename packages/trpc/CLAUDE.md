@AGENTS.md

# packages/trpc — tRPC API Layer

Core tRPC API layer with 15 feature routers covering all backend procedures.

## Tech Stack
- @trpc/server 11.7
- Drizzle ORM for database access
- Zod for input validation
- SuperJSON for serialization
- Upstash QStash for async jobs

## Key Files
- `src/trpc.ts` — Core setup: context creation, error formatting, procedure definitions
- `src/root.ts` — Root router aggregating all 15 feature routers
- `src/router/` — Feature routers: admin, user, organization, project, workspace, chat, integration (github/linear/slack), task, agent, analytics, billing, device, api-key, v2-project, v2-workspace

## Security Model
- `publicProcedure` — no auth required
- `protectedProcedure` — authenticated user required
- `adminProcedure` — company email domain required

## Exports
- `appRouter`, `AppRouter` type
- `createCaller`, `createCallerFactory`
- `publicProcedure`, `protectedProcedure`, `adminProcedure`
- `createTRPCRouter`, `createTRPCContext`
- `RouterInputs`, `RouterOutputs` type helpers
- `./integrations/*` — integration-specific exports

## Internal Dependencies
- `@superset/auth` — session/user auth context
- `@superset/db` — database schema, client, enums
- `@superset/shared` — constants (COMPANY.EMAIL_DOMAIN)
