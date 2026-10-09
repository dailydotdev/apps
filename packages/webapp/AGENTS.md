# Webapp

- Static assets go in `public/app/assets/` (served at `/app/assets/*`). Files under `public/assets/` work in local dev but 404 in production, because the bare `/assets` prefix is proxied to the marketing site's origin. The `/assets/:path*` redirect in `next.config.ts` exists only for legacy URLs.
- `app/` is App Router only for the service worker and the not-found page. Everything else is Pages Router; don't add routes or layouts under `app/`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
