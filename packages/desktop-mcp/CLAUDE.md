@AGENTS.md

# packages/desktop-mcp — Desktop UI Automation MCP Server

MCP server for desktop UI automation via Chrome DevTools Protocol, allowing agents to inspect and interact with the Electron app.

## Tech Stack
- @modelcontextprotocol/sdk for MCP server
- puppeteer-core for CDP client
- Zod for request/response validation

## 9 MCP Tools
takeScreenshot, inspectDom, click, typeText, sendKeys, getConsoleLogs, evaluateJs, navigate, getWindowInfo

## Key Patterns
- Lazy CDP connection to Electron on first tool call
- Auto-reconnect on connection drop (handles Electron restart/hot reload)
- Re-injects focus lock and console capture on reconnect
- Discovers main app page by filtering CDP pages for localhost/file:// URLs
- Runs as subprocess with stdio transport (`src/bin.ts`)

## Exports
- Default: `createMcpServer()` — factory function
- Type exports: 11 response/element types

## Internal Dependencies
- None
