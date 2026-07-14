import { useMemo } from 'react';
import type { Ad } from '../../graphql/posts';
import { substituteMacros } from './adMacros';
import { useAdMacroContext } from './useAdMacroContext';

/**
 * Resolves the ad's click URL with cachebuster/consent macros filled, so the
 * ad server can set a CM360 `trackclk` (or any macro-bearing URL) as `ad.link`
 * and have it substituted client-side before navigation. Links without macros
 * pass through unchanged. Consent resolves synchronously, so the href is ready
 * before the card can be clicked.
 */
export const useAdClickUrl = (ad: Pick<Ad, 'link'>): string => {
  const ctx = useAdMacroContext(!!ad?.link);

  return useMemo(
    () => (ctx && ad?.link ? substituteMacros(ad.link, ctx) : ad?.link),
    [ad?.link, ctx],
  );
};
