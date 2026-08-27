import { useMemo } from 'react';
import type { Ad } from '../../graphql/posts';
import { substituteMacros } from './adMacros';
import { useAdMacroContext } from './useAdMacroContext';

/**
 * Fills cachebuster/consent macros in the ad's click URL so the server can use
 * a macro-bearing tracking URL as `ad.link`, substituted before navigation.
 * Links without macros pass through unchanged.
 */
export const useAdClickUrl = (ad: Pick<Ad, 'link'>): string => {
  const ctx = useAdMacroContext(!!ad?.link);

  return useMemo(
    () => (ctx && ad?.link ? substituteMacros(ad.link, ctx) : ad?.link),
    [ad?.link, ctx],
  );
};
