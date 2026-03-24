@AGENTS.md

# packages/auth — Authentication & Authorization

Centralized authentication using Better Auth with OAuth, organizations, billing, and API keys.

## Tech Stack
- Better Auth 1.4.18 with 8+ plugins
- Stripe for billing
- Resend for email delivery
- Upstash Redis for rate limiting, QStash for async jobs
- Drizzle ORM for database

## Key Files
- `src/server.ts` — Main Better Auth config (~910 LOC) with all plugins, hooks, Stripe lifecycle
- `src/client.ts` — React client wrapper for organization, session, Stripe, API key plugins
- `src/lib/accept-invitation-endpoint.ts` — Custom invitation acceptance with token verification
- `src/lib/resolve-session-organization-state.ts` — Active organization resolution
- `src/utils/billing.ts` — Billing utilities

## Key Patterns
- **Multi-org**: Sessions track `activeOrganizationId`; auto-selection handles race conditions
- **Auto-enrollment**: Users with matching email domains auto-join organizations
- **Billing**: Stripe customers per org; seat-based pricing with prorations
- **Rate limiting**: 10 invitations/hour per user via Upstash

## Exports
- `./server` — server-side auth configuration
- `./client` — React client (requires `"use client"`)
- `./env` — environment variable schema
- `./stripe` — Stripe client singleton

## Internal Dependencies
- `@superset/db` — database client and auth schema
- `@superset/email` — email templates
- `@superset/shared` — auth utilities (`canInvite()` role logic)
