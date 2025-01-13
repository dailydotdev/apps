import { useCallback, useEffect, useState } from 'react';
import type { LoggedUser } from '../lib/user';
import { setCookie } from '../lib/cookie';
import { useAuthContext } from '../contexts/AuthContext';

type UseConsentCookie = [
  boolean,
  (additional?: string[]) => void,
  (user?: LoggedUser) => void,
  boolean,
];

export enum GdprConsentKey {
  Necessary = 'ilikecookies_gdpr',
  Marketing = 'ilikecookies_gdpr_marketing',
}

export const consentMap = {
  basic: 'ilikecookies',
  gdpr: {
    necessary: GdprConsentKey.Necessary,
    marketing: GdprConsentKey.Marketing,
  },
};

interface ConsentSettings {
  title: string;
  description: string;
  isAlwaysOn?: boolean;
}

export const otherGdprConsents = [consentMap.gdpr.marketing];
export const gdprConsentSettings: Record<GdprConsentKey, ConsentSettings> = {
  [GdprConsentKey.Necessary]: {
    title: 'Strictly necessary cookies',
    description: '',
    isAlwaysOn: true,
  },
  [GdprConsentKey.Marketing]: {
    title: 'Marketing cookies',
    description:
      'Marketing cookies are used to deliver content and advertisements that are more relevant to you and your interests. These cookies track your online activity across websites and devices to create a profile of your preferences, enabling personalized experience.',
  },
};

const setBrowserCookie = (key: string): void => {
  const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

  setCookie(key, true, {
    path: '/',
    domain: process.env.NEXT_PUBLIC_DOMAIN,
    sameSite: 'lax',
    maxAge: TEN_YEARS,
  });
};

const getBrowserCookie = (key: string) =>
  globalThis?.document?.cookie.split('; ').find((row) => row.startsWith(key));

export const useConsentCookie = (key: string): UseConsentCookie => {
  const [showCookie, setShowCookie] = useState(false);
  const [exists, setExists] = useState(!!getBrowserCookie(key));

  const acceptCookies: UseConsentCookie[1] = useCallback(
    (additional) => {
      setShowCookie(false);

      setExists(true);
      setBrowserCookie(key);

      additional?.forEach((cookie) => setBrowserCookie(cookie));
    },
    [key],
  );

  const updateCookieBanner = useCallback(
    (user?: LoggedUser): void => {
      if (getBrowserCookie(key)) {
        if (!exists) {
          setExists(true);
        }

        return;
      }

      if (user) {
        acceptCookies();
        return;
      }

      setShowCookie(true);
    },
    [acceptCookies, exists, key],
  );

  return [showCookie, acceptCookies, updateCookieBanner, exists];
};

interface UseCookieBanner {
  showBasicBanner: boolean;
  showGdprBanner: boolean;
  onAcceptCookies: () => void;
}

export function useCookieBanner(): UseCookieBanner {
  const { user, isGdprCovered, isAuthReady } = useAuthContext();
  const [showCookie, acceptCookies, updateCookieBanner] = useConsentCookie(
    consentMap.basic,
  );
  const [showCookieGdpr, acceptCookiesGdpr, updateCookieBannerGdpr] =
    useConsentCookie(consentMap.gdpr.necessary);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (isGdprCovered) {
      updateCookieBannerGdpr(user);
    } else {
      updateCookieBanner(user);
    }
  }, [
    updateCookieBanner,
    updateCookieBannerGdpr,
    isGdprCovered,
    user,
    isAuthReady,
  ]);

  return {
    showBasicBanner: showCookie,
    showGdprBanner: showCookieGdpr,
    onAcceptCookies: isGdprCovered ? acceptCookiesGdpr : acceptCookies,
  };
}
