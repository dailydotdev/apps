import { test, expect } from '@playwright/test';

const getRequiredEnv = (name: 'USER_NAME' | 'PASSWORD'): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }

  return value;
};

test.describe('Daily.dev Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    const userName = getRequiredEnv('USER_NAME');
    const password = getRequiredEnv('PASSWORD');

    await page.goto('/');

    await page
      .getByRole('button', { name: 'Accept all' })
      .or(page.getByRole('button', { name: 'I understand' }))
      .click();
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.getByRole('textbox', { name: 'Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(userName);
    await page.getByRole('textbox', { name: 'Email' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Log in' }).click();

    // Check for profile element on both mobile and desktop
    await expect(
      page.getByRole('link', { name: 'playwrighttest\'s profile' }).or(
        page.getByRole('button', { name: 'Profile settings' }),
      ),
    ).toBeVisible();
  });
});
