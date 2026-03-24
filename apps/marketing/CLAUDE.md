@AGENTS.md

# apps/marketing — Marketing Website

Marketing website at superset.sh with 3D hero, features showcase, blog, changelog, and comparison pages.

## Tech Stack
- Next.js 16 (React 19) with App Router
- React Three Fiber + Three.js for 3D graphics
- Framer Motion for animations
- MDX Remote for blog, changelog, comparison content
- Shiki for code syntax highlighting
- PostHog + Sentry

## Key Patterns

### Content
- MDX files in `content/` directory (blog posts, changelog entries, comparisons)
- Content utilities in `src/lib/` (blog.ts, changelog.ts, compare.ts)

### Performance
- Below-fold sections dynamically imported to reduce initial JS bundle
- Dark theme forced (`forcedTheme="dark"`)
- React Compiler enabled

### SEO
- JSON-LD structured data (Organization, SoftwareApplication, Website, FAQ)
- PostHog analytics proxied via rewrites (`/ingest/*`)

## Internal Dependencies
- `@superset/auth` — authentication utilities
- `@superset/email` — email templates
- `@superset/shared` — constants (COMPANY, THEME_STORAGE_KEY)
- `@superset/ui` — shared UI components
