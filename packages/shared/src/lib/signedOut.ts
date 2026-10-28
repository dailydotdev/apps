import { setCookie } from './cookie';

export const SIGNED_OUT_COOKIE = 'dd_signed_out';

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export const markSignedOut = async (): Promise<void> => {
  setCookie(SIGNED_OUT_COOKIE, 1, {
    domain: process.env.NEXT_PUBLIC_DOMAIN,
    path: '/',
    maxAge: THIRTY_DAYS,
    sameSite: 'lax',
  });
  await globalThis.navigator?.credentials?.preventSilentAccess?.();
};
