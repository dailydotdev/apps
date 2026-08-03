import { getIubendaConsent } from '../../lib/iubenda';
import { getCookies } from '../../lib/cookie';
import { isExtension } from '../../lib/func';
import { GdprConsentKey } from '../../hooks/useCookieBanner';
import type { TcfConsent } from '../../lib/tcf';
import type { AdMacroContext } from './adMacros';

/**
 * Whether the user granted marketing consent through the first-party cookie
 * flow. The extension is treated as consented (accepted on install),
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

/**
 * Consent context for ad tracker macros. With CMP (TCF) data, `gdprApplies`
 * states whether GDPR applies to this user and the TC string carries the
 * actual consent. Without it (CMP flag off, extension), the pre-TCF
 * compatibility behavior applies: first-party marketing consent or being out
 * of GDPR scope → `gdpr=0` and measurement proceeds; in scope without
 * consent → `gdpr=1`, which tags treat as not-consented. Keep the fallback
 * until the CMP is rolled out to everyone.
 */
export const resolveAdConsent = (
  isGdprCovered?: boolean,
  tcf?: TcfConsent,
): AdMacroContext => {
  if (typeof tcf?.gdprApplies !== 'undefined' || tcf?.tcString) {
    return {
      gdprApplies: tcf.gdprApplies,
      consentString: tcf.tcString,
      addtlConsent: tcf.addtlConsent,
    };
  }

  return { gdprApplies: !!isGdprCovered && !hasMarketingConsent() };
};
