import { useMemo } from 'react';
import type { AdsenseUtm } from './adsense';
import { ADSENSE_UTM_KEYS, getAdsenseUtmChannel } from './adsense';

const STORAGE_KEY = 'adsense_utm';

// UTMs only ride the landing URL; the session copy keeps the second post the
// visitor opens attributed to the same source.
function readSessionUtm(): AdsenseUtm | undefined {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as AdsenseUtm) : undefined;
  } catch {
    return undefined;
  }
}

function writeSessionUtm(utm: AdsenseUtm): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
  } catch {
    // Storage blocked (private mode, quota) — attribution just stays per page.
  }
}

export function resolveAdsenseUtm(search: string): AdsenseUtm | undefined {
  const params = new URLSearchParams(search);
  const fromUrl: AdsenseUtm = {};
  ADSENSE_UTM_KEYS.forEach((key) => {
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

export function useAdsenseUtmChannel(): {
  channel?: string;
  utm?: AdsenseUtm;
} {
  return useMemo(() => {
    if (typeof window === 'undefined') {
      return {};
    }
    const utm = resolveAdsenseUtm(window.location.search);
    return { utm, channel: utm && getAdsenseUtmChannel(utm) };
  }, []);
}
