import { useCallback, useState } from 'react';
import { LoggedUser } from '../lib/user';
import { setCookie } from '../lib/cookie';

const consentCookieName = 'ilikecookies';

export function useCookieBanner(): [
  boolean,
  () => void,
  (user?: LoggedUser) => void,
] {
  const [showCookie, setShowCookie] = useState(false);

  const acceptCookies = useCallback((): void => {
    const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

    setShowCookie(false);
    setCookie(consentCookieName, true, {
      path: '/',
      domain: process.env.NEXT_PUBLIC_DOMAIN,
      sameSite: 'lax',
      maxAge: TEN_YEARS,
    });
  }, []);

  const updateCookieBanner = useCallback(
    (user?: LoggedUser): void => {
      if (
        document.cookie
          .split('; ')
          .find((row) => row.startsWith(consentCookieName))
      ) {
        return;
      }
      if (user) {
        acceptCookies();
        return;
      }
      setShowCookie(true);
    },
    [acceptCookies],
  );

  return [showCookie, acceptCookies, updateCookieBanner];
}
