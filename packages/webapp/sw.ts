import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Serwist } from 'serwist';

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const excludedSafariVendors = /(Chrome|Chromium|Android|CriOS|FxiOS|Edg|OPR)/i;
const isSafariWorker = (): boolean => {
  const userAgent = self.navigator?.userAgent || '';
  return /Safari/i.test(userAgent) && !excludedSafariVendors.test(userAgent);
};

if (isSafariWorker()) {
  // Safari crashes with WebKitInternal:0 when this SW intercepts navigations (ENG-210).
  self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      (async () => {
        await self.clients.claim();
        await self.registration.unregister();
      })(),
    );
  });
} else {
  const serwist = new Serwist({
    // eslint-disable-next-line no-underscore-dangle
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: defaultCache,
    precacheOptions: {
      concurrency: 3,
      cleanupOutdatedCaches: true,
    },
  });

  serwist.addEventListeners();
}
