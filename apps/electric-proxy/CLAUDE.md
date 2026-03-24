@AGENTS.md

# apps/electric-proxy — Electric Cloud Auth Proxy

Cloudflare Workers proxy that authenticates requests via JWT and forwards them to Electric Cloud with organization-scoped row-level security.

## Tech Stack
- Cloudflare Workers (Wrangler)
- jose for JWT verification
- Drizzle ORM for SQL query building

## Key Patterns

### Authentication
- Verifies Bearer tokens against remote JWKS endpoint with caching
- Extracts user's authorized organizations from JWT claims

### Row-Level Security
- Dynamically builds WHERE clauses based on user's organizations
- Table-specific rules for 20+ tables in `src/where.ts`
- Column restrictions for sensitive tables (apikeys, integration_connections)

### Proxy
- Forwards filtered requests to Electric's `/v1/shape` endpoint
- Passes through Electric-specific params (live, cursor, offset)
- Adds CORS headers and removes content-encoding

## Internal Dependencies
- `@superset/db` — database schema definitions
