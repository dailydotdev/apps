import { test as setup } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import {
  extractRootDomain,
  TRACKING_COOKIE_MAX_AGE_SECONDS,
} from './helpers';

const authFile = path.resolve(__dirname, '../playwright/.auth/tracking.json');

const ALNUM =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const randomAlnum = (length: number): string => {
  let out = '';
  while (out.length < length) {
    for (const byte of randomBytes(length * 2)) {
      if (byte < 248) {
        out += ALNUM[byte % 62];
      }
      if (out.length === length) {
        break;
      }
    }
  }
  return out;
};

setup('seed da2 tracking cookie', async ({ context, baseURL }) => {
  if (!baseURL) {
    throw new Error('BASE_URL is required to seed the da2 cookie');
  }

  const { hostname } = new URL(baseURL);
  const domain = extractRootDomain(hostname);
  const value = `e2etest${randomAlnum(14)}`;

  const expires =
    Math.floor(Date.now() / 1000) + TRACKING_COOKIE_MAX_AGE_SECONDS;

  await context.addCookies([
    {
      name: 'da2',
      value,
      domain,
      path: '/',
      expires,
    },
  ]);

  await context.storageState({ path: authFile });
});
