import { useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { resolveAdRequestConsent } from './adConsent';
import type { AdRequestConsent } from './adConsent';
import { useTcfConsent } from './useTcfConsent';
import { useConsentCookie } from '../../hooks/useCookieConsent';
import { GdprConsentKey } from '../../hooks/useCookieBanner';
import { requiresCertifiedCmp } from '../../lib/geo';
import { startTcfSubscription } from '../../lib/tcf';
import { isExtension, isIOSNative } from '../../lib/func';
import { PREBID_CMP_TIMEOUT_MS } from './kueez';

export const useAdRequestConsent = (
  enabled: boolean,
): AdRequestConsent | null => {
  const { geo, isAuthReady, isFunnel } = useAuthContext();
  const requiresCmp = requiresCertifiedCmp(geo?.region);
  const tcf = useTcfConsent();
  const [cmpTimedOut, setCmpTimedOut] = useState(false);
  const cmpConfigured = Boolean(
    process.env.NEXT_PUBLIC_IUBENDA_SITE_ID &&
      Number(process.env.NEXT_PUBLIC_IUBENDA_POLICY_ID),
  );
  const shouldWaitForCmp =
    enabled &&
    requiresCmp &&
    cmpConfigured &&
    !isExtension &&
    !isIOSNative() &&
    !isFunnel &&
    !tcf;

  useEffect(() => {
    if (!shouldWaitForCmp || !isAuthReady) {
      return undefined;
    }

    startTcfSubscription();
    const timeout = setTimeout(
      () => setCmpTimedOut(true),
      PREBID_CMP_TIMEOUT_MS,
    );
    return () => clearTimeout(timeout);
  }, [shouldWaitForCmp, isAuthReady]);

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
