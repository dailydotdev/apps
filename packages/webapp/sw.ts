import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Serwist } from 'serwist';
import { shouldEnableNavigationPreload } from './lib/serviceWorker';

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

const serwist = new Serwist({
  // eslint-disable-next-line no-underscore-dangle
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: defaultCache,
  precacheOptions: {
    concurrency: 3,
    cleanupOutdatedCaches: true,
  },
});

const updateNavigationPreload = async (): Promise<void> => {
  if (!self.registration.navigationPreload) {
    return;
  }

  if (shouldEnableNavigationPreload(self.navigator.userAgent)) {
    await self.registration.navigationPreload.enable();
    return;
  }

  await self.registration.navigationPreload.disable();
};

self.addEventListener('activate', (event) => {
  event.waitUntil(updateNavigationPreload());
});

serwist.addEventListeners();
