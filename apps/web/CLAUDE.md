@AGENTS.md

# apps/web — Main Web Application

The main web dashboard at app.superset.sh for managing parallel coding agents, tasks, and integrations.

## Tech Stack
- Next.js 16 (React 19) with App Router
- TailwindCSS v4 + shadcn/ui via `@superset/ui`
- tRPC for API calls, React Query for state
- Better Auth for authentication
- Sentry + PostHog for monitoring/analytics

## Key Patterns

### Authentication
- `src/proxy.ts` handles auth guard (Next.js 16 — never use `middleware.ts`)
- Server-side auth via `@superset/auth/server`
- Route groups: `(dashboard)` for protected routes, `(auth)` for sign-in/sign-up

### tRPC
- Client setup in `src/trpc/` with `TRPCReactProvider`
- Server-side caller in `src/trpc/server.tsx`

### Environment
- Type-safe env validation via `@t3-oss/env-nextjs` in `src/env.ts`

## Internal Dependencies
- `@superset/auth` — authentication
- `@superset/trpc` — API layer
- `@superset/ui` — shared components
- `@superset/shared` — constants and utilities
- `@superset/db` — database schema
