import { useEffect, useRef } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useConsentCookie } from './useCookieConsent';
import { isIOSNative } from '../lib/func';
import { getIubendaConsent } from '../lib/iubenda';

export const cookieAcknowledgedKey = 'cookie_acknowledged';

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
  const isInitializedRef = useRef(false);
  const { saveCookies, cookieExists: hasAccepted } = useConsentCookie(
    GdprConsentKey.Necessary,
  );

  useEffect(() => {
    if (!isAuthReady || isInitializedRef.current || isIOSNative()) {
      return;
    }

    isInitializedRef.current = true;

    if (hasAccepted) {
      return;
    }

    const iubenda = getIubendaConsent();

    if (!iubenda?.necessary) {
      return;
    }

    saveCookies(iubenda.marketing ? otherGdprConsents : []);
    globalThis?.localStorage.setItem(cookieAcknowledgedKey, 'true');
  }, [saveCookies, isAuthReady, hasAccepted]);
}
