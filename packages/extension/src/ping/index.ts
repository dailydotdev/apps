// Lightweight content script that runs on daily.dev surfaces at
// document_start to tell the webapp the extension is installed in this
// browser — without the webapp needing to know (or guess) the extension id.
//
// We signal in two redundant ways:
//   1. Stamp the install state onto `<html>` as dataset attributes. This is
//      synchronous and survives React hydration.
//   2. Post a window message after the marker is set, so any listeners that
//      mount after document_start still see the signal.
//
// The webapp reads the marker to decide install-prompt vs. embed flow. The
// frame.html iframe still owns the permission-granted check.

import browser from 'webextension-polyfill';
import { ExtensionMessageType } from '@dailydotdev/shared/src/lib/extension';
import {
  frameEmbeddingPermissionBridgeTiming,
  pagePermissionBridgeRequestEvent,
  pagePermissionBridgeResultEvent,
} from '@dailydotdev/shared/src/features/extensionEmbed/pagePermissionBridge';
import type {
  PagePermissionBridgeResult,
  PermissionGrantResponse,
} from '@dailydotdev/shared/src/features/extensionEmbed/pagePermissionBridge';
import {
  newTabActivationBridgeRequestEvent,
  newTabActivationBridgeResultEvent,
  newTabActivationSuccessKey,
  openExtensionsPageBridgeRequestEvent,
  openExtensionsPageBridgeResultEvent,
  pingExtensionBridgeRequestEvent,
  pingExtensionBridgeResultEvent,
} from '@dailydotdev/shared/src/features/extensionEmbed/newTabActivationBridge';
import type {
  NewTabActivationBridgeResult,
  OpenExtensionsPageBridgeResult,
  PingExtensionBridgeResult,
} from '@dailydotdev/shared/src/features/extensionEmbed/newTabActivationBridge';

const INSTALL_MARKER = 'dailyExtensionInstalled';
const ID_MARKER = 'dailyExtensionId';
const MESSAGE_SOURCE = 'daily-extension-ping';

// chrome.permissions.request is only callable from extension pages. We relay
// the page's click — while the user gesture is still active in the same task
// — to the background service worker, which calls request() on the page's
// behalf. The synchronous dispatchEvent on the page side is what keeps the
// gesture alive across the message boundary.
//
// After the grant the background schedules runtime.reload() so the new
// optional host permission is picked up for declarativeNetRequest. We hold
// the result event until the new service worker responds to a ping, so the
// page only mounts the reader iframe once DNR rules can be installed.
const sleep = (ms: number): Promise<void> =>
  new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });

const waitForExtensionReady = async (): Promise<void> => {
  const { pingDelayBeforeFirstAttemptMs, pingRetryDelayMs, pingMaxAttempts } =
    frameEmbeddingPermissionBridgeTiming;

  await sleep(pingDelayBeforeFirstAttemptMs);

  for (let attempt = 0; attempt < pingMaxAttempts; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop -- sequential polling is the point
      const response = (await browser.runtime.sendMessage({
        type: ExtensionMessageType.PingFrameEmbeddingReady,
      })) as { ready?: boolean } | undefined;
      if (response?.ready) {
        return;
      }
    } catch {
      // sendMessage rejects while the service worker is mid-reload; retry.
    }
    // eslint-disable-next-line no-await-in-loop -- sequential backoff between pings
    await sleep(pingRetryDelayMs);
  }
};

browser.runtime.onMessage.addListener((message: { type?: string }) => {
  if (message?.type === ExtensionMessageType.NotifyNewTabActivated) {
    // Broadcast from the background after the post-install new tab page
    // rendered. Writing localStorage here surfaces the signal to the
    // primer running on this same daily.dev origin.
    try {
      localStorage.setItem(newTabActivationSuccessKey, Date.now().toString());
    } catch {
      // localStorage can fail in private contexts; the primer will fall
      // back to its timeout-driven recovery screen.
    }
  }
  return undefined;
});

window.addEventListener(newTabActivationBridgeRequestEvent, () => {
  const dispatchResult = (result: NewTabActivationBridgeResult): void => {
    window.dispatchEvent(
      new CustomEvent<NewTabActivationBridgeResult>(
        newTabActivationBridgeResultEvent,
        { detail: result },
      ),
    );
  };

  browser.runtime
    .sendMessage({
      type: ExtensionMessageType.RequestOpenNewTab,
    })
    .then((response) => {
      const typed = response as NewTabActivationBridgeResult | undefined;
      dispatchResult({
        triggered: !!typed?.triggered,
        error: typed?.error,
      });
    })
    .catch((error: unknown) => {
      dispatchResult({
        triggered: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to request new tab open',
      });
    });
});

window.addEventListener(pingExtensionBridgeRequestEvent, () => {
  const dispatchResult = (result: PingExtensionBridgeResult): void => {
    window.dispatchEvent(
      new CustomEvent<PingExtensionBridgeResult>(
        pingExtensionBridgeResultEvent,
        { detail: result },
      ),
    );
  };

  // If the extension has been disabled, `browser.runtime.sendMessage`
  // throws "Extension context invalidated" synchronously or rejects.
  // Either way we report `alive: false` and the primer flips to recovery.
  try {
    browser.runtime
      .sendMessage({ type: ExtensionMessageType.PingExtensionAlive })
      .then((response) => {
        const typed = response as { alive?: boolean } | undefined;
        dispatchResult({ alive: !!typed?.alive });
      })
      .catch(() => {
        dispatchResult({ alive: false });
      });
  } catch {
    dispatchResult({ alive: false });
  }
});

window.addEventListener(openExtensionsPageBridgeRequestEvent, () => {
  const dispatchResult = (result: OpenExtensionsPageBridgeResult): void => {
    window.dispatchEvent(
      new CustomEvent<OpenExtensionsPageBridgeResult>(
        openExtensionsPageBridgeResultEvent,
        { detail: result },
      ),
    );
  };

  browser.runtime
    .sendMessage({
      type: ExtensionMessageType.RequestOpenExtensionsPage,
    })
    .then((response) => {
      const typed = response as OpenExtensionsPageBridgeResult | undefined;
      dispatchResult({
        opened: !!typed?.opened,
        error: typed?.error,
      });
    })
    .catch((error: unknown) => {
      dispatchResult({
        opened: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to request extensions page',
      });
    });
});

window.addEventListener(pagePermissionBridgeRequestEvent, () => {
  const dispatchResult = (result: PagePermissionBridgeResult): void => {
    window.dispatchEvent(
      new CustomEvent<PagePermissionBridgeResult>(
        pagePermissionBridgeResultEvent,
        { detail: result },
      ),
    );
  };

  browser.runtime
    .sendMessage({
      type: ExtensionMessageType.RequestFrameEmbeddingPermissions,
    })
    .then(async (response) => {
      const typed = response as PermissionGrantResponse | undefined;
      if (typed?.granted && typed?.willReload) {
        await waitForExtensionReady();
      }
      dispatchResult({
        granted: !!typed?.granted,
        error: typed?.error,
      });
    })
    .catch((error: unknown) => {
      dispatchResult({
        granted: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to request frame embedding permissions',
      });
    });
});

const marker = document.documentElement;

if (marker && !marker.dataset[INSTALL_MARKER]) {
  marker.dataset[INSTALL_MARKER] = 'true';

  let runtimeId: string | undefined;
  try {
    runtimeId = (
      globalThis as typeof globalThis & {
        chrome?: { runtime?: { id?: string } };
      }
    ).chrome?.runtime?.id;
    if (runtimeId) {
      marker.dataset[ID_MARKER] = runtimeId;
    }
  } catch {
    // chrome.runtime can throw during an extension reload; the install marker
    // alone is still enough for the webapp to skip the install prompt.
  }

  try {
    window.postMessage(
      { source: MESSAGE_SOURCE, extensionId: runtimeId ?? null },
      window.location.origin,
    );
  } catch {
    // postMessage can fail if the target origin is exotic; the DOM marker is
    // the primary signal and doesn't rely on this.
  }

  // eslint-disable-next-line no-console
  console.debug('[daily.dev extension] ping', runtimeId ?? '(no id)');
}
