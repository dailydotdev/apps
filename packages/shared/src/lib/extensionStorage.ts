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
      (maybePromise as Promise<void>).catch(() => undefined);
    }
  } catch {
    // Swallow: mirroring is best-effort. Background falls back to defaults.
  }
};
