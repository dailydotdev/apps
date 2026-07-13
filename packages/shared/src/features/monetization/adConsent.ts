import { getIubendaConsent } from '../../lib/iubenda';
import { getCookies } from '../../lib/cookie';
import { isExtension } from '../../lib/func';
import { GdprConsentKey } from '../../hooks/useCookieBanner';
import type { AdMacroContext } from './adMacros';

/**
 * Resolves ad-measurement consent from the user's first-party cookie choice.
 * Accepted marketing cookies or outside GDPR scope → `gdpr=0` and measurement
 * proceeds; in scope without consent → `gdpr=1`, which tags treat as
 * not-consented. The extension is treated as consented (accepted on install),
 * mirroring `useConsentCookie`.
 */
export const hasMarketingConsent = (): boolean => {
  if (isExtension) {
    return true;
  }

  if (getIubendaConsent()?.marketing) {
    return true;
  }

  const key = GdprConsentKey.Marketing;
  return !!getCookies([key])?.[key];
};

export const resolveAdConsent = (isGdprCovered?: boolean): AdMacroContext => ({
  gdprApplies: !!isGdprCovered && !hasMarketingConsent(),
});
