import { test, expect, type Page } from '@playwright/test';

const getRequiredEnv = (name: 'USER_NAME' | 'PASSWORD'): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }

  return value;
};

const acceptCookieBanner = async (page: Page): Promise<void> => {
  await page
    .getByRole('button', { name: 'Accept all' })
    .or(page.getByRole('button', { name: 'I understand' }))
    .click({ timeout: 5000 })
    .catch(() => undefined);
};

const login = async (page: Page): Promise<void> => {
  await page.goto('/');
  await acceptCookieBanner(page);

  const loginButton = page.getByRole('button', { name: 'Log in' });

  if (!(await loginButton.isVisible({ timeout: 5000 }).catch(() => false))) {
    return;
  }

  await loginButton.click();
  await page
    .getByRole('textbox', { name: 'Email' })
    .fill(getRequiredEnv('USER_NAME'));
  await page
    .getByRole('textbox', { name: 'Password' })
    .fill(getRequiredEnv('PASSWORD'));
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(
    page
      .getByRole('link', { name: /profile/i })
      .or(page.getByRole('button', { name: 'Profile settings' })),
  ).toBeVisible({ timeout: 20000 });
};

const removeSocialLink = async (page: Page, url: string): Promise<void> => {
  await page.goto('/settings/profile');
  await expect(page.getByRole('textbox', { name: 'Add link' })).toBeVisible();

  const linkRow = page.locator('div', { hasText: url }).filter({
    has: page.getByRole('button', { name: 'Remove link' }),
  });

  if ((await linkRow.count()) === 0) {
    return;
  }

  await linkRow.first().getByRole('button', { name: 'Remove link' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForURL(
    (currentUrl) => !currentUrl.pathname.startsWith('/settings/profile'),
    {
      timeout: 20000,
    },
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
    await page.goto('/settings/profile');
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
