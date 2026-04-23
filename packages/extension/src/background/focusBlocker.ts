import browser from 'webextension-polyfill';

// Background-side focus blocker. Reads the focus session and blocklist from
// `browser.storage.local` (mirrored there by the new tab UI) and redirects
// top-frame navigations to the new-tab page when they hit a blocked host.
//
// This listener is intentionally defensive: missing permissions, parse
// errors, or unexpected shapes all short-circuit silently. The feature is
// gated on a GrowthBook flag + Plus + an explicit user toggle, so users who
// haven't opted in will never see any of this wiring fire.

const SESSION_KEY = 'newtab:focus-session';
const BLOCKLIST_KEY = 'newtab:focus-blocklist';

interface FocusSessionMirror {
  startedAt: number | null;
  durationMinutes: number;
  pausedAt: number | null;
  pausedElapsedMs: number;
  completedAt: number | null;
}

interface FocusBlocklistMirror {
  enabled: boolean;
  hosts: string[];
}

const isSessionActive = (session: FocusSessionMirror | null): boolean => {
  if (!session) {
    return false;
  }
  if (session.startedAt === null) {
    return false;
  }
  if (session.completedAt !== null) {
    return false;
  }
  if (session.pausedAt !== null) {
    return false;
  }
  const elapsed = session.pausedElapsedMs + (Date.now() - session.startedAt);
  return elapsed < session.durationMinutes * 60_000;
};

const normalize = (host: string): string =>
  host.toLowerCase().replace(/^www\./, '');

const matchesBlockedHost = (candidate: string, hosts: string[]): boolean => {
  const normalized = normalize(candidate);
  return hosts.some(
    (host) => normalized === host || normalized.endsWith(`.${host}`),
  );
};

const readMirrors = async (): Promise<{
  session: FocusSessionMirror | null;
  blocklist: FocusBlocklistMirror | null;
}> => {
  try {
    const result = await browser.storage.local.get([
      SESSION_KEY,
      BLOCKLIST_KEY,
    ]);
    return {
      session: (result[SESSION_KEY] as FocusSessionMirror) ?? null,
      blocklist: (result[BLOCKLIST_KEY] as FocusBlocklistMirror) ?? null,
    };
  } catch {
    return { session: null, blocklist: null };
  }
};

const buildBlockedRedirectUrl = (host: string): string => {
  const base = browser.runtime.getURL('index.html');
  const params = new URLSearchParams({ 'focus-blocked': host });
  return `${base}?${params.toString()}`;
};

// Cheap guard: avoid redirect loops and ignore browser-internal URLs where
// tabs.update would reject anyway.
const isEligibleUrl = (url: string | undefined): url is string => {
  if (!url) {
    return false;
  }
  if (!/^https?:\/\//.test(url)) {
    return false;
  }
  if (url.startsWith(browser.runtime.getURL(''))) {
    return false;
  }
  return true;
};

export const registerFocusBlocker = (): void => {
  if (!browser.tabs?.onUpdated?.addListener) {
    return;
  }

  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Only react to the earliest signal so we redirect before the page
    // actually loads. `changeInfo.url` fires on address changes; fall back
    // to the tab's current URL when loading begins.
    const targetUrl = changeInfo.url ?? tab.url;
    if (!isEligibleUrl(targetUrl)) {
      return;
    }

    const { session, blocklist } = await readMirrors();
    if (!blocklist?.enabled || !blocklist.hosts.length) {
      return;
    }
    if (!isSessionActive(session)) {
      return;
    }

    let host: string;
    try {
      host = new URL(targetUrl).hostname;
    } catch {
      return;
    }

    if (!matchesBlockedHost(host, blocklist.hosts)) {
      return;
    }

    try {
      await browser.tabs.update(tabId, {
        url: buildBlockedRedirectUrl(host),
      });
    } catch {
      // Swallow: the tab may have closed or lost focus before we could redirect.
    }
  });
};
