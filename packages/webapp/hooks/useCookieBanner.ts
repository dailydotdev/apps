import { useState } from 'react';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';

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
      document.cookie
        .split('; ')
        .find((row) => row.startsWith(consentCookieName))
    ) {
      return;
    }
    if (user) {
      return acceptCookies();
    }
    setShowCookie(true);
  };

  return [showCookie, acceptCookies, updateCookieBanner];
}
