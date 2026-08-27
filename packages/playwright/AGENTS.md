# Playwright E2E Tests

Tests run against **live production** (`https://daily.dev`) by default, or `BASE_URL`. Credentials come from a git-ignored `.env` (`USER_NAME`, `PASSWORD`); in CI they're GitHub secrets. Never hardcode them.

```bash
cd packages/playwright
pnpm install-deps      # first time: install browsers
pnpm test              # also: test:headed, test:ui, test:debug, report
```

(Or from the root: `pnpm test:e2e`.)

## Conventions (learned the hard way)

- Role-based selectors (`getByRole`, `getByLabel`, `getByText`), not CSS/XPath.
- The matrix includes mobile devices (Pixel 5, iPhone 12), so elements often differ by viewport. Use `.or()` to accept either variant.
- Production shows a cookie consent banner; dismiss it early with an `.or()` across the possible button labels ("Accept all" / "I understand").
- No hardcoded waits (`waitForTimeout`); rely on auto-waiting and `expect`.

## CI

Triggered by Vercel deployment success on `main` (repository dispatch), `.github/workflows/e2e-tests.yml`. On failure: Slack alert, and the `playwright-report` artifact (traces/screenshots/videos) is downloadable from the Actions run.
