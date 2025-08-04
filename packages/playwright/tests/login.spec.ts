import { test, expect } from '@playwright/test';

test.describe('Daily.dev Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Accept all' }).click();
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.getByRole('textbox', { name: 'Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(process.env.USER_NAME);
    await page.getByRole('textbox', { name: 'Email' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill(process.env.PASSWORD);
    await page.getByRole('button', { name: 'Log in' }).click();
    // Check for profile element on both mobile and desktop
    await expect(
      page.getByRole('link', { name: 'playwrighttest\'s profile' }).or(
        page.getByRole('button', { name: 'Profile settings' })
      )
    ).toBeVisible()
  });
});
