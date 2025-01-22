import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { CookieOptions } from '../lib/cookie';
import { expireCookie, getCookies, setCookie } from '../lib/cookie';
import { disabledRefetch } from '../lib/func';

export type AcceptCookiesCallback = (
  additional?: string[],
  toRemove?: string[],
) => void;

interface UseConsentCookie {
  saveCookies: AcceptCookiesCallback;
  cookieExists: boolean;
}

const cookieOptions: Partial<CookieOptions> = {
  path: '/',
  sameSite: 'lax',
  domain: process.env.NEXT_PUBLIC_DOMAIN,
};

const setBrowserCookie = (key: string): void => {
  globalThis?.localStorage.removeItem(key);

  const cookies = getCookies([key]);

  if (cookies[key]) {
    return;
  }

  const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

  setCookie(key, true, { ...cookieOptions, maxAge: TEN_YEARS });
};

const expireBrowserCookie = (key: string): void => {
  expireCookie(key, { ...cookieOptions });
  globalThis?.localStorage.setItem(key, 'disabled');
};

const getBrowserCookie = (key: string) =>
  globalThis?.document?.cookie.split('; ').find((row) => row.startsWith(key));

export const useConsentCookie = (key: string): UseConsentCookie => {
  const queryKey = useMemo(() => ['cookie', key], [key]);
  const client = useQueryClient();
  const { data: exists } = useQuery({
    queryKey,
    initialData: () => !!getBrowserCookie(key),
    ...disabledRefetch,
  });

  const onCookieAccepted = useCallback(
    (cacheKey: string) => {
      setBrowserCookie(cacheKey);
      client.setQueryData(['cookie', cacheKey], true);
    },
    [client],
  );

  const saveCookies: AcceptCookiesCallback = useCallback(
    (additional, toRemove) => {
      onCookieAccepted(key);

      if (additional) {
        additional.forEach(onCookieAccepted);
      }

      if (toRemove) {
        toRemove.forEach(expireBrowserCookie);
      }
    },
    [key, onCookieAccepted],
  );

  return { saveCookies, cookieExists: exists };
};
