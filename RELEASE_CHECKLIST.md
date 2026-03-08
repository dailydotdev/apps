# Production Release Checklist

## CI gates (must be green)

- `pnpm verify:ci`
  - lint across `shared`, `webapp`, `extension`
  - typecheck across `shared`, `webapp`, `extension`
  - unit/integration tests across `shared`, `webapp`, `extension`
- `pnpm test:e2e:smoke`
  - anonymous browser smoke tests for core app routes

## E2E monitoring after deployment

- `E2E Tests` workflow runs after successful production deployment on `main`.
- Authenticated smoke tests require `USER_NAME` and `PASSWORD` secrets.

## Required environment and secrets checks

- Verify app env vars are set in production:
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_WEBAPP_URL`
  - `NEXT_PUBLIC_DOMAIN`
  - any feature-specific vars used by the release
- Verify CI secrets exist for authenticated E2E:
  - `USER_NAME`
  - `PASSWORD`
  - `E2E_MONITORING_SLACK`

## Release-day smoke checks

- Open homepage and verify feed renders.
- Run search and verify results page opens.
- Open at least one post and navigate back to feed.
- Validate settings page is accessible for authenticated user.
- Validate extension new-tab feed still renders after release.

## Streak debug policy

- `?debugStreak` is disabled by default on production API.
- Internal QA can enable debug mode explicitly with:
  - `localStorage.setItem('dd-streak-debug', 'enabled')`
  - reload a URL that includes `?debugStreak`
- Remove local override after QA:
  - `localStorage.removeItem('dd-streak-debug')`

## Shortcuts policy (webapp vs extension)

- Webapp supports custom shortcuts management and rendering.
- "Most visited sites" remains extension-only (browser permission based).
- Webapp surfaces an install-extension CTA for top-sites capability.

## Rollback readiness

- Confirm last known-good commit/tag before release.
- Keep rollback owner assigned and available during release window.
- If smoke fails post-release:
  - rollback first
  - analyze root cause after service is stable
