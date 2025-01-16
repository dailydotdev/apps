import { useCallback, useState } from 'react';
import type { LoggedUser } from '../lib/user';
import type { CookieOptions } from '../lib/cookie';
import { expireCookie, setCookie } from '../lib/cookie';

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
  updateCookieBanner: (user?: LoggedUser) => void;
}

export function useCookieBanner(): UseCookieBanner {
  const [showCookie, acceptCookies, updateCookieBanner] = useConsentCookie(
    GdprConsentKey.Necessary,
  );

  return {
    showBanner: showCookie,
    onAcceptCookies: acceptCookies,
    updateCookieBanner,
  };
}
