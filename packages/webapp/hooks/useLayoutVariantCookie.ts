import { useEffect } from 'react';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLayoutVariant } from '@dailydotdev/shared/src/hooks/layout/useLayoutVariant';
import { LAYOUT_VARIANT_COOKIE } from '../lib/layoutVariant';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

/**
 * Persists the resolved shell so `proxy.ts` can serve the matching route on
 * the next hard navigation. Mounted above the layout, where the context the
 * mirrored route provides is out of scope, so this always reads the client's
 * own evaluation rather than echoing the server's decision back.
 *
 * Only sessions that actually render the v2 shell are recorded: the rail owns
 * the header for logged-in users only, so writing `v2` for anyone else would
 * hand them a shell that boot immediately takes away.
 */
export const useLayoutVariantCookie = (): void => {
  const { isV2, isLoading } = useLayoutVariant();
  const { isAuthReady, isLoggedIn } = useAuthContext();

  useEffect(() => {
    if (isLoading || !isAuthReady) {
      return;
    }

    const variant = isV2 && isLoggedIn ? 'v2' : 'v1';
    const isSecure = globalThis.location?.protocol === 'https:';
    globalThis.document.cookie = `${LAYOUT_VARIANT_COOKIE}=${variant}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax${
      isSecure ? '; secure' : ''
    }`;
  }, [isAuthReady, isLoggedIn, isLoading, isV2]);
};
