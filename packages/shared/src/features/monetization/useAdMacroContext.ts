import { useMemo } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import type { AdMacroContext } from './adMacros';
import { resolveAdConsent } from './adConsent';
import { useTcfConsent } from './useTcfConsent';

/**
 * Resolves the consent context used to fill ad tracker macros. Shared by
 * `AdPixel` and `AdMeasurement`. Returns null while disabled (i.e. the ad
 * isn't near the viewport yet). Recomputes when the CMP reports a consent
 * change.
 */
export const useAdMacroContext = (enabled: boolean): AdMacroContext | null => {
  const { isGdprCovered } = useAuthContext();
  const tcf = useTcfConsent();

  return useMemo(
    () => (enabled ? resolveAdConsent(isGdprCovered, tcf) : null),
    [enabled, isGdprCovered, tcf],
  );
};
