import { test, expect, type Page } from "@playwright/test";
import { login } from "./helpers";

const removeSocialLink = async (page: Page, url: string): Promise<void> => {
  await page.goto("/settings/profile");
  await expect(page.getByRole("textbox", { name: "Add link" })).toBeVisible();

  const linkRow = page.getByTestId("social-link-row").filter({ hasText: url });

  if ((await linkRow.count()) === 0) {
    return;
  }

  await linkRow.getByRole("button", { name: "Remove link" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForURL(
    (currentUrl) => !currentUrl.pathname.startsWith("/settings/profile"),
    {
      timeout: 20000,
    }
  );
};

test.skip(
  !process.env.USER_NAME || !process.env.PASSWORD,
  "Credentials are required"
);
test.skip(
  ({ browserName, isMobile }) => browserName !== "chromium" || isMobile,
  "Run the mutating profile regression once"
);

test("persists a pasted GitHub link when saving without clicking Add", async ({
  page,
}) => {
  const handle = `dailydev-e2e-${Date.now()}`;
  const typedUrl = `github.com/${handle}`;
  const savedUrl = `https://github.com/${handle}`;
  const savedLink = page.locator(
    `[data-testid="social-link-github"][href="${savedUrl}"]`
  );

  await login(page);

  try {
    await page.goto("/settings/profile");
    await page.getByRole("textbox", { name: "Add link" }).fill(typedUrl);
    await page.getByRole("button", { name: "Save" }).click();

    await page.waitForURL(
      (currentUrl) => !currentUrl.pathname.startsWith("/settings/profile"),
      { timeout: 20000 }
    );
    await expect(savedLink).toBeVisible();

    await page.reload();
    await expect(savedLink).toBeVisible();
  } finally {
    await removeSocialLink(page, savedUrl);
  }
});
