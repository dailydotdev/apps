// Page <-> content-script bridge for driving chrome.permissions.request from
// the webapp while preserving the user gesture.
//
// chrome.permissions.request is only callable from extension pages, so the
// page can't call it directly. Instead, the page dispatches a synchronous
// CustomEvent on `window`; the extension's content script listens for it and
// forwards the request to the background via chrome.runtime.sendMessage —
// all within the same task as the original click, which is what keeps
// Chrome's transient user activation alive across the boundary.
//
// After the grant the background must runtime.reload() so DNR picks up the
// new optional host permission. The content script polls until the new
// service worker answers before dispatching the result CustomEvent back to
// the page, so callers only learn the request succeeded once everything
// downstream (DNR rule installation) will work.

export const pagePermissionBridgeRequestEvent =
  'daily-extension-request-frame-permissions';
export const pagePermissionBridgeResultEvent =
  'daily-extension-frame-permissions-result';

export type PagePermissionBridgeResult = {
  granted: boolean;
  error?: string;
};

// Shape returned by the background's RequestFrameEmbeddingPermissions
// handler. Internal to the bridge — the page-facing helper collapses this
// into `PagePermissionBridgeResult` once the post-grant reload + ready-poll
// has completed.
export type PermissionGrantResponse = {
  granted?: boolean;
  willReload?: boolean;
  error?: string;
};

// Timing for the post-grant reload coordination. Background fires
// runtime.reload() ~`reloadDelayMs` after returning the response; the
// content script waits `pingDelayBeforeFirstAttemptMs` before its first
// liveness ping so it doesn't accidentally hit the old worker, then polls
// every `pingRetryDelayMs` up to `pingMaxAttempts` times.
export const frameEmbeddingPermissionBridgeTiming = {
  reloadDelayMs: 50,
  pingDelayBeforeFirstAttemptMs: 800,
  pingRetryDelayMs: 200,
  pingMaxAttempts: 25,
} as const;

const PAGE_HELPER_TIMEOUT_MS = 60_000;

// Drives chrome.permissions.request through the installed extension's
// content script. Must be invoked synchronously from a user-input handler
// (e.g. an onClick) so the click's transient activation is still alive when
// the content script forwards the request to the background.
export const requestFrameEmbeddingPermissionFromPage = (
  timeoutMs: number = PAGE_HELPER_TIMEOUT_MS,
): Promise<PagePermissionBridgeResult> => {
  if (typeof window === 'undefined') {
    return Promise.resolve({
      granted: false,
      error: 'window-unavailable',
    });
  }

  return new Promise<PagePermissionBridgeResult>((resolve) => {
    let settled = false;
    let timeoutId: ReturnType<typeof globalThis.setTimeout> | undefined;

    const onResult = (event: Event): void => {
      if (settled) {
        return;
      }
      settled = true;
      window.removeEventListener(pagePermissionBridgeResultEvent, onResult);
      if (timeoutId !== undefined) {
        globalThis.clearTimeout(timeoutId);
      }
      const { detail } = event as CustomEvent<PagePermissionBridgeResult>;
      resolve({
        granted: !!detail?.granted,
        error: detail?.error,
      });
    };

    timeoutId = globalThis.setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      window.removeEventListener(pagePermissionBridgeResultEvent, onResult);
      resolve({ granted: false, error: 'timeout' });
    }, timeoutMs);

    window.addEventListener(pagePermissionBridgeResultEvent, onResult);

    // Synchronous dispatch is what preserves the user activation across the
    // page <-> content-script boundary.
    window.dispatchEvent(new CustomEvent(pagePermissionBridgeRequestEvent));
  });
};
