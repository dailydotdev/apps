import { useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { isExtension } from '../../lib/func';
import { LAYOUT_VARIANT_COOKIE } from '../../lib/layoutVariant';
import { useViewSize, ViewSize } from '../useViewSize';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

// Records a logged-in laptop session so the proxy can serve the mirrored
// post page, whose initial HTML already carries the laptop shell. Reads the
// viewport directly rather than `useLaptopLayout`, so a session already on
// the mirror records what the window says now, not what the server was told
// last time. Waits for boot: `isLoggedIn` is false until then, and writing
// early would expire the cookie on every hard load.
export const useLayoutVariantCookie = (): void => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { isAuthReady, isLoggedIn } = useAuthContext();

  useEffect(() => {
    if (isExtension || !isAuthReady) {
      return;
    }

    const shouldMirror = isLaptop && isLoggedIn;
    const isSecure = globalThis.location?.protocol === 'https:';
    const value = `${LAYOUT_VARIANT_COOKIE}=${shouldMirror ? 'v2' : ''}`;
    const maxAge = shouldMirror ? COOKIE_MAX_AGE : 0;
    globalThis.document.cookie = `${value}; path=/; max-age=${maxAge}; samesite=lax${
      isSecure ? '; secure' : ''
    }`;
  }, [isAuthReady, isLoggedIn, isLaptop]);
};
