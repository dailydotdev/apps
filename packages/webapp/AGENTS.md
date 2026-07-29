# Webapp

Next.js 15, **Pages Router** (no App Router / Server Components), deployed on Vercel. Pages set layouts via `MyPage.getLayout = (page) => <MainLayout>{page}</MainLayout>`.

## Static Assets (production 404 trap)

Put webapp static assets in `public/app/assets/` (served at `/app/assets/*`). Do **not** add files to `public/assets/`: the bare `/assets` prefix is proxied to the marketing site's origin in production, so files there work in local dev but 404 in production. A wildcard redirect (`/assets/:path*` → `/app/assets/:path*`) exists only for legacy URLs.

## API Proxy

The webapp proxies API requests (configured in `next.config.ts`): production hits `api.daily.dev`, local hits `localhost:5000` when `NEXT_PUBLIC_DOMAIN=localhost`.

## Changed-File Verification

- Run `node scripts/typecheck-strict-changed.js` from the repo root for any TypeScript change. Package-wide strict tsc has unrelated backlog; the changed-file guard is what catches branch regressions.
- The strict guard fails on implicit `any` and on `null` returned from components typed `ReactElement`; be explicit with nullable return types and callback event types.
- CI has no webapp `next build` job, so Vercel can catch type errors CI missed. After shared-package changes, verify the full webapp tsc before pushing.

## Testing

Tests in `__tests__/`, Next.js router and common dependency mocks in `__mocks__/`.
