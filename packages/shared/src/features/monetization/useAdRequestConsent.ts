import { useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { resolveAdRequestConsent } from './adConsent';
import type { AdRequestConsent } from './adConsent';
import { useTcfConsent } from './useTcfConsent';
import { useConsentCookie } from '../../hooks/useCookieConsent';
import { GdprConsentKey } from '../../hooks/useCookieBanner';
import { requiresCertifiedCmp } from '../../lib/geo';
import { hasTcfApi, startTcfSubscription } from '../../lib/tcf';
import { isExtension } from '../../lib/func';
import { PREBID_CMP_TIMEOUT_MS } from './kueez';

export const useAdRequestConsent = (
  enabled: boolean,
): AdRequestConsent | null => {
  const { geo } = useAuthContext();
  const requiresCmp = requiresCertifiedCmp(geo?.region);
  const tcf = useTcfConsent();
  const [cmpTimedOut, setCmpTimedOut] = useState(false);
  const shouldWaitForCmp =
    enabled && !isExtension && requiresCmp && hasTcfApi() && !tcf;

  useEffect(() => {
    if (!shouldWaitForCmp) {
      return undefined;
    }

    startTcfSubscription();
    const timeout = setTimeout(
      () => setCmpTimedOut(true),
      PREBID_CMP_TIMEOUT_MS,
    );
    return () => clearTimeout(timeout);
  }, [shouldWaitForCmp]);

  useConsentCookie(GdprConsentKey.Necessary);
  useConsentCookie(GdprConsentKey.Marketing);
  const { gdprApplies, consentString, addtlConsent, consentExists } =
    resolveAdRequestConsent(requiresCmp, tcf);
  const isReady = enabled && (!shouldWaitForCmp || cmpTimedOut);
  return useMemo(
    () =>
      isReady
        ? { gdprApplies, consentString, addtlConsent, consentExists }
        : null,
    [isReady, gdprApplies, consentString, addtlConsent, consentExists],
  );
};
