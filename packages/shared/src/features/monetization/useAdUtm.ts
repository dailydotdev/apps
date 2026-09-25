import { useMemo } from 'react';
import type { AdUtm } from './kueez';
import { AD_UTM_KEYS } from './kueez';

const STORAGE_KEY = 'ad_utm';

// UTMs only ride the landing URL; the session copy keeps the second post the
// visitor opens attributed to the same source.
function readSessionUtm(): AdUtm | undefined {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as AdUtm) : undefined;
  } catch {
    return undefined;
  }
}

function writeSessionUtm(utm: AdUtm): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
  } catch {
    // Storage blocked (private mode, quota) so attribution stays per page.
  }
}

export function resolveAdUtm(search: string): AdUtm | undefined {
  const params = new URLSearchParams(search);
  const fromUrl: AdUtm = {};
  AD_UTM_KEYS.forEach((key) => {
    const value = params.get(`utm_${key}`);
    if (value) {
      fromUrl[key] = value;
    }
  });
  if (Object.keys(fromUrl).length) {
    writeSessionUtm(fromUrl);
    return fromUrl;
  }
  return readSessionUtm();
}

/**
 * The acquisition source behind this visit, for ad telemetry and for the
 * first-party data the bid request carries. Stable for the session, so the
 * memo never needs to re-run on navigation.
 */
export function useAdUtm(): AdUtm | undefined {
  return useMemo(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    return resolveAdUtm(window.location.search);
  }, []);
}
