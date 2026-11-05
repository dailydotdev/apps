// Takes the pictures the Startups Onboarding pages show as previews. Run it with
// Storybook on port 6047 after a design change, optionally only for stories whose
// id contains a word: node scripts/startups-previews.mjs [word]
import { createRequire } from 'module';
import { mkdirSync, readdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const pnpm = join(here, '../../../node_modules/.pnpm');
const version = readdirSync(pnpm).find((d) => d.startsWith('playwright-core@'));
const { chromium } = createRequire(import.meta.url)(
  join(pnpm, version, 'node_modules/playwright-core'),
);

const BASE = 'http://localhost:6047/';
const OUT = join(here, '../public/startups-onboarding/previews');
const CONCURRENCY = 4;
const DESKTOP = { width: 1280, height: 860 };
const PHONE = { width: 375, height: 812 };

const usedByUseCases = [
  /^startups-onboarding-2-screens--/,
  /^startups-onboarding-2b-manage-and-upsell--/,
  /^startups-onboarding-4-states-and-recoveries--(?!overview)/,
  /^startups-playgrounds-today-remaining-states--/,
  /^features-squads-daily-dev-for-startups-states-a-account--/,
  /^features-squads-daily-dev-for-startups-checkout--/,
];
const usedByChoices = [
  /^startups-onboarding-3b-sign-up-panel--(?!overview)/,
  /^startups-onboarding-3d-company-step-directions--/,
  /^startups-onboarding-3-design-decisions--(progress-|centered)(?!options)/,
];

const word = process.argv[2];
const index = await fetch(`${BASE}index.json`).then((r) => r.json());
const ids = Object.keys(index.entries).filter(
  (id) => !word || id.includes(word),
);
const jobs = [
  ...ids
    .filter((id) =>
      [...usedByUseCases, ...usedByChoices].some((re) => re.test(id)),
    )
    .map((id) => ({ id, size: DESKTOP })),
  ...ids
    .filter((id) => usedByUseCases.some((re) => re.test(id)))
    .map((id) => ({ id, size: PHONE })),
];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const failed = [];
let bytes = 0;
let next = 0;

const toWebp = (page, png) =>
  page.evaluate(async (base64) => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext('2d').drawImage(image, 0, 0);
    return canvas.toDataURL('image/webp', 0.8).split(',')[1];
  }, png.toString('base64'));

const worker = async () => {
  while (next < jobs.length) {
    const { id, size } = jobs[next];
    next += 1;
    const context = await browser.newContext({ viewport: size });
    const page = await context.newPage();

    try {
      await page.goto(
        `${BASE}iframe.html?id=${id}&viewMode=story&globals=theme:dark`,
        { timeout: 120000 },
      );
      await page.waitForFunction(
        () => document.querySelector('#storybook-root')?.children.length,
        { timeout: 120000 },
      );
      // Stories with a play function need time to click through to their state.
      await page.waitForTimeout(id.includes('states-a-account') ? 9000 : 4000);

      const hasError = await page.evaluate(() => {
        const error = document.querySelector('.sb-errordisplay');
        return error && getComputedStyle(error).display !== 'none';
      });

      if (hasError) {
        failed.push(id);
      } else {
        const png = await page.screenshot();
        const webp = Buffer.from(await toWebp(page, png), 'base64');
        bytes += webp.length;
        writeFileSync(join(OUT, `${id}.${size.width}.webp`), webp);
      }
    } catch (error) {
      failed.push(`${id}: ${error.message.slice(0, 80)}`);
    }

    await context.close();
  }
};

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
await browser.close();
console.log(
  `${jobs.length - failed.length}/${jobs.length} pictures, ${Math.round(bytes / 1048576)} MB`,
);
if (failed.length) {
  console.log('Failed:', failed);
}
