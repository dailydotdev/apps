import { chromium } from '@playwright/test';
const base = 'https://google-preferred-sources-dailydo.preview.app.daily.dev';
const slug = 'my-proxmox-server-became-more-useful-when-i-stopped-treating-lxcs-as-docker-containers-7oqfdczwk';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport:{width:1440,height:950} })).newPage();
const resp = await page.goto(`${base}/posts/${slug}?preferredSource=1`, { waitUntil:'domcontentloaded' });
await page.waitForTimeout(15000);
const r = await page.evaluate(() => ({
  bodyLen: document.body.innerText.length,
  hasRecommend: /recommend this post/i.test(document.body.innerText),
  hasPreferred: /preferred source/i.test(document.body.innerText),
  scriptTag: !!document.getElementById('google-preferred-source'),
  asideCount: document.querySelectorAll('aside').length,
  title: document.title.slice(0,60),
}));
console.log('HTTP', resp.status(), JSON.stringify(r));
await browser.close();
