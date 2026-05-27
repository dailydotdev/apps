// Page <-> content-script bridge for the post-install activation primer.
//
// The webapp asks the extension to open `chrome://newtab` so Chrome shows
// the override-confirmation bubble while the user is still in our primer
// context. The webapp dispatches a CustomEvent on `window`; the ping
// content script forwards it to the background, which calls
// `chrome.tabs.create({ url: 'chrome://newtab' })`. The literal
// `chrome://newtab` URL is required — passing the override page via
// `chrome.runtime.getURL` would not register as an NTP visit and would
// not trigger the bubble.
//
// The outcome of the bubble is not directly observable. We infer it from
// two side channels written by the extension into localStorage on the
// daily.dev origin:
//   - `newTabActivationSuccessKey` is written by the override page when it
//     renders post-install (success — the user kept our override).
//   - `newTabActivationRejectedKey` is written by the background when
//     `chrome.management.onDisabled` fires (best-effort rejection signal —
//     Chrome disables the extension when the user picks "Change it back").
// The primer polls both keys after triggering the new tab and falls back
// to a recovery screen if neither resolves within a short window.

export const newTabActivationBridgeRequestEvent =
  'daily-extension-request-open-new-tab';
export const newTabActivationBridgeResultEvent =
  'daily-extension-open-new-tab-result';

export const openExtensionsPageBridgeRequestEvent =
  'daily-extension-request-open-extensions-page';
export const openExtensionsPageBridgeResultEvent =
  'daily-extension-open-extensions-page-result';

export type OpenExtensionsPageBridgeResult = {
  opened: boolean;
  error?: string;
};

export type NewTabActivationBridgeResult = {
  triggered: boolean;
  error?: string;
};

// Storage keys read by the primer and written by the extension. The keys
// are scoped per-install via a millisecond timestamp so a fresh primer
// session does not get a stale signal from a previous attempt.
export const newTabActivationSuccessKey = 'daily-extension-newtab-activated';
export const newTabActivationRejectedKey = 'daily-extension-newtab-rejected';

const PAGE_HELPER_TIMEOUT_MS = 10_000;

// Drives `chrome.tabs.create({ url: 'chrome://newtab' })` through the
// installed extension's content script. Returns once the background has
// confirmed the tab was opened; observing whether the user accepted the
// override is the primer's responsibility (via the storage keys above).
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

// Asks the extension's service worker to open `chrome://extensions` in a
// new tab. Web pages cannot navigate to chrome:// URLs directly, but the
// extension's background can call `chrome.tabs.create` with one. Used by
// the primer recovery screen to send users to where they can re-enable
// daily.dev if Chrome disabled it. Fails (resolves `opened: false`) if
// the extension has already been disabled — in that case nothing on the
// daily.dev origin can reach the background.
export const requestOpenExtensionsPageFromPage = (
  timeoutMs: number = PAGE_HELPER_TIMEOUT_MS,
): Promise<OpenExtensionsPageBridgeResult> => {
  if (typeof window === 'undefined') {
    return Promise.resolve({
      opened: false,
      error: 'window-unavailable',
    });
  }

  return new Promise<OpenExtensionsPageBridgeResult>((resolve) => {
    let settled = false;
    let timeoutId: ReturnType<typeof globalThis.setTimeout> | undefined;

    const onResult = (event: Event): void => {
      if (settled) {
        return;
      }
      settled = true;
      window.removeEventListener(openExtensionsPageBridgeResultEvent, onResult);
      if (timeoutId !== undefined) {
        globalThis.clearTimeout(timeoutId);
      }
      const { detail } = event as CustomEvent<OpenExtensionsPageBridgeResult>;
      resolve({
        opened: !!detail?.opened,
        error: detail?.error,
      });
    };

    timeoutId = globalThis.setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      window.removeEventListener(openExtensionsPageBridgeResultEvent, onResult);
      resolve({ opened: false, error: 'timeout' });
    }, timeoutMs);

    window.addEventListener(openExtensionsPageBridgeResultEvent, onResult);

    window.dispatchEvent(new CustomEvent(openExtensionsPageBridgeRequestEvent));
  });
};
