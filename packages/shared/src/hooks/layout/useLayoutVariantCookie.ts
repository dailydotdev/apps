import { useEffect } from 'react';
import { isExtension } from '../../lib/func';
import { LAYOUT_VARIANT_COOKIE } from '../../lib/layoutVariant';
import { useViewSize, ViewSize } from '../useViewSize';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

// Records a laptop session so the proxy can serve the mirrored post page,
// whose initial HTML already carries the laptop shell. Reads the viewport
// directly rather than `useLaptopLayout`, so a session already on the mirror
// records what the window says now, not what the server was told last time.
export const useLayoutVariantCookie = (): void => {
  const isLaptop = useViewSize(ViewSize.Laptop);

  useEffect(() => {
    if (isExtension) {
      return;
    }

    const isSecure = globalThis.location?.protocol === 'https:';
    const value = `${LAYOUT_VARIANT_COOKIE}=${isLaptop ? 'v2' : ''}`;
    const maxAge = isLaptop ? COOKIE_MAX_AGE : 0;
    globalThis.document.cookie = `${value}; path=/; max-age=${maxAge}; samesite=lax${
      isSecure ? '; secure' : ''
    }`;
  }, [isLaptop]);
};
