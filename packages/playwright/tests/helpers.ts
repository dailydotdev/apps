import { expect, type Locator, type Page } from '@playwright/test';

const cookieButtonNames = [
  /accept all/i,
  /accept/i,
  /i understand/i,
  /got it/i,
  /allow all/i,
];

const tryClick = async (locator: Locator): Promise<boolean> => {
  try {
    if ((await locator.count()) === 0) {
      return false;
    }

    await locator.first().click({ timeout: 2000 });
    return true;
  } catch {
    return false;
  }
};

export const dismissCookieBannerIfPresent = async (
  page: Page,
): Promise<void> => {
  for (const name of cookieButtonNames) {
    const clicked = await tryClick(page.getByRole('button', { name }));
    if (clicked) {
      return;
    }
  }
};

export const expectFeedToBeVisible = async (page: Page): Promise<void> => {
  await expect(page.getByTestId('posts-feed')).toBeVisible();
};

export const gotoAndExpectOk = async (
  page: Page,
  path: string,
): Promise<void> => {
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response, `No response while navigating to ${path}`).not.toBeNull();
  expect(response?.ok(), `Navigation to ${path} returned ${response?.status()}`).toBeTruthy();
};

export const expectAppShellToBeVisible = async (page: Page): Promise<void> => {
  const nextData = page.locator('script#__NEXT_DATA__');
  await expect(nextData).toHaveCount(1);

  const payload = await nextData.textContent();
  expect(payload, 'Missing __NEXT_DATA__ payload').toBeTruthy();
  expect(payload).toContain('"page"');
};

export const login = async (page: Page): Promise<void> => {
  if (!process.env.USER_NAME || !process.env.PASSWORD) {
    throw new Error('Missing USER_NAME/PASSWORD for authenticated tests');
  }

  await page.goto('/');
  await dismissCookieBannerIfPresent(page);

  await page.getByRole('button', { name: /^log in$/i }).first().click();
  await page.getByRole('textbox', { name: /email/i }).fill(process.env.USER_NAME);
  await page
    .getByRole('textbox', { name: /password/i })
    .fill(process.env.PASSWORD);
  await page.getByRole('button', { name: /^log in$/i }).first().click();

  await expect(
    page
      .getByRole('link', { name: /profile/i })
      .or(page.getByRole('button', { name: /profile settings/i })),
  ).toBeVisible();
};

