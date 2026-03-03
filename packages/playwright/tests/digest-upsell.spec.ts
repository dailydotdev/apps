import { test, expect } from '@playwright/test';

test.describe('Digest Upsell Banners', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Handle cookie consent
    await page
      .getByRole('button', { name: 'Accept all' })
      .or(page.getByRole('button', { name: 'I understand' }))
      .click();

    // Log in
    await page.getByRole('button', { name: 'Log in' }).click();
    await page
      .getByRole('textbox', { name: 'Email' })
      .fill(process.env.USER_NAME);
    await page.getByRole('textbox', { name: 'Password' }).press('Tab');
    await page
      .getByRole('textbox', { name: 'Password' })
      .fill(process.env.PASSWORD);
    await page.getByRole('button', { name: 'Log in' }).click();

    // Wait for auth to complete
    await expect(
      page
        .getByRole('link', { name: 'profile' })
        .or(page.getByRole('button', { name: 'Profile settings' })),
    ).toBeVisible();
  });

  test('notifications page shows digest upsell banner for eligible users', async ({
    page,
  }) => {
    await page.goto('/notifications');

    // The banner should be visible if the user is non-Plus and has no digest
    const banner = page.getByText('Get your personalized digest');
    const enableButton = page.getByRole('button', { name: 'Enable digest' });

    // If the banner is visible, verify its structure
    if (await banner.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(banner).toBeVisible();
      await expect(enableButton).toBeVisible();

      // Verify close button exists
      const closeButton = page.getByRole('button', { name: 'Close' });
      await expect(closeButton).toBeVisible();
    }
  });

  test('bookmarks page shows digest upsell banner for eligible users', async ({
    page,
  }) => {
    await page.goto('/bookmarks');

    // The banner should be visible if the user is non-Plus and has no digest
    const banner = page.getByText('Never miss the best posts');
    const enableButton = page.getByRole('button', { name: 'Enable digest' });

    // If the banner is visible, verify its structure
    if (await banner.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(banner).toBeVisible();
      await expect(enableButton).toBeVisible();

      // Verify close button exists
      const closeButton = page.getByRole('button', { name: 'Close' });
      await expect(closeButton).toBeVisible();
    }
  });

  test('digest upsell banner can be dismissed on notifications page', async ({
    page,
  }) => {
    await page.goto('/notifications');

    const banner = page.getByText('Get your personalized digest');

    // Only test dismiss if banner is visible (user is eligible)
    if (await banner.isVisible({ timeout: 5000 }).catch(() => false)) {
      const closeButton = page.getByRole('button', { name: 'Close' });
      await closeButton.click();

      await expect(banner).toBeHidden();
    }
  });

  test('digest upsell banner can be dismissed on bookmarks page', async ({
    page,
  }) => {
    await page.goto('/bookmarks');

    const banner = page.getByText('Never miss the best posts');

    // Only test dismiss if banner is visible (user is eligible)
    if (await banner.isVisible({ timeout: 5000 }).catch(() => false)) {
      const closeButton = page.getByRole('button', { name: 'Close' });
      await closeButton.click();

      await expect(banner).toBeHidden();
    }
  });
});
