import { useState } from 'react';
import { LoggedUser } from './user';

const consentCookieName = 'ilikecookies';

export function useCookieBanner(): [
  boolean,
  () => void,
  (user?: LoggedUser) => void,
] {
  const [showCookie, setShowCookie] = useState(false);

  const acceptCookies = (): void => {
    setShowCookie(false);
    document.cookie = `${consentCookieName}=true;path=/;domain=${
      process.env.NEXT_PUBLIC_DOMAIN
    };samesite=lax;expires=${60 * 60 * 24 * 365 * 10}`;
  };

  const updateCookieBanner = (user?: LoggedUser): void => {
    if (
      !user &&
      !document.cookie
        .split('; ')
        .find((row) => row.startsWith(consentCookieName))
    ) {
      setShowCookie(true);
    }
  };

  return [showCookie, acceptCookies, updateCookieBanner];
}
