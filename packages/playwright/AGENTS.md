# Playwright E2E Tests

End-to-end tests for daily.dev using Playwright. Tests run against the live production site (`https://app.daily.dev`) or a custom `BASE_URL`.

## Quick Start

```bash
cd packages/playwright

# First time: install Playwright browsers
pnpm install-deps

# Create .env with test credentials
cat > .env <<EOF
USER_NAME=<test-account-email>
PASSWORD=<test-account-password>
EOF

# Run tests
pnpm test              # Headless (all browsers)
pnpm test:headed       # With browser UI visible
pnpm test:ui           # Interactive UI mode
pnpm test:debug        # Debug mode with inspector
pnpm test:codegen      # Record actions → generate test code
pnpm report            # View HTML report from last run
```

From the monorepo root:

```bash
pnpm test:e2e          # Same as pnpm test inside this package
pnpm test:e2e:headed   # Headed mode
pnpm test:e2e:ui       # UI mode
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BASE_URL` | No | `https://app.daily.dev` | Target URL for tests |
| `USER_NAME` | Yes | — | Test account email |
| `PASSWORD` | Yes | — | Test account password |

These live in `.env` (git-ignored). In CI they come from GitHub secrets.

## Writing Tests

Tests go in `tests/` and use the `*.spec.ts` naming convention.

### Patterns

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature name', () => {
  test('should do the expected thing', async ({ page }) => {
    await page.goto('/');

    // Use role-based selectors (accessible, resilient to markup changes)
    await page.getByRole('button', { name: 'Log in' }).click();

    // Read credentials from env
    await page.getByRole('textbox', { name: 'Email' }).fill(process.env.USER_NAME);

    // Use .or() for elements that vary across viewports (mobile vs desktop)
    await expect(
      page.getByRole('link', { name: 'Profile' })
        .or(page.getByRole('button', { name: 'Profile settings' }))
    ).toBeVisible();
  });
});
```

### Key Conventions

- **Role-based selectors first** — `getByRole`, `getByLabel`, `getByText`. Avoid CSS/XPath selectors.
- **Handle cookie consent** — Pages may show a consent banner. Dismiss it early:
  ```typescript
  await page.getByRole('button', { name: 'Accept all' })
    .or(page.getByRole('button', { name: 'I understand' }))
    .click();
  ```
- **Mobile/desktop variance** — Use `.or()` when elements differ by viewport. The test matrix includes Chromium, Firefox, Mobile Chrome (Pixel 5), and Mobile Safari (iPhone 12).
- **No hardcoded waits** — Use Playwright's auto-waiting and `expect` assertions instead of `setTimeout` or `page.waitForTimeout`.
- **Credentials from env** — Never hardcode test account credentials. Always read from `process.env`.

## Browser Matrix

| Project | Device |
|---------|--------|
| `chromium` | Desktop Chrome |
| `firefox` | Desktop Firefox |
| `Mobile Chrome` | Pixel 5 |
| `Mobile Safari` | iPhone 12 |

WebKit (Desktop Safari) is configured but currently commented out.

## Configuration

- **Config file**: `playwright.config.ts`
- **Parallel**: Fully parallel locally, single worker on CI
- **Retries**: 2 on CI, 0 locally
- **Artifacts on failure**: Screenshots, video recordings, traces (on first retry)
- **Reporter**: HTML (output at `playwright-report/`)

## CI

E2E tests run via GitHub Actions (`.github/workflows/e2e-tests.yml`):

- **Trigger**: Vercel deployment success on `main` branch (repository dispatch)
- **Container**: `mcr.microsoft.com/playwright:v1.54.2-noble` (browsers pre-installed)
- **Artifacts**: Playwright HTML report uploaded (30-day retention)
- **Alerts**: Slack notification on failure

## Debugging Failures

```bash
# View the HTML report from the last run
pnpm report

# Run a single test file
pnpm test tests/login.spec.ts

# Run in debug mode (opens inspector)
pnpm test:debug

# Run with trace viewer enabled for all tests
pnpm test -- --trace on
```

In CI, download the `playwright-report` artifact from the GitHub Actions run to inspect traces, screenshots, and videos.
