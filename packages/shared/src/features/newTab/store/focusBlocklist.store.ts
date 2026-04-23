import { useCallback, useSyncExternalStore } from 'react';
import { mirrorToExtensionStorage } from '../../../lib/extensionStorage';

export interface FocusBlocklist {
  enabled: boolean;
  // Bare hostnames (e.g. "twitter.com"). Matches on exact host or any subdomain.
  // We deliberately avoid URL path matching — hostname granularity is what
  // users expect for "block distractions".
  hosts: string[];
}

const DEFAULT_BLOCKLIST: FocusBlocklist = {
  enabled: false,
  hosts: [],
};

export const FOCUS_BLOCKLIST_STORAGE_KEY = 'newtab:focus-blocklist';
const CHANGE_EVENT = 'newtab:focus-blocklist:changed';

let cachedRaw: string | null = null;
let cachedValue: FocusBlocklist = DEFAULT_BLOCKLIST;

const read = (): FocusBlocklist => {
  if (typeof window === 'undefined') {
    return DEFAULT_BLOCKLIST;
  }
  const raw = window.localStorage.getItem(FOCUS_BLOCKLIST_STORAGE_KEY);
  if (raw === cachedRaw) {
    return cachedValue;
  }
  let value = DEFAULT_BLOCKLIST;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<FocusBlocklist>;
      value = {
        enabled: Boolean(parsed.enabled),
        hosts: Array.isArray(parsed.hosts)
          ? parsed.hosts.filter(
              (host): host is string =>
                typeof host === 'string' && host.length > 0,
            )
          : [],
      };
    } catch {
      value = DEFAULT_BLOCKLIST;
    }
  }
  cachedRaw = raw;
  cachedValue = value;
  return value;
};

const write = (value: FocusBlocklist): void => {
  if (typeof window === 'undefined') {
    return;
  }
  const raw = JSON.stringify(value);
  window.localStorage.setItem(FOCUS_BLOCKLIST_STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedValue = value;
  mirrorToExtensionStorage(FOCUS_BLOCKLIST_STORAGE_KEY, value);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
};

const subscribe = (cb: () => void): (() => void) => {
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener('storage', cb);
  };
};

const getServerSnapshot = (): FocusBlocklist => DEFAULT_BLOCKLIST;

// Normalize a user-entered value into a bare hostname. Returns null when the
// input can't be parsed — we reject the entry rather than persisting garbage.
export const normalizeHost = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }
  const withProtocol = trimmed.includes('://') ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (!url.hostname) {
      return null;
    }
    return url.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
};

export const matchesBlockedHost = (
  candidate: string,
  hosts: string[],
): boolean => {
  const normalized = candidate.toLowerCase().replace(/^www\./, '');
  return hosts.some(
    (host) => normalized === host || normalized.endsWith(`.${host}`),
  );
};

export const useFocusBlocklist = (): {
  blocklist: FocusBlocklist;
  addHost: (input: string) => boolean;
  removeHost: (host: string) => void;
  setEnabled: (enabled: boolean) => void;
  clear: () => void;
} => {
  const blocklist = useSyncExternalStore(subscribe, read, getServerSnapshot);

  const addHost = useCallback((input: string): boolean => {
    const host = normalizeHost(input);
    if (!host) {
      return false;
    }
    const current = read();
    if (current.hosts.includes(host)) {
      return true;
    }
    write({ ...current, hosts: [...current.hosts, host] });
    return true;
  }, []);

  const removeHost = useCallback((host: string) => {
    const current = read();
    write({
      ...current,
      hosts: current.hosts.filter((entry) => entry !== host),
    });
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    const current = read();
    write({ ...current, enabled });
  }, []);

  const clear = useCallback(() => {
    write(DEFAULT_BLOCKLIST);
  }, []);

  return { blocklist, addHost, removeHost, setEnabled, clear };
};
