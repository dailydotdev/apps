import { expect, type Page } from "@playwright/test";

export const TRACKING_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365 * 10;

export const extractRootDomain = (hostname: string): string => {
  const host = hostname.split(":")[0];
  if (host === "127.0.0.1") {
    return host;
  }
  const parts = host.split(".");
  while (parts.length > 2) {
    parts.shift();
  }
  return parts.join(".");
};

export const getRequiredEnv = (name: "USER_NAME" | "PASSWORD"): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }

  return value;
};

export const acceptCookieBanner = async (page: Page): Promise<void> => {
  await page
    .getByRole("button", { name: "Accept all" })
    .or(page.getByRole("button", { name: "I understand" }))
    .click({ timeout: 5000 })
    .catch(() => undefined);
};

export const login = async (page: Page): Promise<void> => {
  await page.goto("/");
  await acceptCookieBanner(page);

  const loginButton = page.getByRole("button", { name: "Log in" });

  if (!(await loginButton.isVisible({ timeout: 5000 }).catch(() => false))) {
    return;
  }

  await loginButton.click();

  // Scope the submit to the auth form, the page header keeps its own "Log in".
  const loginForm = page.locator("form").filter({
    has: page.getByRole("textbox", { name: "Password" }),
  });

  await loginForm
    .getByRole("textbox", { name: "Email" })
    .fill(getRequiredEnv("USER_NAME"));
  await loginForm
    .getByRole("textbox", { name: "Password" })
    .fill(getRequiredEnv("PASSWORD"));
  await loginForm.getByRole("button", { name: "Log in" }).click();

  await expect(
    page
      .getByRole("link", { name: /profile/i })
      .or(page.getByRole("button", { name: "Profile settings" }))
  ).toBeVisible({ timeout: 20000 });
};
