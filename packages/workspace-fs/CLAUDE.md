@AGENTS.md

# packages/workspace-fs — Workspace Filesystem

Secure, transport-agnostic filesystem abstraction with file operations, search, and watch capabilities bounded to a workspace root.

## Tech Stack
- @parcel/watcher for file watching
- fast-glob for pattern matching
- fuse.js for fuzzy file search
- Node.js fs/promises, crypto, child_process

## Key Files
- `src/fs.ts` — Core implementation: path validation (prevents symlink escapes), atomic writes, revision tracking
- `src/search.ts` — Fuse fuzzy matching + optional ripgrep for content search
- `src/watch.ts` — Parcel watcher with event coalescing (create+delete cancels, etc.)
- `src/host/service.ts` — Host-side service bridging to core methods
- `src/client/index.ts` — Client-side factory for RPC-style remote access

## Key Patterns
- **Security-first**: all paths validated within workspace root; symlink escape prevention
- **Revision-based conflicts**: mtime:size as revision; `ifMatch` preconditions for optimistic concurrency
- **Atomic writes**: temp file + rename pattern; preserves permissions
- **Path locking**: filesystem locks in `/tmp/superset-workspace-fs-locks/`
- **Transport-agnostic**: same interface for local (host) and remote (client) use

## Exports
- `./client` — client factory and types
- `./core` — service interface and request/subscription type mappings
- `./host` — host service factory and implementation
- `./resource-uri` — resource URI utilities

## Internal Dependencies
- None — foundational package
