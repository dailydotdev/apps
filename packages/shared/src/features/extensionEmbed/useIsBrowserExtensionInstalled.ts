import { useSyncExternalStore } from 'react';

// The extension ships a tiny content script (`ping`) that runs at
// document_start on daily.dev origins and stamps `<html data-daily-extension-installed>`.
// Reading that marker is the source of truth for "is the extension installed
// in this browser right now?" — it runs before any webapp JS, so the check is
// synchronous, id-agnostic, and doesn't depend on the webapp's build env
// matching the real installed extension id.
const MARKER_DATASET_KEY = 'dailyExtensionInstalled';
const MARKER_ATTRIBUTE = 'data-daily-extension-installed';

const readMarker = (): boolean => {
  if (typeof document === 'undefined') {
    return false;
  }
  return document.documentElement?.dataset?.[MARKER_DATASET_KEY] === 'true';
};

const subscribe = (onChange: () => void): (() => void) => {
  if (
    typeof document === 'undefined' ||
    typeof MutationObserver === 'undefined'
  ) {
    return () => {};
  }

  const observer = new MutationObserver(() => onChange());
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [MARKER_ATTRIBUTE],
  });

  return () => observer.disconnect();
};

const getServerSnapshot = (): boolean => false;

export type UseIsBrowserExtensionInstalled = {
  isInstalled: boolean;
  // Kept for API symmetry with the old probe-based hook. The marker read is
  // synchronous so there's no real "checking" phase on the webapp.
  isChecking: boolean;
};

export const useIsBrowserExtensionInstalled =
  (): UseIsBrowserExtensionInstalled => {
    const isInstalled = useSyncExternalStore(
      subscribe,
      readMarker,
      getServerSnapshot,
    );

    return { isInstalled, isChecking: false };
  };

// Function form for non-hook callers (e.g. imperative checks).
export const isBrowserExtensionInstalled = (): boolean => readMarker();
