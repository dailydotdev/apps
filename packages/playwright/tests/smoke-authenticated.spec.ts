import { test, expect } from '@playwright/test';
import { expectFeedToBeVisible, login } from './helpers';

const hasCredentials = !!process.env.USER_NAME && !!process.env.PASSWORD;

test.describe('Authenticated smoke', () => {
  test.skip(!hasCredentials, 'Requires USER_NAME/PASSWORD');

  test('logs in successfully', async ({ page }) => {
    await login(page);
  });

  test('loads my feed after login', async ({ page }) => {
    await login(page);
    await page.goto('/my-feed');

    await expect(page).toHaveURL(/my-feed|app\.daily\.dev\/$/);
    await expectFeedToBeVisible(page);
  });

  test('opens settings for authenticated user', async ({ page }) => {
    await login(page);
    await page.goto('/settings');

    await expect(page).toHaveURL(/settings/);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });
});

