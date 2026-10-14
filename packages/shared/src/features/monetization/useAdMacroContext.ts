import { useMemo } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import type { AdMacroContext } from './adMacros';
import { resolveAdConsent } from './adConsent';
import { useTcfConsent } from './useTcfConsent';
import { requiresCertifiedCmp } from '../../lib/geo';

/**
 * Resolves the consent context used to fill ad tracker macros. Shared by
 * `AdPixel` and `AdMeasurement`. Returns null while disabled (i.e. the ad
 * isn't near the viewport yet). Recomputes when the CMP reports a consent
 * change.
 */
export const useAdMacroContext = (enabled: boolean): AdMacroContext | null => {
  const { geo } = useAuthContext();
  const requiresCmp = requiresCertifiedCmp(geo?.region);
  const tcf = useTcfConsent();

  return useMemo(
    () => (enabled ? resolveAdConsent(requiresCmp, tcf) : null),
    [enabled, requiresCmp, tcf],
  );
};
