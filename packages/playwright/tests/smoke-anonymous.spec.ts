import { test, expect } from '@playwright/test';
import {
  dismissCookieBannerIfPresent,
  expectAppShellToBeVisible,
  gotoAndExpectOk,
} from './helpers';

test.describe('Anonymous smoke', () => {
  test('loads homepage shell', async ({ page }) => {
    await gotoAndExpectOk(page, '/');
    await dismissCookieBannerIfPresent(page);

    await expect(page).toHaveURL(/\/$/);
    await expect(page).toHaveTitle(/daily\.dev/i);
    await expectAppShellToBeVisible(page);
  });

  test('loads popular route for anonymous user', async ({ page }) => {
    await gotoAndExpectOk(page, '/popular');
    await dismissCookieBannerIfPresent(page);

    await expect(page).toHaveURL(/popular/);
    await expectAppShellToBeVisible(page);
  });

  test('loads search route for anonymous user', async ({ page }) => {
    await gotoAndExpectOk(page, '/search?q=typescript');
    await dismissCookieBannerIfPresent(page);

    await expect(page).toHaveURL(/search/);
    await expectAppShellToBeVisible(page);
  });

  test('supports browser back and forward between routes', async ({ page }) => {
    await gotoAndExpectOk(page, '/');
    await gotoAndExpectOk(page, '/popular');

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expectAppShellToBeVisible(page);

    await page.goForward();
    await expect(page).toHaveURL(/popular/);
    await expectAppShellToBeVisible(page);
  });
});

