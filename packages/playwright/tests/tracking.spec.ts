import { test, expect } from "@playwright/test";
import { extractRootDomain } from "./helpers";

test("da2 cookie is seeded with correct format and domain scope", async ({
  context,
  baseURL,
}) => {
  if (!baseURL) {
    throw new Error("BASE_URL is required");
  }
  const { hostname } = new URL(baseURL);
  const expectedDomain = extractRootDomain(hostname);

  const cookies = await context.cookies(baseURL);
  const da2 = cookies.find((c) => c.name === "da2");

  expect(da2).toBeDefined();
  expect(da2).toMatchObject({
    name: "da2",
    value: expect.stringMatching(/^e2etest[a-zA-Z0-9]{14}$/),
    domain: `.${expectedDomain}`,
    path: "/",
    httpOnly: false,
    secure: false,
    sameSite: "Lax",
  });
  expect(da2?.expires).toBeGreaterThan(0);
});
