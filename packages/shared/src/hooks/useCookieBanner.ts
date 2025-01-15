import { useCallback, useEffect, useState } from 'react';
import type { LoggedUser } from '../lib/user';
import type { CookieOptions } from '../lib/cookie';
import { expireCookie, setCookie } from '../lib/cookie';
import { useAuthContext } from '../contexts/AuthContext';

export type AcceptCookiesCallback = (
  additional?: string[],
  toRemove?: string[],
) => void;

type UseConsentCookie = [
  boolean,
  AcceptCookiesCallback,
  (user?: LoggedUser) => void,
  boolean,
];

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
    description: '',
    isAlwaysOn: true,
  },
  [GdprConsentKey.Marketing]: {
    title: 'Marketing cookies',
    description:
      'Marketing cookies are used to deliver content and advertisements that are more relevant to you and your interests. These cookies track your online activity across websites and devices to create a profile of your preferences, enabling personalized experience.',
  },
};

const cookieOptions: Partial<CookieOptions> = {
  path: '/',
  sameSite: 'lax',
  domain: process.env.NEXT_PUBLIC_DOMAIN,
};

const setBrowserCookie = (key: string): void => {
  const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

  setCookie(key, true, { ...cookieOptions, maxAge: TEN_YEARS });
  globalThis?.localStorage.removeItem(key);
};

const expireBrowserCookie = (key: string): void => {
  expireCookie(key, { ...cookieOptions });
  globalThis?.localStorage.setItem(key, 'disabled');
};

const getBrowserCookie = (key: string) =>
  globalThis?.document?.cookie.split('; ').find((row) => row.startsWith(key));

export const useConsentCookie = (key: string): UseConsentCookie => {
  const [showCookie, setShowCookie] = useState(false);
  const [exists, setExists] = useState(!!getBrowserCookie(key));

  const acceptCookies: AcceptCookiesCallback = useCallback(
    (additional, toRemove) => {
      setShowCookie(false);

      setExists(true);
      setBrowserCookie(key);

      if (additional) {
        additional.forEach(setBrowserCookie);
      }

      if (toRemove) {
        toRemove.forEach(expireBrowserCookie);
      }
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
  showBanner: boolean;
  onAcceptCookies: () => void;
}

export function useCookieBanner(): UseCookieBanner {
  const { user, isGdprCovered, isAuthReady } = useAuthContext();
  const [showCookie, acceptCookies, updateCookieBanner] = useConsentCookie(
    GdprConsentKey.Necessary,
  );

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    updateCookieBanner(user);
  }, [updateCookieBanner, isGdprCovered, user, isAuthReady]);

  return {
    showBanner: showCookie,
    onAcceptCookies: acceptCookies,
  };
}
