import { useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { GdprConsentKey, otherGdprConsents } from './useCookieBanner';
import { useConsentCookie } from './useCookieConsent';
import { isIOSNative } from '../lib/func';
import { getIubendaConsent } from '../lib/iubenda';

/**
 * iubenda owns the cookie banner in every region (webapp Iubenda component;
 * the funnel keeps its own consent step). This hook only mirrors a consent
 * cookie written on another *.daily.dev property or in a previous session
 * into the first-party `ilikecookies*` cookies, so gating works before the
 * CMP script has loaded.
 */
export function useIubendaConsentMirror(): void {
  const { isAuthReady } = useAuthContext();
  const { saveCookies, cookieExists: hasAccepted } = useConsentCookie(
    GdprConsentKey.Necessary,
  );

  useEffect(() => {
    // `hasAccepted` already stops this from writing twice, so no separate
    // latch is needed. Consent expressed later in the session is written by
    // the CMP callback, not here.
    if (!isAuthReady || hasAccepted || isIOSNative()) {
      return;
    }

    const iubenda = getIubendaConsent();

    if (!iubenda?.necessary) {
      return;
    }

    // carries the refusal as well as the grant, so a marketing consent
    // withdrawn on another *.daily.dev property is not left behind here
    saveCookies(
      iubenda.marketing ? otherGdprConsents : [],
      iubenda.marketing ? [] : otherGdprConsents,
    );
  }, [saveCookies, isAuthReady, hasAccepted]);
}
