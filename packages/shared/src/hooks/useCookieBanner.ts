import { useCallback, useEffect, useState } from 'react';
import type { LoggedUser } from '../lib/user';
import { setCookie } from '../lib/cookie';
import { useAuthContext } from '../contexts/AuthContext';

type UseConsentCookie = [
  boolean,
  (additional?: string[]) => void,
  (user?: LoggedUser) => void,
];

const consentMap = {
  basic: 'ilikecookies',
  gdpr: {
    necessary: 'ilikecookies_gdpr',
    marketing: 'ilikecookies_gdpr_marketing',
  },
};

export const otherGdprConsents = [consentMap.gdpr.marketing];

const setBrowserCookie = (key: string): void => {
  const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

  setCookie(key, true, {
    path: '/',
    domain: process.env.NEXT_PUBLIC_DOMAIN,
    sameSite: 'lax',
    maxAge: TEN_YEARS,
  });
};

const useConsentCookie = (key: string): UseConsentCookie => {
  const [showCookie, setShowCookie] = useState(false);

  const acceptCookies: UseConsentCookie[1] = useCallback(
    (additional) => {
      setShowCookie(false);

      setBrowserCookie(key);

      additional?.forEach((cookie) => setBrowserCookie(cookie));
    },
    [key],
  );

  const updateCookieBanner = useCallback(
    (user?: LoggedUser): void => {
      if (document.cookie.split('; ').find((row) => row.startsWith(key))) {
        return;
      }
      if (user) {
        acceptCookies();
        return;
      }
      setShowCookie(true);
    },
    [acceptCookies, key],
  );

  return [showCookie, acceptCookies, updateCookieBanner];
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
      updateCookieBanner(user);
    } else {
      updateCookieBannerGdpr(user);
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
    onAcceptCookies: isGdprCovered ? acceptCookies : acceptCookiesGdpr,
  };
}
