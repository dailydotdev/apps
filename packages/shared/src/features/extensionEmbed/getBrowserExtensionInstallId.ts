import { BrowserName, getCurrentBrowserName } from '../../lib/func';

/**
 * Resolves the installed browser extension id for embedded article previews.
 * - In the extension new tab / extension surfaces, `window.location.origin` is
 *   `chrome-extension://<id>`.
 * - On the webapp, expose browser-specific public ids so the iframe can point
 *   at the matching `frame.html` for the current browser.
 */
export const getBrowserExtensionInstallId = (): string | null => {
  if (typeof window !== 'undefined') {
    const match = /^chrome-extension:\/\/([^/]+)/.exec(window.location.origin);
    if (match?.[1]) {
      return match[1];
    }
  }

  const fromEnv = process.env.NEXT_PUBLIC_DAILY_EXTENSION_ID?.trim();
  if (fromEnv) {
    return fromEnv;
  }

  const chromeId = process.env.NEXT_PUBLIC_DAILY_CHROME_EXTENSION_ID?.trim();
  const edgeId = process.env.NEXT_PUBLIC_DAILY_EDGE_EXTENSION_ID?.trim();
  const browserName = getCurrentBrowserName();

  if (browserName === BrowserName.Edge) {
    return edgeId || chromeId || null;
  }

  if ([BrowserName.Chrome, BrowserName.Brave].includes(browserName)) {
    return chromeId || edgeId || null;
  }

  return chromeId || edgeId || null;
};
