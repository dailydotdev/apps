import { useCallback, useEffect, useState } from 'react';
import type { CookieOptions } from '../lib/cookie';
import { expireCookie, setCookie } from '../lib/cookie';
import { useAuthContext } from '../contexts/AuthContext';

export type AcceptCookiesCallback = (
  additional?: string[],
  toRemove?: string[],
) => void;

interface UseConsentCookie {
  saveCookies: AcceptCookiesCallback;
  cookieExists: boolean;
}

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
  const [exists, setExists] = useState(!!getBrowserCookie(key));

  const saveCookies: AcceptCookiesCallback = useCallback(
    (additional, toRemove) => {
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

  return { saveCookies, cookieExists: exists };
};

interface UseCookieBanner {
  showBanner: boolean;
  onAcceptCookies: () => void;
}

export function useCookieBanner(): UseCookieBanner {
  const { isAuthReady, user, isGdprCovered } = useAuthContext();
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
    if (!isAuthReady || isOpen) {
      return;
    }

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
  };
}
