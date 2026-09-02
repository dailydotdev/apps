import { useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { isExtension } from '../../lib/func';
import { LAYOUT_VARIANT_COOKIE } from '../../lib/layoutVariant';
import { useLayoutVariantFlag } from './useLayoutVariant';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

// Reads the flag rather than `useLayoutVariant` so a session already on a
// mirrored route records what GrowthBook says now, not what the server was
// told last time.
export const useLayoutVariantCookie = (): void => {
  const { isV2, isLoading } = useLayoutVariantFlag();
  const { isLoggedIn } = useAuthContext();

  useEffect(() => {
    if (isExtension || isLoading) {
      return;
    }

    const shouldMirror = isV2 && isLoggedIn;
    const isSecure = globalThis.location?.protocol === 'https:';
    const value = `${LAYOUT_VARIANT_COOKIE}=${shouldMirror ? 'v2' : ''}`;
    const maxAge = shouldMirror ? COOKIE_MAX_AGE : 0;
    globalThis.document.cookie = `${value}; path=/; max-age=${maxAge}; samesite=lax${
      isSecure ? '; secure' : ''
    }`;
  }, [isLoggedIn, isLoading, isV2]);
};
