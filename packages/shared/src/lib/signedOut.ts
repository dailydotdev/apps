import { expireCookie, getCookies, setCookie } from './cookie';

export const SIGNED_OUT_COOKIE = 'dd_signed_out';

const THIRTY_DAYS = 60 * 60 * 24 * 30;

const cookieScope = { domain: process.env.NEXT_PUBLIC_DOMAIN, path: '/' };

export const markSignedOut = async (): Promise<void> => {
  setCookie(SIGNED_OUT_COOKIE, 1, {
    ...cookieScope,
    maxAge: THIRTY_DAYS,
    sameSite: 'lax',
  });
  try {
    await globalThis.navigator?.credentials?.preventSilentAccess?.();
  } catch {
    // The cookie above is what the homepage reads; this is best effort.
  }
};

export const clearSignedOut = (): void => {
  if (getCookies([SIGNED_OUT_COOKIE])?.[SIGNED_OUT_COOKIE]) {
    expireCookie(SIGNED_OUT_COOKIE, cookieScope);
  }
};
