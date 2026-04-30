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

const INSTALL_MARKER = 'dailyExtensionInstalled';
const ID_MARKER = 'dailyExtensionId';
const MESSAGE_SOURCE = 'daily-extension-ping';

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
