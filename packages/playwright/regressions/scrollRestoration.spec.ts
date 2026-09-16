import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import path from 'path';
import ts from 'typescript';

declare global {
  interface Window {
    scrollRestorationHarness: typeof import('../../shared/src/lib/scrollRestoration');
  }
}

const source = readFileSync(
  path.resolve(__dirname, '../../shared/src/lib/scrollRestoration.ts'),
  'utf8'
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});

test.beforeEach(async ({ page, context, browserName }) => {
  if (browserName === 'chromium') {
    const session = await context.newCDPSession(page);
    await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  }
  await page.route('http://scroll-restoration.test/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0}#feed{height:2000px}</style><main id="feed">Cached feed fixture</main>',
    })
  );
  await page.goto('http://scroll-restoration.test/');
  await page.addScriptTag({
    content: `window.scrollRestorationHarness = {}; (function(exports) { ${outputText}\n })(window.scrollRestorationHarness);`,
  });
});

test('native scrolling clamps on a short feed; shared restoration waits for delayed growth', async ({
  page,
}) => {
  const clampedPosition = await page.evaluate(() => {
    window.scrollTo(0, 5000);
    return window.scrollY;
  });
  expect(clampedPosition).toBeGreaterThan(0);
  expect(clampedPosition).toBeLessThan(5000);

  await page.evaluate(() => {
    window.scrollTo(0, 0);
    window.scrollRestorationHarness.restoreScrollPosition(5000);
    window.setTimeout(() => {
      document.getElementById('feed')!.style.height = '12000px';
    }, 2500);
  });
  await expect
    .poll(() => page.evaluate(() => window.scrollY), { timeout: 6000 })
    .toBe(5000);
});

test('late feed growth cannot scroll the reader after the deadline', async ({
  page,
}) => {
  await page.evaluate(() =>
    window.scrollRestorationHarness.restoreScrollPosition(5000)
  );
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          window.scrollRestorationHarness.isScrollRestoring()
        ),
      {
        timeout: 12000,
      }
    )
    .toBe(false);
  await page.evaluate(async () => {
    document.getElementById('feed')!.style.height = '12000px';
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );
  });
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test('native scroll events cancel a pending restoration', async ({ page }) => {
  await page.evaluate(() => {
    window.scrollRestorationHarness.restoreScrollPosition(5000);
    window.scrollTo(0, 200);
  });
  await expect
    .poll(() =>
      page.evaluate(() => window.scrollRestorationHarness.isScrollRestoring())
    )
    .toBe(false);
  await page.evaluate(async () => {
    document.getElementById('feed')!.style.height = '12000px';
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );
  });
  expect(await page.evaluate(() => window.scrollY)).toBe(200);
});

test('restores delayed content without ResizeObserver', async ({ page }) => {
  await page.evaluate(() => {
    Reflect.deleteProperty(window, 'ResizeObserver');
    window.scrollRestorationHarness.restoreScrollPosition(5000);
    window.setTimeout(() => {
      document.getElementById('feed')!.style.height = '12000px';
    }, 2500);
  });
  await expect
    .poll(() => page.evaluate(() => window.scrollY), { timeout: 6000 })
    .toBe(5000);
});

test('restores a modal origin after native browser Back creates a new feed entry on close', async ({
  page,
}) => {
  await page.evaluate(() => {
    window.history.scrollRestoration = 'manual';
    window.history.replaceState({ key: 'feed' }, '', '/');
    window.history.pushState({ key: 'modal' }, '', '/posts/example');
    window.scrollRestorationHarness.saveScrollPosition(
      '/posts/example',
      5000,
      'post-modal'
    );
    window.history.pushState({ key: 'closed-feed' }, '', '/');
  });
  await page.goBack();
  await expect(page).toHaveURL('http://scroll-restoration.test/posts/example');
  await page.evaluate(() => {
    const target = window.scrollRestorationHarness.getScrollPosition(
      '/posts/example',
      'post-modal'
    )!;
    window.history.pushState({ key: 'closed-again' }, '', '/');
    window.scrollRestorationHarness.saveScrollPosition('/', target);
    window.scrollRestorationHarness.restoreScrollPosition(target);
    window.setTimeout(() => {
      document.getElementById('feed')!.style.height = '12000px';
    }, 2500);
  });
  await expect
    .poll(() => page.evaluate(() => window.scrollY), { timeout: 6000 })
    .toBe(5000);
});
