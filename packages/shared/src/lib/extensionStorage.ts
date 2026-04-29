// Thin helper to mirror selected UI state into `chrome.storage.local` so the
// background service worker can read it without re-implementing parsing.
// No-op outside the extension (web app, tests, SSR).

interface StorageArea {
  set: (items: Record<string, unknown>) => Promise<void> | void;
  remove?: (keys: string | string[]) => Promise<void> | void;
}

interface ChromeStorageGlobal {
  chrome?: { storage?: { local?: StorageArea } };
  browser?: { storage?: { local?: StorageArea } };
}

const getExtensionStorage = (): StorageArea | undefined => {
  const scope = globalThis as unknown as ChromeStorageGlobal;
  return scope.chrome?.storage?.local ?? scope.browser?.storage?.local;
};

// Anything that needs the mirror to be authoritative should fall back to the
// `localStorage` source of truth (e.g. the new-tab bootstrap reading the
// schedule directly), so a failure here is observability, not a bug we need
// to handle at every call site.
/* eslint-disable no-console -- diagnostic surface for the storage mirror;
   lint complains because we touch console at all, but observability is the
   whole point of this function. */
const reportMirrorFailure = (key: string, error: unknown): void => {
  if (typeof console === 'undefined' || typeof console.warn !== 'function') {
    return;
  }
  console.warn(`[mirrorToExtensionStorage] failed to mirror "${key}":`, error);
};
/* eslint-enable no-console */

export const mirrorToExtensionStorage = (key: string, value: unknown): void => {
  const storage = getExtensionStorage();
  if (!storage) {
    return;
  }
  try {
    const maybePromise = storage.set({ [key]: value });
    if (
      maybePromise &&
      typeof (maybePromise as Promise<void>).catch === 'function'
    ) {
      (maybePromise as Promise<void>).catch((error) =>
        reportMirrorFailure(key, error),
      );
    }
  } catch (error) {
    reportMirrorFailure(key, error);
  }
};
