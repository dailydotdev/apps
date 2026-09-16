import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './regressions',
  testMatch: 'scrollRestoration.spec.ts',
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: { screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'pixel-5-chromium', use: { ...devices['Pixel 5'] } },
  ],
});
