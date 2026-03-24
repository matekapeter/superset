@AGENTS.md

# packages/shared — Shared Types & Utilities

Foundational package providing shared types, constants, and utilities across the monorepo.

## Tech Stack
- Zod for schema validation
- TypeScript (no other runtime dependencies)

## Exports
- `./constants` — auth providers, protocol schemes, company info, feature flags, token config
- `./names` — name/email utilities (`getInitials()`)
- `./auth` — role hierarchy and authorization logic (`canInvite()`, `canRemoveMember()`)
- `./agent-command` — agent type definitions, preset commands, task prompt building
- `./agent-catalog` — built-in agent definitions and metadata
- `./agent-launch` — agent launch request validation and normalization (Zod schemas)
- `./agent-prompt-template` — task prompt templating with `{{variable}}` interpolation
- `./task-slug` — slug generation utilities
- `./terminal-link-parsing` — terminal link parsing (ported from VSCode)

## Key Types
- `AgentType`: "claude" | "codex" | "gemini" | "opencode" | "pi" | "copilot" | "cursor-agent"
- `AgentKind`: "terminal" | "chat"
- `OrganizationRole`: "member" | "admin" | "owner"
- `AgentLaunchRequest`: discriminated union (terminal vs chat)

## Internal Dependencies
- None — this is a foundational package
