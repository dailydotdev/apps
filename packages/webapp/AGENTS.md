# Webapp

- Static assets go in `public/app/assets/` (served at `/app/assets/*`). Files under `public/assets/` work in local dev but 404 in production, because the bare `/assets` prefix is proxied to the marketing site's origin. The `/assets/:path*` redirect in `next.config.ts` exists only for legacy URLs.
- `app/` is App Router only for the service worker and the not-found page. Everything else is Pages Router; don't add routes or layouts under `app/`.
