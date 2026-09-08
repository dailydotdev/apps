import { chromium } from '@playwright/test';
const base = 'https://preferred-sources-scoped-dailydo.preview.app.daily.dev';
const slug = 'my-proxmox-server-became-more-useful-when-i-stopped-treating-lxcs-as-docker-containers-7oqfdczwk';
const url = `${base}/posts/${slug}?preferredSource=1`;
const browser = await chromium.launch();

const probe = async (block) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await ctx.newPage();
  if (block) {
    // simulate a content blocker eating the publisher script
    await page.route('**/news.google.com/swg/**', (r) => r.abort());
  }
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(16000); // past the 4s timeout
  const r = await page.evaluate(() => {
    const el = [...document.querySelectorAll('button,a')]
      .find((e) => /add as preferred source/i.test(e.innerText || ''));
    if (!el) return { found: false };
    return { found: true, tag: el.tagName,
      disabled: el.tagName === 'BUTTON' ? el.disabled : false,
      href: el.getAttribute('href'), target: el.getAttribute('target') };
  });
  console.log(block ? 'SCRIPT BLOCKED :' : 'SCRIPT ALLOWED :', JSON.stringify(r));
  await ctx.close();
};

await probe(false);
await probe(true);
await browser.close();
