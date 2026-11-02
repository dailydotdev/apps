import { useMemo } from 'react';

/**
 * UTM dimensions worth attributing an ad impression to. The values ride our
 * own slot events and the page-level targeting handed to Content Ignite, so
 * a visitor from a paid campaign can be priced apart from an organic one.
 */
export const AD_UTM_KEYS = ['source', 'medium', 'campaign', 'content'] as const;

export type AdUtmKey = (typeof AD_UTM_KEYS)[number];

export type AdUtm = Partial<Record<AdUtmKey, string>>;

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
 * targeting the ad tag carries. Stable for the session, so the memo never
 * needs to re-run on navigation.
 */
export function useAdUtm(): AdUtm | undefined {
  return useMemo(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    return resolveAdUtm(window.location.search);
  }, []);
}
