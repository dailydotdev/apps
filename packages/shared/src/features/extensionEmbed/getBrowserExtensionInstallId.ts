/**
 * Resolves the installed browser extension id for embedded article previews.
 *
 * Resolution order:
 * 1. Extension surfaces (new tab / companion) — `window.location.origin`
 *    already encodes the id as `chrome-extension://<id>`.
 * 2. Webapp surfaces where the extension's ping content script has run — it
 *    stamps the real, browser-assigned id onto `<html data-daily-extension-id>`.
 *    This beats any statically-baked build env because it reflects the id of
 *    the extension the user *actually* has installed.
 * 3. Fallback to `NEXT_PUBLIC_DAILY_EXTENSION_ID` for pre-ping-script
 *    extension versions and for SSR.
 */
export const getBrowserExtensionInstallId = (): string | null => {
  if (typeof window !== 'undefined') {
    const match = /^chrome-extension:\/\/([^/]+)/.exec(window.location.origin);
    if (match?.[1]) {
      return match[1];
    }

    const fromMarker =
      document.documentElement?.dataset?.dailyExtensionId?.trim();
    if (fromMarker) {
      return fromMarker;
    }
  }

  const fromEnv = process.env.NEXT_PUBLIC_DAILY_EXTENSION_ID?.trim();
  return fromEnv || null;
};
