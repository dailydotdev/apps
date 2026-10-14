import { useMemo } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { resolveAdRequestConsent } from './adConsent';
import type { AdRequestConsent } from './adConsent';
import { useTcfConsent } from './useTcfConsent';
import { useConsentCookie } from '../../hooks/useCookieConsent';
import { GdprConsentKey } from '../../hooks/useCookieBanner';

export const useAdRequestConsent = (
  enabled: boolean,
): AdRequestConsent | null => {
  const { isGdprCovered } = useAuthContext();
  const tcf = useTcfConsent();
  useConsentCookie(GdprConsentKey.Necessary);
  useConsentCookie(GdprConsentKey.Marketing);
  const { gdprApplies, consentString, addtlConsent, consentExists } =
    resolveAdRequestConsent(isGdprCovered, tcf);
  return useMemo(
    () =>
      enabled
        ? { gdprApplies, consentString, addtlConsent, consentExists }
        : null,
    [enabled, gdprApplies, consentString, addtlConsent, consentExists],
  );
};
