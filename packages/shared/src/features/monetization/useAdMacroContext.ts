import { useMemo } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import type { AdMacroContext } from './adMacros';
import { resolveAdConsent } from './adConsent';

/**
 * Resolves the consent/cachebuster context used to fill ad tracker macros.
 * Shared by the impression pixel path (AdPixel) and the JS measurement path
 * (AdMeasurement). Consent comes from the user's first-party cookie choice, so
 * it resolves synchronously — no CMP round-trip. Returns null while disabled
 * (i.e. the ad isn't near the viewport yet).
 */
export const useAdMacroContext = (enabled: boolean): AdMacroContext | null => {
  const { isGdprCovered } = useAuthContext();

  return useMemo(
    () => (enabled ? resolveAdConsent(isGdprCovered) : null),
    [enabled, isGdprCovered],
  );
};
