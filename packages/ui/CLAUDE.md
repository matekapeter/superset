@AGENTS.md

# packages/ui — Shared UI Component Library

Comprehensive shared React UI library built on shadcn/ui, Radix UI, and TailwindCSS v4.

## Tech Stack
- React 19 + TypeScript
- 30+ Radix UI primitives
- TailwindCSS v4 with CSS custom properties
- Class-variance-authority (CVA) for variants
- Lucide React icons
- Recharts, XYFlow React, Sonner, Motion

## Structure

### shadcn/ui components (`src/components/ui/`)
- 60+ components using **kebab-case single files** (e.g., `button.tsx`, `dialog.tsx`)
- This is intentional for shadcn CLI compatibility — do NOT refactor to folder structure
- Add new components: `npx shadcn@latest add <component>` (run in this directory)

### AI chat elements (`src/components/ai-elements/`)
- 42 specialized components for AI/chat UI (message, artifact, tool-call, canvas)
- Also uses kebab-case single files

### Atoms (`src/atoms/`)
- Pre-composed higher-level components wrapping shadcn primitives

### Theming (`src/globals.css`)
- CSS custom properties for light/dark mode via next-themes

## Internal Dependencies
- `@superset/shared` — utilities like `getInitials()`
