import { useEffect, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import type { AdMacroContext } from './adMacros';
import { readAdConsent } from './adConsent';

/**
 * Resolves the consent/cachebuster context used to fill ad tracker macros.
 * Shared by the impression pixel path (AdPixel) and the JS measurement path
 * (AdMeasurement) so consent is read the same way on the same card. Reads the
 * CMP only once enabled (i.e. the ad is near the viewport) to avoid needless
 * work for off-screen ads. Returns null until resolved; callers must wait for a
 * non-null value before firing so trackers never go out with unfilled macros.
 */
export const useAdMacroContext = (enabled: boolean): AdMacroContext | null => {
  const { isGdprCovered } = useAuthContext();
  const [ctx, setCtx] = useState<AdMacroContext | null>(null);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let active = true;
    readAdConsent(isGdprCovered).then((resolved) => {
      if (active) {
        setCtx(resolved);
      }
    });

    return () => {
      active = false;
    };
  }, [enabled, isGdprCovered]);

  return ctx;
};
