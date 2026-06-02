// Page <-> content-script bridge for the post-install activation primer.
//
// The webapp asks the extension to open `chrome://newtab` so Chrome shows
// the new-tab override-confirmation bubble while the user is still in our
// primer context. The webapp dispatches a CustomEvent on `window`; the ping
// content script forwards it to the background, which calls
// `chrome.tabs.create({ url: 'chrome://newtab' })`. The literal
// `chrome://newtab` URL is required — passing the override page via
// `chrome.runtime.getURL` would not register as an NTP visit and would not
// trigger the bubble.

export const newTabActivationBridgeRequestEvent =
  'daily-extension-request-open-new-tab';
export const newTabActivationBridgeResultEvent =
  'daily-extension-open-new-tab-result';

export type NewTabActivationBridgeResult = {
  triggered: boolean;
  error?: string;
};

const PAGE_HELPER_TIMEOUT_MS = 10_000;

// Drives `chrome.tabs.create({ url: 'chrome://newtab' })` through the
// installed extension's content script. Resolves once the background has
// confirmed the tab was opened (or on timeout if the extension is absent).
export const requestOpenNewTabFromPage = (
  timeoutMs: number = PAGE_HELPER_TIMEOUT_MS,
): Promise<NewTabActivationBridgeResult> => {
  if (typeof window === 'undefined') {
    return Promise.resolve({
      triggered: false,
      error: 'window-unavailable',
    });
  }

  return new Promise<NewTabActivationBridgeResult>((resolve) => {
    let settled = false;
    let timeoutId: ReturnType<typeof globalThis.setTimeout> | undefined;

    const onResult = (event: Event): void => {
      if (settled) {
        return;
      }
      settled = true;
      window.removeEventListener(newTabActivationBridgeResultEvent, onResult);
      if (timeoutId !== undefined) {
        globalThis.clearTimeout(timeoutId);
      }
      const { detail } = event as CustomEvent<NewTabActivationBridgeResult>;
      resolve({
        triggered: !!detail?.triggered,
        error: detail?.error,
      });
    };

    timeoutId = globalThis.setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      window.removeEventListener(newTabActivationBridgeResultEvent, onResult);
      resolve({ triggered: false, error: 'timeout' });
    }, timeoutMs);

    window.addEventListener(newTabActivationBridgeResultEvent, onResult);

    window.dispatchEvent(new CustomEvent(newTabActivationBridgeRequestEvent));
  });
};
