@AGENTS.md

# packages/chat — AI Chat Runtime

AI-powered chat/agent runtime with slash commands, MCP support, and dual desktop/web implementations.

## Tech Stack
- Vercel `ai` package, Anthropic SDK, OpenAI SDK
- Mastracode (AI agent framework)
- tRPC, Hono for server transports
- React + TanStack React Query for client

## Key Patterns

### Dual Runtime
- `src/server/desktop/` — Desktop-specific: file-based config, OAuth, keychain auth
- `src/server/trpc/` — Web tRPC runtime with MCP support
- `src/server/hono/` — Hono HTTP adapter

### Slash Commands
- Discovered from `.claude/commands/` and `.agents/commands/` directories
- Markdown files with optional YAML frontmatter
- Registry cached per project/global scope

### Streaming
- Chat messages stream with real-time display state updates
- Session lifecycle with hooks for startup, message submission, runtime restart

## Exports
- `./client` — React hooks and providers for chat UI
- `./shared` — slash command utilities (tokenization, parsing, matching)
- `./server/desktop` — desktop chat service
- `./server/trpc` — tRPC server runtime
- `./server/hono` — Hono HTTP adapter

## Internal Dependencies
- `@superset/trpc` — AppRouter type and tRPC client
- `@superset/workspace-fs` — filesystem operations for runtime
