@AGENTS.md

# apps/api — API Backend

Backend API server providing tRPC endpoints, webhooks, MCP server, and real-time chat via durable streams.

## Tech Stack
- Next.js 16 with App Router (API routes only)
- tRPC 11 for RPC layer
- Better Auth for authentication
- Drizzle ORM for database access
- MCP SDK for AI tool integration
- Integrations: Octokit (GitHub), Linear SDK, Slack Web API, Stripe

## Key Patterns

### Request Handling
- `src/proxy.ts` handles CORS, Electric SQL, and Durable Stream headers (Next.js 16 — never use `middleware.ts`)
- tRPC handler at `src/app/api/trpc/[trpc]/route.ts`

### MCP Server
- Runs MCP server via `WebStandardStreamableHTTPServerTransport`
- Endpoint at `src/app/api/agent/`

### Webhooks
- Signature verification for GitHub, Linear, Slack webhooks
- Webhook routes under `src/app/api/github/`, `src/app/api/integrations/`

### Real-time Chat
- Durable streams for message streaming with offset/cursor pagination
- Chat routes at `src/app/api/chat/`

### Environment
- Comprehensive env validation via `@t3-oss/env-nextjs` in `src/env.ts`

## Internal Dependencies
- `@superset/auth` — session management
- `@superset/db` — database schema and client
- `@superset/trpc` — shared tRPC router definitions
- `@superset/mcp` — MCP server implementation
- `@superset/shared` — shared utilities
