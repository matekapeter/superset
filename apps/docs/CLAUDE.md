@AGENTS.md

# apps/docs — Documentation Site

Official documentation site built with Fumadocs MDX.

## Tech Stack
- Next.js 16 (React 19) with App Router
- Fumadocs (fumadocs-core, fumadocs-mdx, fumadocs-ui)
- TailwindCSS v4 + Radix UI
- Sentry + PostHog

## Key Patterns

### Content
- MDX documentation files in `content/docs/` with `meta.json` for sidebar ordering
- Fumadocs loader in `src/lib/source.ts` for page tree generation
- `source.config.ts` for schema customization

### Routes
- Dynamic docs routing at `src/app/(docs)/[[...slug]]/page.tsx`
- Automatic redirects: `/` and `/docs` → `/installation`
- LLM-accessible docs at `/llms.mdx/` and `/llms-full.txt/`
- Search API at `src/app/api/search/route.ts`

### Build
- `fumadocs-mdx` runs on `postinstall` and before build
- Typecheck includes MDX generation step

## Internal Dependencies
- `@superset/shared` — constants (COMPANY, DOCS_URL)
