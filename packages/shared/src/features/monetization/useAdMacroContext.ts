import { useMemo } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import type { AdMacroContext } from './adMacros';
import { resolveAdConsent } from './adConsent';

/**
 * Resolves the consent context used to fill ad tracker macros. Shared by
 * `AdPixel` and `AdMeasurement`. Returns null while disabled (i.e. the ad
 * isn't near the viewport yet).
 */
export const useAdMacroContext = (enabled: boolean): AdMacroContext | null => {
  const { isGdprCovered } = useAuthContext();

  return useMemo(
    () => (enabled ? resolveAdConsent(isGdprCovered) : null),
    [enabled, isGdprCovered],
  );
};
