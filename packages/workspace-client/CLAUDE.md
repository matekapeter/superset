@AGENTS.md

# packages/workspace-client — Workspace React Client

React client library providing tRPC-based workspace filesystem access with hooks for file tree, document editing, and real-time FS events.

## Tech Stack
- React Query (@tanstack/react-query)
- tRPC (@trpc/client, @trpc/react-query)
- SuperJSON for serialization
- WebSocket for real-time FS events

## Key Hooks
- `useFileTree()` — hierarchical file tree with lazy loading, expansion, refresh, FS event updates (~490 LOC)
- `useFileDocument()` — file read/edit with conflict detection, revision tracking, auto-reload (~320 LOC)
- `useWorkspaceFsEvents()` / `useWorkspaceFsEventBridge()` — WebSocket FS event subscriptions

## Key Patterns
- Ref-based state for event callbacks without closure issues
- Lazy directory loading with invalidation on external changes
- Event deduplication via registry pattern (single WebSocket per workspace)
- Client caching per `hostUrl:cacheKey` tuple
- Revision-based conflict detection (mtime:size ETag)
- Binary detection (first 8KB null byte check), max file size 2MB

## Exports
- `WorkspaceClientProvider` + `useWorkspaceClient()`
- `useFileTree()`, `useFileDocument()`
- `useWorkspaceFsEvents()`, `useWorkspaceFsEventBridge()`
- `workspaceTrpc` client factory

## Internal Dependencies
- `@superset/host-service` — tRPC AppRouter type
- `@superset/workspace-fs` — FsEntry, FsWatchEvent types
