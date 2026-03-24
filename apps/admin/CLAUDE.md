@AGENTS.md

# apps/admin — Admin Dashboard

Internal analytics dashboard for viewing metrics, retention, signups, revenue, and funnel analytics with role-based access.

## Tech Stack
- Next.js 16 (React 19) with App Router
- Recharts for charting
- TailwindCSS v4 + shadcn/ui
- tRPC + React Query
- Better Auth with email domain validation

## Key Patterns

### Access Control
- `src/proxy.ts` verifies user email ends with company domain before granting access (Next.js 16 — never use `middleware.ts`)
- Dashboard layout redirects unauthenticated/non-company users to the web app

### Analytics
- tRPC queries: `getActivationFunnel`, `getMarketingFunnel`, `getWAUTrend`, `getRetention`, etc.
- Dynamic time range selection via TimeRangePicker component

## Internal Dependencies
- `@superset/auth` — authentication and session management
- `@superset/db` — Drizzle ORM schemas
- `@superset/shared` — constants (COMPANY.EMAIL_DOMAIN)
- `@superset/trpc` — shared tRPC router definitions
- `@superset/ui` — shared UI components
