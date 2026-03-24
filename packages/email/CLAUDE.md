@AGENTS.md

# packages/email — Email Templates

React Email templates for transactional emails across the platform.

## Tech Stack
- React Email framework
- TailwindCSS v4 via @react-email/tailwind
- date-fns for date formatting

## Templates (10)
Located in `src/emails/`: welcome, organization-invitation, member-added, member-removed, subscription-started, subscription-cancelled, payment-failed, enterprise-inquiry, and more.

## Key Patterns
- All templates wrap `StandardLayout` for consistent branding/footer
- This package only defines templates — sending is handled by consumers
- `bun run dev` starts React Email preview server
- `bun run export` generates static HTML

## Exports
- `./emails/*` — individual email templates
- `./components/index.ts` — shared components (StandardLayout, Button, Logo)

## Internal Dependencies
- None (consumed by `@superset/auth` and `apps/marketing`)
