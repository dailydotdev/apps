import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { CookieOptions } from '../lib/cookie';
import { expireCookie, getCookies, setCookie } from '../lib/cookie';
import { checkIsExtension, disabledRefetch } from '../lib/func';

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
};

const getBrowserCookie = (key: string) =>
  globalThis?.document?.cookie.split('; ').find((row) => row.startsWith(key));

export const useConsentCookie = (key: string): UseConsentCookie => {
  const isExtension = checkIsExtension();
  const queryKey = useMemo(() => ['cookie', key], [key]);
  const client = useQueryClient();
  const { data: exists } = useQuery({
    queryKey,
    initialData: () => isExtension || !!getBrowserCookie(key),
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
      if (isExtension) {
        // eslint-disable-next-line no-console
        console.log('we don not store cookies in extension');
        return;
      }

      onCookieAccepted(key);

      if (additional) {
        additional.forEach(onCookieAccepted);
      }

      if (toRemove) {
        toRemove.forEach(expireBrowserCookie);
      }
    },
    [key, onCookieAccepted, isExtension],
  );

  return { saveCookies, cookieExists: exists };
};
