// The extension ships a tiny content script (`ping`) that runs at
// document_start on daily.dev origins and stamps
// `<html data-daily-extension-installed>`. Reading the attribute is the
// fastest "is the extension installed in this browser right now?" signal —
// it runs before any webapp JS, synchronously, id-agnostic, and doesn't
// depend on the webapp's build env matching the installed extension id.
// The marker can't change within a session (content scripts don't
// retroactively inject into open tabs on install), so no reactive
// subscription is needed.
const MARKER_DATASET_KEY = 'dailyExtensionInstalled';

const readMarker = (): boolean => {
  if (typeof document === 'undefined') {
    return false;
  }
  return document.documentElement?.dataset?.[MARKER_DATASET_KEY] === 'true';
};

// Fallback probe for users on extension builds that predate the `ping`
// content script. We preload a resource from the same
// `web_accessible_resources` entry as `frame.html` — if the preload
// succeeds, we know both (a) an extension at that id is installed and (b)
// the current origin is in `frame.html`'s `matches`, which is exactly the
// two conditions we need for the embed iframe to actually load. Probing
// `css/companion.css` (universal `*://*/*` matches) would false-positive
// for origins that aren't allowed to embed `frame.html`, leading to
// Chrome's "page blocked" flash.
const PROBE_RESOURCE_PATH = 'js/frame.bundle.js';
const PROBE_TIMEOUT_MS = 1500;
const PROBE_QUERY_PARAM = '__daily_probe';

export const detectBrowserExtensionInstalled = (
  extensionId: string | null | undefined,
  timeoutMs: number = PROBE_TIMEOUT_MS,
): Promise<boolean> => {
  const trimmedId = extensionId?.trim();

  if (!trimmedId || typeof document === 'undefined') {
    return Promise.resolve(false);
  }

  if (readMarker()) {
    return Promise.resolve(true);
  }

  return new Promise<boolean>((resolve) => {
    const link = document.createElement('link');
    // `preload`+`as=script` always fetches but never executes, so the probe
    // can't leak code into the host page.
    link.rel = 'preload';
    link.as = 'script';
    const probeUrl = new URL(
      `chrome-extension://${trimmedId}/${PROBE_RESOURCE_PATH}`,
    );
    // Cache-bust retries so a failed "extension not installed yet" probe
    // doesn't get stuck on an earlier negative result after the user
    // installs the extension while the modal stays open.
    probeUrl.searchParams.set(
      PROBE_QUERY_PARAM,
      `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    link.href = probeUrl.toString();

    let settled = false;
    const finalize = (installed: boolean) => {
      if (settled) {
        return;
      }
      settled = true;
      link.onload = null;
      link.onerror = null;
      link.remove();
      resolve(installed);
    };

    link.onload = () => finalize(true);
    link.onerror = () => finalize(false);

    document.head.appendChild(link);

    globalThis.setTimeout(() => finalize(false), timeoutMs);
  });
};

export type UseIsBrowserExtensionInstalled = {
  isInstalled: boolean;
  // Kept for API symmetry with the old probe-based hook. The marker read is
  // synchronous so there's no real "checking" phase on the webapp.
  isChecking: boolean;
};

export const useIsBrowserExtensionInstalled =
  (): UseIsBrowserExtensionInstalled => ({
    isInstalled: readMarker(),
    isChecking: false,
  });

// Function form for non-hook callers (e.g. imperative checks).
export const isBrowserExtensionInstalled = (): boolean => readMarker();
