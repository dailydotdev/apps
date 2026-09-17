import { test, expect, type Page } from '@playwright/test';
import { login } from './helpers';

/**
 * This is the only spec in the package that writes to the shared CI account,
 * and it runs against live production. Cleanup is best effort: if Save itself
 * fails the link was never stored, and if it stored but the redirect did not
 * happen the row is still removed below. A hard failure mid-cleanup leaves one
 * `dailydev-e2e-*` link behind for a maintainer to delete.
 */
const openProfileSettings = async (page: Page): Promise<void> => {
  await page.goto('/settings/profile');

  // The links section stays disabled until the profile query settles, so the
  // list is only trustworthy once the input is enabled.
  await expect(page.getByRole('textbox', { name: 'Add link' })).toBeEnabled({
    timeout: 20000,
  });
};

const removeSocialLink = async (page: Page, url: string): Promise<void> => {
  await openProfileSettings(page);

  const linkRow = page.getByTestId('social-link-row').filter({ hasText: url });

  if ((await linkRow.count()) === 0) {
    return;
  }

  await linkRow.getByRole('button', { name: 'Remove link' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForURL(
    (currentUrl) => !currentUrl.pathname.startsWith('/settings/profile'),
    { timeout: 20000 },
  );
};

test.skip(
  !process.env.USER_NAME || !process.env.PASSWORD,
  'Credentials are required',
);
test.skip(
  ({ browserName, isMobile }) => browserName !== 'chromium' || isMobile,
  'Run the mutating profile regression once',
);

test('persists a pasted GitHub link when saving without clicking Add', async ({
  page,
}) => {
  const handle = `dailydev-e2e-${Date.now()}`;
  const typedUrl = `github.com/${handle}`;
  const savedUrl = `https://github.com/${handle}`;
  const savedLink = page.locator(
    `[data-testid="social-link-github"][href="${savedUrl}"]`,
  );

  await login(page);

  try {
    await openProfileSettings(page);
    await page.getByRole('textbox', { name: 'Add link' }).fill(typedUrl);
    await page.getByRole('button', { name: 'Save' }).click();

    await page.waitForURL(
      (currentUrl) => !currentUrl.pathname.startsWith('/settings/profile'),
      { timeout: 20000 },
    );
    await expect(savedLink).toBeVisible();

    await page.reload();
    await expect(savedLink).toBeVisible();
  } finally {
    await removeSocialLink(page, savedUrl);
  }
});
