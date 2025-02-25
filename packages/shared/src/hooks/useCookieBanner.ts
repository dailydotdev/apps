import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import type { AcceptCookiesCallback } from './useCookieConsent';
import { useConsentCookie } from './useCookieConsent';
import { isIOSNative } from '../lib/func';

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

interface UseCookieBanner {
  showBanner: boolean;
  onAcceptCookies: () => void;
  onOpenBanner: () => void;
  onHideBanner: () => void;
}

export function useCookieBanner(): UseCookieBanner {
  const { isAuthReady, user, isGdprCovered } = useAuthContext();
  const isInitializedRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const { saveCookies, cookieExists: hasAccepted } = useConsentCookie(
    GdprConsentKey.Necessary,
  );

  const onAccept: AcceptCookiesCallback = useCallback(
    (...args) => {
      saveCookies(...args);
      globalThis?.localStorage.setItem(cookieAcknowledgedKey, 'true');
      setIsOpen(false);
    },
    [saveCookies],
  );

  useEffect(() => {
    if (!isAuthReady || isOpen || isInitializedRef.current || isIOSNative()) {
      return;
    }

    isInitializedRef.current = true;

    if (!isGdprCovered) {
      if (hasAccepted) {
        return;
      }

      if (user) {
        saveCookies();
        return;
      }

      setIsOpen(true);
      return;
    }

    if (hasAccepted) {
      if (!user) {
        return;
      }

      const acknowledged = globalThis?.localStorage?.getItem(
        cookieAcknowledgedKey,
      );

      if (acknowledged) {
        return;
      }
    } else if (user) {
      saveCookies(); // accepting necessary ones
    }

    setIsOpen(true);
  }, [saveCookies, isOpen, isAuthReady, user, hasAccepted, isGdprCovered]);

  return {
    showBanner: isOpen,
    onAcceptCookies: onAccept,
    onOpenBanner: () => setIsOpen(true),
    onHideBanner: () => setIsOpen(false),
  };
}
