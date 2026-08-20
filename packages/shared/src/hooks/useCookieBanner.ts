import { useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useConsentCookie } from './useCookieConsent';
import { isIOSNative } from '../lib/func';
import { getIubendaConsent } from '../lib/iubenda';

export enum GdprConsentKey {
  Necessary = 'ilikecookies',
  Marketing = 'ilikecookies_marketing',
}

interface ConsentSettings {
  title: string;
  description: string;
  isAlwaysOn?: boolean;
}

export const otherGdprConsents = [GdprConsentKey.Marketing];
export const gdprConsentSettings: Record<GdprConsentKey, ConsentSettings> = {
  [GdprConsentKey.Necessary]: {
    title: 'Strictly necessary cookies',
    description:
      'These cookies are used for activities that are strictly necessary to operate or deliver the service you requested from us and, therefore, do not require you to consent.',
    isAlwaysOn: true,
  },
  [GdprConsentKey.Marketing]: {
    title: 'Marketing cookies',
    description:
      'Marketing cookies are used to deliver content and advertisements that are more relevant to you and your interests. These cookies track your online activity across websites and devices to create a profile of your preferences, enabling personalized experience.',
  },
};

/**
 * iubenda owns the cookie banner in every region (webapp Iubenda component;
 * the funnel keeps its own consent step). This hook only mirrors a consent
 * cookie written on another *.daily.dev property or in a previous session
 * into the first-party `ilikecookies*` cookies, so gating works before the
 * CMP script has loaded.
 */
export function useCookieBanner(): void {
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

    saveCookies(iubenda.marketing ? otherGdprConsents : []);
  }, [saveCookies, isAuthReady, hasAccepted]);
}
