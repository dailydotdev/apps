/**
 * Resolves the installed browser extension id for embedded article previews.
 * - In the extension new tab / extension surfaces, `window.location.origin` is
 *   `chrome-extension://<id>`.
 * - On the webapp, set `NEXT_PUBLIC_DAILY_EXTENSION_ID` to the Chrome Web Store
 *   extension id so iframe URLs can point at `frame.html`.
 */
export const getBrowserExtensionInstallId = (): string | null => {
  if (typeof window !== 'undefined') {
    const match = /^chrome-extension:\/\/([^/]+)/.exec(window.location.origin);
    if (match?.[1]) {
      return match[1];
    }
  }

  const fromEnv = process.env.NEXT_PUBLIC_DAILY_EXTENSION_ID?.trim();
  return fromEnv || null;
};
