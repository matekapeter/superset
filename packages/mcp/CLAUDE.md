@AGENTS.md

# packages/mcp — MCP Server Integration

MCP (Model Context Protocol) server exposing Superset operations as standardized tools for AI agents.

## Tech Stack
- @modelcontextprotocol/sdk v1.26
- Drizzle ORM for database queries
- Zod for schema validation

## 17 MCP Tools
- **Devices** (7): list-devices, list-workspaces, list-projects, get-app-context, get-workspace-details, create-workspace, update-workspace, delete-workspace, switch-workspace, start-agent-session
- **Tasks** (6): create-task, list-tasks, get-task, update-task, delete-task, list-task-statuses
- **Organizations** (1): list-members

## Key Patterns
- Context-aware tools via `McpContext` (userId, organizationId, source)
- Device command execution: creates pending commands in `agentCommands` table, polls until completion (30s timeout)
- In-memory transport for Slack agent integration
- Optional `onToolCall` middleware for analytics

## Exports
- Default: `createMcpServer()` — creates MCP server with tool registration
- `./auth` — `McpContext` type
- `./in-memory` — `createInMemoryMcpClient()` for internal use

## Internal Dependencies
- `@superset/db` — database client and schema
- `@superset/shared` — task slug utilities
