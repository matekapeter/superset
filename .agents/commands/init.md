---
description: Explore the entire monorepo in parallel and build a structured project summary
allowed-tools: Agent, Read, Glob, Grep
---

Build a comprehensive understanding of the Superset monorepo by launching parallel subagents to explore each workspace, then compiling a structured summary.

## Step 1: Launch parallel exploration agents

Launch **Agent** subagents (with `subagent_type: Explore`) in parallel. Each agent explores one workspace folder and returns a structured summary.

### Apps (launch all in parallel)

Launch one Agent per app with this prompt template (substitute `<name>` and `<path>`):

> Explore the workspace at `<path>` and return a structured summary:
>
> 1. **Name**: Package name from package.json
> 2. **Purpose**: One sentence describing what this app does
> 3. **Tech stack**: Framework, language, key libraries (from package.json dependencies)
> 4. **Entry points**: Main files that start the app (e.g., src/index.ts, app/layout.tsx)
> 5. **Key directories**: Top-level src directories and what they contain
> 6. **Internal dependencies**: Which @superset/* packages it depends on
> 7. **Scripts**: Scripts from package.json
> 8. **Notable patterns**: Unusual or important patterns (IPC channels, proxy.ts, custom plugins, etc.)
>
> Be concise. Use bullet points. Focus only on this workspace.

Apps to explore:
- `apps/web`
- `apps/api`
- `apps/admin`
- `apps/marketing`
- `apps/desktop`
- `apps/mobile`
- `apps/docs`
- `apps/electric-proxy`
- `apps/streams`

### Packages (launch all in parallel)

Launch one Agent per package with this prompt template:

> Explore the package at `<path>` and return a structured summary:
>
> 1. **Name**: Package name from package.json
> 2. **Purpose**: One sentence describing what this package provides
> 3. **Tech stack**: Key libraries and tools used
> 4. **Exports**: What does this package export? (check main/exports in package.json and primary index.ts)
> 5. **Key files**: The 3-5 most important files and what they do
> 6. **Internal dependencies**: Which @superset/* packages it depends on
> 7. **Schema/types**: Key shared types, schemas, or database tables if any
> 8. **Notable patterns**: How this package is used across the monorepo
>
> Be concise. Use bullet points. Focus only on this package.

Packages to explore:
- `packages/ui`
- `packages/db`
- `packages/auth`
- `packages/trpc`
- `packages/shared`
- `packages/mcp`
- `packages/chat`
- `packages/email`
- `packages/desktop-mcp`
- `packages/local-db`
- `packages/host-service`
- `packages/workspace-client`
- `packages/workspace-fs`
- `packages/scripts`
- `packages/macos-process-metrics`

### Tooling & config (launch one agent)

Launch a single Agent to explore tooling and configuration:

> Explore the monorepo tooling and configuration. Return a summary covering:
>
> 1. **Root config**: Summarize turbo.jsonc, biome.jsonc, root tsconfig, bunfig.toml
> 2. **Tooling directory**: What shared TypeScript configs exist in tooling/
> 3. **Agent/IDE config**: What is in .agents/, .claude/, .cursor/, .codex/, .superset/
> 4. **CI/CD**: List .github/workflows/ and what each workflow does
> 5. **Environment**: Read .env.example (NOT .env) and note expected environment variables
>
> Be concise. Use bullet points.

## Step 2: Read root-level context

While agents run, directly read these files for root-level context:
- `AGENTS.md` — project conventions and structure
- `README.md` (if it exists) — project overview
- `turbo.jsonc` — workspace pipeline configuration
- Root `package.json` — scripts, workspace globs

## Step 3: Compile the structured summary

After all agents return, compile their outputs into this format:

```
# Superset Monorepo — Project Summary

## Overview
[One paragraph about what Superset is and how the monorepo is organized]

## Tech Stack
[Key technologies discovered across the monorepo]

## Apps
### <app-name>
- **Purpose**: ...
- **Tech**: ...
- **Entry points**: ...
- **Internal deps**: ...
[Repeat for each app]

## Packages
### <package-name>
- **Purpose**: ...
- **Exports**: ...
- **Key files**: ...
- **Internal deps**: ...
[Repeat for each package]

## Tooling & Config
[Summary from tooling agent]

## Dependency Graph
[Key dependency relationships: which apps depend on which packages,
which packages depend on each other. Highlight most-depended-on packages.]

## Key Patterns & Conventions
[From AGENTS.md and discovered during exploration]

## Common Commands
[Most useful commands for development]
```

## Step 4: Present the summary

Print the compiled summary. If `$ARGUMENTS` contains a specific focus area (e.g., "desktop", "database", "auth"), give extra detail on that area while still providing the full overview.

## Important Notes

- All exploration is **read-only**. Do not modify any files.
- Do not read `.env` files — only `.env.example` or `.env.template`.
- Keep each agent's scope narrow to its assigned workspace for fast parallel execution.
- If a workspace folder is empty or has no package.json, note it as "empty/placeholder" and move on.
- Prioritize discovering **relationships between workspaces** — the dependency graph is one of the most valuable outputs.

$ARGUMENTS
