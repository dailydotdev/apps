# Playwright E2E Tests

- Tests run against live production (`https://daily.dev`) unless `BASE_URL` is set, logged in with `USER_NAME`/`PASSWORD` from a git-ignored `.env` (GitHub secrets in CI). Never hardcode credentials.
- The project matrix includes Pixel 5 and iPhone 12, so the same element often differs by viewport. Use `.or()` to accept both variants.
- CI runs on Vercel deployment success of `main` (`.github/workflows/e2e-tests.yml`); the `playwright-report` artifact on the Actions run has traces and screenshots for failures.
