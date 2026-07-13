import { getIubendaConsent } from '../../lib/iubenda';
import { getCookies } from '../../lib/cookie';
import { isExtension } from '../../lib/func';
import { GdprConsentKey } from '../../hooks/useCookieBanner';
import type { AdMacroContext } from './adMacros';

/**
 * Resolves ad-measurement consent from the user's own cookie choice rather than
 * an IAB TCF/GPP CMP (we don't run one). CM360/DoubleVerify gate on the `gdpr`
 * flag: with `gdpr=0` they measure without requiring a TCF consent string (which
 * we can't produce). So when the user has accepted marketing cookies — or is
 * outside GDPR scope — we signal `gdpr=0` and measurement proceeds; an in-scope
 * user who hasn't consented stays `gdpr=1` with no string, i.e. not measured.
 *
 * Mirrors the rest of the app, where the extension is treated as consented
 * (see `useConsentCookie`).
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
