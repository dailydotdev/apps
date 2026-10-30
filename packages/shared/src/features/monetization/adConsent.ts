import { getCookies } from '../../lib/cookie';
import { isExtension } from '../../lib/func';
import { GdprConsentKey } from '../../hooks/useCookieBanner';
import type { TcfConsent } from '../../lib/tcf';
import type { AdMacroContext } from './adMacros';

export enum AdConsentExists {
  True = 'TRUE_CONSENT',
  False = 'FALSE_CONSENT',
  None = 'NONE_CONSENT',
}

export interface AdRequestConsent extends AdMacroContext {
  consentExists?: AdConsentExists;
}

const getMarketingConsent = (): boolean | undefined => {
  if (isExtension) {
    return true;
  }

  const cookies = getCookies([
    GdprConsentKey.Necessary,
    GdprConsentKey.Marketing,
  ]);
  if (cookies?.[GdprConsentKey.Marketing]) {
    return true;
  }
  if (cookies?.[GdprConsentKey.Necessary]) {
    return false;
  }
  return undefined;
};

export const resolveAdRequestConsent = (
  requiresCmp?: boolean,
  tcf?: TcfConsent,
): AdRequestConsent => {
  const gdprApplies = tcf?.gdprApplies ?? requiresCmp;
  if (tcf?.tcString) {
    return {
      gdprApplies,
      consentString: tcf.tcString,
      addtlConsent: tcf.addtlConsent,
    };
  }

  if (gdprApplies !== true) {
    return { gdprApplies };
  }

  const marketing = getMarketingConsent();
  if (marketing === true) {
    return { gdprApplies, consentExists: AdConsentExists.True };
  }
  if (marketing === false) {
    return { gdprApplies, consentExists: AdConsentExists.False };
  }
  return { gdprApplies, consentExists: AdConsentExists.None };
};

/**
 * Whether the user granted marketing consent through the first-party cookie
 * flow. The extension is treated as consented (accepted on install),
 * mirroring `useConsentCookie`.
 */
export const hasMarketingConsent = (): boolean => {
  return getMarketingConsent() === true;
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
